# Edge Cases — Phase Reference Index

Use these documents while implementing each phase of [`implementation-plan.md`](../implementation-plan.md). Each file lists edge cases, where they surface in code, expected behavior, and how to test.

| Phase | Document | When to open |
|-------|----------|--------------|
| **0** | [phase-0-prerequisites.md](./phase-0-prerequisites.md) | Repo scaffold, tooling, env setup |
| **1** | [phase-1-static-prototype.md](./phase-1-static-prototype.md) | Schemas, mocks, wizard UI, stub API |
| **2** | [phase-2-llm-integration.md](./phase-2-llm-integration.md) | LLM client, prompts, orchestrator, scoring |
| **3** | [phase-3-pdf-export.md](./phase-3-pdf-export.md) | PDF generation, export API, file parsing |
| **4** | [phase-4-guardrails.md](./phase-4-guardrails.md) | Truthfulness validation, export gating |
| **5** | [phase-5-polish-deploy.md](./phase-5-polish-deploy.md) | UX polish, deploy, E2E, production |

### How to use

1. Open the edge-case doc for your **current phase** before coding a feature area.
2. When fixing a bug, add the case to the relevant doc if it is not already listed.
3. Cross-phase issues (e.g. parsing) appear in the earliest phase that must handle them; later phases reference upstream behavior.

### Legend (used in all phase docs)

| Severity | Meaning |
|----------|---------|
| **P0** | Must handle in this phase — broken UX or data integrity if ignored |
| **P1** | Should handle — degraded experience or future phase pain |
| **P2** | Nice to have — document and defer if time-constrained |
