# Phase 4 — Guardrails & Validation Edge Cases

**Scope:** Guardrail validator, detectors, metric tracer, keyword density, orchestrator hardening, export gating.  
**Reference:** [Implementation Plan § Phase 4](../implementation-plan.md#phase-4--guardrails--validation)

---

## Guardrail Validator (`lib/services/guardrails.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P4-V01 | **New employer name** — not substring of original resume | `blockExport: true`; clear violation message | P0 |
| P4-V02 | **Employer renamed** — "Google" → "Alphabet" subsidiary | May false positive; allow if original contains parent or alias map | P1 |
| P4-V03 | **Employer abbreviation** — "International Business Machines" vs "IBM" | Alias/normalization table to reduce false blocks | P1 |
| P4-V04 | **New degree or certification** | Block export | P0 |
| P4-V05 | **Degree reworded** — "BS CS" vs "Bachelor of Science in Computer Science" | Allow if same institution + level inferable | P1 |
| P4-V06 | **New numeric metric in tailored bullet** | Set `riskFlag`; do not block entire export unless policy says hard block | P0 |
| P4-V07 | **Metric moved between bullets** — same number, different job | Allow if number exists somewhere in original resume text | P1 |
| P4-V08 | **Percentage without baseline** — "improved performance 50%" new | Flag as unsupported metric | P0 |
| P4-V09 | **Date change** — end date extended | Block or flag — dates immutable in MVP | P0 |
| P4-V10 | **Job title at company changed** — inflated title | Flag seniority risk; compare title strings | P1 |
| P4-V11 | **Technology in bullet not in resume or gaps** | Flag or strip technology term | P0 |
| P4-V12 | **Technology only in gaps as missing** — user shouldn't add in bullet | Flag: "Addresses gap — verify you have this experience" | P1 |
| P4-V13 | **Keyword density spike** — 8 JD terms in one bullet | UI warning; optional soft block | P1 |
| P4-V14 | **All bullets `confidence: low`** | Banner: review entire resume before export | P1 |
| P4-V15 | **Guardrails pass but content still wrong** | Disclaimer + user checkbox; cannot catch all LLM errors | P0 |
| P4-V16 | **Validator throws exception** | Fail closed: block export; log error | P0 |

---

## Metric Tracer (`lib/guardrails/metric-tracer.ts`)

| ID | Edge case | Example | Expected behavior | Severity |
|----|-----------|---------|-------------------|----------|
| P4-M01 | **Number in word form** — "doubled" vs "2x" | Best-effort; flag if new quant claim | P2 |
| P4-M02 | **Currency formats** — `$1M`, `1 million`, `1000000` | Normalize before compare | P1 |
| P4-M03 | **Ranges** — "10-15%" in tailored, not in original | Flag | P1 |
| P4-M04 | **Same number, different context** — "3 years" → "3 teams" | Contextual check; flag if unit changed | P1 |
| P4-M05 | **Years in dates vs metrics** — "2020" in bullet | Ignore date-like years in metric scan | P1 |
| P4-M06 | **Phone numbers in contact** | Exclude contact section from metric scan | P1 |
| P4-M07 | **Ordinals** — "top 5" new in tailored | Flag if "5" not in original bullet/resume | P1 |

---

## Keyword Density (`lib/guardrails/keyword-density.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P4-K01 | **Common words match JD keywords** — "management" | Use JD keyword list only, not generic words | P1 |
| P4-K02 | **Acronym + expansion double count** — K8s and Kubernetes | Count as one concept | P2 |
| P4-K03 | **Short bullet, 3 keywords** — high density but natural | Threshold by bullet length | P1 |
| P4-K04 | **Skills section reorder only** | Don't apply bullet density rules to skills list | P2 |

---

## Detectors (`lib/guardrails/detectors.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P4-D01 | **Case-only employer match** | Case-insensitive substring check | P1 |
| P4-D02 | **Unicode homoglyphs** — lookalike chars to bypass check | Normalize Unicode NFKC | P2 |
| P4-D03 | **Company in JD mistaken as new employer** | Compare against resume experience only, not JD company field | P0 |
| P4-D04 | **Freelance / self-employed** — inconsistent labels | Normalize "Self", "Freelance", own name | P1 |
| P4-D05 | **Multiple certifications, one added** | Block even if others exist | P0 |

---

## Orchestrator Integration

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P4-O01 | **Guardrails modify bullets** — strip terms | Persist modified `TailoredResume` in run; re-score tailored | P0 |
| P4-O02 | **Guardrails block but user views UI** | Show violations list; disable export | P0 |
| P4-O03 | **Re-run tailor after guardrail fail** | New run id; don't merge with blocked run | P1 |
| P4-O04 | **Partial violations** — 2 of 10 bullets flagged | Allow export with acknowledgment for soft flags only | P1 |
| P4-O05 | **Hard block + soft flags together** | Hard block wins; export disabled | P0 |
| P4-O06 | **`guardrailWarnings` in API response** | Array of human-readable strings | P1 |

---

## Stricter Zod / LLM Retry

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P4-Z01 | **`.strict()` breaks provider extra metadata** | Strip unknown keys before strict parse | P1 |
| P4-Z02 | **Repair prompt infinite loop** | Max 2 attempts total; hard stop | P0 |
| P4-Z03 | **Partial JSON on truncate** | Fail with token limit message | P1 |

---

## Export Gating (UI + API)

| ID | Edge case | Where | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P4-E01 | **Checkbox unchecked** | `ExportConfirmModal` | Export buttons disabled | P0 |
| P4-E02 | **User checks box without reading** | UX | Still required — legal disclaimer not enforceable beyond UI | P0 |
| P4-E03 | **API export bypasses UI** — direct POST | `/api/export/pdf` | Re-run guardrails; 403 if blocked | P0 |
| P4-E04 | **Soft flags only** — metrics flagged | Export allowed after checkbox + risk banner | P1 |
| P4-E05 | **Hard block** | Export API | 403 with violation codes | P0 |
| P4-E06 | **Client tampered run JSON** — removed riskFlag | Server re-validates from stored run or re-runs guardrails on body | P0 |
| P4-E07 | **Export comparison but not tailored** | Separate guardrail pass per PDF type | P1 |

---

## UI Components

| ID | Edge case | Component | Expected behavior | Severity |
|----|-----------|-----------|-------------------|----------|
| P4-U01 | **Many risk flags** — 15 bullets | `RiskFlagBanner` + scroll to first | P1 |
| P4-U02 | **riskFlag null vs empty string** | Treat both as no flag | P2 |
| P4-U03 | **confidence medium** — no special styling | Optional subtle badge; high/low are priority | P2 |
| P4-U04 | **Modal dismissed without export** | Checkbox state resets or persists per session — document choice | P2 |
| P4-U05 | **Blocked export click** | Tooltip: "Resolve N violations" | P1 |

---

## False Positive / False Negative Tuning

| ID | Scenario | Risk | Mitigation |
|----|----------|------|------------|
| P4-FP01 | Legitimate rephrase triggers new metric flag | User friction | Tune regex; allow % only if digit sequence exists in original |
| P4-FP02 | Subsidiary name change blocks export | Block valid export | Alias table |
| P4-FN01 | LLM paraphrases metric "doubled users" from "2x user growth" | Bad export | Semantic metric check (Phase 5+); prompt improvement |
| P4-FN02 | New soft skill claim without evidence | Undetected | Gap engine + manual review disclaimer |

---

## Testing matrix (Phase 4)

| Test | Fixture / action | Assert |
|------|------------------|--------|
| Fake employer | Tailored adds "Meta" not in resume | `blockExport: true` |
| Invented metric | "Increased revenue 40%" new | `riskFlag` set |
| Moved metric | Same "30%" from another bullet | No flag |
| New degree | PhD added | Block export |
| API bypass | POST export with tampered JSON | 403 |
| Checkbox gate | Export without confirm | UI disabled |
| Keyword stuff | 10 JD terms one bullet | Warning shown |
| Validator crash | Mock throw in guardrails | Export blocked, 500 logged |
| Soft-only export | Flags but no hard block | Export OK after checkbox |

---

## Logging (no PII)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P4-LOG01 | **Log full violation diff** | Log violation codes + bullet index, not full resume | P0 |
| P4-LOG02 | **False positive reports** | Optional `guardrailViolationCode` for tuning | P2 |

---

## Handoff to Phase 5

- Rate limit export endpoint separately (expensive).
- E2E test: blocked export path + successful export with checkbox.
- Document known false positives in README troubleshooting.
