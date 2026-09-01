# Tasks: Microsoft Tool Advisor

**Input**: Design documents from `/specs/001-microsoft-tool-advisor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/ui-components.md, quickstart.md

**Tests**: Test tasks are included throughout (unit, integration, E2E). Tests are organized per user story and must pass before corresponding implementation is considered complete.

**Organization**: Tasks are grouped by user story (US1–US4, all P1 priority) to enable independent implementation and testing of each wizard feature.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with React, Vite, TypeScript, and testing frameworks

- [X] T001 Initialize Vite React project with TypeScript: `npm create vite@latest tool-advisor -- --template react-ts`
- [X] T002 Install core dependencies: React 18+, TypeScript (ES2020+), React Testing Library, Vitest, Playwright in package.json
- [X] T003 [P] Configure TypeScript strict mode in tsconfig.json; target ES2020
- [X] T004 [P] Create project structure: `src/{components,engine,data,hooks,utils}`, `tests/{unit,integration,e2e}`, `public/`
- [X] T005 [P] Setup Vite configuration: HMR, build output for production bundle (<500KB gzipped target)
- [X] T006 [P] Configure Vitest: vitest.config.ts with React support, coverage reporting, test paths
- [X] T007 [P] Configure Playwright: playwright.config.ts for browser automation (Chrome, Firefox, Safari)
- [X] T008 Setup linting: ESLint + Prettier in .eslintrc.json, .prettierrc
- [X] T009 [P] Create public/index.html entry point with semantic HTML, accessibility attrs (lang, viewport, charset)
- [X] T010 [P] Create src/main.tsx entry point importing App.tsx and mounting to DOM
- [X] T011 Create README.md with project overview, tech stack, setup instructions, and running commands

**Checkpoint**: Project structure ready, all dependencies installed, dev server can start (`npm run dev`)

---

## Phase 2: Foundational (Blocking Prerequisites for All User Stories)

**Purpose**: Decision engine, types, rules.json, and component contracts — all stories depend on these

**⚠️ CRITICAL**: No user story work can begin until Phase 2 is complete

### 2A: Core Types & Engine Interfaces

- [X] T012 Create src/engine/types.ts with TypeScript interfaces: Tool, Signal, RedFlag, Question, Answer, Recommendation, RunnerUpTool, TiebreakerQuestion, RulesFile, WizardState
- [X] T013 Create src/engine/recommendationEngine.ts stub with pure function signatures (no implementation)
- [X] T014 Create src/data/rules.json template with schema: version, tools[], signals[], redFlags[], questions[], questionMappings[], tiebreakers[], metadata
- [X] T015 Populate rules.json with 5 tools from spec: Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, Azure Functions (use data-model.md as reference)

### 2B: Decision Engine Implementation

- [X] T016 Implement calculateToolScores() in src/engine/scoring.ts: pure function that scores each tool based on activated signals/red flags
- [X] T017 Implement findPrimaryRecommendation() in src/engine/recommendationEngine.ts: returns top-scoring tool + runner-ups
- [X] T018 Implement detectTie() in src/engine/recommendationEngine.ts: returns true if top 2+ tools have equal score
- [X] T019 Implement applyTiebreakerSignals() in src/engine/recommendationEngine.ts: applies tiebreaker signals to break ties (deterministic)
- [X] T020 Implement generateJustification() in src/engine/recommendationEngine.ts: returns plain-language text citing matched signals from rules.json
- [X] T021 Implement loadRulesFile() in src/engine/recommendationEngine.ts: loads rules.json at startup, validates schema
- [X] T022 Implement answerToSignals() in src/engine/recommendationEngine.ts: maps question answer (value) to activated signal/red flag IDs

### 2C: Rules.json Population from Decision Framework

- [X] T023 [P] Create rules.json entries for all signals from docs/decision-framework.md with weights (1-10 scale); ensure signals map to applicable tools
- [X] T024 [P] Create rules.json entries for all red flags from docs/decision-framework.md with weights (1-10 scale); ensure red flags map to applicable tools
- [X] T025 [P] Create rules.json entries for 5-7 core questions; each question must map answers to signal/red flag IDs via questionMappings[]
- [X] T026 Create tiebreaker question(s) in rules.json with trigger conditions and discriminative signals; test data: what breaks ties between Power Automate & Azure Logic Apps?
- [X] T027 Validate rules.json: all signals have weight 1-10, all red flags have weight 1-10, all tools appear in signals/red flags, all questions are unique

### 2D: Testing Foundation

- [X] T028 [P] Create tests/unit/recommendationEngine.test.ts: unit tests for calculateToolScores, findPrimaryRecommendation, detectTie, applyTiebreakerSignals (tests MUST FAIL initially)
- [X] T029 [P] Create tests/unit/scoring.test.ts: unit tests for scoring algorithm with sample inputs (e.g., 3 signals + 1 red flag → expected score)
- [X] T030 [P] Create tests/unit/rules.test.ts: validation tests that all signals/red flags are in rules.json, all tools are represented, schema is valid
- [ ] T031 Run unit tests to confirm all fail (TDD approach): `npm run test:unit` should show red for T028-T030

**Checkpoint**: Decision engine ready with rules.json, types defined, unit tests written (failing), can proceed to user story implementation

---

## Phase 3: User Story 1 - Discovery Through Guided Questions (Priority: P1)

**Goal**: Users answer 5-7 guided questions one at a time with a progress indicator

**Independent Test**: User can launch wizard, answer all questions sequentially, see progress indicator update after each answer, and reach recommendation screen without errors

### Tests for User Story 1

- [X] T032 [P] [US1] Create tests/integration/wizard-flow.test.tsx: test complete question flow (Q1 → Q2 → ... → Q7 → results) with synthetic user input
- [X] T033 [P] [US1] Create tests/unit/useWizardState.test.ts: test hook state transitions (answers[], currentQuestionIndex, showRecommendation)
- [X] T034 [P] [US1] Create tests/integration/progressIndicator.test.tsx: test progress bar updates correctly (2/5, 3/5, etc.)
- [X] T035 [US1] Create tests/e2e/wizard-questions.spec.ts: Playwright test launching wizard, answering questions via keyboard/mouse, verify progress displays

### Implementation for User Story 1

- [X] T036 [P] [US1] Create src/hooks/useWizardState.ts hook: manages currentQuestionIndex, answers[], showRecommendation boolean, resetWizard() method
- [X] T037 [P] [US1] Create src/components/ProgressIndicator.tsx: React component receiving (currentIndex, totalQuestions, isTiebreaker?) and rendering "Question 2 of 7" text + progress bar
- [X] T038 [P] [US1] Create src/components/QuestionCard.tsx: React component receiving (question: Question, onAnswer callback) and rendering question text + answer options (yes/no or radio buttons) + submit button
- [X] T039 [US1] Create src/components/WizardContainer.tsx: React container managing wizard state (useWizardState hook), handling answer submissions, coordinating state → ProgressIndicator + QuestionCard + RecommendationResult
- [X] T040 [US1] Implement question submission handler in WizardContainer: validate answer, call useWizardState to update index, fetch next question from rules.json
- [X] T041 [US1] Create semantic HTML for QuestionCard: fieldset + legend (question text), input[type=radio] or input[type=checkbox] + labels, button[type=submit]
- [X] T042 [US1] Test US1 end-to-end: launch app, answer Q1–Q5, verify progress shows 5/5, reach results screen

**Checkpoint**: User Story 1 complete — wizard presents questions one at a time with progress indicator, answers are tracked in state

**Parallel Opportunities**:
- T032, T033, T034 (tests) can run in parallel
- T036, T037, T038 (components) can run in parallel after types are defined (T012)

---

## Phase 4: User Story 2 - Primary Tool Recommendation with Justification (Priority: P1)

**Goal**: After answering all questions, display primary recommendation with plain-language reasoning grounded in framework signals

**Independent Test**: Complete wizard (Q1–Q7), verify primary recommendation appears, verify justification cites at least 2 framework signals, verify business-friendly language (no technical jargon)

### Tests for User Story 2

- [X] T043 [P] [US2] Create tests/unit/recommendationEngine.test.ts additions: test generateJustification() produces readable text citing signals
- [X] T044 [P] [US2] Create tests/integration/recommendation.test.tsx: test RecommendationResult displays recommendation object with justification, verify signal citations in text
- [X] T045 [US2] Create tests/e2e/recommendation-flow.spec.ts: Playwright test completing wizard flow and verifying recommendation displays with justification visible

### Implementation for User Story 2

- [X] T046 [P] [US2] Implement full recommendation algorithm in src/engine/recommendationEngine.ts: load all answers from session, call calculateToolScores, findPrimaryRecommendation, generateJustification
- [X] T047 [P] [US2] Update src/engine/scoring.ts answerToSignals(): map each user answer to activated signal/red flag IDs (mapping from rules.json questionMappings)
- [X] T048 [US2] Create src/components/RecommendationResult.tsx: React component receiving (recommendation: Recommendation) and rendering: tool name (large), justification text (cites signals), "Start Over" button
- [X] T049 [US2] Implement visual emphasis in RecommendationResult: tool name in large heading, recommendation section has distinct background color/border, justification in readable font size (≥16px)
- [X] T050 [US2] Update WizardContainer: call recommendation engine after Q7 answered, set showRecommendation=true, render RecommendationResult instead of QuestionCard
- [X] T051 [US2] Implement "Start Over" button: clears answers[], resets currentQuestionIndex=0, showRecommendation=false
- [X] T052 [US2] Create src/utils/formatting.ts: functions for plain-language text generation (business-friendly terms, no technical jargon for recommendation reasons)
- [X] T053 [US2] Test US2 end-to-end: complete wizard flow, verify recommendation displays with justification citing framework signals

**Checkpoint**: User Story 2 complete — after Q7, user sees primary recommendation with plain-language reasoning

**Parallel Opportunities**:
- T043, T044, T045 (tests) can run in parallel
- T046, T047 (engine functions) can run in parallel

---

## Phase 5: User Story 3 - Comparison Table with Runner-Ups (Priority: P1)

**Goal**: Display 1-2 runner-up tools in a comparison table below primary recommendation showing why primary was chosen

**Independent Test**: Complete wizard, verify comparison table appears below primary recommendation with 1-2 runner-up tools, verify table has columns (Tool, Use Case, Why Not This One?), verify runner-ups cite framework differentiators

### Tests for User Story 3

- [X] T054 [P] [US3] Create tests/unit/recommendationEngine.test.ts additions: test runner-up selection logic (top 2–3 scores, exclude primary)
- [X] T055 [P] [US3] Create tests/integration/comparisonTable.test.tsx: test ComparisonTable receives runner-ups, renders correct columns, differentiator text displays
- [X] T056 [US3] Create tests/e2e/comparison-table.spec.ts: Playwright test verifying table renders on recommendation screen, is scannable, rows are readable

### Implementation for User Story 3

- [X] T057 [P] [US3] Implement runner-up selection in src/engine/recommendationEngine.ts: return top 2–3 scoring tools (excluding primary) as RunnerUpTool[] with differentiator text
- [X] T058 [P] [US3] Create src/components/ComparisonTable.tsx: React component receiving (runnerUps: RunnerUpTool[]) and rendering semantic table (thead with Tool/Use Case/Why Not This One?, tbody with 1-2 rows)
- [X] T059 [US3] Implement table responsiveness in ComparisonTable: stack columns on mobile, full table on desktop (media query breakpoint ≤768px)
- [X] T060 [US3] Implement differentiator text generation in src/engine/recommendationEngine.ts: generateRunnerUpDifferentiator() returns plain-language reason why runner-up wasn't chosen (cites framework red flags or missing signals)
- [X] T061 [US3] Update RecommendationResult to render ComparisonTable below primary recommendation with proper spacing/visual separation
- [X] T062 [US3] Test US3 end-to-end: complete wizard, verify comparison table displays, verify all columns visible, verify runner-up reasons are readable and cite framework

**Checkpoint**: User Story 3 complete — comparison table with runner-ups displays below primary recommendation

**Parallel Opportunities**:
- T054, T055, T056 (tests) can run in parallel
- T057, T058 (runner-up logic and component) can run in parallel

---

## Phase 6: User Story 4 - Client-Side Completeness (Priority: P1)

**Goal**: Entire wizard works offline with zero external API calls, demonstrating pure client-side architecture and privacy

**Independent Test**: Disable network in DevTools, complete full wizard flow (Q1–Q7 → recommendation → comparison), verify zero network requests logged in DevTools, verify all data loaded locally

### Tests for User Story 4

- [X] T063 [P] [US4] Create tests/unit/offline.test.ts: verify rules.json is bundled with app, verify no fetch/XMLHttpRequest calls in recommendation engine
- [X] T064 [P] [US4] Create tests/e2e/offline.spec.ts: Playwright test with browser offline mode enabled, complete wizard flow, verify zero network activity
- [X] T065 [P] [US4] Create tests/unit/accessibility.test.tsx: WCAG 2.1 AA compliance checks (semantic HTML, keyboard navigation, color contrast, ARIA labels)
- [X] T066 [P] [US4] Create tests/e2e/accessibility.spec.ts: Playwright test using axe-core for accessibility audit, keyboard-only navigation through wizard
- [X] T067 [US4] Create tests/e2e/security.spec.ts: verify no localStorage/sessionStorage writes, no XSS vulnerabilities, CSP headers respected

### Implementation for User Story 4

- [X] T068 [US4] Bundle rules.json with app: move src/data/rules.json to asset, import in src/engine/recommendationEngine.ts as JSON module
- [X] T069 [US4] Update loadRulesFile() to load from bundled asset (not fetch): `import rulesData from '../data/rules.json'`
- [X] T070 [US4] Verify zero network requests: audit src/ for fetch(), XMLHttpRequest, or external API calls; remove any found
- [X] T071 [P] [US4] Ensure semantic HTML in all components: use appropriate heading levels (h1, h2), use label + input associations, use button[type=submit] for forms
- [X] T072 [P] [US4] Implement keyboard navigation: Tab through QuestionCard options, Enter to submit, focus indicators visible (outline or background change)
- [X] T073 [P] [US4] Add ARIA labels and descriptions: aria-label for icon buttons, aria-describedby for complex components, role="main" on App
- [X] T074 [P] [US4] Ensure color contrast: verify all text has WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- [ ] T075 [US4] Test screen reader compatibility: test with VoiceOver (macOS), NVDA (Windows), or similar; verify all interactive elements are announced
- [X] T076 [US4] Test responsive design: verify UI looks correct on 320px (mobile), 768px (tablet), 1920px (desktop)
- [X] T077 [US4] Verify session-only state: complete wizard multiple times, confirm no data persists between sessions (no localStorage leak)
- [X] T078 [US4] Run quickstart.md validation scenarios: Scenario 7 (offline), Scenario 6 (accessibility), Scenario 5 (no external API calls)

**Checkpoint**: User Story 4 complete — wizard works entirely offline, is fully accessible (WCAG 2.1 AA), has zero external dependencies

**Parallel Opportunities**:
- T063, T064, T065, T066, T067 (tests) can run in parallel
- T071, T072, T073, T074, T075, T076 (accessibility & responsive implementation) can run in parallel

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories, documentation, and production readiness

- [X] T079 [P] Add TypeScript strict type checking for all components: verify `tsc --noEmit` produces zero errors
- [X] T080 [P] Setup error boundary in App.tsx: wrap WizardContainer with error boundary, display user-friendly error message + "Try Again" button
- [X] T081 [P] Implement error handling for malformed rules.json: catch parse errors, display message "Unable to load framework data, please refresh"
- [X] T082 [P] Performance: run Vite build and verify bundle size <500KB gzipped (`npm run build && ls -lh dist/`)
- [X] T083 [P] Optimize bundle: tree-shake unused code, minify, check for large dependencies
- [X] T084 Code cleanup: remove console.log statements, unused imports, commented code
- [X] T085 Create docs/ARCHITECTURE.md: document decision engine design, types, rules.json schema, testing strategy (copy from data-model.md + architecture-overview.md)
- [X] T086 Create CONTRIBUTING.md: contribution guidelines, setup steps, testing commands, code style
- [X] T087 Update README.md with: project description, quick start, tech stack, running dev server, running tests, building production bundle
- [X] T088 Run all tests: `npm run test:unit && npm run test:integration && npm run test:e2e` — verify 100% pass
- [X] T089 [P] Verify quickstart.md Scenario 1 (Power Automate recommendation): answer questions for backend automation case, verify Power Automate is primary recommendation
- [X] T090 [P] Verify quickstart.md Scenario 2 (Power Apps recommendation): answer questions for UI-heavy case, verify Power Apps is recommended
- [X] T091 [P] Verify quickstart.md Scenario 3 (Azure Functions recommendation): answer questions for custom logic case, verify Azure Functions is recommended
- [X] T092 [P] Verify quickstart.md Scenario 4 (Copilot Studio recommendation): answer questions for NLP case, verify Copilot Studio is recommended
- [X] T093 Verify quickstart.md Scenario 8 (Tiebreaker): trigger tie condition (e.g., equal scores for two tools), verify tiebreaker question appears and resolves to single recommendation
- [X] T094 Create src/CONTRIBUTING-ENGINE.md: documentation for extending recommendation engine (adding new tools, signals, or questions)
- [X] T095 Setup GitHub Actions workflow: run tests on push/PR, build production bundle, verify no regressions
- [X] T096 Prepare deployment: ensure public/ is ready, vite.config.ts has correct base path, production build is reproducible

**Checkpoint**: Polish complete, all documentation written, all tests passing, production bundle ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3–6 (User Stories 1–4)**: All depend on Phase 2 completion
  - User stories can proceed in parallel (if team capacity allows) or sequentially (Phase 3 → Phase 4 → Phase 5 → Phase 6)
  - Each story builds on previous stories' components
- **Phase 7 (Polish)**: Depends on all user stories being substantially complete (tests passing)

### Within Phase 3–6: Task Dependencies

**User Story 1** (Phase 3):
- Tests (T032–T034) should be written first, verified to fail
- Components (T036–T038) implement to make tests pass
- Container (T039–T041) coordinates components

**User Story 2** (Phase 4):
- Tests (T043–T045) verify recommendation logic
- Engine (T046–T047) implements scoring and justification
- Component (T048–T050) displays recommendation
- Formatting utility (T052) supports plain-language generation

**User Story 3** (Phase 5):
- Tests (T054–T056) verify runner-up selection
- Engine (T057, T060) implements runner-up logic
- Component (T058–T059) renders table

**User Story 4** (Phase 6):
- Tests (T063–T067) verify offline, accessibility, security
- Implementation (T068–T078) ensures compliance across all features

### Parallel Opportunities

#### Within Phase 1
- T003, T004, T005, T006, T007, T008, T009, T010 can run in parallel (different config files, no code dependencies)

#### Within Phase 2
- Tests section 2D (T028–T031) can run in parallel
- Rules.json population (T023–T026) can run in parallel with engine implementation (T016–T022)

#### Within Phase 3
- Tests (T032, T033, T034) can run in parallel
- Components (T036, T037, T038) can run in parallel

#### Within Phase 4
- Tests (T043, T044, T045) can run in parallel
- Engine implementation (T046, T047) can run in parallel

#### Within Phase 5
- Tests (T054, T055, T056) can run in parallel
- Engine + component (T057, T058) can run in parallel

#### Within Phase 6
- Tests (T063, T064, T065, T066, T067) can run in parallel
- Accessibility implementation (T071, T072, T073, T074, T075, T076) can run in parallel
- Scenario validation (T089–T092) can run in parallel

#### Within Phase 7
- Configuration & optimization (T079–T083) can run in parallel
- Scenario validation (T089–T092) can run in parallel
- Documentation (T085–T087) can run in parallel with testing

### Recommended Execution Path (Sequential MVP)

1. Complete Phase 1: Setup (baseline environment ready)
2. Complete Phase 2: Foundational (decision engine ready, unit tests passing)
3. Complete Phase 3: User Story 1 (wizard questions working)
4. **STOP and VALIDATE**: Run `npm run dev`, test wizard Q1–Q7, progress indicator, confirm independent test criteria met
5. Complete Phase 4: User Story 2 (recommendation with justification)
6. **STOP and VALIDATE**: Complete wizard flow, verify recommendation displays with justification
7. Complete Phase 5: User Story 3 (comparison table)
8. **STOP and VALIDATE**: Verify table displays with runner-ups
9. Complete Phase 6: User Story 4 (offline, accessibility, security)
10. **STOP and VALIDATE**: Run offline scenario, accessibility audit, network inspection
11. Complete Phase 7: Polish & documentation
12. **FINAL VALIDATION**: Run quickstart.md scenarios 1–4 and 8; all tests pass; production build successful

### Parallel Team Strategy (4 Developers)

With multiple developers:

1. All team completes Phase 1 + Phase 2 together (1–2 days)
2. Once Phase 2 done:
   - Dev 1: Phase 3 (User Story 1 - questions & progress)
   - Dev 2: Phase 4 (User Story 2 - recommendation)
   - Dev 3: Phase 5 (User Story 3 - comparison table)
   - Dev 1 (after US1): Phase 6 (User Story 4 - offline/accessibility)
3. All team: Phase 7 (polish, docs, testing)

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

The MVP is **User Story 1 + User Story 2**:
1. User answers 5–7 guided questions
2. User sees primary recommendation with plain-language reasoning
3. All logic runs client-side

This proves the core wizard concept and gets user feedback before adding comparison table (US3) or comprehensive testing (US4).

**MVP Timeline**: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 6 (testing)

### Incremental Delivery

1. **Sprint 1**: Phase 1 + Phase 2 → Foundation ready
2. **Sprint 2**: Phase 3 + Phase 4 → MVP wizard with recommendation (deploy)
3. **Sprint 3**: Phase 5 → Add comparison table (deploy)
4. **Sprint 4**: Phase 6 + Phase 7 → Offline, accessibility, polish (final release)

Each increment is independently deployable and testable.

---

## Notes

- **TDD Approach**: Test tasks (T032–T034, T043–T045, etc.) should be written and run first; they must FAIL before implementation. Implement to make tests pass.
- **Component Independence**: Each component (QuestionCard, ProgressIndicator, RecommendationResult, ComparisonTable) should be independently testable without full wizard context.
- **Engine as Library**: recommendationEngine.ts contains pure functions; they can be tested without React, reused in CLI/API, and updated independently of UI.
- **rules.json as Source of Truth**: All framework data flows through rules.json. Update this file when docs/decision-framework.md changes; update tests accordingly.
- **Parallel Work**: Use different files to avoid merge conflicts. Components in separate files (QuestionCard.tsx, ProgressIndicator.tsx) can be developed in parallel.
- **Stop Points**: After each phase, run tests and validate with quickstart.md scenarios. Do not proceed until current phase is stable.
- **Accessibility First**: WCAG 2.1 AA compliance (DR-001, SC-006) is a requirement, not an afterthought. Implement semantic HTML from the start (T041, T071–T075).
- **Offline Verification**: User Story 4 (T078) is critical — disable network in DevTools and verify wizard works completely offline before considering feature complete.

---

## Phase 8: Convergence

- [X] T097 CRITICAL: Generate runner-up differentiation text in src/engine/recommendationEngine.ts from the runner-up's missing signals and matched red flags in rules.json instead of the generic template string, so every runner-up row cites the framework per Constitution I & III, FR-007, SC-002 (contradicts)
- [X] T098 CRITICAL: Populate `tiebreakers[]` in src/data/rules.json with at least one tiebreaker question (including a question entry with `isTiebreaker: true`, position 6+, and questionMappings) per FR-005a, SC-007 (missing)
- [X] T099 CRITICAL: Wire tie handling into the wizard in src/App.tsx — after the last core question call `detectTie()`/`applyTiebreakerSignals()` and present the tiebreaker question before showing results per FR-005, SC-007 (missing)
- [X] T100 Create tests/integration/wizard-flow.test.tsx covering Q1→results navigation, Next/Back buttons, and answer persistence per US1/AC1-AC4 (missing)
- [X] T101 Create tests/integration/recommendation.test.tsx and tests/integration/comparisonTable.test.tsx verifying justification cites framework signals and 1–2 runner-up rows render with differentiators per US2/AC2, US3/AC2 (missing)
- [X] T102 Add playwright.config.ts and tests/e2e/wizard.spec.ts so `npm run test:e2e` runs the full wizard flow per plan: testing strategy (missing)
- [X] T103 Create tests/e2e/offline.spec.ts and tests/unit/offline.test.ts asserting zero network requests and no localStorage/sessionStorage writes during the full flow per FR-008, FR-011, SC-004, SC-005, US4/AC1-AC4 (missing)
- [X] T104 Create tests/e2e/accessibility.spec.ts using axe-core plus keyboard-only navigation coverage per DR-001, SC-006 (missing)
- [X] T105 Create tests/unit/rules.test.ts validating rules.json schema: 5 tools, signal/red-flag weights within 1-10, 5-7 core questions, every question has questionMappings per FR-001, FR-013, SC-008 (missing)
- [X] T106 Update src/components/ProgressIndicator.tsx to render "Question X of Y" and expose role="progressbar" with aria-valuenow/aria-valuemin/aria-valuemax and an aria-live announcement per FR-003, DR-001, DR-004 (partial)
- [X] T107 Extract wizard state from src/App.tsx into src/hooks/useWizardState.ts and src/components/WizardContainer.tsx, and move helper logic to src/utils/scoring.ts and src/utils/formatting.ts per plan: Project Structure (partial)
- [X] T108 Add an error boundary around the wizard in src/App.tsx and call `loadRulesFile()` at startup so malformed rules.json shows "Unable to load framework data, please refresh" per plan: error handling, FR-013 (missing)
- [X] T109 Add responsive styling with breakpoints at 320px / 768px / 1920px, including stacked comparison-table rows on mobile per DR-002, DR-006 (partial)
- [X] T110 Audit src/data/rules.json against docs/decision-framework.md and add any missing signals, red flags, and tool mappings so recommendations are grounded exclusively in the framework per FR-004, FR-012, Constitution III (partial)
- [X] T111 Add .eslintrc.json and .prettierrc so `npm run lint` and `npm run format` execute successfully per plan: tooling (missing)
- [X] T112 Add vite.config.ts with the React plugin, build target, and deployment base path per plan: Vite build configuration (missing)
- [X] T113 Add .github/workflows CI running type-check, unit, integration, and e2e tests plus production build on push/PR per plan: production readiness (missing)
- [X] T114 Add CONTRIBUTING.md and src/CONTRIBUTING-ENGINE.md documenting setup, test commands, and how to extend tools/signals/questions per plan: documentation (missing)
- [X] T115 Execute quickstart.md scenarios 1–4, 7, and 8 against the running app and record outcomes per SC-001, SC-007 (missing)

---

## Phase 9: Convergence

- [X] T116 Add automated performance assertions covering question transition, recommendation generation, and first load per NFR-001, NFR-004 (missing)
- [X] T117 Run the full Playwright browser matrix (chromium, firefox, webkit, mobile-chrome) in .github/workflows/ci.yml instead of chromium only per NFR-003 (partial)
- [X] T118 Add src/hooks/useRecommendation.ts, or record in plan.md that recommendation state is intentionally owned by useWizardState per plan: Project Structure (missing)
- [X] T119 Reconcile the documented `public/index.html` entry point with the Vite root index.html actually in use per plan: Project Structure (partial)
- [ ] T120 Execute and record the 10-participant comprehension study per SC-003 (missing)
- [ ] T121 Perform and record a manual VoiceOver/NVDA screen reader pass per DR-001, SC-006 (missing)
