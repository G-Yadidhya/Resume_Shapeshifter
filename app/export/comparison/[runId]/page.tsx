"use client";

import React, { use, useEffect, useState } from "react";
import ComparisonTemplate from "@/lib/pdf/comparison-template";
import type { TailoringRun } from "@/lib/schemas";
import { loadTailoringRun } from "@/lib/session";

/**
 * Print-friendly comparison view for PDF export (Phase 3).
 * Client-renders the comparison template, loading the run data from sessionStorage or a base64 query parameter.
 */
export default function ComparisonExportPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  const { runId } = use(params);
  const sp = use(searchParams);

  const [run, setRun] = useState<TailoringRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from sessionStorage
    const storedRun = loadTailoringRun();
    if (storedRun && storedRun.id === runId) {
      setRun(storedRun);
      setLoading(false);
      return;
    }

    // 2. Fall back to searchParams.run query param
    if (sp.run) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sp.run))));
        setRun(decoded);
      } catch (err) {
        console.error("Failed to decode run from query param", err);
      }
    }
    setLoading(false);
  }, [runId, sp.run]);

  if (loading) {
    return (
      <main style={{ padding: "40px", fontFamily: "system-ui, sans-serif" }}>
        <h1>Comparison Export</h1>
        <p style={{ color: "#666" }}>Loading comparison view...</p>
      </main>
    );
  }

  if (!run) {
    return (
      <main style={{ padding: "40px", fontFamily: "system-ui, sans-serif" }}>
        <h1>Comparison Export</h1>
        <p style={{ color: "#666" }}>
          No run data found for <code>{runId}</code>. Pass the run JSON as a base64-encoded <code>run</code> query
          parameter or make sure it is present in your active session.
        </p>
      </main>
    );
  }

  return (
    <main>
      <style>{`
        body { margin: 0; padding: 0; }
        @media print {
          body { background: white; }
          button { display: none; }
        }
      `}</style>
      <div style={{ padding: "16px", background: "#f9f9f9", borderBottom: "1px solid #ccc", textAlign: "center" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            border: "1px solid #0070f3",
            background: "#0070f3",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          🖨️ Print to PDF
        </button>
      </div>
      <ComparisonTemplate run={run} />
    </main>
  );
}

