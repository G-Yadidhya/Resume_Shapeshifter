export function combineScores(scores: {
  skillCoverageScore: number;
  responsibilityAlignmentScore: number;
  keywordScore: number;
  seniorityScore: number;
  criticalMissingCount: number;
}) {
  const base =
    scores.skillCoverageScore * 0.5 +
    scores.responsibilityAlignmentScore * 0.2 +
    scores.keywordScore * 0.2 +
    scores.seniorityScore * 0.1;
  const penalty = Math.min(20, scores.criticalMissingCount * 4);
  return clampScore(Math.round(base - penalty));
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
