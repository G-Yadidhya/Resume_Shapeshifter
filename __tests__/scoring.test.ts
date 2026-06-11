import { describe, expect, it } from "vitest";

import { combineScores } from "@/lib/scoring/combine-scores";
import { scoreKeywordAlignment } from "@/lib/scoring/keyword-alignment";
import { scoreSkillCoverage } from "@/lib/scoring/skill-coverage";
import type { JobDescriptionProfile, ResumeProfile } from "@/lib/schemas";

const resume: ResumeProfile = {
  contact: { name: "", email: "", phone: "", location: "" },
  summary: "Backend engineer building Node.js REST APIs with PostgreSQL.",
  skills: ["Node.js", "PostgreSQL", "REST APIs", "Docker"],
  experience: [
    {
      company: "Acme",
      title: "Software Engineer",
      startDate: "2022",
      endDate: "Present",
      bullets: ["Built API services and Dockerized deployments."],
    },
  ],
  projects: [],
  education: [],
  certifications: [],
};

const jd: JobDescriptionProfile = {
  jobTitle: "Backend Engineer",
  company: "Example",
  requiredSkills: ["Node.js", "PostgreSQL", "Docker", "GraphQL"],
  preferredSkills: ["Kubernetes"],
  responsibilities: ["Build REST APIs", "Improve reliability"],
  qualifications: [],
  tools: ["Node.js", "PostgreSQL"],
  keywords: ["backend", "REST APIs", "GraphQL"],
  seniorityLevel: "Mid-level",
  domainSignals: [],
};

describe("scoring helpers", () => {
  it("scores required and preferred skill coverage", () => {
    const result = scoreSkillCoverage(resume, jd);

    expect(result.matchedRequired).toContain("Node.js");
    expect(result.missingRequired).toContain("GraphQL");
    expect(result.missingPreferred).toContain("Kubernetes");
    expect(result.score).toBeGreaterThan(50);
  });

  it("scores keyword alignment", () => {
    const result = scoreKeywordAlignment(resume, jd);

    expect(result.matchedKeywords).toContain("REST APIs");
    expect(result.missingKeywords).toContain("GraphQL");
    expect(result.score).toBeGreaterThan(0);
  });

  it("combines scores with missing-requirement penalties", () => {
    expect(
      combineScores({
        skillCoverageScore: 80,
        responsibilityAlignmentScore: 70,
        keywordScore: 60,
        seniorityScore: 90,
        criticalMissingCount: 2,
      }),
    ).toBe(67);
  });
});
