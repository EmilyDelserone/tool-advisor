# Copilot Instructions: Microsoft Tool Advisor

A client-side React + TypeScript wizard that recommends one of five Microsoft tools (Power Automate,
Power Apps, Copilot Studio, Azure Logic Apps, Azure Functions) from a short series of guided
questions. No backend, no APIs, no storage.

## Read these before making changes

| Document | Use it for |
|----------|------------|
| [docs/decision-framework.md](../docs/decision-framework.md) | The authoritative signals and red flags for every tool. Never invent tools or criteria outside this file. |
| [docs/architecture-overview.md](../docs/architecture-overview.md) | System structure, component hierarchy, data flow, and module boundaries. |
| [docs/testing-guidelines.md](../docs/testing-guidelines.md) | Test layers, file locations, naming conventions, and what to run before pushing. |
| [docs/coding-guidelines.md](../docs/coding-guidelines.md) | Formatting, import organization, and how DRY is applied here. |
| [.specify/memory/constitution.md](../.specify/memory/constitution.md) | Non-negotiable project principles. |

## SpecKit artifacts

The feature is specified under `specs/001-microsoft-tool-advisor/`. Treat these as the source of
intent — if code and spec disagree, resolve the disagreement rather than assuming the code is right.

| Artifact | Contains |
|----------|----------|
| [specs/001-microsoft-tool-advisor/spec.md](../specs/001-microsoft-tool-advisor/spec.md) | Functional (FR), design (DR), and non-functional (NFR) requirements, user stories, success criteria, and traceability tables. |
| [specs/001-microsoft-tool-advisor/plan.md](../specs/001-microsoft-tool-advisor/plan.md) | Tech stack, state management approach, testing strategy, and project structure. |
| [specs/001-microsoft-tool-advisor/tasks.md](../specs/001-microsoft-tool-advisor/tasks.md) | Phased task list with completion markers. |
| [specs/001-microsoft-tool-advisor/data-model.md](../specs/001-microsoft-tool-advisor/data-model.md) | Entity definitions and the `rules.json` schema. |
| [specs/001-microsoft-tool-advisor/contracts/ui-components.md](../specs/001-microsoft-tool-advisor/contracts/ui-components.md) | Component props and behavioural contracts. |
| [specs/001-microsoft-tool-advisor/quickstart.md](../specs/001-microsoft-tool-advisor/quickstart.md) | Manual validation scenarios and their automated equivalents. |

## Hard constraints

1. **Client-side only.** No `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `localStorage`,
   `sessionStorage`, cookies, or IndexedDB anywhere in `src/`. Tests enforce this.
2. **Framework authority.** All recommendation data comes from `src/data/rules.json`, curated from
   `docs/decision-framework.md`. Changing recommendation behaviour means changing the framework first.
3. **Transparent reasoning.** Justifications and runner-up differentiators must be generated from
   matched signal and red flag `text` values, never hard-coded prose.
4. **Accessibility.** WCAG 2.1 AA is a requirement, not a polish item. Use semantic HTML and
   role-based queries; axe-core audits run in CI.

## Code layout

```text
src/
  components/   UI, plus WizardContainer and ErrorBoundary
  engine/       Pure recommendation logic and shared types (no React)
  hooks/        useWizardState — all wizard state
  utils/        scoring.ts, formatting.ts
  data/         rules.json
tests/          unit | integration | e2e
```

## Commands

```bash
npm run dev            # dev server
npm run type-check     # tsc --noEmit
npm run lint           # ESLint
npm run test:unit      # Vitest unit suites
npm run test:integration
npm run test:e2e       # Playwright (npx playwright install chromium first)
npm run build && npm run check:size
```
