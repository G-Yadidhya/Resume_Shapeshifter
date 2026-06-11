import { nanoid } from "nanoid";

import mockFixture from "@/fixtures/mock-tailoring-run.json";
import { TailoringRunSchema, type TailoringRun } from "@/lib/schemas";

const MOCK_DELAY_MS = 1500;
const MIN_LOADING_MS = 800;

const validatedFixture = TailoringRunSchema.parse(mockFixture);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface MockOrchestratorOptions {
  delayMs?: number;
  signal?: AbortSignal;
}

/**
 * Returns a validated mock TailoringRun after a simulated pipeline delay.
 * Phase 1: inputs are accepted but fixture content is fixed.
 */
export async function mockOrchestratorRun(
  options: MockOrchestratorOptions = {},
): Promise<TailoringRun> {
  const delayMs = Math.max(options.delayMs ?? MOCK_DELAY_MS, MIN_LOADING_MS);
  const started = Date.now();

  if (options.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  await sleep(delayMs);

  if (options.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const elapsed = Date.now() - started;
  if (elapsed < MIN_LOADING_MS) {
    await sleep(MIN_LOADING_MS - elapsed);
  }

  return {
    ...validatedFixture,
    id: `run_${nanoid(10)}`,
    createdAt: new Date().toISOString(),
    status: "complete",
  };
}
