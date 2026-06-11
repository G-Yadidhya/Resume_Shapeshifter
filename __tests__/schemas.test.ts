import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import {
  MatchScoreSchema,
  TailoringRunSchema,
  TailorRequestSchema,
} from "@/lib/schemas";

describe("TailoringRunSchema", () => {
  it("parses mock fixture JSON", () => {
    const raw = readFileSync(
      join(process.cwd(), "fixtures", "mock-tailoring-run.json"),
      "utf-8",
    );
    const data = JSON.parse(raw);
    const result = TailoringRunSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects out-of-range scores", () => {
    const result = MatchScoreSchema.safeParse({
      overallScore: 105,
      skillCoverageScore: 50,
      responsibilityAlignmentScore: 50,
      keywordScore: 50,
      seniorityScore: 50,
      criticalMissingRequirements: [],
      explanation: "test",
    });
    expect(result.success).toBe(false);
  });
});

describe("TailorRequestSchema", () => {
  it("accepts valid text resume request", () => {
    const result = TailorRequestSchema.safeParse({
      resume: { type: "text", content: "Hello" },
      jobDescription: "Backend engineer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty resume type", () => {
    const result = TailorRequestSchema.safeParse({
      resume: { type: "pdf", content: "x" },
      jobDescription: "JD",
    });
    expect(result.success).toBe(false);
  });
});
