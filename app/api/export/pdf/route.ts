import { NextResponse } from "next/server";

import { generateComparisonPDF, generateTailoredPDF } from "@/lib/pdf/generate";
import { TailoringRunSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } }, { status: 400 });
  }

  const parsed = TailoringRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid TailoringRun body", details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  const pdfType =
    typeof body === "object" &&
    body !== null &&
    "pdfType" in body &&
    (body as Record<string, unknown>).pdfType === "tailored"
      ? "tailored"
      : "comparison";

  // Re-validate guardrails before export
  if (parsed.data.blockedForExport) {
    return NextResponse.json(
      { 
        error: { 
          code: "EXPORT_BLOCKED", 
          message: "Export is blocked due to guardrail violations",
          violations: parsed.data.guardrailWarnings.filter(w => w.includes("block") || w.includes("not"))
        } 
      }, 
      { status: 403 },
    );
  }
  try {
    const pdf =
      pdfType === "tailored"
        ? await generateTailoredPDF(parsed.data)
        : await generateComparisonPDF(parsed.data);

    const filename = pdfType === "tailored" ? `tailored-${parsed.data.id ?? "run"}.pdf` : `comparison-${parsed.data.id ?? "run"}.pdf`;

    return new Response(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("/api/export/pdf error", err);
    return NextResponse.json({ error: { code: "EXPORT_ERROR", message: String(err) } }, { status: 500 });
  }
}

export { POST as GET };