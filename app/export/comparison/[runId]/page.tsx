import ComparisonTemplate from "@/lib/pdf/comparison-template";
import type { TailoringRun } from "@/lib/schemas";

/**
 * Print-friendly comparison view for PDF export (Phase 3).
 * Server-renders the comparison template for browser-based PDF generation.
 */
export default async function ComparisonExportPage({
  params,
  searchParams,
}: {
  params: Promise<{ runId: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  const { runId } = await params;
  const sp = await searchParams;

  let run: TailoringRun | null = null;
  if (sp.run) {
    try {
      run = JSON.parse(Buffer.from(sp.run, "base64").toString("utf-8"));
    } catch (err) {
      console.error("Failed to decode run from query param", err);
    }
  }

  if (!run) {
    return (
      <main style={{ padding: "40px", fontFamily: "system-ui, sans-serif" }}>
        <h1>Comparison Export</h1>
        <p style={{ color: "#666" }}>
          No run data found for <code>{runId}</code>. Pass the run JSON as a base64-encoded <code>run</code> query
          parameter.
        </p>
        <p style={{ fontSize: 12, color: "#999", marginTop: 16 }}>
          Example: <code>/export/comparison/{runId}?run={Buffer.from(JSON.stringify({})).toString("base64").slice(0, 20)}...</code>
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
