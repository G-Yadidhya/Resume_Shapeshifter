"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ExportConfirmModal } from "@/components/ExportConfirmModal";
import type { TailoringRun } from "@/lib/schemas";
import { saveTailoringRun } from "@/lib/session";

interface PDFExportButtonProps {
  run: TailoringRun;
}

export function PDFExportButton({ run }: PDFExportButtonProps) {
  const [loading, setLoading] = React.useState<"comparison" | "tailored" | null>(null);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<"comparison" | "tailored" | null>(null);

  const isBlocked = run.blockedForExport;
  const warnings = run.guardrailWarnings ?? [];

  async function handleExport(type: "comparison" | "tailored") {
    setLoading(type);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...run, pdfType: type }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.error?.message || err?.error?.code || `Export failed (${res.status})`,
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${run.id ?? "run"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      const openFallback = confirm(
        `Server-side PDF generation failed: ${message}\n\n` +
        `Would you like to open the print-friendly page to save it to PDF using your browser's Print feature instead?`
      );
      if (openFallback) {
        try {
          saveTailoringRun(run);
          window.open(`/export/comparison/${run.id}`, "_blank");
        } catch (err) {
          console.error("Failed to save run or open fallback printing", err);
          alert("Could not open print page.");
        }
      }
    } finally {
      setLoading(null);
      setShowConfirmModal(false);
    }
  }

  const handleStartExport = (type: "comparison" | "tailored") => {
    if (isBlocked) {
      alert(
        "Export is blocked due to guardrail violations. Please review the errors above.",
      );
      return;
    }

    setSelectedType(type);
    setShowConfirmModal(true);
  };

  const handleConfirmExport = async () => {
    if (selectedType) {
      await handleExport(selectedType);
    }
  };

  return (
     <>
       <div className="flex flex-wrap gap-2">
         <Button
           onClick={() => handleStartExport("comparison")}
           disabled={loading !== null || isBlocked}
           variant={isBlocked ? "outline" : "default"}
         >
           {loading === "comparison" ? "Preparing…" : "📄 Comparison PDF"}
         </Button>
         <Button
           onClick={() => handleStartExport("tailored")}
           disabled={loading !== null || isBlocked}
           variant={isBlocked ? "outline" : "default"}
         >
           {loading === "tailored" ? "Preparing…" : "✅ Tailored Resume PDF"}
         </Button>
       </div>
       <ExportConfirmModal
         isOpen={showConfirmModal}
         warnings={warnings}
         onConfirm={handleConfirmExport}
         onCancel={() => {
           setShowConfirmModal(false);
           setSelectedType(null);
         }}
         isLoading={loading !== null}
       />
     </>
  );
}
