import { NextResponse } from "next/server";
import { z } from "zod";

import { createDefaultLLMClient, LLMError } from "@/lib/llm/client";
import { JDParserService } from "@/lib/services/jd-parser";

const JDParseRequestSchema = z.object({
  jobDescription: z.string(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Request body must be valid JSON");
  }

  const parsed = JDParseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid request body", parsed.error.flatten());
  }

  try {
    const jobDescription = await new JDParserService(
      createDefaultLLMClient(),
    ).parse(parsed.data.jobDescription);
    return NextResponse.json({ jobDescription });
  } catch (error) {
    console.error("[api/parse/jd] failed", error);
    return routeError(error, "Failed to parse job description");
  }
}

function validationError(message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code: "VALIDATION_ERROR", message, details } },
    { status: 400 },
  );
}

function routeError(error: unknown, fallbackMessage: string) {
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
        message: fallbackMessage,
      },
    },
    { status: 500 },
  );
}
