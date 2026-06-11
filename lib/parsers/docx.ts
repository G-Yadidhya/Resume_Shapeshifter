export async function extractDocxText(data: Buffer): Promise<string> {
  const mammothModule = (await import("mammoth")) as unknown as {
    default?: { extractRawText: (options: { buffer: Buffer }) => Promise<{ value: string }> };
    extractRawText: (options: { buffer: Buffer }) => Promise<{ value: string }>;
  };
  const mammoth = mammothModule.default ?? mammothModule;
  const result = await mammoth.extractRawText({ buffer: data });
  return result?.value?.trim() ?? "";
}
