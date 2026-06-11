import type { MatchScore } from "@/lib/schemas";

export function formatScoreDelta(
  original: MatchScore,
  tailored: MatchScore,
): { delta: number; label: string } {
  const delta = tailored.overallScore - original.overallScore;
  if (delta > 0) {
    return { delta, label: `+${delta} pts` };
  }
  if (delta < 0) {
    return { delta, label: `${delta} pts` };
  }
  return { delta: 0, label: "No change" };
}

export function importanceOrder(importance: "high" | "medium" | "low"): number {
  return { high: 0, medium: 1, low: 2 }[importance];
}
