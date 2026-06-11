# Phase 2 — LLM Integration Edge Cases

**Scope:** LLM client, prompts, domain services, orchestrator, scoring, API routes.  
**Reference:** [Implementation Plan § Phase 2](../implementation-plan.md#phase-2--llm-integration)

---

## LLM Client (`lib/llm/client.ts`, `retry.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-L01 | **Invalid JSON in response** — trailing comma, markdown fences | Strip fences; repair retry once; then `LLM_PARSE_ERROR` | P0 |
| P2-L02 | **Valid JSON, invalid schema** — wrong types, missing fields | Zod error → repair prompt with schema hints → retry (max 2) | P0 |
| P2-L03 | **Empty LLM response** | Retry; fail with user message | P0 |
| P2-L04 | **Rate limit 429** | Exponential backoff (1 retry); surface "Try again in a moment" | P0 |
| P2-L05 | **Timeout** — &gt; 60s on large input | Configurable timeout; fail stage with partial run if orchestrator supports | P1 |
| P2-L06 | **Token limit exceeded** — input too long | Pre-flight estimate; reject with "Resume or JD too long" before API call | P0 |
| P2-L07 | **API key invalid 401** | Server log detail; client: "Service configuration error" | P0 |
| P2-L08 | **Model returns array instead of object** | Zod fails → repair or fail | P1 |
| P2-L09 | **Hallucinated extra fields** | `.strict()` strips or fails; prefer strict on LLM output schemas | P1 |
| P2-L10 | **Concurrent requests same run** | Single orchestrator call; no parallel duplicate LLM for same stage | P1 |

---

## Resume Parser (`lib/services/resume-parser.ts`)

| ID | Edge case | Example | Expected behavior | Severity |
|----|-----------|---------|-------------------|----------|
| P2-R01 | **Empty resume text** | `""` | Reject at API with `PARSE_ERROR` before LLM | P0 |
| P2-R02 | **Resume is only contact block** — no experience | Short CV | Valid `ResumeProfile` with empty `experience[]`; gap engine handles | P1 |
| P2-R03 | **Non-standard section headers** — "Where I've Worked" | Heuristic miss | LLM cleanup assigns to `experience` | P1 |
| P2-R04 | **Duplicate section headers** | Two "Experience" blocks | Merge entries or concatenate; preserve all bullets | P1 |
| P2-R05 | **Bullet symbols inconsistent** — `•`, `-`, `*`, numbered | Normalize to string array without symbol prefix in storage | P1 |
| P2-R06 | **Multi-column plain text** — columns interleaved when pasted from PDF | Garbled order | Preserve `rawText`; show parse preview warning; suggest re-paste | P0 |
| P2-R07 | **Tabular skills** — comma vs pipe vs columns | Split on common delimiters; dedupe case-insensitive | P1 |
| P2-R08 | **LLM invents experience** during parse | Employers not in source text | Validate companies against raw text substring; strip or flag | P0 |
| P2-R09 | **Extremely long resume** — 10+ pages text | Truncate for LLM with warning or reject | P0 |
| P2-R10 | **PII in logs** — full resume logged on error | Log `runId` + stage only; never full text in prod | P0 |

---

## JD Parser (`lib/services/jd-parser.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-J01 | **Vague JD** — "rockstar ninja" with few skills | Extract what's possible; empty arrays OK; score explanation notes vagueness | P1 |
| P2-J02 | **JD is mostly legal/EEO boilerplate** | LLM should ignore boilerplate; don't count as requirements | P1 |
| P2-J03 | **Contradictory seniority** — "Junior" title, "10 years required" | Extract both signals; seniority score reflects conflict in explanation | P1 |
| P2-J04 | **Same skill in required and preferred** | Dedupe; keep in `requiredSkills` | P2 |
| P2-J05 | **JD in non-English** | Best-effort parse; warn user output quality may vary | P2 |
| P2-J06 | **JD is URL only** — user pastes link not text | Out of MVP scope; reject: "Paste job description text" | P1 |
| P2-J07 | **Copy-paste HTML from job board** — tags in text | Strip HTML entities/tags in pre-process | P1 |
| P2-J08 | **No job title in JD** | `jobTitle: ""` or infer from first heading; UI fallback | P1 |
| P2-J09 | **100+ bullet requirements** | Cap extracted lists (e.g. top 30) with note in metadata | P1 |

---

## Match Engine (`lib/services/match-engine.ts`, `lib/scoring/`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-M01 | **No required skills in JD** | Skill coverage defaults to neutral or N/A; explanation states why | P1 |
| P2-M02 | **Synonym mismatch** — "K8s" vs "Kubernetes" | Normalize aliases map or LLM semantic match; document known aliases | P1 |
| P2-M03 | **Case sensitivity** — `Python` vs `python` | Case-insensitive compare for skills/keywords | P0 |
| P2-M04 | **Partial word match false positive** — "Java" in "JavaScript" | Word-boundary or token matching | P1 |
| P2-M05 | **Score &gt; 100 after weight math** | Clamp `overallScore` to 0–100 | P0 |
| P2-M06 | **Negative score after penalties** | Clamp to 0 | P0 |
| P2-M07 | **Tailored score lower than original** | Valid — tailoring isn't guaranteed to improve score; show honestly | P0 |
| P2-M08 | **Identical resume and JD** — perfect overlap | Scores near 100; tailoring may make minimal changes | P2 |
| P2-M09 | **LLM explanation contradicts sub-scores** | Prefer deterministic sub-scores; LLM text is narrative only | P1 |
| P2-M10 | **Floating point display** — 67.333333 | Round to integer for display; store number internally | P2 |

---

## Gap Engine (`lib/services/gap-engine.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-G01 | **Skill in resume skills list but not in bullets** | Gap type: "weakly represented" not "missing" | P0 |
| P2-G02 | **JD requires niche cert user doesn't have** | `canSafelyAdd: false`; action "Prepare to address in interview" | P0 |
| P2-G03 | **Gap engine over-flags soft skills** | Cap soft-skill gaps; prioritize hard skills/tools | P1 |
| P2-G04 | **No gaps found** — strong match | Empty `gaps[]`; UI positive message | P1 |
| P2-G05 | **Duplicate gaps** — same skill different wording | Dedupe by normalized name | P1 |
| P2-G06 | **Gap suggests "add" for false requirement** | `canSafelyAdd: false` when not supportable from resume | P0 |

---

## Tailoring Engine (`lib/services/tailoring-engine.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-T01 | **LLM adds new employer** | Phase 4 blocks; Phase 2: detect in logs/tests | P0 |
| P2-T02 | **LLM adds metrics** — "increased revenue 40%" not in original | Flag in `riskFlag` (Phase 4 formalizes) | P0 |
| P2-T03 | **LLM keyword stuffing** | Prompt limits; count JD terms per bullet | P1 |
| P2-T04 | **Bullet count mismatch** — drops or adds bullets | MVP: 1:1 bullet mapping; same count as original per job | P0 |
| P2-T05 | **No changes needed** — bullet unchanged | `original === tailored`; `changeReason`: "Already aligned" | P1 |
| P2-T06 | **Very long tailored bullet** | Prompt max length; truncate with warning | P1 |
| P2-T07 | **Changes employer name spelling** | Company field immutable; only bullets/summary tailored | P0 |
| P2-T08 | **Batch rewrite partial failure** — 3 of 5 jobs OK | Fail run or return partial with `status: "failed"` + completed entries | P1 |
| P2-T09 | **Projects section empty** | Skip project tailoring; no error | P2 |
| P2-T10 | **confidence always "high"** from model | Calibrate in prompt; Phase 4 validates | P1 |

---

## Orchestrator (`lib/orchestrator.ts`)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-O01 | **Resume parse fails** | Abort run; `status: "failed"`; no partial tailor | P0 |
| P2-O02 | **JD parse fails** | Same | P0 |
| P2-O03 | **Gap succeeds, score fails** (parallel) | Return gaps + error on score; or fail entire analyze | P1 |
| P2-O04 | **Tailor fails after successful analyze** | Return parse + scores + gaps; tailor error message | P1 |
| P2-O05 | **Race in parallel score + gap** | `Promise.all` with error aggregation | P1 |
| P2-O06 | **runId collision** | Use `crypto.randomUUID()` | P2 |
| P2-O07 | **Re-entrant call** — same request twice | Idempotent optional; at minimum two independent runs | P2 |

---

## API Routes

| ID | Edge case | Route | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P2-A01 | **Malformed JSON body** | All POST | 400 `VALIDATION_ERROR` | P0 |
| P2-A02 | **Missing `resume` or `jobDescription`** | `/api/tailor` | 400 with field errors | P0 |
| P2-A03 | **Wrong resume type** — `{ type: "pdf" }` without buffer in Phase 2 text-only | `/api/tailor` | 400 "PDF upload not supported yet" or implement parse | P1 |
| P2-A04 | **Request body too large** | All | 413 or 400; Next.js body size limit config | P1 |
| P2-A05 | **`/api/analyze` without tailor** | Analyze only | No `tailored` or `tailoredScore` in response | P1 |
| P2-A06 | **Server error 500** | Any | Generic message; log stack server-side | P0 |

---

## Frontend (Phase 2 wiring)

| ID | Edge case | Expected behavior | Severity |
|----|-----------|-------------------|----------|
| P2-U01 | **Network offline during tailor** | Catch fetch error; retry button | P0 |
| P2-U02 | **30s+ wait** — user navigates away | Warn on leave optional; AbortController cancel request | P1 |
| P2-U03 | **API returns 200 but invalid shape** | Client-side Zod safeParse; error UI | P1 |
| P2-U04 | **Stale results shown** — new analyze while old visible | Clear results on new submit | P0 |

---

## Prompt-specific edge cases

| ID | Prompt | Edge case | Mitigation |
|----|--------|-----------|------------|
| P2-P01 | All | Model ignores JSON-only instruction | Structured output mode + repair |
| P2-P02 | `bullet-rewriter` | Rewrites education as experience | Scope system prompt to experience/projects only |
| P2-P03 | `match-scoring` | Invents critical missing reqs not in JD | Ground in `JobDescriptionProfile` fields only |
| P2-P04 | `gap-analysis` | Suggests lying on resume | `canSafelyAdd: false` + action verbs review |
| P2-P05 | `resume-parser` | Merges two jobs into one | Prompt: one object per employer block |

---

## Testing matrix (Phase 2)

| Test | Setup | Assert |
|------|-------|--------|
| Mock LLM invalid JSON | Fixture returns `{ broken` | Repair or `LLM_PARSE_ERROR` |
| Empty resume | POST `/api/tailor` | 400 `PARSE_ERROR` |
| Student resume | No experience fixture | Valid run; gaps focus on skills/education |
| Weak resume + strong JD | Real JD | `originalScore` &lt; `tailoredScore` typically; not required |
| Synonym skills | JD "Kubernetes", resume "K8s" | Skill coverage &gt; 0 |
| Long input | 20k char JD | Rejected or truncated with message |
| Orchestrator partial fail | Mock gap throw | Graceful error shape |
| No API key | Unset env | 503 friendly error |

---

## Performance edge cases

| ID | Condition | Target | Mitigation |
|----|-----------|--------|------------|
| P2-Perf01 | Typical 1-page resume + JD | &lt; 30s total | Parallel score + gap; batch bullets |
| P2-Perf02 | 5 job entries × 6 bullets | Token heavy | One LLM call per job entry max |
| P2-Perf03 | Cold start serverless | +2–5s | Show loading stages |

---

## Handoff to Phase 3

- Preserve `rawText` on `ResumeProfile` for PDF left column.
- Ensure `TailoringRun` is JSON-serializable for POST body to `/api/export/pdf`.
- Document max recommended input sizes for PDF layout testing.
