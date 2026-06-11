import { z } from "zod";

import type { LLMClient } from "@/lib/llm/client";
import {
  MatchScoreSchema,
  type JobDescriptionProfile,
  type MatchScore,
  type ResumeProfile,
  type TailoredResume,
} from "@/lib/schemas";
import { combineScores, clampScore } from "@/lib/scoring/combine-scores";
import { scoreKeywordAlignment } from "@/lib/scoring/keyword-alignment";
import { scoreSkillCoverage } from "@/lib/scoring/skill-coverage";
import { buildUserMessage, system } from "@/prompts/match-scoring";

const LLMMatchSignalSchema = z.object({
  responsibilityAlignmentScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()).default([]),
  explanation: z.string(),
});

export class MatchEngine {
  constructor(private llm: LLMClient) {}

  async score(
    resume: ResumeProfile | TailoredResume,
    jobDescription: JobDescriptionProfile,
  ): Promise<MatchScore> {
    const skill = scoreSkillCoverage(resume, jobDescription);
    const keyword = scoreKeywordAlignment(resume, jobDescription);
    const llmSignal = await this.llm.completeJSON({
      name: "MatchSignal",
      system,
      user: buildUserMessage(resume, jobDescription),
      schema: LLMMatchSignalSchema,
      temperature: 0.2,
    });

    const criticalMissingRequirements = [
      ...new Set([
        ...skill.missingRequired.slice(0, 8),
        ...llmSignal.criticalMissingRequirements,
      ]),
    ];

    const score: MatchScore = {
      skillCoverageScore: skill.score,
      responsibilityAlignmentScore: clampScore(
        llmSignal.responsibilityAlignmentScore,
      ),
      keywordScore: keyword.score,
      seniorityScore: clampScore(llmSignal.seniorityScore),
      criticalMissingRequirements,
      explanation: llmSignal.explanation,
      overallScore: combineScores({
        skillCoverageScore: skill.score,
        responsibilityAlignmentScore:
          llmSignal.responsibilityAlignmentScore,
        keywordScore: keyword.score,
        seniorityScore: llmSignal.seniorityScore,
        criticalMissingCount: criticalMissingRequirements.length,
      }),
    };

    return MatchScoreSchema.parse(score);
  }
}
