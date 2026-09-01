# UI Component Contract: Microsoft Tool Advisor

**Date**: 2025-09-01

This document defines the public interfaces and contracts for the Microsoft Tool Advisor React components.

## App Component

The root application component.

### Props

```typescript
interface AppProps {
  // No props - App is the entry point
}
```

### Exports

```typescript
export default App: React.FC<AppProps>
```

### Behavior

- Renders the main wizard flow or recommendation result
- Manages overall application state
- Handles window-level error boundaries

### Usage

```tsx
import App from './components/App';

<App />
```

---

## WizardContainer Component

Manages wizard state and orchestrates the question flow.

### Props

```typescript
interface WizardContainerProps {
  rulesFile: RulesFile;              // Framework definitions (loaded at app startup)
  onRecommendationGenerated?: (rec: Recommendation) => void; // Optional callback when recommendation is ready
}
```

### State

Maintains:
- Current question index
- List of answers (Question → Answer)
- Whether tiebreaker is needed
- Generated recommendation

### Exports

```typescript
export const WizardContainer: React.FC<WizardContainerProps>
```

### Behavior

1. Displays current question via `QuestionCard`
2. On question submission, advances to next question
3. After final question, calls recommendation engine
4. If tie detected, shows tiebreaker question
5. After tiebreaker (or if no tie), displays `RecommendationResult`
6. Allows restart (reset state and return to Q1)

### Public Methods

None (state-based component; use React callback props for state updates).

---

## QuestionCard Component

Displays a single question with options.

### Props

```typescript
interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: Answer) => void;  // Called when user submits answer
  isSubmitting?: boolean;                // Optional: show loading state
}
```

### Exports

```typescript
export const QuestionCard: React.FC<QuestionCardProps>
```

### Behavior

- Renders question text
- Renders options (yes/no, radio, checkbox depending on question type)
- Renders submit button
- Calls `onAnswer` with selected value when submit is clicked
- Disables form during submit if `isSubmitting` is true

### Accessibility

- Form inputs are accessible (labels, ARIA)
- Submit button is keyboard accessible
- Screen reader announces question and options

---

## ProgressIndicator Component

Shows wizard progress.

### Props

```typescript
interface ProgressIndicatorProps {
  currentIndex: number;        // 0-based index of current question
  totalQuestions: number;      // Total questions in this session (5-7 or 5-8 with tiebreaker)
  showTiebreaker?: boolean;    // If true, indicate tiebreaker is active
}
```

### Exports

```typescript
export const ProgressIndicator: React.FC<ProgressIndicatorProps>
```

### Behavior

- Displays "Question X of Y" or "Tiebreaker Question"
- Shows visual progress bar (percent complete)
- Updates reactively as `currentIndex` and `totalQuestions` change

### Accessibility

- ARIA live region announces progress updates
- Percentage is announced (e.g., "50% complete")

---

## RecommendationResult Component

Displays the primary recommendation and comparison table.

### Props

```typescript
interface RecommendationResultProps {
  recommendation: Recommendation;
  onRestart: () => void;  // Called when user clicks "Start Over"
}
```

### Exports

```typescript
export const RecommendationResult: React.FC<RecommendationResultProps>
```

### Behavior

1. Displays primary tool name prominently
2. Displays justification text (cites specific signals)
3. Renders `ComparisonTable` with runner-up tools
4. Renders "Start Over" button that calls `onRestart`
5. Displays metadata (questions answered, generation time)

### Accessibility

- Recommendation is a landmark section (`<section aria-label="Recommendation">`)
- Comparison table uses semantic HTML (`<table>`)
- "Start Over" button is keyboard accessible

---

## ComparisonTable Component

Displays 1-2 runner-up tools in a comparison table.

### Props

```typescript
interface ComparisonTableProps {
  runnerUps: RunnerUpTool[];  // 1-2 tools
}
```

### Exports

```typescript
export const ComparisonTable: React.FC<ComparisonTableProps>
```

### Behavior

- Renders table with columns: Tool Name, Primary Use Case, Why Not This One?
- One row per runner-up tool
- Responsive layout (adapts to screen size)
- Differentiation text clearly explains tradeoff

### Accessibility

- Uses `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Column headers are `<th>` with `scope="col"`
- Screen reader announces table structure

---

## Contracts Summary

| Component | Input Contract | Output Contract | State Management |
|-----------|---|---|---|
| App | None | Renders WizardContainer or RecommendationResult | Global error boundary |
| WizardContainer | rulesFile | QuestionCard, ProgressIndicator, RecommendationResult | Wizard state (answers, index) |
| QuestionCard | question, onAnswer | None | Form input state |
| ProgressIndicator | currentIndex, totalQuestions | None | Read-only display |
| RecommendationResult | recommendation, onRestart | None | Display-only |
| ComparisonTable | runnerUps | None | Display-only |

All components are:
- **Functional** (React.FC)
- **Pure** (no side effects, same props → same output)
- **Testable** (no external dependencies)
- **Accessible** (WCAG 2.1 AA)

---

## Error Boundaries

**Global Error Boundary** (App-level):
- Catches errors from any child component
- Displays user-friendly error message
- Offers "Try Again" button to refresh page

**Optional Local Boundaries** (feature-level):
- WizardContainer: catches recommendation engine errors
- RecommendationResult: catches rendering errors

---

## Testing Contracts

All components MUST be testable independently:

1. **QuestionCard**: Test with mock question; verify form renders and calls `onAnswer`
2. **ProgressIndicator**: Test with different indices; verify text updates
3. **ComparisonTable**: Test with mock runner-ups; verify table structure
4. **RecommendationResult**: Test with mock recommendation; verify display and "Start Over" callback
5. **WizardContainer**: Test full flow from Q1 to recommendation

See `tests/integration/` for example test cases.
