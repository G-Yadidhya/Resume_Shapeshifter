# Phase 0 — Prerequisites Edge Cases

**Scope:** Repo scaffold, Next.js setup, Shadcn, Zod, folder layout, env config.  
**Reference:** [Implementation Plan § Prerequisites](../implementation-plan.md#prerequisites-before-phase-1)

---

## Project & Tooling

| ID | Edge case | Where | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P0-01 | **OneDrive / synced folder path** — long paths or sync locks on `node_modules` | Local dev on Windows | Prefer non-synced clone or exclude `node_modules` from OneDrive; document in README | P1 |
| P0-02 | **Node version mismatch** — team uses different Node LTS | `package.json` engines | Pin `"engines": { "node": ">=20" }`; add `.nvmrc` | P1 |
| P0-03 | **`create-next-app` defaults** — Pages Router selected by mistake | `app/` vs `pages/` | Verify App Router (`app/layout.tsx` exists); no `pages/` API mix without intent | P0 |
| P0-04 | **Shadcn init path alias** — `@/` not resolving | `tsconfig.json`, `components.json` | Ensure `"paths": { "@/*": ["./*"] }` matches Shadcn config | P0 |
| P0-05 | **ESLint + build fails on unused vars** in scaffold | CI / `npm run build` | Fix or configure rules before Phase 1; do not disable globally | P1 |

---

## Environment & Secrets

| ID | Edge case | Where | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P0-06 | **`.env.local` committed** | Git | `.gitignore` must include `.env*` except `.env.example` | P0 |
| P0-07 | **Missing `GROQ_API_KEY`** in Phase 1 | N/A yet | Phase 1 must not require key; `.env.example` documents it for Phase 2 | P0 |
| P0-08 | **Empty string env var** — `GROQ_API_KEY=""` set | Phase 2 server | Treat as missing; return clear 503/config error, not opaque LLM failure | P1 |

---

## Folder Layout

| ID | Edge case | Where | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P0-09 | **Duplicate type definitions** — types in components and `lib/` | Entire codebase | Single source: `lib/schemas.ts` from Phase 1 onward | P0 |
| P0-10 | **`fixtures/` imported in client bundle** | Next.js client components | Import fixtures only in server routes or use `fetch('/fixtures/...')` for client demos | P1 |
| P0-11 | **Case-sensitive paths on Linux deploy** — `Components/` vs `components/` | Vercel | Use lowercase `components/`, `lib/` consistently | P1 |

---

## Build & Dev Server

| ID | Edge case | Where | Expected behavior | Severity |
|----|-----------|-------|-------------------|----------|
| P0-12 | **Port 3000 already in use** | `npm run dev` | Document alternate port: `npm run dev -- -p 3001` | P2 |
| P0-13 | **Strict TypeScript errors on Shadcn components** | `tsconfig strict` | Enable `strict: true` early; fix Shadcn peer issues before Phase 1 UI | P1 |
| P0-14 | **Windows line endings (CRLF)** in fixtures | `fixtures/*.txt` | Normalize to LF in repo or normalize on read in tests | P2 |

---

## Testing Checklist (Phase 0 exit)

- [ ] `npm run dev` — landing page loads
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — passes
- [ ] `.env.example` present; `.env.local` gitignored
- [ ] Folder skeleton matches architecture §17

---

## Deferred to later phases

| Topic | Handled in |
|-------|------------|
| LLM API failures | Phase 2 |
| File upload MIME validation | Phase 3 / 5 |
| Rate limiting | Phase 5 |
