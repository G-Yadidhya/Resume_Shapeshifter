import { NextResponse } from "next/server";

import { LLMError } from "@/lib/llm/client";
import { createTailoringOrchestrator } from "@/lib/orchestrator";
import { TailorRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Request body must be valid JSON");
  }

  const parsed = TailorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid request body", parsed.error.flatten());
  }

  try {
    const analysis = await createTailoringOrchestrator().analyze(parsed.data);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[api/analyze] failed", error);
    if (error instanceof LLMError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.code === "LLM_CONFIG_ERROR" ? 503 : 502 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to analyze resume and job description",
        },
      },
      { status: 500 },
    );
  }
}

function validationError(message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code: "VALIDATION_ERROR", message, details } },
    { status: 400 },
  );
}
