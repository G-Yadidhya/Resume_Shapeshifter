import { OUTPUT_JSON_RULES, TRUTHFULNESS_SYSTEM_PROMPT } from "@/prompts/system";

export const system = `${TRUTHFULNESS_SYSTEM_PROMPT}

Convert resume text into structured resume data. Preserve original facts and wording where uncertain.`;

export function buildUserMessage(resumeText: string) {
  return `Parse this resume into a ResumeProfile JSON object.

Required JSON shape:
{
  "contact": {
    "name": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "website": string
  },
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "title": string,
      "startDate": string,
      "endDate": string,
      "bullets": string[]
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "bullets": string[],
      "technologies": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "endDate": string
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "date": string
    }
  ],
  "rawText": string
}

${OUTPUT_JSON_RULES}
Set rawText to the exact resume text provided.

Resume text:
${resumeText}`;
}
