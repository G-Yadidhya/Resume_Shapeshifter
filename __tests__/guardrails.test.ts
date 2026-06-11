import { describe, it, expect } from "vitest";
import {
  detectNewCompanies,
  detectNewDegrees,
  detectNewCertifications,
  detectLowConfidenceBullets,
  detectFlaggedBullets,
} from "@/lib/guardrails/detectors";
import { traceMetrics } from "@/lib/guardrails/metric-tracer";
import { checkKeywordDensity } from "@/lib/guardrails/keyword-density";
import { GuardrailsService } from "@/lib/services/guardrails";
import type { ResumeProfile, TailoredResume, JobDescriptionProfile } from "@/lib/schemas";

describe("Guardrails — Detectors", () => {
  describe("detectNewCompanies", () => {
    it("should detect new companies in tailored resume", () => {
      const original: ResumeProfile = {
        contact: { name: "John", email: "", phone: "", location: "" },
        experience: [{ company: "Apple", title: "Engineer", startDate: "2020", endDate: "2023", bullets: [] }],
        skills: [],
        projects: [],
        education: [],
        certifications: [],
      };

      const tailored: TailoredResume = {
        tailoredSummary: "I worked at Google",
        tailoredSkills: [],
        tailoredExperience: [
          {
            company: "Google",
            title: "Senior Engineer",
            bullets: [{ original: "Built stuff", tailored: "Built amazing stuff", changeReason: "Enhanced", keywordsAddressed: [], confidence: "high" }],
          },
        ],
      };

      const violations = detectNewCompanies(original, tailored);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toContain("Google");
    });

    it("should not flag existing companies", () => {
      const original: ResumeProfile = {
        contact: { name: "John", email: "", phone: "", location: "" },
        experience: [{ company: "Apple", title: "Engineer", startDate: "2020", endDate: "2023", bullets: [] }],
        skills: [],
        projects: [],
        education: [],
        certifications: [],
      };

      const tailored: TailoredResume = {
        tailoredSummary: "",
        tailoredSkills: [],
        tailoredExperience: [
          {
            company: "Apple",
            title: "Senior Engineer",
            bullets: [],
          },
        ],
      };

      const violations = detectNewCompanies(original, tailored);
      expect(violations.length).toBe(0);
    });
  });

  describe("detectLowConfidenceBullets", () => {
    it("should detect low confidence bullets", () => {
      const tailored: TailoredResume = {
        tailoredSummary: "",
        tailoredSkills: [],
        tailoredExperience: [
          {
            company: "Apple",
            title: "Engineer",
            bullets: [
              {
                original: "Did something",
                tailored: "Enhanced something",
                changeReason: "Improved clarity",
                keywordsAddressed: [],
                confidence: "low",
              },
            ],
          },
        ],
      };

      const violations = detectLowConfidenceBullets(tailored);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toContain("low-confidence");
    });

    it("should not warn on high/medium confidence", () => {
      const tailored: TailoredResume = {
        tailoredSummary: "",
        tailoredSkills: [],
        tailoredExperience: [
          {
            company: "Apple",
            title: "Engineer",
            bullets: [
              {
                original: "Did something",
                tailored: "Enhanced something",
                changeReason: "Improved clarity",
                keywordsAddressed: [],
                confidence: "high",
              },
            ],
          },
        ],
      };

      const violations = detectLowConfidenceBullets(tailored);
      expect(violations.length).toBe(0);
    });
  });

  describe("detectFlaggedBullets", () => {
    it("should detect bullets with riskFlag set", () => {
      const tailored: TailoredResume = {
        tailoredSummary: "",
        tailoredSkills: [],
        tailoredExperience: [
          {
            company: "Apple",
            title: "Engineer",
            bullets: [
              {
                original: "Led team",
                tailored: "Led cross-functional team of 10+",
                changeReason: "Added metric",
                keywordsAddressed: [],
                confidence: "medium",
                riskFlag: "Unverified team size",
              },
            ],
          },
        ],
      };

      const violations = detectFlaggedBullets(tailored);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toContain("Unverified team size");
    });
  });
});

describe("Guardrails — Metric Tracer", () => {
  it("should warn about missing metrics from original", () => {
    const original: ResumeProfile = {
      contact: { name: "John", email: "", phone: "", location: "" },
      experience: [
        {
          company: "Apple",
          title: "Engineer",
          startDate: "2020",
          endDate: "2023",
          bullets: ["Improved performance by 50%", "Led team of 5"],
        },
      ],
      skills: [],
      projects: [],
      education: [],
      certifications: [],
    };

    const tailored: TailoredResume = {
      tailoredSummary: "Improved systems",
      tailoredSkills: [],
      tailoredExperience: [
        {
          company: "Apple",
          title: "Engineer",
          bullets: [{ original: "Improved performance by 50%", tailored: "Optimized performance", changeReason: "Simplified", keywordsAddressed: [], confidence: "high" }],
        },
      ],
    };

    const { warnings } = traceMetrics(original, tailored);
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe("Guardrails — Keyword Density", () => {
  it("should warn about excessive keyword repetition", () => {
    const tailored: TailoredResume = {
      tailoredSummary: "React React React developer. JavaScript JavaScript JavaScript expert.",
      tailoredSkills: ["React", "React", "JavaScript", "JavaScript"],
      tailoredExperience: [
        {
          company: "Apple",
          title: "Engineer",
          bullets: [
            {
              original: "Built systems",
              tailored: "Built React systems using JavaScript and React with JavaScript",
              changeReason: "Added keywords",
              keywordsAddressed: ["React", "JavaScript"],
              confidence: "high",
            },
          ],
        },
      ],
    };

    const jd: JobDescriptionProfile = {
      jobTitle: "Software Engineer",
      company: "Google",
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
      qualifications: [],
      tools: [],
      keywords: ["React", "JavaScript"],
      seniorityLevel: "Senior",
      domainSignals: [],
    };

    const warnings = checkKeywordDensity(tailored, jd);
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe("GuardrailsService", () => {
  it("should block export on new company violation", () => {
    const service = new GuardrailsService();

    const original: ResumeProfile = {
      contact: { name: "John", email: "", phone: "", location: "" },
      experience: [{ company: "Apple", title: "Engineer", startDate: "2020", endDate: "2023", bullets: [] }],
      skills: [],
      projects: [],
      education: [],
      certifications: [],
    };

    const tailored: TailoredResume = {
      tailoredSummary: "",
      tailoredSkills: [],
      tailoredExperience: [
        {
          company: "Fake Corp",
          title: "Engineer",
          bullets: [],
        },
      ],
    };

    const jd: JobDescriptionProfile = {
      jobTitle: "Engineer",
      company: "Google",
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
      qualifications: [],
      tools: [],
      keywords: [],
      seniorityLevel: "Senior",
      domainSignals: [],
    };

    const result = service.validate(original, tailored, jd);
    expect(result.blockedForExport).toBe(true);
    expect(result.blockingViolations.length).toBeGreaterThan(0);
  });

  it("should allow export with only warnings", () => {
    const service = new GuardrailsService();

    const original: ResumeProfile = {
      contact: { name: "John", email: "", phone: "", location: "" },
      experience: [
        {
          company: "Apple",
          title: "Engineer",
          startDate: "2020",
          endDate: "2023",
          bullets: ["Improved by 50%"],
        },
      ],
      skills: [],
      projects: [],
      education: [],
      certifications: [],
    };

    const tailored: TailoredResume = {
      tailoredSummary: "",
      tailoredSkills: [],
      tailoredExperience: [
        {
          company: "Apple",
          title: "Senior Engineer",
          bullets: [
            {
              original: "Improved by 50%",
              tailored: "Optimized performance significantly",
              changeReason: "Enhanced",
              keywordsAddressed: [],
              confidence: "high",
            },
          ],
        },
      ],
    };

    const jd: JobDescriptionProfile = {
      jobTitle: "Engineer",
      company: "Google",
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
      qualifications: [],
      tools: [],
      keywords: [],
      seniorityLevel: "Senior",
      domainSignals: [],
    };

    const result = service.validate(original, tailored, jd);
    expect(result.blockedForExport).toBe(false);
  });
});
