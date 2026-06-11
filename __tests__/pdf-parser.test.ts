import { describe, expect, it } from "vitest";
import { extractPdfText } from "@/lib/parsers/pdf";

describe("extractPdfText", () => {
  it("throws exception on invalid PDF buffer", async () => {
    await expect(extractPdfText(Buffer.from("%PDF-1.4\\n%%EOF"))).rejects.toThrow();
  });
});
