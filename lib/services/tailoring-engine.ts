import type { LLMClient } from "@/lib/llm/client";
import {
  TailoredResumeSchema,
  type GapAnalysis,
  type JobDescriptionProfile,
  type ResumeProfile,
  type TailoredResume,
} from "@/lib/schemas";
import { buildUserMessage, system } from "@/prompts/bullet-rewriter";

export class TailoringEngine {
  constructor(private llm: LLMClient) {}

  async tailor(
    resume: ResumeProfile,
    jobDescription: JobDescriptionProfile,
    gaps: GapAnalysis,
  ): Promise<TailoredResume> {
    return this.llm.completeJSON({
      name: "TailoredResume",
      system,
      user: buildUserMessage(resume, jobDescription, gaps),
      schema: TailoredResumeSchema,
      temperature: 0.45,
    });
  }
}
