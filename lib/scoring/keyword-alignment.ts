import type {
  JobDescriptionProfile,
  ResumeProfile,
  TailoredResume,
} from "@/lib/schemas";
import { includesTerm, resumeToSearchText, uniqueTerms } from "@/lib/scoring/text";

export type KeywordAlignmentResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
};

export function scoreKeywordAlignment(
  resume: ResumeProfile | TailoredResume,
  jobDescription: JobDescriptionProfile,
): KeywordAlignmentResult {
  const searchText = resumeToSearchText(resume);
  const keywords = uniqueTerms([
    ...jobDescription.keywords,
    ...jobDescription.responsibilities.flatMap((item) =>
      item.split(/[;,]/).slice(0, 2),
    ),
  ]);

  const matchedKeywords = keywords.filter((term) => includesTerm(searchText, term));
  const missingKeywords = keywords.filter((term) => !includesTerm(searchText, term));

  return {
    score: keywords.length
      ? Math.round((matchedKeywords.length / keywords.length) * 100)
      : 100,
    matchedKeywords,
    missingKeywords,
  };
}
