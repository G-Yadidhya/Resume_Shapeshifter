import type { LLMClient } from "@/lib/llm/client";
import {
  ResumeProfileSchema,
  type ResumeProfile,
  type TailorRequest,
} from "@/lib/schemas";
import { buildUserMessage, system } from "@/prompts/resume-parser";

export class ResumeParserService {
  constructor(private llm: LLMClient) {}

  async parse(input: TailorRequest["resume"]): Promise<ResumeProfile> {
    const content = input.content.trim();
    if (!content) {
      throw new Error("Resume content is required.");
    }

    const parsed = await this.llm.completeJSON({
      name: "ResumeProfile",
      system,
      user: buildUserMessage(content),
      schema: ResumeProfileSchema,
      temperature: 0.2,
    });

    return {
      ...parsed,
      rawText: content,
    };
  }
}
