import { z } from "zod";

import { completeJSONWithRetry } from "@/lib/llm/retry";

export type LLMErrorCode =
  | "LLM_CONFIG_ERROR"
  | "LLM_HTTP_ERROR"
  | "LLM_PARSE_ERROR"
  | "VALIDATION_ERROR";

export class LLMError extends Error {
  code: LLMErrorCode;
  status?: number;
  details?: unknown;

  constructor(
    code: LLMErrorCode,
    message: string,
    options: { status?: number; details?: unknown; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "LLMError";
    this.code = code;
    this.status = options.status;
    this.details = options.details;
  }
}

export type CompleteJSONParams<T> = {
  name: string;
  system: string;
  user: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any, any>;
  temperature?: number;
};

export interface LLMClient {
  completeJSON<T>(params: CompleteJSONParams<T>): Promise<T>;
}

type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

const GroqChatResponseSchema: z.ZodType<GroqChatResponse> = z.object({
  choices: z
    .array(
      z.object({
        message: z
          .object({
            content: z.string().nullable().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
});

export class GroqLLMClient implements LLMClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(options: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    timeoutMs?: number;
  } = {}) {
    const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
    if (!apiKey?.trim()) {
      throw new LLMError(
        "LLM_CONFIG_ERROR",
        "GROQ_API_KEY is required for live LLM integration.",
      );
    }

    this.apiKey = apiKey;
    this.model =
      options.model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    this.baseUrl =
      options.baseUrl ?? "https://api.groq.com/openai/v1/chat/completions";
    this.timeoutMs = options.timeoutMs ?? 30000;
  }

  async completeJSON<T>(params: CompleteJSONParams<T>): Promise<T> {
    return completeJSONWithRetry(params, (messages) =>
      this.createChatCompletion(messages, params.temperature ?? 0.2),
    );
  }

  private async createChatCompletion(
    messages: GroqChatMessage[],
    temperature: number,
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          n: 1,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      const text = await response.text();

      if (!response.ok) {
        throw new LLMError(
          "LLM_HTTP_ERROR",
          `Groq request failed with status ${response.status}.`,
          { status: response.status, details: text },
        );
      }

      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch (error) {
        throw new LLMError("LLM_PARSE_ERROR", "Groq returned invalid JSON.", {
          details: text,
          cause: error,
        });
      }

      const parsed = GroqChatResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new LLMError(
          "VALIDATION_ERROR",
          "Groq response did not match the expected chat shape.",
          { details: parsed.error.flatten() },
        );
      }

      const content = parsed.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new LLMError("LLM_PARSE_ERROR", "Groq returned an empty reply.", {
          details: parsed.data,
        });
      }

      return content;
    } catch (error) {
      if (error instanceof LLMError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new LLMError("LLM_HTTP_ERROR", "Groq request timed out.", {
          cause: error,
        });
      }
      throw new LLMError("LLM_HTTP_ERROR", "Groq request failed.", {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createDefaultLLMClient(): LLMClient {
  return new GroqLLMClient();
}
