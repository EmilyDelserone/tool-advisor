# Research Phase: Microsoft Tool Advisor

**Date**: 2025-09-01

## Overview

This document captures research findings and design decisions for the Microsoft Tool Advisor implementation, resolving all technical uncertainties and establishing best practices for the codebase.

## 1. Recommendation Engine Architecture

**Decision**: Implement the recommendation algorithm as a pure JavaScript module (no React dependency), with deterministic scoring based on framework signals and red flags.

**Rationale**:
- Pure functions enable comprehensive unit testing without React test utilities
- Algorithm is decoupled from UI, allowing reuse in CLI, API, or other frontends in future
- Deterministic scoring ensures consistency and auditability (critical for transparency principle)
- Testability aligns with specification requirement FR-012 (recommendations grounded exclusively in decision framework)

**Alternatives Considered**:
- Embed algorithm in React components: Would couple logic to framework, making testing harder and limiting reuse
- Use external scoring library (like Meilisearch): Would require backend/network calls, violating client-side architecture
- Hardcode recommendations by hand: Doesn't scale when decision framework changes; violates framework authority principle

**Implementation Approach**:
```
src/engine/
├── recommendationEngine.ts    # Core scoring and recommendation logic
├── types.ts                   # TypeScript interfaces (Question, Answer, Tool, Signal, etc.)
└── rules.json                 # Framework definitions (tool signals, red flags, weights)
```

Algorithm:
1. Load rules.json at app startup
2. For each tool, calculate score = sum(matching signals × signal weight) - sum(matching red flags × red flag weight)
3. Rank tools by score
4. If top 2+ tools tie, ask tiebreaker question; use tiebreaker signals to break tie
5. Return recommendation object with primary tool, runner-ups, and justification text

## 2. Framework Data Structure (rules.json)

**Decision**: Curate framework data into `src/data/rules.json` with explicit signal weights and red flag weights. This file is manually updated when `docs/decision-framework.md` changes.

**Rationale**:
- Centralizes framework data for easy reference and updates
- Enables versioning and audit trail (framework changes trackable in git)
- Supports testing: tests can verify that all signals and red flags from the framework are represented
- Allows dynamic scoring algorithms without re-parsing markdown

**Constraints**:
- Manual sync required between docs/decision-framework.md and src/data/rules.json
- Requires a process/checklist to ensure framework updates are reflected (out of scope for v1, but documented)

**Schema** (TypeScript types in src/engine/types.ts):
```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  primaryUseCase: string;
}

interface Signal {
  id: string;
  text: string;
  weight: number; // 1-10 scale
  applicableTools: string[]; // tool ids that match
}

interface RedFlag {
  id: string;
  text: string;
  weight: number; // 1-10 scale
  applicableTools: string[]; // tools to avoid for this red flag
}

interface RulesFile {
  version: string;
  tools: Tool[];
  signals: Signal[];
  redFlags: RedFlag[];
  tiebreakers: Tiebreaker[];
}
```

## 3. Question Design & Answer Mapping

**Decision**: Questions in the wizard are paired with signal/red flag IDs. When users answer, the system marks which signals/red flags are active.

**Rationale**:
- Direct mapping between questions and framework ensures transparency (answers directly feed scoring algorithm)
- Separates question UX (wording, order) from framework logic
- Allows A/B testing question wording without changing scoring algorithm

**Example**:
- Question: "Does your process need a UI for users to interact with?"
  - Answer "Yes" → activates signal "needs-ui"
  - Answer "No" → activates red flag "no-ui-needed"

## 4. Tiebreaker Question Mechanism

**Decision**: Define tiebreaker questions in rules.json. When top-scoring tools are tied, present the tiebreaker question and apply tiebreaker signal weights to differentiate.

**Rationale**:
- Ensures wizard always produces a single recommendation (clear, not ambiguous)
- Tiebreaker questions are derived from framework (e.g., if Power Apps and Copilot Studio tie, a tiebreaker question distinguishes "natural language interaction" vs "structured UI")
- Deterministic: tiebreaker result is recorded as a weight adjustment, not a coin flip

**Schema**:
```typescript
interface Tiebreaker {
  id: string;
  text: string;
  appliesWhen: string[]; // tool ids that are tied
  signals: Signal[]; // signals that apply to tiebreaker answer
}
```

## 5. State Management & Session Handling

**Decision**: Use React hooks (useState, useContext) for session state. No external storage or persistence beyond the browser session.

**Rationale**:
- React hooks are lightweight and sufficient for single-page session state
- No backend or database needed (per constitution)
- Session ends when browser closes; no privacy concerns about data retention

**State Structure**:
```typescript
interface WizardState {
  currentQuestionIndex: number;
  answers: Answer[]; // list of {questionId, answer}
  recommendation: Recommendation | null;
  showTiebreaker: boolean;
  tiebreakerAnswer: Answer | null;
}

interface Answer {
  questionId: string;
  value: string | boolean; // depends on question type
  activatedSignals: string[]; // signal ids
  activatedRedFlags: string[]; // red flag ids
}
```

## 6. Component Organization

**Decision**: Separate container components (state management) from presentation components (UI rendering). Pure functions for recommendation logic.

**Rationale**:
- Follows React best practices (container/presentation pattern)
- Enables testing components independently of state management
- Makes components reusable and easier to refactor

**Component Hierarchy**:
- `App.tsx`: Entry point
- `WizardContainer.tsx`: Manages wizard state (questions, current question index, answers)
- `QuestionCard.tsx`: Displays current question
- `ProgressIndicator.tsx`: Shows progress
- `RecommendationResult.tsx`: Displays recommendation
- `ComparisonTable.tsx`: Shows runner-up tools

## 7. Accessibility (WCAG 2.1 AA)

**Decision**: Use semantic HTML, ARIA labels, keyboard navigation support, and accessible color contrast from the start.

**Rationale**:
- Design requirement (DR-001): WCAG 2.1 AA minimum
- React + semantic HTML naturally supports screen readers
- Keyboard navigation ensures mobile and assistive device users can complete wizard
- Accessible forms library (react-hook-form) for question inputs

**Testing**: Automated accessibility checks via axe or similar in integration tests; manual review by accessibility auditor (Phase 2).

## 8. Testing Strategy

**Decision**: Three-layer testing approach:
- Unit tests for engine functions (Vitest)
- Integration tests for React components and engine together (React Testing Library)
- E2E tests for full wizard flow (Playwright)

**Rationale**:
- Unit tests of pure functions catch scoring logic bugs early
- Integration tests verify React components + engine work together
- E2E tests confirm the user experience end-to-end
- Matches specification success criteria (SC-002: 100% recommendations grounded in framework)

**Coverage Goals**:
- Engine functions: 90%+ coverage
- React components: 75%+ coverage
- E2E: Happy path + key edge cases

## 9. Performance Optimization

**Decision**: Vite for fast dev server and optimized builds. React.memo and useMemo for component optimization if needed. Lazy loading of rules.json not required (small file size).

**Rationale**:
- Vite is fast (sub-second HMR) and produces small bundles
- Question flow and scoring are fast (<100ms per operation)
- rules.json will be small (<50KB); no lazy loading needed
- No network overhead (offline-capable)

## 10. Offline Support

**Decision**: Entire app runs client-side. No service workers or offline caching required for v1 (browser cache handles it automatically).

**Rationale**:
- App is static after initial load (no dynamic data)
- Browser caches scripts, assets, and rules.json automatically
- Users can re-run the wizard multiple times without network
- Satisfies specification requirement FR-011 (offline-capable)

---

## Deferred Decisions

These are design questions to revisit during implementation phase (Phase 2):

1. **Exact signal weights**: Framework provides best-fit signals and red flags textually; mapping to numeric weights (1-10) is a design choice that should be reviewed with stakeholders
2. **Tiebreaker question UX**: If a tiebreaker is needed, should it replace the recommendation, or appear inline? UX mockup needed.
3. **Error handling for malformed rules.json**: Should the app gracefully degrade, or show an error? Define error boundary strategy.

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Engine | Pure JS module | Testability, decoupling from UI, reusability |
| Framework Data | rules.json (manual sync) | Centralized, versionable, auditable |
| Questions | Mapped to signal/red flag IDs | Transparency, testability, framework fidelity |
| Tiebreaker | Built-in, deterministic | Clear recommendations, framework-derived |
| State | React hooks, no persistence | Lightweight, sufficient for session scope |
| Components | Container/presentation pattern | Testability, reusability, separation of concerns |
| Accessibility | WCAG 2.1 AA from start | Design requirement, built into component choice |
| Testing | Unit + integration + E2E | Catches bugs at all levels |
| Performance | Vite + no lazy loading | Fast dev, small bundle, no network overhead |
| Offline | Browser cache | Satisfies offline requirement, no extra work |

All decisions align with project constitution (transparent logic, client-side only, framework authority, accessible design).
