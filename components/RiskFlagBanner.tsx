"use client";

import { AlertCircle } from "lucide-react";

interface RiskFlagBannerProps {
  violations: string[];
  warnings: string[];
}

export function RiskFlagBanner({ violations, warnings }: RiskFlagBannerProps) {
  if (violations.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Blocking violations */}
      {violations.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Guardrail Violations — Export Blocked
              </h3>
              <p className="mb-2 mt-1 text-sm text-red-800 dark:text-red-200">
                The following issues must be resolved before exporting:
              </p>
              <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                {violations.map((violation, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{violation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Non-blocking warnings */}
      {warnings.length > 0 && violations.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Review Required
              </h3>
              <p className="mb-2 mt-1 text-sm text-amber-800 dark:text-amber-200">
                Please review the following before exporting:
              </p>
              <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
