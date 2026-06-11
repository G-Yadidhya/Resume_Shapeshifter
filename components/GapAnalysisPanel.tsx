import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { importanceOrder } from "@/lib/format";
import type { GapAnalysis } from "@/lib/schemas";

interface GapAnalysisPanelProps {
  gaps: GapAnalysis;
}

const importanceVariant = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const;

export function GapAnalysisPanel({ gaps }: GapAnalysisPanelProps) {
  const sorted = [...gaps.gaps].sort(
    (a, b) => importanceOrder(a.importance) - importanceOrder(b.importance),
  );

  // Dedupe by normalized name
  const seen = new Set<string>();
  const unique = sorted.filter((gap) => {
    const key = gap.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gap analysis</CardTitle>
        <CardDescription>
          Requirements from the job description that are missing or weak on your
          resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unique.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Strong alignment on required skills — no major gaps flagged for this
            role.
          </p>
        ) : (
          <ul className="space-y-4">
            {unique.map((gap) => (
              <li
                key={gap.name}
                className="border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{gap.name}</span>
                  <Badge variant={importanceVariant[gap.importance]}>
                    {gap.importance}
                  </Badge>
                  {gap.canSafelyAdd ? (
                    <Badge variant="outline">Add only if true for you</Badge>
                  ) : (
                    <Badge variant="outline">Do not invent</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-1 text-xs">
                  <span className="font-medium text-foreground">JD: </span>
                  {gap.jdEvidence}
                </p>
                <p className="text-muted-foreground mb-2 text-xs">
                  <span className="font-medium text-foreground">Resume: </span>
                  {gap.resumeEvidence || "Not mentioned"}
                </p>
                <p className="text-sm">
                  {gap.suggestedAction || "Review this requirement manually"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
