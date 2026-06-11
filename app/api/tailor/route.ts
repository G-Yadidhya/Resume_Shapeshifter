import { NextResponse } from "next/server";

import { LLMError } from "@/lib/llm/client";
import { createTailoringOrchestrator } from "@/lib/orchestrator";
import { TailorRequestSchema, TailoringRunSchema } from "@/lib/schemas";

export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST to run tailoring",
      },
    },
    { status: 405 },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 },
    );
  }

  const parsed = TailorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  const resumeContent = parsed.data.resume.content.trim();
  const jobDescription = parsed.data.jobDescription.trim();

  if (!resumeContent) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Resume content is required",
        },
      },
      { status: 400 },
    );
  }

  if (!jobDescription) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Job description is required",
        },
      },
      { status: 400 },
    );
  }

  try {
    const run = await createTailoringOrchestrator().run({
      resume: { type: "text", content: resumeContent },
      jobDescription,
    });
    const validated = TailoringRunSchema.parse(run);
    return NextResponse.json({ run: validated });
  } catch (error) {
    console.error("[api/tailor] orchestrator failed", error);
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
          message: "Failed to generate tailoring run",
        },
      },
      { status: 500 },
    );
  }
}
