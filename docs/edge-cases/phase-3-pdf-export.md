# Phase 3 — PDF Export Edge Cases

**Scope:** PDF generation, comparison/tailored templates, export API, diff highlighting, optional file parsing.  
**Reference:** [Implementation Plan § Phase 3](../implementation-plan.md#phase-3--pdf-export)

---

## PDF Generator (`lib/pdf/generate.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-G01 | **Playwright not installed locally** | Clear dev error with install instructions | P0 |
| P3-G02 | **Chromium launch fails on CI** | Use `@sparticuz/chromium` args; document in README | P0 |
| P3-G03 | **Serverless timeout** — PDF &gt; 10s | Increase function timeout; simplify template; stream response | P0 |
| P3-G04 | **Out of memory** — huge comparison doc | Paginate; limit appendix length | P1 |
| P3-G05 | **Concurrent PDF requests** | Queue or isolate browser instances; close browser in `finally` | P1 |
| P3-G06 | **Browser zombie processes** | Always `browser.close()` in try/finally | P0 |
| P3-G07 | **Empty PDF output** — 0 bytes | Validate buffer size; throw before sending to client | P0 |
| P3-G08 | **Wrong page size** — US Letter vs A4 | Default Letter; document in export settings | P2 |

---

## Tailored Resume PDF Template

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-T01 | **Missing summary** — empty string | Omit summary section | P1 |
| P3-T02 | **Very long skills list** — 40+ skills | Wrap or multi-line; avoid single-line overflow | P1 |
| P3-T03 | **Special characters** — `&`, `<`, Unicode | HTML-escape in template | P0 |
| P3-T04 | **Page break mid-bullet** | CSS `break-inside: avoid` on bullet blocks | P1 |
| P3-T05 | **Single job, many bullets** — 15+ | Allow multi-page; no truncation without warning | P1 |
| P3-T06 | **No contact info** | Omit contact block or show placeholder | P2 |
| P3-T07 | **Tailored skills reorder only** — bullets same as original | PDF still reflects new skill order | P2 |

---

## Comparison PDF Template

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-C01 | **Unequal column heights** — left longer than right | Independent column flow; align section headers | P1 |
| P3-C02 | **Missing `jobTitle` or `company`** | Header: "Tailoring Comparison — [date]" | P1 |
| P3-C03 | **Score explanation very long** | Truncate to 2 lines in score strip; full text in appendix optional | P1 |
| P3-C04 | **50+ gaps** | Top 10 in table; "and N more" footnote | P1 |
| P3-C05 | **No gaps** | Show "No significant gaps identified" | P1 |
| P3-C06 | **Disclaimer missing** | Block ship — footer required on every export | P0 |
| P3-C07 | **Print CSS ignored by Playwright** | Use `@media print` + `printBackground: true` | P0 |
| P3-C08 | **Highlight color not printing** | `printBackground: true`; test in Adobe Reader | P1 |
| P3-C09 | **RTL or mixed-direction text** | LTR default; UTF-8 font embedding if needed | P2 |

---

## Diff Highlighting (`lib/pdf/diff-bullets.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-D01 | **Whitespace-only diff** — trailing space change | Trim before compare; no highlight if substantive match | P1 |
| P3-D02 | **Case-only change** — "python" → "Python" | Highlight as change (intentional JD alignment) | P2 |
| P3-D03 | **Punctuation-only change** | Highlight; still a tailoring change | P2 |
| P3-D04 | **Bullet removed in tailored** — count mismatch | Should not happen post-Phase 2; pair by index; show "—" for missing | P0 |
| P3-D05 | **Extra bullet in tailored** | Flag error in guardrails; PDF shows warning banner | P0 |
| P3-D06 | **Very long bullet breaks layout** | `word-break: break-word`; min column width | P1 |
| P3-D07 | **Markdown in bullet** — `**bold**` | Render as plain text or strip markdown | P1 |

---

## Export API (`app/api/export/pdf/route.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-A01 | **Missing `TailoringRun` in body** | 400 validation error | P0 |
| P3-A02 | **Invalid runId** — not in memory store | 404 "Run not found or expired" | P1 |
| P3-A03 | **Run expired** — serverless cold start lost Map | Accept full run in POST body as primary path | P0 |
| P3-A04 | **`type` param** — `tailored` vs `comparison` vs both | Support `?type=comparison` or separate endpoints | P1 |
| P3-A05 | **Wrong Content-Type** | `application/pdf`; `Content-Disposition: attachment` | P1 |
| P3-A06 | **Export before tailor complete** — `status: "pending"` | 400 "Run not complete" | P0 |
| P3-A07 | **Double-click export** | Idempotent; disable button while generating | P1 |
| P3-A08 | **Malformed run JSON** — fails Zod | 400 `VALIDATION_ERROR` | P0 |

---

## Print Route (`app/export/comparison/[runId]/page.tsx`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-P01 | **runId in URL but run not in store** | 404 page or error state for Playwright | P0 |
| P3-P02 | **Direct browser visit to print URL** | No sensitive data leak; runs ephemeral | P1 |
| P3-P03 | **Hydration mismatch** — client-only data | Server-render full comparison from stored run | P1 |
| P3-P04 | **External fonts fail to load** | System font stack fallback | P1 |
| P3-P05 | **Dark mode styles bleed in** | Print view forces light background | P2 |

---

## `PDFExportButton` (UI)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-U01 | **Popup blocker** — `window.open` for preview | Use blob download via `<a download>` | P1 |
| P3-U02 | **Download fails mid-stream** | Error toast; re-enable button | P1 |
| P3-U03 | **Large PDF slow on mobile** | Loading spinner; no UI freeze | P1 |
| P3-U04 | **No run in client state** | Disable export; prompt to analyze first | P0 |

---

## File Parsing — PDF (`lib/parsers/pdf.ts`) — if in Phase 3

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-F01 | **Scanned PDF** — image only, no text layer | Extract empty or garbage; error: "Use text-based PDF or paste text" | P0 |
| P3-F02 | **Password-protected PDF** | Clear error | P1 |
| P3-F03 | **Corrupt PDF** | `PARSE_ERROR`; don't crash server | P0 |
| P3-F04 | **Multi-column layout** — interleaved lines | Show parse preview; warn user | P0 |
| P3-F05 | **File size &gt; 5 MB** | Reject before parse | P1 |
| P3-F06 | **Wrong MIME** — `.pdf` renamed `.txt` | Magic byte check | P1 |
| P3-F07 | **Empty PDF** | `PARSE_ERROR` | P1 |

---

## File Parsing — DOCX (`lib/parsers/docx.ts`) — if in Phase 3

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-F08 | **`.doc` legacy format** | Reject: "Save as DOCX" | P1 |
| P3-F09 | **Tables in DOCX** — skills grid | Flatten to text with separators | P1 |
| P3-F10 | **Headers/footers** | Exclude or include consistently; don't duplicate contact | P2 |
| P3-F11 | **Corrupt DOCX** | `PARSE_ERROR` | P0 |

---

## Vercel / Serverless-specific

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P3-V01 | **Playwright binary too large** | `@sparticuz/chromium` + `playwright-core` | P0 |
| P3-V02 | **`/tmp` not writable** | Stream PDF directly to response; no temp file | P1 |
| P3-V03 | **Function memory 1024MB insufficient** | Bump to 3008MB for PDF route | P1 |
| P3-V04 | **react-pdf fallback** | Feature flag if Playwright fails in prod | P1 |

---

## Testing matrix (Phase 3)

| Test | Input | Assert |
|------|-------|--------|
| Happy export | Complete `TailoringRun` in POST body | Valid PDF magic bytes `%PDF` |
| Empty sections | Run with no projects | PDF renders without crash |
| Long resume | 8 jobs × 5 bullets | Multi-page PDF; &lt; 10s local |
| Special chars | Bullets with `<script>` | Escaped in PDF text |
| Missing runId store | GET print URL only | 404 or POST body fallback works |
| Comparison highlights | Known diff fixture | Changed bullets have highlight class |
| Scanned PDF upload | Image PDF | User-friendly error |
| Disclaimer | Any export | Footer text present in extracted text |

---

## Handoff to Phase 4

- Export path must call guardrails before generating bytes (Phase 4).
- Comparison PDF should include `riskFlag` indicators on flagged bullets.
- Export confirmation checkbox gates download in Phase 4 UI.
