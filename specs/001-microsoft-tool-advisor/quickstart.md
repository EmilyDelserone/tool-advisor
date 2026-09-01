# Quickstart & Validation Guide: Microsoft Tool Advisor

**Date**: 2025-09-01

## Overview

This guide provides runnable validation scenarios to prove the Microsoft Tool Advisor feature works end-to-end. It covers prerequisites, setup, and test scenarios that verify core functionality.

## Prerequisites

- Node.js 18+ and npm
- Git
- Browser (Chrome, Firefox, Safari, or Edge)
- Command-line terminal

## Setup

### 1. Clone Repository and Install Dependencies

```bash
git clone https://github.com/EmilyDelserone/tool-advisor.git
cd tool-advisor
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173/ in your browser.

### 3. Verify App Loads

- [ ] Page loads without errors (check browser console for errors)
- [ ] "Microsoft Tool Advisor" title is visible
- [ ] First question is displayed
- [ ] Progress indicator shows "Question 1 of N"

## Scenario 1: Happy Path - Power Automate Recommendation

**Objective**: Verify the wizard produces the correct recommendation for a Power Automate use case.

**Setup**: Start at http://localhost:5173/

**Steps**:

1. **Question 1**: "Does your solution need a UI?"
   - [ ] Answer: "No" (backend automation only)

2. **Question 2**: "Is this an internal business process?"
   - [ ] Answer: "Yes"

3. **Question 3**: "Does this require custom code?"
   - [ ] Answer: "No" (standard connectors are sufficient)

4. **Question 4**: "How many connectors do you need?"
   - [ ] Answer: "Standard connectors" or "Up to 2 premium"

5. **Question 5**: "What are the compliance/governance needs?"
   - [ ] Answer: "Moderate" or "Managed via DLP policies"

6. Continue through remaining questions (if any) selecting options consistent with Power Automate use case.

7. **Verify Recommendation**:
   - [ ] Primary recommendation is "Power Automate"
   - [ ] Justification text includes phrases like "backend automation" and "standard connectors"
   - [ ] Justification cites specific signals from the decision framework
   - [ ] Comparison table shows 1-2 runner-up tools (e.g., Power Automate → Logic Apps, Azure Functions)
   - [ ] Runner-up differentiation text explains why Power Automate is better (e.g., "...simpler to set up than Logic Apps for internal processes")

**Expected Outcome**:
```
PRIMARY RECOMMENDATION:
Power Automate

Why? This recommendation aligns with your need for backend automation 
without a UI, and your process can be handled by standard connectors. 
Power Automate is the fastest to stand up for internal business processes.

ALTERNATIVES CONSIDERED:
┌─────────────────────────────────────────────────────────────────┐
│ Tool              │ Primary Use Case     │ Why Not This One?   │
│ Azure Logic Apps  │ Enterprise integration│ Requires IT ownership│
│ Azure Functions   │ Custom algorithms    │ Overkill without    │
│                   │                      │ custom logic need   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scenario 2: UI-Required Case - Power Apps Recommendation

**Objective**: Verify the wizard produces Power Apps recommendation when user interaction is required.

**Setup**: Reload page (or use "Start Over" button)

**Steps**:

1. **Question 1**: "Does your solution need a UI?"
   - [ ] Answer: "Yes" (users interact directly)

2. **Remaining Questions**: Answer consistently with Power Apps scenario:
   - Internal employees/field workers using the app
   - Structured data entry/interaction needed
   - Citizen developer or business analyst building it

3. **Verify Recommendation**:
   - [ ] Primary recommendation is "Power Apps"
   - [ ] Justification mentions "user-facing interface" and internal audience
   - [ ] Runner-ups show Copilot Studio (natural language) or Copilot Studio (guided UI)

**Expected Outcome**: Power Apps is recommended as primary tool.

---

## Scenario 3: Custom Logic Case - Azure Functions Recommendation

**Objective**: Verify the wizard produces Azure Functions recommendation for custom code scenarios.

**Setup**: Reload page

**Steps**:

1. **Question 1**: "Does your solution need a UI?"
   - [ ] Answer: Based on scenario (UI or backend)

2. **Relevant Questions**: Answer consistently with Azure Functions scenario:
   - Requires custom code or complex algorithms
   - Pro-developer ownership (not citizen developer)
   - Part of broader Azure integration strategy

3. **Verify Recommendation**:
   - [ ] Primary recommendation is "Azure Functions"
   - [ ] Justification emphasizes "custom logic" and "pro-developer"

**Expected Outcome**: Azure Functions is recommended.

---

## Scenario 4: Natural Language Interaction - Copilot Studio Recommendation

**Objective**: Verify the wizard produces Copilot Studio recommendation for conversational scenarios.

**Setup**: Reload page

**Steps**:

1. **Answer Questions** consistent with Copilot Studio:
   - Needs natural language interaction (FAQ, self-service, troubleshooting)
   - Calls Power Automate flows or actions
   - Data sources: Dataverse, SharePoint, Graph

2. **Verify Recommendation**:
   - [ ] Primary recommendation is "Copilot Studio"
   - [ ] Justification mentions "natural language" and "self-service"

**Expected Outcome**: Copilot Studio is recommended.

---

## Scenario 5: Offline Functionality

**Objective**: Verify the app works offline (no network calls required).

**Setup**: 
1. Open DevTools (F12)
2. Go to Network tab
3. Throttle to "Offline" mode (or use "No Internet" in Chrome DevTools)
4. Start the wizard (or reload if already open)

**Steps**:

1. **Use Wizard Offline**:
   - [ ] All questions load without errors
   - [ ] Answer questions and navigate through wizard
   - [ ] Recommendation is generated and displayed

2. **Verify Network Activity**:
   - [ ] No network requests in Network tab (besides initial page load/assets)
   - [ ] Console shows no failed API calls or network errors
   - [ ] Recommendation logic executes entirely client-side

**Expected Outcome**: Wizard functions identically offline and online; zero external API calls.

---

## Scenario 6: Accessibility - Keyboard Navigation

**Objective**: Verify WCAG 2.1 AA accessibility compliance for keyboard users.

**Setup**: Open wizard at http://localhost:5173/

**Steps**:

1. **Navigation**:
   - [ ] Press Tab to navigate through form elements (questions, options, buttons)
   - [ ] All interactive elements are reachable via Tab key
   - [ ] Focus is visible (outline or color change)

2. **Question Interaction**:
   - [ ] Can select radio buttons or checkboxes with arrow keys
   - [ ] Can submit answer with Enter key
   - [ ] Can reach "Next" button with Tab and activate with Enter

3. **Screen Reader Test** (use NVDA, JAWS, or VoiceOver):
   - [ ] Questions are announced clearly
   - [ ] Options are announced as radio buttons or checkboxes
   - [ ] Progress indicator is announced
   - [ ] Recommendation and comparison table are readable via screen reader

**Expected Outcome**: All content accessible via keyboard and screen reader.

---

## Scenario 7: Tiebreaker (if implemented)

**Objective**: Verify tiebreaker question appears when top tools are equally scored.

**Setup**: Reload page

**Steps**:

1. **Answer Questions** to trigger a tie scenario:
   - Ask developer to identify which question combinations result in tied scores
   - Answer those questions to reach the tie condition

2. **Verify Tiebreaker**:
   - [ ] Tiebreaker question appears after final core question
   - [ ] Progress indicator reflects additional question
   - [ ] Tiebreaker question is clearly labeled or explained
   - [ ] After tiebreaker answer, a single primary recommendation is generated (not tied)

**Expected Outcome**: Tie is resolved; user sees single, clear recommendation.

---

## Scenario 8: Comparison Table Structure

**Objective**: Verify comparison table is readable and helpful.

**Setup**: Complete wizard to see recommendation (Scenario 1, 2, or 3)

**Steps**:

1. **Table Visibility**:
   - [ ] Comparison table appears below primary recommendation
   - [ ] Table is clearly labeled "Alternatives Considered" or similar
   - [ ] Table has 1-2 rows (runner-up tools)

2. **Table Content**:
   - [ ] Column headers: Tool Name, Primary Use Case, Why Not This One?
   - [ ] Each row has tool name, description, and differentiation text
   - [ ] Differentiation text cites specific signals from decision framework
   - [ ] Text is business-friendly (not technical jargon)

3. **Responsive Layout**:
   - [ ] On desktop: Table is clearly structured
   - [ ] On tablet: Table remains readable (may adapt column widths)
   - [ ] On mobile: Table is readable (may stack columns or scroll horizontally)

**Expected Outcome**: Table is clear, scannable, and supports understanding the recommendation.

---

## Unit Test Execution

**Objective**: Verify recommendation engine logic via unit tests.

**Setup**: Terminal at project root

**Steps**:

```bash
npm run test:unit
```

**Verify**:
- [ ] All tests pass (0 failures)
- [ ] Tests cover recommendation engine (signal scoring, red flags, tool ranking)
- [ ] Tests cover tiebreaker logic (if implemented)
- [ ] Tests verify rules.json is loaded correctly
- [ ] Test output shows >80% coverage for engine functions

**Expected Output**:
```
 ✓ src/engine/recommendationEngine.test.ts (12 tests)
 ✓ src/engine/scoring.test.ts (8 tests)
 ✓ src/engine/rules.test.ts (5 tests)

Test Files  3 passed (3)
Tests     25 passed (25)
Coverage  Engine: 92%, Scoring: 88%, Rules: 95%
```

---

## Integration Test Execution

**Objective**: Verify React components and engine work together.

**Setup**: Terminal at project root

**Steps**:

```bash
npm run test:integration
```

**Verify**:
- [ ] All tests pass
- [ ] Tests cover wizard flow (Q1 → Q2 → ... → Recommendation)
- [ ] Tests verify state updates (answer saved, progress updated)
- [ ] Tests verify recommendation display

**Expected Output**:
```
 ✓ src/components/WizardContainer.test.tsx (6 tests)
 ✓ src/components/RecommendationResult.test.tsx (4 tests)

Test Files  2 passed (2)
Tests     10 passed (10)
```

---

## E2E Test Execution

**Objective**: Verify full user journey end-to-end via browser automation.

**Setup**: Terminal at project root

**Steps**:

```bash
npm run test:e2e
```

**Verify**:
- [ ] All tests pass
- [ ] Tests cover happy path (Q1-Q7 → Recommendation)
- [ ] Tests cover offline scenario
- [ ] Tests verify accessibility (keyboard, focus)

**Expected Output**:
```
 ✓ tests/e2e/wizard.spec.ts (3 tests)

Test Files  1 passed (1)
Tests      3 passed (3)
Duration   15.2s
```

---

## Build for Production

**Objective**: Verify production build succeeds and is deployable.

**Setup**: Terminal at project root

**Steps**:

```bash
npm run build
```

**Verify**:
- [ ] Build completes without errors
- [ ] Output bundle size is reasonable (<500KB for core JS)
- [ ] All assets are optimized (minified, tree-shaken)

**Preview Production Build**:

```bash
npm run preview
```

- [ ] Open http://localhost:4173/ (preview server)
- [ ] Wizard loads and works identically to dev version
- [ ] No console errors

**Expected Output**:
```
✓ 123 modules transformed
dist/index.html                    0.45 kB
dist/assets/app-a1b2c3d4.js       125.34 kB
dist/assets/style-e5f6g7h8.css     12.56 kB

Build complete in 4.2s
```

---

## Validation Checklist

Use this checklist to track validation progress:

- [ ] Scenario 1: Power Automate Recommendation
- [ ] Scenario 2: Power Apps Recommendation
- [ ] Scenario 3: Azure Functions Recommendation
- [ ] Scenario 4: Copilot Studio Recommendation
- [ ] Scenario 5: Offline Functionality
- [ ] Scenario 6: Keyboard Accessibility
- [ ] Scenario 7: Tiebreaker (if applicable)
- [ ] Scenario 8: Comparison Table Structure
- [ ] Unit Tests Pass
- [ ] Integration Tests Pass
- [ ] E2E Tests Pass
- [ ] Production Build Succeeds

**Readiness Criteria**: All checkboxes must be ticked before merging to main.

---

## Troubleshooting

### App Won't Start
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

### Recommendation Doesn't Match Expectations
- Check browser console for errors
- Verify rules.json is loaded: `window.__RULES__` in console (if exposed)
- Check that question answers map to correct signals in QuestionMapping

### Tests Fail
- Clear test cache: `npm run test -- --clearCache`
- Check that engine functions are pure (no side effects)
- Verify rules.json test fixtures match production schema

### Offline Mode Not Working
- Ensure DevTools Network tab is set to "Offline" (not just throttled)
- Check that assets are properly cached (reload page while offline)
- Verify no external CDN dependencies in code

---

## Manual Testing Tips

1. **Use Browser DevTools**:
   - Network tab: verify zero external requests
   - Console: check for errors or warnings
   - Accessibility Inspector: audit for WCAG compliance
   - Performance tab: check if rendering is smooth

2. **Test Multiple Browsers**:
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari (if on macOS)
   - Mobile browser (iPhone, Android via Chrome)

3. **Test Multiple Screen Sizes**:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

4. **Test Scenarios**:
   - Fast decisions (click through quickly)
   - Slow decisions (wait before answering)
   - Go back and change answers (restart wizard)
   - Try all tool paths (one scenario per session)

---

## Acceptance Criteria

The feature is production-ready when:

1. ✓ All 8 scenarios pass manually
2. ✓ All unit, integration, and E2E tests pass
3. ✓ Zero external network requests (offline-capable)
4. ✓ WCAG 2.1 AA accessibility audit passes
5. ✓ Responsive design works on desktop, tablet, mobile
6. ✓ Production build succeeds with reasonable size
7. ✓ Recommendations are always grounded in decision framework signals
8. ✓ Comparison table clearly differentiates runner-ups
9. ✓ Progress indicator is always visible and accurate
10. ✓ No framework or platform errors in any browser
