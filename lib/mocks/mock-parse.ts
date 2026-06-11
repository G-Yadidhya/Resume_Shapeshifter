import type {
  JobDescriptionProfile,
  ResumeProfile,
} from "@/lib/schemas";

/**
 * Phase 1 heuristic parsers — return minimal structured profiles from raw text.
 * Replaced by LLM parsing in Phase 2.
 */
export function mockParseResume(text: string): ResumeProfile {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const name = lines[0] ?? "Unknown";

  const skillsIndex = lines.findIndex((l) => /^skills$/i.test(l));
  const skills =
    skillsIndex >= 0 && lines[skillsIndex + 1]
      ? lines[skillsIndex + 1].split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  return {
    contact: {
      name,
      email: "",
      phone: "",
      location: "",
    },
    summary: "",
    skills,
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    rawText: text,
  };
}

export function mockParseJobDescription(text: string): JobDescriptionProfile {
  const firstLine = text.split("\n").find((l) => l.trim()) ?? "";
  const titleMatch = firstLine.match(/^(.+?)\s*[—–-]\s*(.+)$/);

  return {
    jobTitle: titleMatch?.[1]?.trim() ?? firstLine,
    company: titleMatch?.[2]?.trim() ?? "",
    requiredSkills: [],
    preferredSkills: [],
    responsibilities: [],
    qualifications: [],
    tools: [],
    keywords: [],
    seniorityLevel: "",
    domainSignals: [],
  };
}
