# Resume Shapeshifter

JD-to-resume tailoring engine with match scoring, gap analysis, and side-by-side proof PDFs.

## Prerequisites

- **Node.js 20+** ([download](https://nodejs.org/))
- npm (included with Node)
- **Groq API key** (for live LLM integration; optional for demo mode) — [get one free](https://console.groq.com/)

> **Windows / OneDrive:** If `node_modules` sync causes issues, exclude it from OneDrive or clone outside a synced folder.

## Setup

**Windows:** If `npm` is not recognized, Node.js is either not installed or not on your PATH. Install [Node.js 20+](https://nodejs.org/), **close and reopen your terminal**, then:

```bash
npm install
```

Start the dev server using either:

```bash
npm run dev
```

Or double-click **`dev.cmd`** in the project folder (adds Node to PATH automatically).

Copy env file (optional until Phase 2): duplicate `.env.example` to `.env.local`.

**For live LLM integration:** Set your Groq API key:

```bash
# .env.local
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile  # optional, defaults shown
```

**For PDF generation (Phase 3):** Install Playwright and Chromium:

```bash
npm install --save-dev playwright-core
npx playwright install chromium
```

If Playwright is not available, PDF export falls back to a browser print-to-PDF workflow.

Open [http://localhost:3000](http://localhost:3000) and click **Run demo**, or go to [http://localhost:3000/tailor?demo=1](http://localhost:3000/tailor?demo=1).

If port 3000 is in use:

```bash
npm run dev -- -p 3001
```

## Troubleshooting

### "GROQ_API_KEY is required"
- Set `GROQ_API_KEY` in `.env.local` (get a free API key from [console.groq.com](https://console.groq.com/))
- Or run with demo mode: `?demo=1` appended to the URL

### "PDF generation failed"
- Install Playwright: `npm install --save-dev playwright-core`
- Install Chromium: `npx playwright install chromium`
- Or use the browser print-to-PDF: click **🖨️ Print to PDF** on the comparison page

### "Tailoring pipeline times out (>30s)"
- Check network connectivity and Groq API status
- Try with a shorter resume/JD (typical: <2 pages + <1 page)
- Groq rate limits may apply on free tier; wait a moment and retry

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Project structure

See [`docs/architecture.md`](docs/architecture.md) and [`docs/implementation-plan.md`](docs/implementation-plan.md).

## Features

### Phase 1: Static Prototype
- ✅ Input wizard for resume & job description
- ✅ Mock analysis with sample data
- ✅ Side-by-side comparison UI

### Phase 2: LLM Integration
- ✅ Real resume & JD parsing via Groq LLM
- ✅ Match scoring (original vs tailored)
- ✅ Gap analysis with actionable suggestions
- ✅ Bullet tailoring with confidence scores
- ✅ Live `/api/tailor` endpoint

### Phase 3: PDF Export
- ✅ Comparison PDF: side-by-side original vs tailored with score strip
- ✅ Tailored resume PDF: clean single-column ATS layout
- ✅ JD requirements summary in comparison PDF
- ✅ Gap analysis table in PDF
- ✅ Browser-based print-to-PDF fallback
- ✅ Dual export buttons (comparison + tailored)

### Phase 4–5: In Progress
- Guardrails (truthfulness validation)
- Polish & deployment

**Current phase:** 1 (static prototype) → next: Phase 2 LLM integration.

## Environment variables

| Variable | Required | Phase |
|----------|----------|-------|
| `GROQ_API_KEY` | Phase 2+ | LLM integration |
| `GROQ_MODEL` | Optional | Override default Groq model |

Copy `.env.example` to `.env.local` before Phase 2. Phases 0–1 do not require an API key.

## Documentation

- [Problem statement](docs/problem_statement.md)
- [Architecture](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [Deployment plan](docs/deployment.md)
- [Edge cases by phase](docs/edge-cases/README.md)
