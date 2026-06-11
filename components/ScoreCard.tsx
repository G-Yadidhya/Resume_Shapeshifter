"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatScoreDelta } from "@/lib/format";
import type { MatchScore } from "@/lib/schemas";

interface ScoreCardProps {
  originalScore: MatchScore;
  tailoredScore: MatchScore;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export function ScoreCard({ originalScore, tailoredScore }: ScoreCardProps) {
  const { label: deltaLabel } = formatScoreDelta(originalScore, tailoredScore);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Before tailoring</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {originalScore.overallScore}
            <span className="text-muted-foreground text-base font-normal">
              /100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBar
            label="Skill coverage"
            value={originalScore.skillCoverageScore}
          />
          <ScoreBar
            label="Responsibility alignment"
            value={originalScore.responsibilityAlignmentScore}
          />
          <ScoreBar label="Keywords" value={originalScore.keywordScore} />
          <ScoreBar label="Seniority" value={originalScore.seniorityScore} />
          <p className="text-muted-foreground text-sm leading-relaxed">
            {originalScore.explanation}
          </p>
          <p className="text-muted-foreground text-xs">
            Scores are estimates based on resume–JD alignment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center justify-between gap-2">
            <span>After tailoring</span>
            <span
              className={
                tailoredScore.overallScore >= originalScore.overallScore
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }
            >
              {deltaLabel}
            </span>
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {tailoredScore.overallScore}
            <span className="text-muted-foreground text-base font-normal">
              /100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBar
            label="Skill coverage"
            value={tailoredScore.skillCoverageScore}
          />
          <ScoreBar
            label="Responsibility alignment"
            value={tailoredScore.responsibilityAlignmentScore}
          />
          <ScoreBar label="Keywords" value={tailoredScore.keywordScore} />
          <ScoreBar label="Seniority" value={tailoredScore.seniorityScore} />
          <p className="text-muted-foreground text-sm leading-relaxed">
            {tailoredScore.explanation}
          </p>
          {tailoredScore.criticalMissingRequirements.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Still missing</p>
              <ul className="text-muted-foreground list-inside list-disc text-xs">
                {tailoredScore.criticalMissingRequirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
