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

**Testing**: Vitest, React Testing Library, Playwright (e2e)

**Target Platform**: Web browser (desktop, tablet, mobile responsive)

**Project Type**: Single-page web application (React + Vite frontend only)

**Performance Goals**: Complete 5-7 question flow + recommendation display in under 3 minutes; responsive interactions (<100ms per question submission)

**Constraints**: Client-side only (no backend), offline-capable, zero external API calls, WCAG 2.1 AA accessibility

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
src/
├── components/
│   ├── WizardContainer.tsx
│   ├── QuestionCard.tsx
│   ├── ProgressIndicator.tsx
│   ├── RecommendationResult.tsx
│   ├── ComparisonTable.tsx
│   └── App.tsx
├── engine/
│   ├── recommendationEngine.ts       # Pure functions, no React dependency
│   ├── types.ts
│   └── rules.json
├── data/
│   └── rules.json                    # Framework definitions (curated from docs/decision-framework.md)
├── hooks/
│   ├── useWizardState.ts
│   └── useRecommendation.ts
├── utils/
│   ├── scoring.ts
│   └── formatting.ts
└── main.tsx

tests/
├── unit/
│   ├── recommendationEngine.test.ts
│   ├── scoring.test.ts
│   └── rules.test.ts
├── integration/
│   ├── wizard-flow.test.tsx
│   └── recommendation.test.tsx
└── e2e/
    └── wizard.spec.ts

docs/
├── architecture-overview.md          # Phase 1 output
└── decision-framework.md             # Existing

public/
└── index.html
```

**Structure Decision**: Single React + Vite application (no backend). The `engine/` directory contains pure JavaScript functions for the recommendation algorithm, decoupled from React components for testability. The `data/rules.json` file holds framework definitions curated from `docs/decision-framework.md`. All application state is managed in React hooks and component state; no persistence layer.
