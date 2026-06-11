"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "parse", label: "Parsing resume & job description" },
  { id: "score", label: "Scoring resume against JD" },
  { id: "gap", label: "Analyzing gaps" },
  { id: "tailor", label: "Tailoring bullets" },
] as const;

interface LoadingPipelineProps {
  active?: boolean;
}

export function LoadingPipeline({ active = true }: LoadingPipelineProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Analyzing your resume</CardTitle>
        <CardDescription>
          Running the tailoring pipeline (mock data in Phase 1)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <ul className="space-y-2">
          {STAGES.map((stage, idx) => (
            <li
              key={stage.id}
              className={cn(
                "flex items-center gap-2 text-sm transition-opacity",
                idx <= stageIndex
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground opacity-50",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  idx < stageIndex
                    ? "bg-emerald-500"
                    : idx === stageIndex
                      ? "bg-primary animate-pulse"
                      : "bg-muted",
                )}
              />
              {stage.label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
