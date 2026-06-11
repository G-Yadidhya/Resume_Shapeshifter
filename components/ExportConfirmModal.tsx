"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ExportConfirmModalProps {
  isOpen: boolean;
  warnings: string[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExportConfirmModal({
  isOpen,
  warnings,
  onConfirm,
  onCancel,
  isLoading = false,
}: ExportConfirmModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Confirm Before Export</h2>

        <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium text-foreground">
            Please review your tailored resume:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span>✓</span>
              <span>All content is accurate and truthful</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>No invented employers, degrees, or skills</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>All metrics and accomplishments are verifiable</span>
            </li>
          </ul>

          {warnings.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                Items to review:
              </p>
              <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-400">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="confirm-truth"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <label
            htmlFor="confirm-truth"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have reviewed and verify all content is accurate and truthful
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!confirmed || isSubmitting || isLoading}
            className="flex-1"
          >
            {isSubmitting ? "Exporting..." : "Export PDFs"}
          </Button>
        </div>
      </div>
    </div>
  );
}
