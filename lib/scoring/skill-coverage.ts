import type {
  JobDescriptionProfile,
  ResumeProfile,
  TailoredResume,
} from "@/lib/schemas";
import {
  includesTerm,
  preferredTerms,
  requiredTerms,
  resumeToSearchText,
} from "@/lib/scoring/text";

export type SkillCoverageResult = {
  score: number;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
  missingPreferred: string[];
};

export function scoreSkillCoverage(
  resume: ResumeProfile | TailoredResume,
  jobDescription: JobDescriptionProfile,
): SkillCoverageResult {
  const searchText = resumeToSearchText(resume);
  const required = requiredTerms(jobDescription);
  const preferred = preferredTerms(jobDescription);

  const matchedRequired = required.filter((term) => includesTerm(searchText, term));
  const missingRequired = required.filter((term) => !includesTerm(searchText, term));
  const matchedPreferred = preferred.filter((term) => includesTerm(searchText, term));
  const missingPreferred = preferred.filter((term) => !includesTerm(searchText, term));

  const requiredScore = ratioScore(matchedRequired.length, required.length);
  const preferredScore = ratioScore(matchedPreferred.length, preferred.length);
  const score =
    required.length > 0 && preferred.length > 0
      ? Math.round(requiredScore * 0.75 + preferredScore * 0.25)
      : Math.round((requiredScore + preferredScore) / 2);

  return {
    score,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
  };
}

function ratioScore(matched: number, total: number) {
  if (total === 0) return 100;
  return Math.round((matched / total) * 100);
}
