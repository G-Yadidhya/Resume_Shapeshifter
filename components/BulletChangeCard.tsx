"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { TailoredBullet } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface BulletChangeCardProps {
  bullet: TailoredBullet;
  unchanged?: boolean;
}

const confidenceStyles = {
  high: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30",
  medium:
    "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30",
  low: "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30",
} as const;

const MAX_VISIBLE_KEYWORDS = 6;

export function BulletChangeCard({
  bullet,
  unchanged = false,
}: BulletChangeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = bullet.tailored.length > 280;
  const displayTailored =
    isLong && !expanded ? `${bullet.tailored.slice(0, 280)}…` : bullet.tailored;

  const keywords = bullet.keywordsAddressed ?? [];
  const visibleKeywords = keywords.slice(0, MAX_VISIBLE_KEYWORDS);
  const hiddenCount = keywords.length - visibleKeywords.length;

  return (
    <div
      className={cn(
        "space-y-2 rounded-lg border p-3 text-sm",
        unchanged
          ? "border-border bg-muted/30"
          : confidenceStyles[bullet.confidence],
      )}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
            Original
          </p>
          <p className="leading-relaxed">{bullet.original}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">
            Tailored
          </p>
          <p
            className={cn(
              "leading-relaxed",
              !unchanged && bullet.original !== bullet.tailored && "font-medium",
            )}
          >
            {displayTailored}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-primary mt-1 text-xs underline-offset-2 hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      {!unchanged && (
        <>
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="font-medium text-foreground">Why: </span>
            {bullet.changeReason || "No reason provided"}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {bullet.confidence} confidence
            </Badge>
            {visibleKeywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{hiddenCount} more
              </Badge>
            )}
            {bullet.riskFlag && (
              <Badge variant="destructive" className="text-xs">
                Review: {bullet.riskFlag}
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
