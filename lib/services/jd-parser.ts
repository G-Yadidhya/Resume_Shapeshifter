import type { LLMClient } from "@/lib/llm/client";
import {
  JobDescriptionProfileSchema,
  type JobDescriptionProfile,
} from "@/lib/schemas";
import { buildUserMessage, system } from "@/prompts/jd-extraction";

export class JDParserService {
  constructor(private llm: LLMClient) {}

  async parse(jdText: string): Promise<JobDescriptionProfile> {
    const content = jdText.trim();
    if (!content) {
      throw new Error("Job description is required.");
    }

    return this.llm.completeJSON({
      name: "JobDescriptionProfile",
      system,
      user: buildUserMessage(content),
      schema: JobDescriptionProfileSchema,
      temperature: 0.2,
    });
  }
}
