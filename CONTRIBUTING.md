# Contributing

## Setup

```bash
npm install
npm run dev
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server with HMR |
| `npm run build` | Type check + production bundle into `dist/` |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src/` and `tests/` |
| `npm run format` | Prettier write |
| `npm run test:unit` | Vitest unit suites |
| `npm run test:integration` | Vitest + Testing Library component/flow suites |
| `npm run test:e2e` | Playwright (run `npx playwright install chromium` once) |

## Ground rules

These come from `.specify/memory/constitution.md` and are non-negotiable:

1. **Transparent decision logic** — every recommendation must cite framework signals or red flags.
2. **Client-side only** — no backend, no external APIs, no telemetry, no storage writes. `tests/unit/offline.test.ts` fails the build if `fetch`, `XMLHttpRequest`, or browser storage appears in `src/`.
3. **Framework authority** — `docs/decision-framework.md` is the source of truth; `src/data/rules.json` is its curated runtime form. Do not invent tools, signals, or criteria.
4. **Accessible & responsive** — WCAG 2.1 AA minimum, verified by `tests/e2e/accessibility.spec.ts` (axe-core).

## Code layout

```text
src/
  components/   Presentational components + WizardContainer + ErrorBoundary
  engine/       Pure recommendation logic and shared types
  hooks/        useWizardState (all wizard state lives here)
  utils/        scoring + text formatting helpers
  data/         rules.json (framework data, bundled at build time)
```

## Pull requests

- Keep `npm run lint`, `npm run type-check`, and all three test suites green.
- Changes to `rules.json` need a matching update to the tests in `tests/unit/rules.test.ts` and `tests/unit/quickstart-scenarios.test.ts`.
- See `src/CONTRIBUTING-ENGINE.md` before extending the recommendation engine.
