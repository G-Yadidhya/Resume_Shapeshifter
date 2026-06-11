import { createElement } from "react";
import type { TailoringRun } from "@/lib/schemas";

import ComparisonTemplate from "./comparison-template";
import TailoredTemplate from "./tailored-template";

async function renderHTML(element: ReturnType<typeof createElement>) {
	const ReactDOMServer = await import("react-dom/server");
	return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${ReactDOMServer.renderToStaticMarkup(
		element,
	)}</body></html>`;
}

export async function generateComparisonPDF(run: TailoringRun): Promise<Uint8Array> {
	const html = await renderHTML(createElement(ComparisonTemplate, { run }));

	try {
		const playwright = await import("playwright");
		const browser = await playwright.chromium.launch({ args: ["--no-sandbox"] });
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle" });
		const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
		await browser.close();
		return new Uint8Array(pdfBuffer);
	} catch (err) {
		console.error("PDF generation failed (playwright not available?)", err);
		throw new Error(
			"PDF generation failed. Ensure `playwright` (with Chromium binary) is installed in your environment, or use the comparison page to print to PDF from the browser.",
		);
	}
}

export async function generateTailoredPDF(run: TailoringRun): Promise<Uint8Array> {
	const html = await renderHTML(createElement(TailoredTemplate, { run }));

	try {
		const playwright = await import("playwright");
		const browser = await playwright.chromium.launch({ args: ["--no-sandbox"] });
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle" });
		const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
		await browser.close();
		return new Uint8Array(pdfBuffer);
	} catch (err) {
		console.error("PDF generation failed (playwright not available?)", err);
		throw new Error(
			"PDF generation failed. Ensure `playwright` (with Chromium binary) is installed in your environment, or use the comparison page to print to PDF from the browser.",
		);
	}
}

export default generateComparisonPDF;
