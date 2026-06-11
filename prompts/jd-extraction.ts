import { OUTPUT_JSON_RULES, TRUTHFULNESS_SYSTEM_PROMPT } from "@/prompts/system";

export const system = `${TRUTHFULNESS_SYSTEM_PROMPT}

Extract structured job-description data. Ignore legal boilerplate, EEO statements, benefits, and unrelated company marketing unless it describes role requirements.`;

export function buildUserMessage(jdText: string) {
  return `Extract a JobDescriptionProfile JSON object from this job description.

Required JSON shape:
{
  "jobTitle": string,
  "company": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "qualifications": string[],
  "tools": string[],
  "keywords": string[],
  "seniorityLevel": string,
  "domainSignals": string[]
}

${OUTPUT_JSON_RULES}

Job description:
${jdText}`;
}
