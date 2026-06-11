import path from "path";
import { pathToFileURL } from "url";

export async function extractPdfText(data: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  
  try {
    const workerPath = path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    );
    const workerUrl = pathToFileURL(workerPath).href;
    PDFParse.setWorker(workerUrl);
  } catch (err) {
    console.error("Failed to set PDF worker path, relying on default setup", err);
  }

  const parser = new PDFParse({ data });
  const result = await parser.getText();
  return result?.text?.trim() ?? "";
}
