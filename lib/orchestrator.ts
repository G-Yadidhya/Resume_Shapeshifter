import { nanoid } from "nanoid";

import { createDefaultLLMClient, type LLMClient } from "@/lib/llm/client";
import {
  TailoringRunSchema,
  type GapAnalysis,
  type JobDescriptionProfile,
  type MatchScore,
  type ResumeProfile,
  type TailoredResume,
  type TailoringRun,
  type TailorRequest,
} from "@/lib/schemas";
import { GapEngine } from "@/lib/services/gap-engine";
import { JDParserService } from "@/lib/services/jd-parser";
import { MatchEngine } from "@/lib/services/match-engine";
import { ResumeParserService } from "@/lib/services/resume-parser";
import { TailoringEngine } from "@/lib/services/tailoring-engine";
import { GuardrailsService } from "@/lib/services/guardrails";

export type TailoringAnalysis = {
  resume: ResumeProfile;
  jobDescription: JobDescriptionProfile;
  originalScore: MatchScore;
  gaps: GapAnalysis;
};

export class TailoringOrchestrator {
  private resumeParser: ResumeParserService;
  private jdParser: JDParserService;
  private matchEngine: MatchEngine;
  private gapEngine: GapEngine;
  private tailoringEngine: TailoringEngine;
  private guardrails: GuardrailsService;

  constructor(llm: LLMClient = createDefaultLLMClient()) {
    this.resumeParser = new ResumeParserService(llm);
    this.jdParser = new JDParserService(llm);
    this.matchEngine = new MatchEngine(llm);
    this.gapEngine = new GapEngine(llm);
    this.tailoringEngine = new TailoringEngine(llm);
    this.guardrails = new GuardrailsService();
  }

  async analyze(input: TailorRequest): Promise<TailoringAnalysis> {
    const [resume, jobDescription] = await Promise.all([
      this.resumeParser.parse(input.resume),
      this.jdParser.parse(input.jobDescription),
    ]);

    const [originalScore, gaps] = await Promise.all([
      this.matchEngine.score(resume, jobDescription),
      this.gapEngine.analyze(resume, jobDescription),
    ]);

    return {
      resume,
      jobDescription,
      originalScore,
      gaps,
    };
  }

  async run(input: TailorRequest): Promise<TailoringRun> {
    const analysis = await this.analyze(input);
    const tailored: TailoredResume = await this.tailoringEngine.tailor(
      analysis.resume,
      analysis.jobDescription,
      analysis.gaps,
    );
    const tailoredScore = await this.matchEngine.score(
      tailored,
      analysis.jobDescription,
    );

    const guardrailsResult = this.guardrails.validate(
      analysis.resume,
      tailored,
      analysis.jobDescription,
    );

    return TailoringRunSchema.parse({
      id: `run_${nanoid(10)}`,
      createdAt: new Date().toISOString(),
      status: "complete",
      resume: analysis.resume,
      jobDescription: analysis.jobDescription,
      originalScore: analysis.originalScore,
      tailoredScore,
      gaps: analysis.gaps,
      tailored,
      guardrailWarnings: [
        ...guardrailsResult.blockingViolations,
        ...guardrailsResult.warnings,
      ],
      blockedForExport: guardrailsResult.blockedForExport,
    });
  }
}

export function createTailoringOrchestrator(llm?: LLMClient) {
  return new TailoringOrchestrator(llm);
}
