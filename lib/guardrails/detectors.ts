/**
 * Rule detectors for guardrail validation
 * Each detector returns a string[] of violations/warnings
 */

import type {
  ExperienceEntry,
  ResumeProfile,
  TailoredBullet,
  TailoredResume,
} from "@/lib/schemas";

/**
 * Check if a new company appears in tailored experience that wasn't in original
 */
export function detectNewCompanies(
  original: ResumeProfile,
  tailored: TailoredResume
): string[] {
  const originalCompanies = new Set(
    original.experience.map((e) => e.company.toLowerCase())
  );

  const violations: string[] = [];

  for (const tailoredExp of tailored.tailoredExperience) {
    if (!originalCompanies.has(tailoredExp.company.toLowerCase())) {
      violations.push(
        `New company added in tailored resume: "${tailoredExp.company}" (not in original)`
      );
    }
  }

  return violations;
}

/**
 * Check if new education/degrees appear in tailored resume
 */
export function detectNewDegrees(
  original: ResumeProfile,
  tailored: TailoredResume
): string[] {
  const originalDegrees = new Set(
    original.education.map((e) => `${e.degree}|${e.field}`.toLowerCase())
  );

  // NOTE: TailoredResume doesn't explicitly have education, 
  // but we check if degrees are mentioned in tailored summary/bullets
  const violations: string[] = [];

  // Check for common degree keywords in tailored summary
  const degreePatterns =
    /\b(bachelor|master|phd|mba|bsc|msc|b\.?s|m\.?s|b\.?a|m\.?a)\b/gi;
  const matches = tailored.tailoredSummary.match(degreePatterns);

  if (matches) {
    for (const match of matches) {
      if (
        !originalDegrees.has(match.toLowerCase()) &&
        !original.education.some((e) =>
          e.degree.toLowerCase().includes(match.toLowerCase())
        )
      ) {
        violations.push(`Potential new degree mention in tailored summary: "${match}"`);
      }
    }
  }

  return violations;
}

/**
 * Check if new certifications appear
 */
export function detectNewCertifications(
  original: ResumeProfile,
  tailored: TailoredResume
): string[] {
  const originalCerts = new Set(
    original.certifications.map((c) => c.name.toLowerCase())
  );

  const violations: string[] = [];

  // Check for certification keywords in tailored summary/bullets
  const certPattern = /certified|certification|credential|(aws|azure|gcp|ccna|cissp)/gi;
  const summaryMatches = tailored.tailoredSummary.match(certPattern) || [];

  for (const match of summaryMatches) {
    if (!originalCerts.has(match.toLowerCase())) {
      violations.push(
        `Potential new certification mention in tailored content: "${match}"`
      );
    }
  }

  return violations;
}

/**
 * Check if low-confidence bullets exist
 */
export function detectLowConfidenceBullets(
  tailored: TailoredResume
): string[] {
  const violations: string[] = [];
  let lowConfidenceCount = 0;

  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      if (bullet.confidence === "low") {
        lowConfidenceCount++;
      }
    }
  }

  if (tailored.tailoredProjects) {
    for (const project of tailored.tailoredProjects) {
      for (const bullet of project.bullets) {
        if (bullet.confidence === "low") {
          lowConfidenceCount++;
        }
      }
    }
  }

  if (lowConfidenceCount > 0) {
    violations.push(
      `${lowConfidenceCount} low-confidence bullet(s) require review`
    );
  }

  return violations;
}

/**
 * Check if any bullet has an existing risk flag
 */
export function detectFlaggedBullets(
  tailored: TailoredResume
): string[] {
  const violations: string[] = [];

  for (const exp of tailored.tailoredExperience) {
    for (const bullet of exp.bullets) {
      if (bullet.riskFlag) {
        violations.push(`Flagged bullet in ${exp.company}: ${bullet.riskFlag}`);
      }
    }
  }

  if (tailored.tailoredProjects) {
    for (const project of tailored.tailoredProjects) {
      for (const bullet of project.bullets) {
        if (bullet.riskFlag) {
          violations.push(
            `Flagged bullet in project ${project.name}: ${bullet.riskFlag}`
          );
        }
      }
    }
  }

  return violations;
}
