import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import type { CompleteJSONParams, LLMClient } from "@/lib/llm/client";
import { createTailoringOrchestrator } from "@/lib/orchestrator";
import { TailoringRunSchema } from "@/lib/schemas";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "fixtures", "mock-tailoring-run.json"), "utf-8"),
);

class MockLLMClient implements LLMClient {
  async completeJSON<T>(params: CompleteJSONParams<T>): Promise<T> {
    switch (params.name) {
      case "ResumeProfile":
        return params.schema.parse(fixture.resume);
      case "JobDescriptionProfile":
        return params.schema.parse(fixture.jobDescription);
      case "GapAnalysis":
        return params.schema.parse(fixture.gaps);
      case "TailoredResume":
        return params.schema.parse(fixture.tailored);
      case "MatchSignal": {
        const isTailored = params.user.includes("tailoredSummary");
        return params.schema.parse({
          responsibilityAlignmentScore: isTailored ? 82 : 55,
          seniorityScore: 72,
          criticalMissingRequirements: isTailored
            ? ["GraphQL", "Kubernetes"]
            : ["GraphQL", "CI/CD pipelines"],
          explanation: isTailored
            ? "Tailored bullets better reflect backend API work."
            : "Original resume covers core backend skills but misses some JD language.",
        });
      }
      default:
        throw new Error(`Unexpected schema request: ${params.name}`);
    }
  }
}

describe("TailoringOrchestrator", () => {
  it("runs the Phase 2 pipeline with a mocked LLM client", async () => {
    const orchestrator = createTailoringOrchestrator(new MockLLMClient());
    const run = await orchestrator.run({
      resume: { type: "text", content: "Sample resume" },
      jobDescription: "Sample job description",
    });

    const parsed = TailoringRunSchema.safeParse(run);
    expect(parsed.success).toBe(true);
    expect(run.status).toBe("complete");
    expect(run.id).toMatch(/^run_/);
    expect(run.tailored.tailoredExperience[0]?.bullets[0]?.original).toBe(
      fixture.tailored.tailoredExperience[0].bullets[0].original,
    );
    expect(run.tailoredScore.overallScore).toBeGreaterThan(
      run.originalScore.overallScore,
    );
  });
});
