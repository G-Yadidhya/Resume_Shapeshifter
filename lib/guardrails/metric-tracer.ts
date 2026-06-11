/**
 * Trace numeric metrics from original resume to ensure they appear in tailored
 */

import type { ResumeProfile, TailoredResume } from "@/lib/schemas";

/**
 * Extract all numeric values from a string
 */
function extractNumbers(text: string): number[] {
  const pattern = /\b\d+(?:[.,]\d+)?\b/g;
  const matches = text.match(pattern) || [];
  return matches.map((m) => parseFloat(m.replace(",", "")));
}

/**
 * Check if a metric (e.g., "5") appears in tailored content
 */
function metricAppearsInTailored(
  metric: string,
  tailored: TailoredResume
): boolean {
  const tailoredText =
    tailored.tailoredSummary +
    " " +
    tailored.tailoredSkills.join(" ") +
    " " +
    tailored.tailoredExperience.map((e) => e.bullets.map((b) => b.tailored).join(" ")).join(" ");

  return tailoredText.includes(metric);
}

/**
 * Identify metrics in original that don't appear in tailored
 */
export function traceMetrics(
  original: ResumeProfile,
  tailored: TailoredResume
): { missingMetrics: string[]; warnings: string[] } {
  const warnings: string[] = [];
  const missingMetrics: string[] = [];

  // Extract metrics from original experience bullets
  for (const exp of original.experience) {
    for (const bullet of exp.bullets) {
      const numbers = extractNumbers(bullet);
      for (const num of numbers) {
        const numStr = num.toString();
        if (!metricAppearsInTailored(numStr, tailored)) {
          missingMetrics.push(numStr);
          warnings.push(
            `Metric "${numStr}" from original experience not found in tailored resume`
          );
        }
      }
    }
  }

  return { missingMetrics, warnings };
}
