import { type ZodType } from "zod";

import { LLMError, type CompleteJSONParams } from "@/lib/llm/client";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CompletionFn = (messages: ChatMessage[]) => Promise<string>;

export async function completeJSONWithRetry<T>(
  params: CompleteJSONParams<T>,
  complete: CompletionFn,
): Promise<T> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${params.system}\n\nReturn only a single valid JSON object. Do not wrap it in markdown.`,
    },
    { role: "user", content: params.user },
  ];

  let lastRaw = "";
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const raw = await complete(messages);
    lastRaw = raw;

    try {
      return parseAndValidateJSON(raw, params.schema);
    } catch (error) {
      lastError = error;
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content:
          `The previous response failed validation for ${params.name}. ` +
          "Return corrected JSON only, matching the requested shape exactly. " +
          "Preserve truthful content and use empty strings or arrays when information is unavailable.",
      });
    }
  }

  throw new LLMError(
    lastError instanceof LLMError ? lastError.code : "VALIDATION_ERROR",
    `LLM response for ${params.name} could not be parsed or validated.`,
    { details: { raw: lastRaw, error: lastError } },
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseAndValidateJSON<T>(raw: string, schema: ZodType<T, any, any>): T {
  const cleaned = stripMarkdownFences(raw).trim();
  let value: unknown;

  try {
    value = JSON.parse(cleaned);
  } catch (error) {
    throw new LLMError("LLM_PARSE_ERROR", "LLM response was not valid JSON.", {
      details: cleaned,
      cause: error,
    });
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new LLMError(
      "VALIDATION_ERROR",
      "LLM JSON did not match the expected schema.",
      { details: parsed.error.flatten() },
    );
  }

  return parsed.data;
}

function stripMarkdownFences(value: string) {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
