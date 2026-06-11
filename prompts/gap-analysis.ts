import type { JobDescriptionProfile, ResumeProfile } from "@/lib/schemas";
import { OUTPUT_JSON_RULES, TRUTHFULNESS_SYSTEM_PROMPT } from "@/prompts/system";

export const system = `${TRUTHFULNESS_SYSTEM_PROMPT}

Find honest gaps between the resume and job description. A gap can be missing, weakly represented, or unsupported.`;

export function buildUserMessage(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
) {
  return `Return a GapAnalysis JSON object.

Required JSON shape:
{
  "gaps": [
    {
      "name": string,
      "importance": "high" | "medium" | "low",
      "jdEvidence": string,
      "resumeEvidence": string,
      "suggestedAction": string,
      "canSafelyAdd": boolean
    }
  ]
}

${OUTPUT_JSON_RULES}
canSafelyAdd must be true only when the resume contains clear evidence for the requirement.

ResumeProfile:
${JSON.stringify(resume, null, 2)}

JobDescriptionProfile:
${JSON.stringify(jobDescription, null, 2)}`;
}
