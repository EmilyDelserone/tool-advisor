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

### Edge Cases

- What happens if a user goes back/refreshes the browser mid-way through the questions? (Assume wizard restarts from question 1 on page reload — no session persistence required)
- What if the scoring after 5-7 core questions results in two or more tools tied for the top recommendation? (Ask a tiebreaker question to differentiate; the tiebreaker question is defined in `rules.json` and targets the signals that distinguish the tied tools)
- What if a user answers the tiebreaker question but still has a tie? (The algorithm selects the tied tool with the highest overall signal weight; the tiebreaker is deterministic and defined in `rules.json`)
- What if the decision framework is updated while the tool is open in a browser? (Changes take effect on next page load; no real-time sync required; `rules.json` must be manually updated to reflect framework changes)
- What if a user's answers don't fit the tool categories well? (Still provide a best-fit recommendation based on scoring; add a caveat in the reasoning explaining the partial match)

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
- **FR-010**: System MUST allow users to restart the wizard at any time to get a new recommendation
- **FR-011**: System MUST work without network connectivity (offline-capable)
- **FR-012**: Recommendations MUST be grounded exclusively in the decision framework; no recommendations outside the five tools (Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, Azure Functions) are permitted
- **FR-013**: System MUST load decision framework data from `src/data/rules.json` at application startup; this file is the runtime source of truth for tool definitions, signals, red flags, and scoring weights

### Design & Usability Requirements

- **DR-001**: The wizard interface MUST be accessible (WCAG 2.1 AA minimum) including keyboard navigation and screen reader support
- **DR-002**: The UI MUST be responsive and function smoothly on desktop, tablet, and mobile devices
- **DR-003**: Each question MUST be presented with clear, non-technical phrasing appropriate for business stakeholders
- **DR-004**: The progress indicator MUST be clearly visible and updated after each question submission
- **DR-005**: The primary recommendation MUST be visually emphasized (color, size, typography) to distinguish it from supporting information
- **DR-006**: The comparison table MUST be easy to scan and compare alternatives

## Key Entities

- **Question**: A single query presented to the user, derived from decision framework signals/red-flags
- **Answer**: A user's response to a question, stored in session memory during the wizard
- **Signal**: A best-fit indicator from the decision framework that supports a tool recommendation (has a weight in `rules.json`)
- **RedFlag**: A warning indicator from the decision framework that argues against a tool recommendation (has a weight in `rules.json`)
- **Recommendation**: The selected tool along with its justification reasoning and supporting signals
- **RunnerUpTool**: An alternative tool shown in the comparison table with key differentiators
- **TiebreakerQuestion**: A question asked when the top-scoring tool is tied with another tool, to provide clear differentiation
- **RulesFile**: `src/data/rules.json` containing tool definitions, signals, red flags, weights, and tiebreaker logic

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full wizard (5-7 core questions + optional tiebreaker → recommendation → comparison table) in under 3 minutes
- **SC-002**: 100% of recommendations are grounded in the decision framework (every recommendation cites specific framework signals from `rules.json`)
- **SC-003**: 90% of business stakeholders (non-technical users) can understand the recommendation reason without additional explanation
- **SC-004**: Zero external network requests or API calls during the full user workflow (verified via network inspection)
- **SC-005**: Tool functions identically with and without network connectivity
- **SC-006**: Accessibility audit (WCAG 2.1 AA) passes with zero critical/major issues
- **SC-007**: When tied tools are detected after core questions, a tiebreaker question is presented and results in a clear single-tool recommendation
- **SC-008**: `rules.json` is loaded successfully and all tool definitions, signals, red flags, and weights are accessible to the recommendation algorithm on startup

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
