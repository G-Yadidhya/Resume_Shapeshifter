/**
 * Detect if keyword density spikes indicate over-optimization
 */

import type { JobDescriptionProfile, TailoredResume } from "@/lib/schemas";

/**
 * Calculate keyword frequency in text
 */
function calculateKeywordDensity(text: string, keywords: string[]): Map<string, number> {
  const lowerText = text.toLowerCase();
  const densityMap = new Map<string, number>();

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    // Count occurrences
    const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = lowerText.match(regex) || [];
    if (matches.length > 0) {
      densityMap.set(keyword, matches.length);
    }
  }

  return densityMap;
}

/**
 * Check if keyword density is suspiciously high (over-optimization)
 */
export function checkKeywordDensity(
  tailored: TailoredResume,
  jd: JobDescriptionProfile
): string[] {
  const warnings: string[] = [];

  // Combine all tailored text
  const tailoredText =
    tailored.tailoredSummary +
    " " +
    tailored.tailoredSkills.join(" ") +
    " " +
    tailored.tailoredExperience
      .map((e) => e.bullets.map((b) => b.tailored).join(" "))
      .join(" ");

  const totalWords = tailoredText.split(/\s+/).length;

  const density = calculateKeywordDensity(tailoredText, jd.keywords);

  // Flag keywords appearing more than twice or >2% of text
  for (const [keyword, count] of density) {
    const percentage = (count / totalWords) * 100;
    if (count > 3 || percentage > 2) {
      warnings.push(
        `Keyword "${keyword}" appears ${count} times (${percentage.toFixed(1)}% of tailored resume) — possible over-optimization`
      );
    }
  }

  return warnings;
}
