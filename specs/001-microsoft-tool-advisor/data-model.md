# Data Model: Microsoft Tool Advisor

**Date**: 2025-09-01

## Overview

This document defines the core entities, their fields, relationships, and state transitions for the Microsoft Tool Advisor wizard.

## Entities

### 1. Tool

A Microsoft cloud tool that can be recommended to users.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "power-automate", "power-apps") |
| `name` | string | Yes | Display name (e.g., "Power Automate") |
| `description` | string | Yes | One-sentence description |
| `primaryUseCase` | string | Yes | Main scenario (e.g., "Backend automation without UI") |
| `redFlags` | string[] | No | Red flag IDs that argue against this tool |
| `signals` | string[] | No | Best-fit signal IDs that favor this tool |

**Tools in Scope**:
- Power Automate
- Power Apps
- Copilot Studio
- Azure Logic Apps
- Azure Functions

### 2. Signal

A "best-fit" indicator from the decision framework that supports a tool recommendation.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "backend-automation", "ui-needed") |
| `text` | string | Yes | Framework text (e.g., "Backend automation, no UI needed") |
| `weight` | number | Yes | Numeric score 1-10 (higher = more important) |
| `applicableTools` | string[] | Yes | Tool IDs where this signal is a best-fit |

**Source**: Derived from "Best-fit signals" column in docs/decision-framework.md.

**Example**:
```json
{
  "id": "backend-automation",
  "text": "Backend automation, no UI needed. Trigger is scheduled or event-driven.",
  "weight": 8,
  "applicableTools": ["power-automate"]
}
```

### 3. RedFlag

A warning indicator from the decision framework that argues against a tool recommendation.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "needs-ui-after-all") |
| `text` | string | Yes | Framework text (e.g., "Needs a real UI") |
| `weight` | number | Yes | Numeric score 1-10 (higher = stronger warning) |
| `applicableTools` | string[] | Yes | Tool IDs that should be avoided if this flag matches |

**Source**: Derived from "Red flags" column in docs/decision-framework.md.

**Example**:
```json
{
  "id": "needs-ui",
  "text": "Needs a real UI for user interaction",
  "weight": 9,
  "applicableTools": ["power-automate"]
}
```

### 4. Question

A single question presented to the user during the wizard.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "q1-need-ui", "q2-custom-logic") |
| `text` | string | Yes | Question phrasing for end user |
| `type` | enum | Yes | "yes/no", "single-choice", "multiple-choice" |
| `options` | Option[] | Conditional | Required if type is choice-based |
| `position` | number | Yes | Order in quiz (1-7) |
| `isTiebreaker` | boolean | No | true if this is a tiebreaker question (default: false) |

**Option** (nested):
```typescript
interface Option {
  value: string;        // e.g., "yes", "custom-code"
  label: string;        // e.g., "Yes", "Requires custom code"
  help?: string;        // Optional tooltip for users
}
```

**Example**:
```json
{
  "id": "q1-need-ui",
  "text": "Does your solution need a user-facing interface?",
  "type": "yes/no",
  "options": [
    { "value": "yes", "label": "Yes, users interact directly" },
    { "value": "no", "label": "No, backend automation only" }
  ],
  "position": 1
}
```

### 5. QuestionMapping

Maps a question answer to active signals and red flags.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `questionId` | string | Yes | Question this mapping applies to |
| `answerValue` | string | Yes | Answer value (e.g., "yes", "custom-code") |
| `activatedSignals` | string[] | Yes | Signal IDs that become active |
| `activatedRedFlags` | string[] | Yes | Red flag IDs that become active |

**Example**:
```json
{
  "questionId": "q1-need-ui",
  "answerValue": "yes",
  "activatedSignals": ["ui-needed"],
  "activatedRedFlags": []
}
```

### 6. Answer (Session)

A user's response to a single question during the wizard session.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `questionId` | string | Yes | The question answered |
| `value` | string \| boolean | Yes | The answer value |
| `timestamp` | number | Yes | Unix timestamp when answered |
| `activatedSignals` | string[] | Yes | Signal IDs triggered by this answer (derived from QuestionMapping) |
| `activatedRedFlags` | string[] | Yes | Red flag IDs triggered by this answer (derived from QuestionMapping) |

**Lifecycle**: Created when user submits a question; accumulated in wizard state until recommendation is generated.

### 7. ToolScore (Internal)

A temporary calculation object during recommendation engine execution.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `toolId` | string | Yes | Tool being scored |
| `signalScore` | number | Yes | Sum of weights for matched signals |
| `redFlagPenalty` | number | Yes | Sum of weights for matched red flags |
| `netScore` | number | Yes | signalScore - redFlagPenalty |
| `matchedSignals` | string[] | Yes | Signal IDs that contributed to score |
| `matchedRedFlags` | string[] | Yes | Red flag IDs that contributed to penalty |

**Usage**: Internal to recommendationEngine.ts; not exposed to UI.

### 8. Recommendation

The final recommendation generated and displayed to the user.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `primaryTool` | Tool | Yes | The recommended tool |
| `score` | number | Yes | Final net score of primary tool |
| `justification` | string | Yes | Plain-language reason (includes signal citations) |
| `matchedSignals` | Signal[] | Yes | Signals that supported this recommendation |
| `matchedRedFlags` | RedFlag[] | No | Red flags that were avoided (context for user) |
| `runnerUps` | RunnerUpTool[] | Yes | 1-2 alternative tools for comparison |
| `generatedAt` | number | Yes | Unix timestamp of recommendation |
| `questionsAnswered` | number | Yes | Count of questions answered (5-7 or 5-8 with tiebreaker) |

### 9. RunnerUpTool

An alternative tool shown in the comparison table.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `tool` | Tool | Yes | The runner-up tool |
| `score` | number | Yes | Net score of this tool |
| `differentiation` | string | Yes | Why primary is better than this runner-up (cites specific signals) |
| `matchedSignals` | Signal[] | Yes | Signals this tool matched |

### 10. Tiebreaker

A question and associated signals used to break ties between equally-scored tools.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `questionId` | string | Yes | Question to ask when tie is detected |
| `appliesWhen` | string[] | Yes | Tool IDs that are tied |
| `discriminativeSignals` | Signal[] | Yes | Signals that differentiate the tied tools |

**Example**: If Power Apps and Copilot Studio both score 75, a tiebreaker asks "Does the user need natural language interaction?" to favor Copilot Studio if yes, Power Apps if no.

## Relationships

### Question Mapping Flow

```
User Answer → QuestionMapping → Signals + RedFlags → Tool Scores → Recommendation
     ↓             ↓                      ↓                ↓              ↓
  Answer entity  Lookup signals    Update ToolScore    Rank & tie    Generate text
                 for this Q+A      objects             detect       with citations
```

### State Transitions During Wizard Session

```
┌─────────────────────────────────────────────┐
│ Wizard Start: Q1                            │
│ wizardState.currentQuestionIndex = 0        │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│ User Answers Question → Answer entity       │
│ created, signals/red flags activated        │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│ currentQuestionIndex++                      │
│ If index < 7: Continue with Q(index+1)     │
│ If index == 7: Evaluate scores             │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│ Score Evaluation                            │
│ If tie detected:                            │
│   showTiebreaker = true                     │
│ Else:                                       │
│   Generate Recommendation object            │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│ (If Tiebreaker) User Answers Tiebreaker Q   │
│ Apply discriminative signals → final score  │
│ Generate Recommendation                     │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│ Display Recommendation + Comparison Table   │
│ User can restart wizard (reset state)       │
└─────────────────────────────────────────────┘
```

## Validation Rules

### Question-Answer Validation
- Answer value MUST match one of the defined options for the question
- QuestionMapping for (questionId, answerValue) pair MUST exist
- activatedSignals and activatedRedFlags MUST be non-empty (at least one per answer)

### Signal/RedFlag Validation
- All signals in signals[] array MUST have entries in rules.json
- All red flags in redFlags[] array MUST have entries in rules.json
- Signal weight and redFlag weight MUST be in range 1-10

### Recommendation Validation
- primaryTool MUST have the highest netScore among all tools
- runnerUps MUST contain the next 1-2 highest-scoring tools (min 1, max 2)
- justification MUST cite at least one signal from matchedSignals
- score MUST equal sum(matchedSignals weights) - sum(matchedRedFlags weights)

## Schema File (TypeScript Types)

See `src/engine/types.ts` for complete TypeScript interface definitions. Key types:

```typescript
interface Tool { ... }
interface Signal { ... }
interface RedFlag { ... }
interface Question { ... }
interface Answer { ... }
interface Recommendation { ... }
interface RulesFile { tools, signals, redFlags, questions, tiebreakers, mappings }
```

---

## Notes for Implementation

1. **Immutability**: All entities are treated as immutable in the recommendation engine (pure functions don't modify inputs).
2. **Loading**: `rules.json` is loaded once at app startup; no dynamic updates during session.
3. **Serialization**: Answer and Recommendation objects are JSON-serializable (no functions or circular refs).
4. **Error Handling**: Invalid rules.json structure should trigger an error boundary (details in error handling task).
5. **Testing**: Unit tests will verify data model constraints (validation rules) are enforced.
