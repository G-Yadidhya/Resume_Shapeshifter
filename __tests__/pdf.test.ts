import { describe, expect, it } from "vitest";
import { diffBullets } from "@/lib/pdf/diff-bullets";
import type { TailoredBullet } from "@/lib/schemas";

describe("PDF diff-bullets", () => {
  it("detects changed bullets", () => {
    const bullets: TailoredBullet[] = [
      { original: "Led API development", tailored: "Architected scalable API microservices", changeReason: "", keywordsAddressed: [], confidence: "high" },
      { original: "Managed database", tailored: "Managed database", changeReason: "", keywordsAddressed: [], confidence: "high" },
      { original: "Wrote tests", tailored: "Implemented comprehensive unit and integration tests", changeReason: "", keywordsAddressed: [], confidence: "medium" },
    ];

    const diffs = diffBullets(bullets);

    expect(diffs).toHaveLength(3);
    expect(diffs[0].changed).toBe(true);
    expect(diffs[1].changed).toBe(false);
    expect(diffs[2].changed).toBe(true);
  });

  it("handles whitespace variations", () => {
    const bullets: TailoredBullet[] = [
      { original: "  Managed teams  ", tailored: "Managed teams", changeReason: "", keywordsAddressed: [], confidence: "high" },
    ];

    const diffs = diffBullets(bullets);
    expect(diffs[0].changed).toBe(false);
  });

  it("marks null/undefined as unchanged when both are falsy", () => {
    const bullets: TailoredBullet[] = [
      { original: undefined, tailored: undefined, changeReason: "", keywordsAddressed: [], confidence: "high" } as any,
    ];

    const diffs = diffBullets(bullets);
    expect(diffs[0].changed).toBe(false);
  });

  it("marks change when transitioning from undefined to text", () => {
    const bullets: TailoredBullet[] = [
      { original: undefined, tailored: "New accomplishment", changeReason: "", keywordsAddressed: [], confidence: "high" } as any,
    ];

    const diffs = diffBullets(bullets);
    expect(diffs[0].changed).toBe(true);
  });
});
