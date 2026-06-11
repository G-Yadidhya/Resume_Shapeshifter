import type { JobDescriptionProfile, ResumeProfile, TailoredResume } from "@/lib/schemas";
import { OUTPUT_JSON_RULES, TRUTHFULNESS_SYSTEM_PROMPT } from "@/prompts/system";

export const system = `${TRUTHFULNESS_SYSTEM_PROMPT}

Score responsibility and seniority alignment. Do not inflate scores; explain evidence plainly.`;

export function buildUserMessage(
  resume: ResumeProfile | TailoredResume,
  jobDescription: JobDescriptionProfile,
) {
  return `Return JSON with this exact shape:
{
  "responsibilityAlignmentScore": number,
  "seniorityScore": number,
  "criticalMissingRequirements": string[],
  "explanation": string
}

Scores must be integers from 0 to 100.
${OUTPUT_JSON_RULES}

Resume or tailored resume:
${JSON.stringify(resume, null, 2)}

JobDescriptionProfile:
${JSON.stringify(jobDescription, null, 2)}`;
}
