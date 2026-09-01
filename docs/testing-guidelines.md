# Testing Guidelines

## Layers

Tests live in `tests/` and are split into three layers, each with its own runner and npm script.

| Layer | Location | Runner | Command |
|-------|----------|--------|---------|
| Unit | `tests/unit/` | Vitest (jsdom) | `npm run test:unit` |
| Integration | `tests/integration/` | Vitest + React Testing Library (jsdom) | `npm run test:integration` |
| End-to-end | `tests/e2e/` | Playwright | `npm run test:e2e` |

**Unit** tests cover the decision engine in isolation — pure functions from `src/engine/` and
`src/utils/`, `rules.json` schema validation, the `useWizardState` hook, the quickstart recommendation
scenarios, and static guards that no network or storage API appears in `src/`. They never render the
full app beyond what a single component needs.

**Integration** tests render real components with React Testing Library and drive them the way a user
would: answering questions, navigating with Back/Next, triggering the tiebreaker, restarting, and
checking that the recommendation and comparison table render correctly.

**End-to-end** tests run the production build in a real browser and cover the whole journey plus the
constitutional guarantees: zero external requests, offline operation, no browser storage, WCAG 2.1 AA
via axe-core, accessible-name coverage of every control via `ariaSnapshot()`, and responsive
behaviour at 320/768/1920px. The `ariaSnapshot()` checks approximate what a screen reader announces;
they narrow, but do not remove, the need for a manual VoiceOver/NVDA pass.

## Naming conventions

- Vitest files: `*.test.ts`, or `*.test.tsx` when the file renders JSX
- Playwright files: `*.spec.ts` (Playwright only collects `*.spec.ts` / `*.test.ts` from `tests/e2e/`)
- Shared Playwright helpers live in `tests/e2e/helpers.ts` — no `.spec` suffix, so it is not collected
  as a test file
- Name the file after the unit under test: `scoring.test.ts` covers `src/utils/scoring.ts`,
  `progressIndicator.test.tsx` covers `src/components/ProgressIndicator.tsx`

> **Note**: this project uses **Vitest**, not Jest. The APIs (`describe`, `it`, `expect`) are
> Jest-compatible, but imports come from `vitest` and configuration lives in `vitest.config.ts`.
> Because the codebase is TypeScript, test files use `.ts` / `.tsx` rather than `.js`.

## Writing a test

- Import test APIs explicitly: `import { describe, it, expect } from 'vitest';`
- Reference the requirement being verified in the `describe` or `it` name, e.g.
  `describe('scoreTools (FR-004a)')`. This keeps `spec.md` traceable from the test suite.
- Prefer role-based queries (`getByRole`, `getByLabelText`) over test IDs or class names — they fail
  when accessibility regresses, which is the point.
- Derive expectations from `rules.json` where possible (question counts, tool names) instead of
  hard-coding numbers that drift when the framework is updated.
- Keep engine tests free of React; the engine is pure and must stay testable without a DOM.

## Fixtures and shared setup

- `tests/setup.ts` runs before every Vitest file: it enables the React act environment and calls
  `cleanup()` after each test.
- Answer paths through the wizard are expressed as arrays of option indexes (for example
  `UI_APP_PATH`, `TIE_PATH`) so they survive changes to question wording.
- Do not add network mocks. If a test needs one, the code under test is violating the client-side-only
  principle.

## Coverage expectations

- Every function exported from `src/engine/` and `src/utils/` needs unit coverage.
- Every user story acceptance scenario in `specs/001-microsoft-tool-advisor/spec.md` needs at least
  one integration or e2e test.
- Every change to `rules.json` needs a matching update to `tests/unit/rules.test.ts` and
  `tests/unit/quickstart-scenarios.test.ts`.

## Before pushing

```bash
npm run type-check && npm run lint && npm run test:unit && npm run test:integration && npm run test:e2e
```

CI runs the same sequence plus `npm run build` and `npm run check:size`.
