# Implementation Plan: Microsoft Tool Advisor

**Branch**: `001-microsoft-tool-advisor` | **Date**: 2025-09-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-microsoft-tool-advisor/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a client-side wizard application that guides business stakeholders through 5-7 guided questions (plus optional tiebreaker) to recommend the right Microsoft tool (Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, Azure Functions). The wizard displays a primary recommendation with plain-language reasoning grounded in the decision framework, plus a comparison table with 1-2 runner-up tools. All logic runs client-side in the browser with no backend, no external API calls, and no data storage beyond the session.

## Technical Context

**Language/Version**: JavaScript/TypeScript (ES2020+) with React 18+

**Primary Dependencies**: React, Vite, TypeScript

**Storage**: Browser session state only (no persistence, no external storage)

**State Management**: Plain React hooks. All wizard state (`currentQuestionIndex`, `answers`, `tiebreakerQuestion`, `recommendation`) lives in a single custom hook, `src/hooks/useWizardState.ts`, consumed by `WizardContainer`. No Context, no reducer, no state library — the state is small, local, and never shared across routes.

**Testing**: Three layers, all runnable locally and in CI:

- **Unit** (`tests/unit/`, Vitest): pure engine functions, `rules.json` schema validation, quickstart scenario outcomes, and static checks that no network or storage APIs appear in `src/`
- **Integration** (`tests/integration/`, Vitest + React Testing Library, jsdom): full wizard navigation, tiebreaker path, restart, and recommendation/comparison rendering
- **E2E** (`tests/e2e/`, Playwright): real-browser wizard flow, offline and zero-request verification, and axe-core WCAG 2.1 AA audits

**Target Platform**: Web browser — latest two versions of Chrome, Edge, Firefox, and Safari (desktop, tablet, mobile). Internet Explorer is out of scope.

**Project Type**: Single-page web application (React + Vite frontend only)

**Performance Goals**: Complete 5-7 question flow + recommendation display in under 3 minutes; question transitions and recommendation generation under 100ms; first load under 2 seconds; production bundle under 200KB gzipped

**Constraints**: Client-side only (no backend), offline-capable, zero external API calls, WCAG 2.1 AA accessibility, responsive at 480px / 768px / desktop breakpoints

**Scale/Scope**: Single feature (wizard + recommendation), 5 tools in decision matrix, ~5-7 core questions + optional 1 tiebreaker

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I: Transparent Decision Logic** ✓
- Design includes recommendation justification with framework signal citations
- All scoring logic is deterministic and reviewable

**Principle II: Client-Side Only Architecture** ✓
- No backend required; all logic runs in browser
- No external API calls; no data transmission beyond local session
- Framework data (rules.json) bundled with application

**Principle III: Decision Framework Authority** ✓
- Design uses rules.json curated from docs/decision-framework.md
- No tool recommendations outside the five defined tools
- Framework is single source of truth for signals and red flags

**Principle IV: Accessible & Responsive Design** ✓
- React + semantic HTML enables WCAG 2.1 AA compliance
- Vite builds support modern browser APIs and responsive design
- Accessibility testing included in test strategy

**Violations**: None. Design aligns with all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-microsoft-tool-advisor/
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
index.html                            # Vite entry point (repo root, not public/)

src/
├── App.tsx                           # Loads/validates rules, renders ErrorBoundary + WizardContainer
├── components/
│   ├── WizardContainer.tsx
│   ├── QuestionCard.tsx
│   ├── ProgressIndicator.tsx
│   ├── RecommendationResult.tsx
│   ├── ComparisonTable.tsx
│   └── ErrorBoundary.tsx
├── engine/
│   ├── recommendationEngine.ts       # Pure functions, no React dependency
│   └── types.ts
├── data/
│   └── rules.json                    # Framework definitions (curated from docs/decision-framework.md)
├── hooks/
│   └── useWizardState.ts             # Owns wizard *and* recommendation state
├── utils/
│   ├── scoring.ts
│   └── formatting.ts
├── index.css
└── main.tsx

tests/
├── setup.ts
├── unit/
│   ├── recommendationEngine.test.ts
│   ├── scoring.test.ts
│   ├── rules.test.ts
│   ├── useWizardState.test.ts
│   ├── accessibility.test.tsx
│   ├── offline.test.ts
│   └── quickstart-scenarios.test.ts
├── integration/
│   ├── wizard-flow.test.tsx
│   ├── recommendation.test.tsx
│   └── progressIndicator.test.tsx
└── e2e/
    ├── helpers.ts
    ├── wizard.spec.ts
    ├── offline.spec.ts
    ├── accessibility.spec.ts
    ├── security.spec.ts
    ├── responsive.spec.ts
    └── performance.spec.ts

scripts/
└── check-bundle-size.mjs              # Enforces NFR-002

docs/
├── architecture-overview.md
├── decision-framework.md
├── testing-guidelines.md
└── coding-guidelines.md
```

**Structure Decision**: Single React + Vite application (no backend). The `engine/` directory contains pure TypeScript functions for the recommendation algorithm, decoupled from React components for testability. The `data/rules.json` file holds framework definitions curated from `docs/decision-framework.md`. All application state is managed in React hooks and component state; no persistence layer.

**Deviations from the original sketch** (recorded rather than "fixed", because the shipped shape is the better one):

- **No `src/engine/rules.json`**: framework data lives only in `src/data/rules.json`, per FR-013. A second copy would violate the single-source-of-truth principle.
- **No `src/hooks/useRecommendation.ts`**: recommendation state is produced by the same transition that consumes the final answer, so splitting it from `useWizardState` would mean two hooks sharing one piece of state. `useWizardState` returns `recommendation` directly.
- **`index.html` at the repository root, not `public/index.html`**: this is the Vite convention — the root HTML file is the build entry point and is processed for asset injection, whereas `public/` is for files copied verbatim. `public/` is retained but empty.
- **`src/App.tsx`, not `src/components/App.tsx`**: `App` is the composition root rather than a presentational component.
