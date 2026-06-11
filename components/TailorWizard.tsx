"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { GapAnalysisPanel } from "@/components/GapAnalysisPanel";
import { JDInput } from "@/components/JDInput";
import { JDRequirementsSummary } from "@/components/JDRequirementsSummary";
import { LoadingPipeline } from "@/components/LoadingPipeline";
import { ResumeInput } from "@/components/ResumeInput";
import { ScoreCard } from "@/components/ScoreCard";
import { SideBySideDiff } from "@/components/SideBySideDiff";
import { PDFExportButton } from "@/components/PDFExportButton";
import { RiskFlagBanner } from "@/components/RiskFlagBanner";
import { GuardrailsService } from "@/lib/services/guardrails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SAMPLE_JD_TEXT,
  SAMPLE_RESUME_TEXT,
} from "@/lib/fixtures/sample-content";
import {
  clearTailoringRun,
  loadTailoringRun,
  saveTailoringRun,
} from "@/lib/session";
import {
  TailoringRunSchema,
  type TailoringRun,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";

type WizardStep = "input" | "analyzing" | "results";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "analyzing", label: "Analyze" },
  { id: "results", label: "Results" },
];

export function TailorWizard() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const [step, setStep] = useState<WizardStep>("input");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [run, setRun] = useState<TailoringRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const requestGenRef = useRef(0);
  const demoStartedRef = useRef(false);
  const restoredRef = useRef(false);

  const guardrailsResult = run
    ? new GuardrailsService().validate(run.resume, run.tailored, run.jobDescription)
    : null;

  const runAnalyze = useCallback(async (resume: string, jd: string) => {
    const trimmedResume = resume.trim();
    const trimmedJd = jd.trim();
    if (!trimmedResume || !trimmedJd) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const generation = ++requestGenRef.current;

    setLoading(true);
    setError(null);
    setStep("analyzing");

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: { type: "text", content: trimmedResume },
          jobDescription: trimmedJd,
        }),
        signal: controller.signal,
      });

      let data: { run?: unknown; error?: { message?: string } } = {};
      const responseText = await response.text();

      try {
        data = JSON.parse(responseText);
      } catch {
        if (response.status === 504) {
          throw new Error(
            "Request timed out (504 Gateway Timeout). " +
            "If you are deployed on Vercel's free tier, serverless functions are limited to a 10-second execution limit. " +
            "Please try with a shorter resume/job description or redeploy to a platform without execution limits (e.g. Docker)."
          );
        }
        throw new Error(
          `Server returned a non-JSON response (Status ${response.status} ${response.statusText || ""}). ` +
          `Please check if your development server is running and healthy.`
        );
      }

      if (generation !== requestGenRef.current) return;

      if (!response.ok) {
        const message =
          data?.error?.message ?? "Something went wrong. Please try again.";
        throw new Error(message);
      }

      const parsed = TailoringRunSchema.parse(data.run);
      setRun(parsed);
      saveTailoringRun(parsed);
      setStep("results");
    } catch (err) {
      if (generation !== requestGenRef.current) return;

      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      setError(err instanceof Error ? err.message : "Unexpected error");
      setStep("input");
    } finally {
      if (generation === requestGenRef.current) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    if (isDemo) {
      clearTailoringRun();
      setResumeText(SAMPLE_RESUME_TEXT);
      setJdText(SAMPLE_JD_TEXT);
      return;
    }

    const saved = loadTailoringRun();
    if (saved) {
      setRun(saved);
      setStep("results");
    }
  }, [isDemo]);

  useEffect(() => {
    if (!isDemo || demoStartedRef.current) return;
    if (!resumeText.trim() || !jdText.trim()) return;

    demoStartedRef.current = true;
    void runAnalyze(resumeText, jdText);
  }, [isDemo, resumeText, jdText, runAnalyze]);

  const canAnalyze =
    resumeText.trim().length > 0 &&
    jdText.trim().length > 0 &&
    !loading;

  const handleAnalyze = () => {
    void runAnalyze(resumeText, jdText);
  };

  const handleStartOver = () => {
    abortRef.current?.abort();
    requestGenRef.current += 1;
    clearTailoringRun();
    setRun(null);
    setError(null);
    setStep("input");
    demoStartedRef.current = false;
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tailor your resume
          </h1>
          <p className="text-muted-foreground text-sm">
            Paste or upload a resume and provide a job description to preview
            match scoring and bullet rewrites.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Home</Link>
        </Button>
      </div>

      <nav aria-label="Wizard progress" className="flex flex-wrap gap-2">
        {STEPS.map((s, idx) => (
          <Badge
            key={s.id}
            variant={idx <= stepIndex ? "default" : "outline"}
            className={cn(idx === stepIndex && "ring-ring ring-2 ring-offset-2")}
          >
            {idx + 1}. {s.label}
          </Badge>
        ))}
      </nav>

      {step === "input" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ResumeInput
              value={resumeText}
              onChange={setResumeText}
              onLoadSample={() => setResumeText(SAMPLE_RESUME_TEXT)}
              disabled={loading}
            />
            <JDInput
              value={jdText}
              onChange={setJdText}
              onLoadSample={() => setJdText(SAMPLE_JD_TEXT)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="space-y-2" role="alert">
              <p className="text-destructive text-sm">{error}</p>
              <p className="text-muted-foreground text-xs">
                Make sure the dev server is running: double-click{" "}
                <code className="text-xs">dev.cmd</code> or run{" "}
                <code className="text-xs">npm run dev</code> in a terminal where
                Node.js is installed.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleAnalyze} disabled={!canAnalyze}>
              Analyze & tailor
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResumeText(SAMPLE_RESUME_TEXT);
                setJdText(SAMPLE_JD_TEXT);
              }}
              disabled={loading}
            >
              Load both samples
            </Button>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 py-12">
          <LoadingPipeline active={loading} />
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "results" && run && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              Run <code className="text-xs">{run.id}</code> · Phase 1 mock
              results
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                New analysis
              </Button>
              <PDFExportButton run={run} />
            </div>
          </div>

          {guardrailsResult && (
            <RiskFlagBanner
              violations={guardrailsResult.blockingViolations}
              warnings={guardrailsResult.warnings}
            />
          )}

          <JDRequirementsSummary jobDescription={run.jobDescription} />
          <ScoreCard
            originalScore={run.originalScore}
            tailoredScore={run.tailoredScore}
          />
          <GapAnalysisPanel gaps={run.gaps} />
          <SideBySideDiff tailored={run.tailored} />
        </div>
      )}

      {step === "results" && !run && (
        <div className="text-muted-foreground space-y-3 py-8 text-center text-sm">
          <p>No results loaded.</p>
          <Button variant="outline" onClick={handleStartOver}>
            Start over
          </Button>
        </div>
      )}
    </div>
  );
}
