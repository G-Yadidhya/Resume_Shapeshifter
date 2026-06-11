import type {
  GapAnalysis,
  JobDescriptionProfile,
  ResumeProfile,
} from "@/lib/schemas";
import { OUTPUT_JSON_RULES, TRUTHFULNESS_SYSTEM_PROMPT } from "@/prompts/system";

export const system = `${TRUTHFULNESS_SYSTEM_PROMPT}

Rewrite only resume summary, skills ordering, experience bullets, and project bullets. Preserve employers, job titles, education, dates, and project names.`;

export function buildUserMessage(
  resume: ResumeProfile,
  jobDescription: JobDescriptionProfile,
  gaps: GapAnalysis,
) {
  return `Return a TailoredResume JSON object.

Required JSON shape:
{
  "tailoredSummary": string,
  "tailoredSkills": string[],
  "tailoredExperience": [
    {
      "company": string,
      "title": string,
      "bullets": [
        {
          "original": string,
          "tailored": string,
          "changeReason": string,
          "keywordsAddressed": string[],
          "confidence": "high" | "medium" | "low",
          "riskFlag": string | null
        }
      ]
    }
  ],
  "tailoredProjects": [
    {
      "name": string,
      "bullets": [
        {
          "original": string,
          "tailored": string,
          "changeReason": string,
          "keywordsAddressed": string[],
          "confidence": "high" | "medium" | "low",
          "riskFlag": string | null
        }
      ]
    }
  ]
}

${OUTPUT_JSON_RULES}
Every original bullet from the resume must appear exactly once in an original field.
If a change adds an implied detail, set confidence to medium or low and add a riskFlag.

ResumeProfile:
${JSON.stringify(resume, null, 2)}

JobDescriptionProfile:
${JSON.stringify(jobDescription, null, 2)}

GapAnalysis:
${JSON.stringify(gaps, null, 2)}`;
}
