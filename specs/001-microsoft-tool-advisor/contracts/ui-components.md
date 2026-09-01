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

- Loads and validates `rules.json` at module load via `loadRulesFile()`
- On validation failure, renders "Unable to load framework data, please refresh" instead of the wizard
- Otherwise wraps `WizardContainer` in the global `ErrorBoundary`

### Usage

```tsx
import App from './App';

<App />
```

---

## WizardContainer Component

Renders the wizard using state supplied by the `useWizardState` hook.

### Props

```typescript
interface WizardContainerProps {
  rules: RulesFile; // Validated framework definitions
}
```

### State

All state is owned by `useWizardState(rules)` which returns:

```typescript
{
  currentQuestion: Question | undefined;
  currentIndex: number;        // 0-based; equals core question count while on a tiebreaker
  totalQuestions: number;      // core questions, +1 once a tiebreaker is active
  isTiebreaker: boolean;
  isLastQuestion: boolean;
  canGoBack: boolean;
  selectedValue: string | undefined;
  recommendation: Recommendation | null;
  selectAnswer: (value: string) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
}
```

### Exports

```typescript
export const WizardContainer: React.FC<WizardContainerProps>
```

### Behavior

1. Displays current question via `QuestionCard` and progress via `ProgressIndicator`
2. `selectAnswer` records the choice; `goNext` advances or evaluates
3. After the final core question, `evaluateAnswers()` either returns a recommendation or a tiebreaker question
4. `goBack` returns to the previous question (or leaves the tiebreaker), preserving prior answers
5. When a recommendation exists, renders `RecommendationResult` with `reset` as `onRestart`

### Public Methods

None (state-based component; use the hook's returned callbacks).

---

## QuestionCard Component

Displays a single question with options and wizard navigation.

### Props

```typescript
interface QuestionCardProps {
  question: Question;
  selectedValue?: string;      // Currently selected option id
  isLastQuestion: boolean;     // Switches the submit label to "See recommendation"
  canGoBack: boolean;          // Enables the Back button
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}
```

### Exports

```typescript
export const QuestionCard: React.FC<QuestionCardProps>
```

### Behavior

- Renders question text in a `<legend>` inside a `<fieldset>`
- Renders controlled radio options (explicit `options[]`, or `Yes` / `No` by default)
- Submit button reads "Next", or "See recommendation" on the last question, and is disabled until an option is selected
- "Back" button is disabled when `canGoBack` is false
- Form submission calls `onNext`

### Accessibility

- Form inputs are accessible (label per option, radio group named by question id)
- Buttons are keyboard accessible with visible focus indicators
- Screen reader announces question and options

---

## ErrorBoundary Component

Class component wrapping the wizard.

### Props

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
}
```

### Behavior

- Catches render errors from any descendant
- Renders a `role="alert"` card with a "Try again" button that clears the error state
- Logs to the console only — no telemetry leaves the browser

---

## ProgressIndicator Component

Shows wizard progress.

### Props

```typescript
interface ProgressIndicatorProps {
  currentIndex: number;        // 0-based index of current question
  totalQuestions: number;      // Questions in this session (core, +1 when a tiebreaker is active)
  isTiebreaker?: boolean;      // If true, label reads "Tiebreaker question X of Y"
}
```

### Exports

```typescript
export const ProgressIndicator: React.FC<ProgressIndicatorProps>
```

### Behavior

- Displays "Question X of Y", or "Tiebreaker question X of Y" when `isTiebreaker` is set
- Shows visual progress bar with percent complete
- Updates reactively as `currentIndex` and `totalQuestions` change

### Accessibility

- Label sits in an `aria-live="polite"` region so updates are announced
- Track exposes `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`

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

1. Displays primary tool name as the only `h1`
2. Displays justification text (cites specific signals)
3. Renders `ComparisonTable` with runner-up tools
4. Renders "Start over" button that calls `onRestart`

### Accessibility

- Recommendation sits in a `<section>` within `<main>`
- Comparison table uses semantic HTML (`<table>`)
- "Start over" button is keyboard accessible

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

- Renders table with columns: Tool, Use case, Why not this one?
- One row per runner-up tool, ordered by descending net score
- At ≤768px rows stack, with each cell prefixed by its column label via `data-label`
- Returns `null` when there are no runner-ups

### Accessibility

- Uses `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Column headers are `<th>` with `scope="col"`
- Explicit `role` attributes preserve table semantics when rows stack on small screens

---

## Contracts Summary

| Component | Input Contract | Output Contract | State Management |
|-----------|---|---|---|
| App | None | Renders ErrorBoundary + WizardContainer, or the rules-load error | Module-level rules validation |
| ErrorBoundary | children | Renders children or an alert card | `hasError` |
| WizardContainer | rules | QuestionCard, ProgressIndicator, RecommendationResult | `useWizardState` hook |
| QuestionCard | question, selectedValue, isLastQuestion, canGoBack, onSelect, onNext, onBack | None | Controlled by parent |
| ProgressIndicator | currentIndex, totalQuestions, isTiebreaker | None | Read-only display |
| RecommendationResult | recommendation, onRestart | None | Display-only |
| ComparisonTable | runnerUps | None | Display-only |

All components are:
- **Functional** (React.FC), except `ErrorBoundary`, which must be a class to use `getDerivedStateFromError`
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
