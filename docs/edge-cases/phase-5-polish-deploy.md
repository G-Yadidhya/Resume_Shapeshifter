# Phase 5 — Polish, Demo & Deploy Edge Cases

**Scope:** UX polish, file upload, rate limiting, E2E tests, deployment, demo kit, production operations.  
**Reference:** [Implementation Plan § Phase 5](../implementation-plan.md#phase-5--polish-demo--deploy)

---

## Loading & Progress (`LoadingPipeline`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-L01 | **Stage completes out of UI order** — network jitter | Bind UI to server-sent stage events or ordered state machine | P1 |
| P5-L02 | **Pipeline stuck** — LLM hang | Timeout + cancel button + "Taking longer than usual" after 20s | P0 |
| P5-L03 | **Refresh during loading** | Lose in-progress run; show message to restart | P1 |
| P5-L04 | **SSE connection drops** | Fall back to spinner; poll or allow completion blind | P2 |
| P5-L05 | **Fast pipeline** — &lt; 1s | Don't flash stages; minimum display or skip animation | P2 |

---

## Error Handling & Retry

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-E01 | **`LLM_PARSE_ERROR`** | Friendly copy + retry; preserve inputs | P0 |
| P5-E02 | **`VALIDATION_ERROR`** | "Something went wrong" + support id (`runId`) | P0 |
| P5-E03 | **`PARSE_ERROR` on upload** | Suggest paste text alternative | P0 |
| P5-E04 | **429 rate limit** — app or Groq | Backoff message; disable retry 30s | P0 |
| P5-E05 | **503 Groq outage** | Status page link optional; retry later | P1 |
| P5-E06 | **Retry after partial failure** | Don't duplicate charges blindly; new run id | P1 |
| P5-E07 | **Error boundary crash in results** | React error boundary; link back to input | P1 |

---

## Empty & Edge UI States

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-U01 | **Zero gaps** | Positive copy: "Strong alignment on required skills" | P1 |
| P5-U02 | **Perfect score 100** | Don't imply job offer; "estimate only" | P1 |
| P5-U03 | **No bullets changed** | Explain: "Resume already well aligned" | P1 |
| P5-U04 | **First visit — no samples loaded** | Clear CTA + optional guided tour | P2 |
| P5-U05 | **sessionStorage cleared mid-session** | Detect missing run; redirect to input | P1 |

---

## Accessibility

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-A01 | **Keyboard-only navigation** | Tab through wizard; focus trap in modal | P1 |
| P5-A02 | **Screen reader on score cards** | `aria-label` with scores and delta | P1 |
| P5-A03 | **Color-only confidence indicators** | Icon or text label in addition to color | P1 |
| P5-A04 | **Focus lost on step change** | Move focus to step heading | P2 |
| P5-A05 | **Reduced motion** | Respect `prefers-reduced-motion` on animations | P2 |

---

## File Upload (if implemented in Phase 5)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-F01 | **Drag-drop wrong file type** — `.exe`, image | Reject with allowed types list | P0 |
| P5-F02 | **Multiple files dropped** | Take first PDF/DOCX only; message if multiple | P1 |
| P5-F03 | **Upload + pasted text both set** | Policy: upload wins or latest action wins; document | P1 |
| P5-F04 | **Slow upload on mobile** | Progress indicator | P2 |
| P5-F05 | **Parse preview shows garbage** | Prominent "Text looks wrong? Paste manually" CTA | P0 |
| P5-F06 | **Filename with unicode** | Sanitize display name | P2 |
| P5-F07 | **Zero-byte file** | Reject before upload completes | P1 |

---

## Rate Limiting

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-R01 | **Burst requests** — spam Analyze | 5 req / 15 min per IP on `/api/tailor` (tune as needed) | P0 |
| P5-R02 | **Shared NAT** — office IP blocked | Consider softer limit or API key auth later | P2 |
| P5-R03 | **Rate limit on export only** | Separate bucket; PDF is CPU heavy | P1 |
| P5-R04 | **429 response shape** | `Retry-After` header + JSON error | P1 |
| P5-R05 | **Serverless multi-instance** — in-memory limit ineffective | Use Upstash Redis or Vercel KV for prod | P1 |

---

## Security (Production)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-S01 | **XSS in resume pasted** — `<script>` | Escape on render; sanitize PDF HTML | P0 |
| P5-S02 | **SSRF via JD URL** (if added) | Block internal IPs; allowlist https only | P0 |
| P5-S03 | **PII in server logs** | Redact resume/JD in prod logging | P0 |
| P5-S04 | **API key in client bundle** | Never `NEXT_PUBLIC_` for Groq key | P0 |
| P5-S05 | **CSRF on POST routes** | Same-site cookies default; optional CSRF token if cross-origin | P2 |
| P5-S06 | **Denial of wallet** — huge payloads | Body size limit + char limit + rate limit | P0 |

---

## Deployment (Vercel)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-D01 | **Missing env on deploy** | Build succeeds; runtime 503 with config message | P0 |
| P5-D02 | **Playwright fails only in prod** | Fallback `@react-pdf` or external PDF service | P0 |
| P5-D03 | **Edge vs Node runtime** — Playwright needs Node | `export const runtime = 'nodejs'` on PDF routes | P0 |
| P5-D04 | **Cold start + 30s tailor** | Vercel Pro timeout 60s+ on functions | P0 |
| P5-D05 | **Region latency** — user far from Groq inference region | Document; optional region config | P2 |
| P5-D06 | **Preview deploy without secrets** | PR previews mock or skip LLM routes | P2 |

---

## E2E Tests (`e2e/tailor-flow.spec.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-T01 | **Flaky LLM in CI** | Mock API in E2E or use recorded fixtures | P0 |
| P5-T02 | **PDF download assertion** | Check `%PDF` header not full binary hash | P1 |
| P5-T03 | **Timeout in CI** — slow pipeline | Increase test timeout to 60s or mock | P1 |
| P5-T04 | **Parallel E2E workers** | Isolated state; no shared rate limit | P2 |
| P5-T05 | **Checkbox export gate** | Test cannot download without confirm | P1 |

---

## Demo Kit (`fixtures/`, `docs/demo-script.md`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-DM01 | **Sample JD URL goes stale** — job removed | Store full JD text in fixture, not live URL | P0 |
| P5-DM02 | **Demo resume too strong** — small score delta | Curate resume with intentional gaps for visible improvement | P1 |
| P5-DM03 | **Demo fails on live API** | Document offline mock mode for presentations | P1 |
| P5-DM04 | **Copyright on real JD** | Use publicly posted listing; attribute in demo script | P2 |
| P5-DM05 | **Load sample overwrites user work** | Confirm dialog if fields non-empty | P1 |

---

## Performance (Production)

| ID | Edge case | Target | Mitigation |
|----|-----------|--------|------------|
| P5-P01 | Peak concurrent users | N/A MVP | Rate limit |
| P5-P02 | Repeat analyze same inputs | Cache parse results client-side 5 min optional | P2 |
| P5-P03 | Large bundle — Playwright in main chunk | Dynamic import PDF module only on export | P1 |
| P5-P04 | Lighthouse score low | Acceptable for tool app; optimize images on landing | P2 |

---

## Operational Edge Cases

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P5-O01 | **Groq price/model deprecation** | Env `GROQ_MODEL`; document upgrade path | P1 |
| P5-O02 | **User expects ATS guarantee** | Landing disclaimer: no ranking guarantees | P0 |
| P5-O03 | **User exports without review** | Checkbox + PDF disclaimer (Phase 4) | P0 |
| P5-O04 | **Support request "wrong output"** | `runId` in UI for correlation | P2 |

---

## Smoke Test Checklist (Production)

- [ ] Landing loads over HTTPS
- [ ] Load samples → Analyze → results &lt; 60s
- [ ] Original and tailored scores visible
- [ ] Gap panel renders
- [ ] Export comparison PDF with disclaimer
- [ ] Guardrail block demo (test fixture) works
- [ ] Rate limit returns 429 after threshold (staging)
- [ ] No API key in browser network tab responses

---

## Post-MVP Edge Cases (document only)

| ID | Feature | Edge case | Note |
|----|---------|-----------|------|
| P5-X01 | JD URL fetch | Bot blocking, login walls | Out of MVP scope |
| P5-X02 | Auth | Multi-user run isolation | Requires DB |
| P5-X03 | Saved history | GDPR delete request | Future compliance |
| P5-X04 | DOCX export | Formatting loss | Extension |

---

## Cross-Phase Regression Watchlist

When polishing, re-verify these from earlier phases:

| From | ID | Quick check |
|------|-----|-------------|
| Phase 1 | P1-U01 | Empty input still blocked |
| Phase 2 | P2-L06 | Token limit still enforced |
| Phase 3 | P3-C06 | Disclaimer still in PDF |
| Phase 4 | P4-E03 | API export still runs guardrails |
