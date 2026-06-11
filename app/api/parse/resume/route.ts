import { NextResponse } from "next/server";
import { z } from "zod";

import { createDefaultLLMClient, LLMError } from "@/lib/llm/client";
import { ResumeParserService } from "@/lib/services/resume-parser";
import { extractDocxText } from "@/lib/parsers/docx";
import { extractPdfText } from "@/lib/parsers/pdf";

const ResumeParseRequestSchema = z.object({
  resume: z.object({
    type: z.literal("text"),
    content: z.string(),
  }),
});

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return await handleFileUpload(request);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationError("Request body must be valid JSON");
  }

  const parsed = ResumeParseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid request body", parsed.error.flatten());
  }

  try {
    const resume = await new ResumeParserService(
      createDefaultLLMClient(),
    ).parse(parsed.data.resume);
    return NextResponse.json({ resume });
  } catch (error) {
    console.error("[api/parse/resume] failed", error);
    return routeError(error, "Failed to parse resume");
  }
}

async function handleFileUpload(request: Request) {
  let filename = "unknown";
  let fileType = "unknown";
  try {
    const formData = await request.formData();
    const file = formData.get("resumeFile");
    const fileLike = file as { name?: unknown; type?: unknown; arrayBuffer?: () => Promise<ArrayBuffer>; text?: () => Promise<string> };

    if (
      !fileLike ||
      typeof fileLike.name !== "string" ||
      typeof fileLike.arrayBuffer !== "function"
    ) {
      return validationError("Missing resume file in upload");
    }

    filename = fileLike.name.toLowerCase();
    fileType = String(fileLike.type ?? "").toLowerCase();
    const fileBuffer = Buffer.from(await fileLike.arrayBuffer());

    if (filename.endsWith(".pdf") || fileType === "application/pdf") {
      const resumeText = await extractPdfText(fileBuffer);
      if (!resumeText) {
        return validationError(
          "Uploaded PDF contains no extractable text. Please paste the resume text manually or upload a text-based file.",
        );
      }
      return NextResponse.json({ resumeText });
    }

    if (
      filename.endsWith(".docx") ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const resumeText = await extractDocxText(fileBuffer);
      if (!resumeText) {
        return validationError(
          "Uploaded DOCX contains no extractable text. Please paste the resume text manually or upload a plain text file.",
        );
      }
      return NextResponse.json({ resumeText });
    }

    if (filename.endsWith(".txt") || fileType === "text/plain") {
      const resumeText = typeof fileLike.text === "function"
        ? await fileLike.text()
        : fileBuffer.toString("utf-8");
      return NextResponse.json({ resumeText });
    }

    return validationError(
      "Unsupported resume file type. Please upload PDF, DOCX, or TXT.",
    );
  } catch (error) {
    console.error("[api/parse/resume] file upload failed", {
      filename,
      fileType,
      error,
    });
    const message =
      error instanceof Error
        ? error.message
        : "Failed to extract uploaded resume text.";
    return routeError(error, message);
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
        message: error instanceof Error ? error.message : fallbackMessage,
      },
    },
    { status: 500 },
  );
}
