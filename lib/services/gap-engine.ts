import type { LLMClient } from "@/lib/llm/client";
import {
  GapAnalysisSchema,
  type GapAnalysis,
  type JobDescriptionProfile,
  type ResumeProfile,
} from "@/lib/schemas";
import { buildUserMessage, system } from "@/prompts/gap-analysis";

export class GapEngine {
  constructor(private llm: LLMClient) {}

  async analyze(
    resume: ResumeProfile,
    jobDescription: JobDescriptionProfile,
  ): Promise<GapAnalysis> {
    return this.llm.completeJSON<GapAnalysis>({
      name: "GapAnalysis",
      system,
      user: buildUserMessage(resume, jobDescription),
      schema: GapAnalysisSchema,
      temperature: 0.2,
    });
  }
}
