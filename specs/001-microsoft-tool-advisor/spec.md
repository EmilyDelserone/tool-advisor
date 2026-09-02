# Feature Specification: Microsoft Tool Advisor

**Feature Branch**: `001-microsoft-tool-advisor`

**Created**: 2025-09-01

**Status**: Draft

**Input**: User description: "Build 'Microsoft Tool Advisor,' a wizard that takes a business need and recommends the right Microsoft tool (Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, or Azure Functions). The user answers a short series of guided questions one at a time, with a progress indicator, then sees a primary recommendation with a plain-language reason, plus a comparison table of 1-2 runner-up tools. Base the recommendation logic on the decision framework in docs/decision-framework.md. No backend, no database, no external API calls needed for the core feature."

## Clarifications

### Session 2025-09-01

- Q: How many questions should the wizard ask users? → A: 5-7 questions
- Q: How should the recommendation algorithm handle ties when multiple tools match equally well? → A: Ask a tiebreaker question to differentiate
- Q: How should the decision framework data be represented in the tool? → A: Manually curate a separate "rules.json" file based on the decision framework, maintained in sync

### Session 2026-09-02

- Q: How should the fit percentage be normalised so it cannot contradict the ranking? → A: Divide every tool's net score by the highest signal score in the same run. A shared denominator keeps percentage order identical to net score order, so a runner-up can never display a higher percentage than the winner
- Q: What should the expandable runner-up row reveal, and where does that content come from? → A: The specific framework red flags that reduced that tool's fit score, with their point cost, taken from the engine's score data rather than recomputed in the UI
- Q: When a user edits an earlier answer, which later answers should be discarded? → A: Only answers that depend on superseded scoring. The core questions are independent of one another so their answers are preserved; the tiebreaker answer is discarded because the tie that prompted it may no longer exist

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discovery Through Guided Questions (Priority: P1)

A business analyst needs to identify which Microsoft tool is best for a specific automation or application need. They open the Tool Advisor wizard and answer a series of simple, guided questions about their business need — one question at a time with a progress indicator showing how far through the interview they are. Each question helps narrow down the tool selection.

**Why this priority**: This is the core interaction loop and primary value of the tool. Without this, the recommendation system has nothing to work with.

**Independent Test**: Can be fully tested by launching the wizard, answering a complete series of questions, and verifying that the tool correctly advances through questions and displays a progress indicator showing completion percentage or step counts.

**Acceptance Scenarios**:

1. **Given** the wizard is open on the first question, **When** the user answers and submits the response, **Then** the next question displays and the progress indicator updates to show forward progress
2. **Given** the user is on question N of a series, **When** they submit an answer, **Then** they see question N+1 (or finish if it's the last question)
3. **Given** the user is viewing a question, **When** they review the progress indicator, **Then** it clearly shows how many questions remain (e.g., "Question 2 of 5")
4. **Given** the wizard has displayed all questions, **When** the user completes the final question, **Then** the results view is displayed
5. **Given** the user is on a later question, **When** they select an earlier step in the progress indicator, **Then** that question is shown again with their previous answer still selected

---

### User Story 2 - Primary Tool Recommendation with Justification (Priority: P1)

After answering all questions, the user receives a clear, primary tool recommendation with a plain-language explanation of why that tool is the best fit. The reasoning directly connects to the signals and red flags from the decision framework, not just a generic description.

**Why this priority**: The recommendation and its reasoning are the core deliverable. Without clear justification grounded in the framework, users won't trust the recommendation.

**Independent Test**: Can be fully tested by completing the wizard with different answer sets and verifying that (1) a single primary recommendation is shown, (2) the justification references specific signals/red flags from docs/decision-framework.md, and (3) the reasoning is readable and actionable.

**Acceptance Scenarios**:

1. **Given** the user has completed all questions, **When** the results page loads, **Then** exactly one tool is displayed as the primary recommendation
2. **Given** a primary recommendation is displayed, **When** the user reads the justification text, **Then** it includes specific reasons from the decision framework (e.g., "This recommendation aligns with your need for X and avoids the red flag of Y")
3. **Given** the user sees a recommendation, **When** they review the explanation, **Then** it uses business-friendly language, not technical jargon
4. **Given** the results are displayed, **When** the user reviews the primary tool section, **Then** it is visually distinct (color, size, emphasis) from secondary information
5. **Given** the results are displayed, **When** the user looks at the recommended tool, **Then** a 0-100% fit score is shown as a labelled percentage bar alongside it

---

### User Story 3 - Comparison Table with Runner-Up Tools (Priority: P1)

Below the primary recommendation, the user sees a comparison table showing 1-2 runner-up tools. The table helps users understand why the primary recommendation was chosen and when the alternatives might be appropriate instead. Each row in the table shows the tool and key differentiators grounded in the decision framework.

**Why this priority**: The comparison table provides context and builds confidence in the recommendation by showing that alternatives were considered.

**Independent Test**: Can be fully tested by verifying that (1) a comparison table appears below the primary recommendation, (2) it contains 1-2 runner-up tools, (3) each tool row includes decision framework signals/red flags, and (4) the table clearly communicates why the primary was chosen over the alternatives.

**Acceptance Scenarios**:

1. **Given** the results page displays, **When** the user scrolls below the primary recommendation, **Then** a comparison table showing 1-2 runner-up tools is visible
2. **Given** the comparison table is displayed, **When** the user reviews each row, **Then** it includes the runner-up tool name, primary use case, and key differentiator from the primary recommendation
3. **Given** the runner-up tools are shown, **When** the user compares them to the primary, **Then** they understand why the primary is the better fit for their specific answers
4. **Given** the results view, **When** the user sees the comparison table, **Then** it is clearly organized and easier to scan than the full decision framework
5. **Given** each runner-up row, **When** the user reviews it, **Then** its fit score is shown as a percentage bar that never exceeds the recommended tool's percentage
6. **Given** a runner-up row is collapsed by default, **When** the user activates its disclosure by click, tap, or keyboard, **Then** the specific framework red flags that lowered that tool's fit score are listed in plain language with their point cost

---

### User Story 4 - Client-Side Completeness (Priority: P1)

The entire tool advisor experience — questions, decision logic, recommendation, and comparison — works entirely in the user's browser. No server calls, no data storage, no network dependencies are required for the core feature. Users can use the tool offline and with full confidence in privacy.

**Why this priority**: This is a constitutional requirement (established in project constitution) and a core technical constraint. Violating this breaks fundamental project governance.

**Independent Test**: Can be fully tested by opening the tool in a browser with network offline, completing the full workflow, and verifying no errors occur and the recommendation is generated correctly.

**Acceptance Scenarios**:

1. **Given** the browser has no network connectivity, **When** the user opens the tool, **Then** it loads and functions normally
2. **Given** the tool is running offline, **When** the user completes the question flow, **Then** a recommendation is generated locally without network requests
3. **Given** the user completes the tool, **When** they review browser dev tools for network activity, **Then** no external API calls, database connections, or analytics requests are present
4. **Given** the wizard completes, **When** the user closes the browser tab, **Then** no user data has been stored server-side or sent externally

---

### User Story 5 - Revisiting and Changing an Answer (Priority: P2)

Part-way through the wizard, or after seeing the recommendation, the user realises an earlier answer was wrong or wants to explore a different scenario. They return to that question directly — via Back, the step list, or a "Change an answer" action on the results view — change it, and see the recommendation and every fit score recalculated, without answering the whole interview again.

**Why this priority**: The interview is short but not trivial; forcing a full restart to correct one answer discourages exploration and makes the tool feel brittle. It is P2 because the core recommendation loop (US1-US4) delivers value without it.

**Independent Test**: Can be fully tested by completing the wizard, returning to an earlier question, changing that answer, and verifying that the remaining answers are retained, the recommendation is recomputed, and the fit percentages match the new answer set.

**Acceptance Scenarios**:

1. **Given** the user has answered several questions, **When** they select an earlier step in the progress indicator, **Then** that question is displayed with its previous answer selected and no answers are lost
2. **Given** the user is viewing the results, **When** they choose "Change an answer", **Then** the wizard reopens with every previous answer preserved
3. **Given** the user changes an earlier answer, **When** they return to the results, **Then** the recommendation, runner-ups, and all fit percentages reflect the edited answer set
4. **Given** a tiebreaker was previously asked, **When** the user changes a core answer, **Then** the tiebreaker answer is discarded and the tiebreaker is only asked again if the new answers still tie
5. **Given** the user is on question 2, **When** they look at the step list, **Then** steps beyond the furthest question they have reached are unavailable

---

### Edge Cases

- What happens if a user goes back/refreshes the browser mid-way through the questions? (Assume wizard restarts from question 1 on page reload — no session persistence required)- What if the scoring after 5-7 core questions results in two or more tools tied for the top recommendation? (Ask a tiebreaker question to differentiate; the tiebreaker question is defined in `rules.json` and targets the signals that distinguish the tied tools)
- What if a user answers the tiebreaker question but still has a tie? (The algorithm selects the tied tool with the highest overall signal weight; the tiebreaker is deterministic and defined in `rules.json`)
- What if the decision framework is updated while the tool is open in a browser? (Changes take effect on next page load; no real-time sync required; `rules.json` must be manually updated to reflect framework changes)
- What if a user's answers don't fit the tool categories well? (Still provide a best-fit recommendation based on scoring; add a caveat in the reasoning explaining the partial match)
- What if a user changes an earlier answer after a tiebreaker has already been answered? (The tiebreaker answer is discarded because the tie that prompted it may no longer exist; independent core answers are preserved and the wizard re-evaluates)
- What if no tool scores above zero after red flag penalties? (Every fit percentage is 0% and the justification carries the partial-match caveat; a recommendation is still produced)
- What if two tools tie and therefore share a fit percentage? (Identical percentages are shown; the tiebreaker question, not the percentage, resolves which tool wins)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present exactly 5-7 core questions to the user, one at a time in a sequential wizard interface
- **FR-002**: System MUST track user answers to all questions during the wizard session in browser memory
- **FR-003**: System MUST display a progress indicator showing question count and current position (e.g., "Question 2 of 5")
- **FR-004**: System MUST evaluate the user's answers against the decision framework criteria using a weighted scoring algorithm defined in `src/data/rules.json`
- **FR-005**: System MUST calculate a primary recommendation by matching user answers to tool signals and red flags using deterministic scoring; if the top scoring tool ties with one or more other tools, the system MUST ask a tiebreaker question
- **FR-005a**: System MUST include a tiebreaker question capability in the recommendation logic; if a tie is detected after core questions, the system presents a tiebreaker question to differentiate between tied tools
- **FR-006**: System MUST display the primary recommendation on a results page with a plain-language justification that cites specific framework signals (from `rules.json`) that matched the user's answers
- **FR-007**: System MUST display a comparison table showing 1-2 runner-up tools with key differentiators (from `rules.json`) based on the decision framework
- **FR-008**: System MUST run entirely client-side (no backend, no external API calls, no database)
- **FR-009**: System MUST provide readable recommendations using business-friendly language, not technical jargon
- **FR-010**: System MUST allow users to restart the wizard at any time to get a new recommendation; restarting clears all stored answers, any tiebreaker answer, and the generated recommendation, and returns the user to question 1
- **FR-011**: System MUST work without network connectivity (offline-capable)
- **FR-012**: Recommendations MUST be grounded exclusively in the decision framework; no recommendations outside the five tools (Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, Azure Functions) are permitted
- **FR-013**: System MUST load decision framework data from `src/data/rules.json` at application startup; this file is the runtime source of truth for tool definitions, signals, red flags, and scoring weights
- **FR-001a**: Questions MUST be presented in ascending `position` order. Core questions occupy positions 1-7; tiebreaker questions occupy positions 8+ and are excluded from the core sequence
- **FR-001b**: Every question MUST be one of two formats: yes/no (implicit `yes` / `no` options) or multiple-choice single-select (explicit `options[]`). Multi-select and free-text answers are out of scope
- **FR-002a**: Answers MUST be held in React component state (browser memory) for the duration of the session. The system MUST NOT write to `localStorage`, `sessionStorage`, cookies, or IndexedDB. A page reload therefore restarts the wizard at question 1
- **FR-004a**: The score for each tool MUST be `netScore = Σ weight(matched signals) − Σ weight(matched red flags)`, where a signal or red flag matches only if the user's answers activated it **and** the tool appears in its `applicableTools` list. Duplicate activations of the same signal or red flag count once. Scores may be negative
- **FR-005b**: A tie MUST be declared when two or more tools share the highest `netScore`. The system MUST then select the first entry in `tiebreakers[]` whose `appliesWhen` list contains every tied tool id and whose question has not yet been answered, and present that question
- **FR-005c**: If tools remain tied after the tiebreaker (or no applicable tiebreaker exists), the system MUST resolve deterministically: highest `signalScore` first, then the order tools appear in `rules.json`. The same answers MUST always produce the same recommendation
- **FR-006a**: The justification MUST cite up to 2 matched signals and up to 1 matched red flag, rendered as 1-3 sentences of no more than 60 words
- **FR-007a**: The comparison table MUST have exactly three columns — Tool, Use case, Why not this one? — with rows ordered by descending `netScore`
- **FR-007b**: Each "Why not this one?" cell MUST cite up to 2 signals the primary tool matched but the runner-up did not, plus up to 2 red flags the runner-up matched. When neither exists, it MUST state the score difference instead
- **FR-014**: If `rules.json` fails schema validation at startup, the system MUST display "Unable to load framework data, please refresh" instead of the wizard. Any other runtime error MUST be caught by an error boundary that offers a "Try again" action. No error path may transmit data off the device
- **FR-015**: There is no minimum confidence threshold — a recommendation is always produced. When the primary tool's `netScore` is 10 or lower, the justification MUST include a caveat that the answers are only a partial match and the alternatives are worth reviewing
- **FR-016**: `rules.json` is bundled into the application at build time. Framework changes take effect only after a redeploy and a page reload; content-hashed asset filenames ensure browsers do not serve a stale bundle. No real-time sync is required
- **FR-017**: Every tool definition in `rules.json` MUST carry a `docsUrl` pointing at that tool's official Microsoft Learn documentation
- **FR-018**: The results view MUST offer a "Learn more" link to the recommended tool's official documentation, and one link per runner-up in the comparison table. Links MUST open in a new tab with `rel="noopener noreferrer"` and MUST name their destination for screen reader users
- **FR-019**: The engine MUST compute a 0-100 fit score for every candidate tool from the signals it matched against the red flags it triggered, and the results view MUST show it as a percentage bar for the recommended tool and each runner-up. The fit score is presentational only — it MUST NOT change which tool wins, and a runner-up MUST never display a higher percentage than the recommended tool
- **FR-020**: Each runner-up row MUST be expandable, collapsed by default, revealing the specific framework red flags that lowered that tool's fit score with their point cost in plain language. The breakdown MUST come from the engine's score data, not be recomputed in the UI, and MUST be operable by click, tap, and keyboard with `aria-expanded` state
- **FR-021**: Users MUST be able to revisit and change any previously answered question without restarting, via the Back control, the step list in the progress indicator, or a "Change an answer" action on the results view. Steps beyond the furthest question reached MUST be unavailable. Editing an answer MUST clear the current recommendation and recompute scores from the edited answer set; answers that depend on superseded scoring — currently the tiebreaker — MUST be discarded, while independent answers are preserved

### Design & Usability Requirements

- **DR-001**: The wizard interface MUST be accessible (WCAG 2.1 AA minimum) including keyboard navigation and screen reader support
- **DR-002**: The UI MUST be responsive across three breakpoints: mobile (≤480px, single column, full-width stacked buttons), tablet (≤768px, reduced padding, comparison table rows stacked with visible field labels), and desktop (>768px, full table layout). Primary action controls (Back, Next, See recommendation, Start over) MUST be at least 44px tall; inline informational affordances such as glossary triggers MUST be at least 24px, the WCAG 2.2 AA target-size minimum
- **DR-003**: Each question MUST be presented with clear, non-technical phrasing appropriate for business stakeholders
- **DR-004**: The progress indicator MUST be clearly visible and update after each question submission. It MUST read "Question X of Y" (or "Tiebreaker question X of Y") alongside a percentage complete, and expose `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax` plus a polite live region
- **DR-005**: The primary recommendation MUST be visually emphasized: tool name as the only `h1` at ~2.5rem, inside a tinted panel (light blue background, blue border, drop shadow) that is visually distinct from the comparison table; body copy at ≥16px with a minimum 4.5:1 contrast ratio
- **DR-006**: The comparison table MUST be easy to scan: three columns, one row per runner-up, and no more than 60 words per cell
- **DR-007**: Interaction copy MUST use these labels: "Back", "Next", "See recommendation" (final question), "Start over" (results), "Try again" (error state)
- **DR-008**: Error states MUST render in the same card layout as the wizard, carry `role="alert"`, and use plain language with no stack traces or technical identifiers
- **DR-009**: Technical terms in question and recommendation copy MUST offer an on-demand plain-English definition with one concrete example. The affordance MUST open on mouse hover, on touch tap, and from the keyboard, and MUST NOT change the user's answer when activated
- **DR-010**: Each tool MUST be accompanied by a distinct icon wherever it is named as a recommendation or runner-up, and in question copy that names a tool. Icons MUST be decorative (`aria-hidden`) with the tool name always present as text. Icons MUST come from an MIT-licensed set — the official Microsoft Power Platform and Azure icon sets are licensed only for "architectural diagrams, training materials, or documentation" and MUST NOT be embedded in this product UI without explicit permission from Microsoft
- **DR-011**: Fit score bars MUST fill from zero to their value over approximately 500ms when the results appear, staggered so the winner and each runner-up do not animate in unison. The announced value MUST remain the final score throughout, and the animation MUST be disabled under `prefers-reduced-motion: reduce`

### Non-Functional Requirements

- **NFR-001**: Question-to-question transitions MUST render in under 100ms on a mid-range laptop; recommendation generation MUST complete in under 100ms
- **NFR-002**: The production bundle MUST stay under 200KB gzipped
- **NFR-003**: The application MUST support the latest two versions of Chrome, Edge, Firefox, and Safari (desktop and mobile). Internet Explorer is out of scope
- **NFR-004**: First load MUST complete within 2 seconds on a broadband connection; after first load the application MUST work with no network at all

## Key Entities

- **Question**: A single query presented to the user, derived from decision framework signals/red-flags
- **Answer**: A user's response to a question, stored in session memory during the wizard
- **Signal**: A best-fit indicator from the decision framework that supports a tool recommendation (has a weight in `rules.json`)
- **RedFlag**: A warning indicator from the decision framework that argues against a tool recommendation (has a weight in `rules.json`)
- **Recommendation**: The selected tool along with its justification reasoning, fit score, and supporting signals
- **RunnerUpTool**: An alternative tool shown in the comparison table with key differentiators, its own fit score, and the red flag breakdown behind that score
- **ToolScore**: The per-tool scoring result — signal score, red flag penalty, net score, and the 0-100 fit score derived from them
- **ScoreContribution**: A single framework signal or red flag with the weight it added to or removed from a tool's score, used to explain a runner-up's percentage
- **WizardStep**: A question's position in the progress indicator, whether it has been answered, and whether it can be jumped to
- **TiebreakerQuestion**: A question asked when the top-scoring tool is tied with another tool, to provide clear differentiation
- **RulesFile**: `src/data/rules.json` containing tool definitions, signals, red flags, weights, and tiebreaker logic

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full wizard (5-7 core questions + optional tiebreaker → recommendation → comparison table) in under 3 minutes. Measured from first question render to results render, on a desktop browser, by an unassisted first-time participant
- **SC-002**: 100% of recommendations are grounded in the decision framework (every recommendation cites specific framework signals from `rules.json`). Verified by automated assertion that justification and every runner-up differentiator contain at least one signal or red flag `text` value
- **SC-003**: 90% of business stakeholders (non-technical users) can understand the recommendation reason without additional explanation. Verified by a moderated review with at least 10 participants who restate the reason in their own words; a restatement matching the cited signals counts as understood
- **SC-004**: Zero external network requests or API calls during the full user workflow. Verified by an automated browser test that records every request and asserts no non-localhost host is contacted
- **SC-005**: Tool functions identically with and without network connectivity. Verified by completing the full flow with the browser context set offline after first load
- **SC-006**: Accessibility audit (WCAG 2.1 AA) passes with zero critical/major issues. Verified by an automated axe-core audit (`wcag2a`, `wcag2aa`, `wcag21aa` rule sets) on both the question and results views, plus a manual keyboard-only pass
- **SC-007**: When tied tools are detected after core questions, a tiebreaker question is presented and results in a clear single-tool recommendation
- **SC-008**: `rules.json` is loaded successfully and all tool definitions, signals, red flags, and weights are accessible to the recommendation algorithm on startup
- **SC-009**: Fit percentages never contradict the ranking — in every answer combination, no runner-up displays a percentage above the recommended tool's. Verified by an automated test asserting percentage order matches net score order
- **SC-010**: A user can correct a single earlier answer and reach an updated recommendation without re-answering the questions they did not change. Verified by an automated test that edits one answer and asserts the remaining answers are retained and the recommendation is recomputed
- **SC-011**: Every runner-up percentage can be explained on demand — expanding a runner-up lists the framework red flags behind its score, and their weights sum to that tool's total penalty. Verified by an automated test comparing the rendered breakdown against the engine's score data

## Traceability

### User stories → functional requirements

| User story | Functional requirements |
|------------|-------------------------|
| US1 Discovery through guided questions | FR-001, FR-001a, FR-001b, FR-002, FR-002a, FR-003, FR-010 |
| US2 Primary recommendation with justification | FR-004, FR-004a, FR-005, FR-005a, FR-005b, FR-005c, FR-006, FR-006a, FR-009, FR-015, FR-019 |
| US3 Comparison table with runner-ups | FR-007, FR-007a, FR-007b, FR-012, FR-017, FR-018, FR-019, FR-020 |
| US4 Client-side completeness | FR-008, FR-011, FR-013, FR-014, FR-016 |
| US5 Revisiting and changing an answer | FR-002a, FR-003, FR-010, FR-021 |

### Success criteria → functional requirements

| Success criterion | Verifies |
|-------------------|----------|
| SC-001 | FR-001, FR-003 |
| SC-002 | FR-006, FR-006a, FR-007b, FR-012 |
| SC-003 | FR-009 |
| SC-004 | FR-008 |
| SC-005 | FR-011, FR-013 |
| SC-006 | DR-001, DR-004, DR-005 |
| SC-007 | FR-005, FR-005a, FR-005b, FR-005c |
| SC-008 | FR-013, FR-014 |
| SC-009 | FR-004a, FR-019 |
| SC-010 | FR-021 |
| SC-011 | FR-020 |

### Edge cases → requirements

| Edge case | Requirement |
|-----------|-------------|
| Refresh mid-wizard restarts at question 1 | FR-002a |
| Tie after core questions | FR-005b |
| Tie persists after tiebreaker | FR-005c |
| Framework updated after deployment | FR-016 |
| Answers only partially match a tool | FR-015 |
| Malformed or unloadable `rules.json` | FR-014 |
| Earlier answer changed after a tiebreaker was answered | FR-021 |
| No tool scores above zero after penalties | FR-015, FR-019 |
| Two tools share a fit percentage | FR-005b, FR-019 |

## Assumptions

- The wizard will ask 5-7 core questions, with a possible 8th tiebreaker question if the top recommendation tool is tied with another tool on scoring (resolved during planning)
- Questions are derived from decision framework signal/red-flag categories and help users identify which signals apply to their scenario
- Recommendation algorithm uses weighted scoring based on framework signals; each signal has a defined weight, and tools are ranked deterministically
- If two or more tools tie after scoring, a tiebreaker question is asked to differentiate (the question and differentiation criteria are design outputs)
- Decision framework data is maintained in a separate `src/data/rules.json` file (or similar) that is manually curated/updated based on `docs/decision-framework.md`; the `rules.json` file is the runtime source of truth for tool definitions, signals, and red flags
- The `rules.json` file structure includes: tool definitions (name, description, primary use case), best-fit signals (list with weights), red flags (list with weights), and tiebreaker question(s) if needed
- The application loads and parses `rules.json` at startup (client-side); framework updates require manual updates to `rules.json` and redeployment (no dynamic loading from markdown)
- Browser local storage or session storage may be used for temporary state during the wizard, but no data persists after the browser session ends
- Mobile and desktop UIs may differ in layout (e.g., question width, button placement) but must deliver identical functional and decision logic
- Users have basic familiarity with Microsoft cloud tools (Power Platform, Azure) or are willing to learn; the tool does not teach tool details, only helps match business needs to tools
- The five tools covered (Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, Azure Functions) represent the complete set for this recommendation scope; other Microsoft services are out of scope
