# Phase 1 — Static Prototype Edge Cases

**Scope:** Zod schemas, fixtures, mock orchestrator, wizard UI, stub `/api/tailor`.  
**Reference:** [Implementation Plan § Phase 1](../implementation-plan.md#phase-1--static-prototype)

---

## Schemas (`lib/schemas.ts`)

| ID | Edge case | Example input | Expected behavior | Severity |
|----|-----------|---------------|-------------------|----------|
| P1-S01 | **Score out of range** — `overallScore: 105` or `-3` | Invalid mock JSON | Zod rejects; fixture loader fails fast in dev | P0 |
| P1-S02 | **Missing optional fields** — no `projects`, no `certifications` | Minimal resume | Schema uses `.default([])` or optional arrays; UI handles empty sections | P0 |
| P1-S03 | **Empty strings vs missing** — `summary: ""` | Parsed resume | Distinguish optional empty; UI hides empty summary section | P1 |
| P1-S04 | **Confidence enum typo** — `"High"` vs `"high"` | LLM-style mock | Zod enum strict; normalize in parser when Phase 2 arrives | P0 |
| P1-S05 | **`riskFlag: null` vs omitted** | Tailored bullet | Accept both; UI treats omitted as no risk | P1 |
| P1-S06 | **Extra unknown keys in fixture JSON** | Drift from schema | Use `.strict()` on fixtures in tests; strip unknown in production parse later | P1 |
| P1-S07 | **Very long bullet text** — 500+ chars | Stress fixture | Schema allows string; UI truncates with expand, PDF phase tests full length | P1 |
| P1-S08 | **Unicode / emoji in names** — `José`, `北京` | Resume contact | UTF-8 throughout; no ASCII-only regex in display | P1 |
| P1-S09 | **Date formats inconsistent** — `Jan 2020`, `01/2020`, `2020-01` | Experience entries | Store as strings in MVP; no invalid date coercion in Phase 1 | P2 |

---

## Fixtures (`fixtures/`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-F01 | **Fixture drift from schema** — mock JSON edited without schema update | CI/test: `TailoringRunSchema.parse(fixture)` on load | P0 |
| P1-F02 | **Sample resume with no work experience** — student resume | Mock still valid; `SideBySideDiff` shows education/projects only | P1 |
| P1-F03 | **Sample JD with no company name** | `company: ""`; UI shows "Company not specified" | P1 |
| P1-F04 | **Mock tailored score lower than original** — bad rewrite simulation | UI must not assume `tailored > original`; show delta either direction | P0 |
| P1-F05 | **Empty gaps array** | `GapAnalysisPanel` shows positive empty state, not blank collapse | P1 |
| P1-F06 | **Large fixture file** — bloated mock for demo | Keep fixture realistic size (&lt; 50 KB); avoid committing huge pasted JDs | P2 |

---

## Mock Orchestrator (`lib/mocks/mock-orchestrator.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-M01 | **Double submit** — user clicks Analyze twice | Disable button while loading; ignore second call or abort first | P0 |
| P1-M02 | **Component unmount during delay** | Cancel or ignore setState on unmounted component (AbortController / `mounted` flag) | P0 |
| P1-M03 | **Mock delay too short** — loading UI flash | Minimum ~800ms display or skeleton to avoid flicker | P2 |
| P1-M04 | **Inputs ignored by mock** — any text returns same fixture | Acceptable in Phase 1; document that samples are fixed; optional: vary score slightly by input length for realism | P2 |

---

## Wizard UI (`app/tailor/page.tsx`, components)

| ID | Edge case | Where | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P1-U01 | **Empty resume on Analyze** | `ResumeInput` | Disable Analyze or inline validation: "Resume is required" | P0 |
| P1-U02 | **Empty JD on Analyze** | `JDInput` | Same as resume | P0 |
| P1-U03 | **Whitespace-only input** — `"   \n\n   "` | Trim before validation; treat as empty | P0 |
| P1-U04 | **Browser back during wizard** | Step state lost | Acceptable MVP; optional: sync step to URL `?step=2` | P2 |
| P1-U05 | **sessionStorage quota exceeded** — huge pasted resume | Try/catch on write; fall back to in-memory only | P1 |
| P1-U06 | **sessionStorage stale data** — schema version changed | Version key `tailoringRun:v1`; clear on mismatch | P1 |
| P1-U07 | **No experience bullets in mock run** | `SideBySideDiff` | Render "No experience entries" placeholder | P1 |
| P1-U08 | **Mismatched bullet counts** — more tailored than original | Should not happen in valid schema; if mock error, show per-entry pairing by index | P1 |
| P1-U09 | **Mobile narrow viewport** — two columns overflow | Stack columns vertically below `md` breakpoint | P0 |
| P1-U10 | **Very long JD in textarea** — 30k+ chars | Textarea scrolls; no client freeze; warn if &gt; 15k chars (Phase 2 token limit) | P1 |

---

## `ScoreCard`

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-SC01 | **Only original score shown** — before tailor step | Show single score card or "After" as pending | P1 |
| P1-SC02 | **Sub-scores don't sum to overall** | Display as-is with label "estimate"; do not fabricate math in UI | P0 |
| P1-SC03 | **Zero score** — `overallScore: 0` | Valid; avoid division-by-zero in delta % display | P1 |
| P1-SC04 | **Long explanation text** | Wrap text; collapsible "Read more" if &gt; 3 lines | P2 |

---

## `GapAnalysisPanel`

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-G01 | **Duplicate gap names** | Dedupe in display or show count badge | P2 |
| P1-G02 | **All gaps `importance: low`** | Still render; sort high → medium → low | P1 |
| P1-G03 | **Missing `suggestedAction`** | Fallback: "Review this requirement manually" | P1 |
| P1-G04 | **`canSafelyAdd: true` for missing skill** | Badge "Add only if true for you" — not "auto-add" | P0 |

---

## `SideBySideDiff` / `BulletChangeCard`

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-D01 | **Identical original and tailored** | Show as unchanged; no false highlight | P1 |
| P1-D02 | **Empty `changeReason`** | Show "No reason provided" in dev; fix fixture in prod | P1 |
| P1-D03 | **Many keywords** — 10+ tags | Wrap tags; limit visible with "+N more" | P2 |
| P1-D04 | **Special characters in bullets** — `<`, `&`, markdown | Escape on render (React default); never `dangerouslySetInnerHTML` without sanitize | P0 |

---

## Stub API (`app/api/tailor/route.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-A01 | **Non-JSON request body** | 400 + `VALIDATION_ERROR` shape (practice for Phase 2) | P1 |
| P1-A02 | **GET instead of POST** | 405 Method Not Allowed | P2 |
| P1-A03 | **CORS from external origin** | Same-origin only for MVP; no open CORS | P1 |
| P1-A04 | **Fixture import path on server** | Use `fs.readFile` or static import; verify works in `next build` | P0 |

---

## `LoadingPipeline`

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P1-L01 | **Error during mock load** — simulate failure for UI | Add dev toggle or test hook to verify error state UI (prep for Phase 2) | P1 |
| P1-L02 | **Stages out of order** | Fixed sequence: parse → score → gap → tailor | P2 |

---

## Testing matrix (Phase 1)

| Test | Input | Assert |
|------|-------|--------|
| Empty submit | Blank fields | Analyze disabled or validation message |
| Sample load | Click "Load sample" | Both fields populated |
| Happy path | Samples + Analyze | All panels render; schema parse passes |
| Mobile | 375px width | Columns stack; no horizontal scroll |
| Score delta | Mock with tailored &lt; original | Negative delta shown correctly |
| Refresh on results | F5 on step 3 | Graceful empty or sessionStorage restore |

---

## Handoff notes for Phase 2

- Schemas defined here become the **contract** for LLM outputs — avoid breaking changes without version bump.
- UI must handle **partial / failed runs** once real API exists (`status: "failed"`).
- Trim and length warnings on inputs should align with token limits added in Phase 2.
