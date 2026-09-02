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
| `docsUrl` | string | Yes | Absolute URL to the tool's official Microsoft Learn documentation |

Tools do not carry signal or red flag lists; the relationship is expressed on the signal/red flag side via `applicableTools`.

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
| `id` | string | Yes | Unique identifier (e.g., "q1-ui", "q2-custom-code") |
| `text` | string | Yes | Question phrasing for end user |
| `type` | enum | Yes | `"yes-no"` or `"multiple-choice"` |
| `options` | Option[] | Conditional | Required when `type` is `"multiple-choice"`; yes/no questions default to `yes` / `no` |
| `position` | number | Yes | Order in the wizard (1-7 core, 8+ tiebreaker) |
| `isTiebreaker` | boolean | No | true if this is a tiebreaker question (default: false) |

**Option** (nested):
```typescript
interface Option {
  id: string;    // e.g., "yes", "business-team"
  label: string; // e.g., "Business users or citizen developers"
}
```

**Example**:
```json
{
  "id": "q6-audience",
  "text": "Who will use this solution?",
  "type": "multiple-choice",
  "position": 6,
  "options": [
    { "id": "internal", "label": "Internal employees" },
    { "id": "external", "label": "External customers or the public" }
  ]
}
```

### 5. QuestionMapping

Maps a question answer to active signals and red flags.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `questionId` | string | Yes | Question this mapping applies to |
| `answerValue` | string | Yes | Answer option id (e.g., "yes", "business-team") |
| `activatedSignalIds` | string[] | Yes | Signal IDs that become active |
| `activatedRedFlagIds` | string[] | Yes | Red flag IDs that become active |

**Example**:
```json
{
  "questionId": "q1-ui",
  "answerValue": "yes",
  "activatedSignalIds": ["ui-required", "structured-data-entry", "cloud-connectors"],
  "activatedRedFlagIds": ["needs-ui"]
}
```

### 6. Answer (Session)

A user's response to a single question during the wizard session.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `questionId` | string | Yes | The question answered |
| `value` | string | Yes | The selected option id |
| `timestamp` | number | Yes | Unix timestamp when answered |
| `activatedSignalIds` | string[] | Yes | Signal IDs triggered by this answer (derived from QuestionMapping) |
| `activatedRedFlagIds` | string[] | Yes | Red flag IDs triggered by this answer (derived from QuestionMapping) |

**Lifecycle**: Created when user submits a question; accumulated in wizard state until recommendation is generated.

### 7. ToolScore (Internal)

A temporary calculation object during recommendation engine execution.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `toolId` | string | Yes | Tool being scored |
| `signalScore` | number | Yes | Sum of weights for matched signals |
| `redFlagPenalty` | number | Yes | Sum of weights for matched red flags |
| `netScore` | number | Yes | signalScore - redFlagPenalty |
| `fitScore` | number | Yes | 0-100. `round(100 × max(0, netScore) ÷ highest signalScore across all tools)`; 0 when no signal matched. The shared denominator keeps percentage order identical to net score order |
| `matchedSignalIds` | string[] | Yes | Signal IDs that contributed to score |
| `matchedRedFlagIds` | string[] | Yes | Red flag IDs that contributed to penalty |

**Usage**: Internal to recommendationEngine.ts; not exposed to UI.

### 8. Recommendation

The final recommendation generated and displayed to the user.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `primaryTool` | Tool | Yes | The recommended tool |
| `score` | number | Yes | Final net score of primary tool |
| `justification` | string | Yes | Plain-language reason (cites up to 2 signals and 1 red flag; adds a partial-match caveat when netScore ≤ 10) |
| `matchedSignalIds` | string[] | Yes | Signal IDs that supported this recommendation |
| `matchedRedFlagIds` | string[] | Yes | Red flag IDs that counted against this tool |
| `runnerUps` | RunnerUpTool[] | Yes | 1-2 alternative tools for comparison |
| `generatedAt` | number | Yes | Unix timestamp of recommendation |
| `questionsAnswered` | number | Yes | Count of questions answered (5-7, or one more with a tiebreaker) |

### 9. RunnerUpTool

An alternative tool shown in the comparison table.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `tool` | Tool | Yes | The runner-up tool |
| `score` | number | Yes | Net score of this tool |
| `differentiationText` | string | Yes | Why the primary is a better fit (cites up to 2 signals it missed and up to 2 red flags it hit) |
| `matchedSignalIds` | string[] | Yes | Signal IDs this tool matched |

### 10. Tiebreaker

A question and associated signals used to break ties between equally-scored tools.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `questionId` | string | Yes | Question to ask when tie is detected |
| `appliesWhen` | string[] | Yes | Tool IDs this tiebreaker can separate; selected only when it covers every tied tool |
| `discriminativeSignalIds` | string[] | Yes | Signal IDs that differentiate the tied tools |

**Example**: If Power Apps and Copilot Studio both score 75, a tiebreaker asks "Does the user need natural language interaction?" to favor Copilot Studio if yes, Power Apps if no.

## rules.json Schema

Location: `src/data/rules.json`. Imported as a module and bundled at build time — never fetched.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `version` | string | Yes | Semantic version of the curated rules |
| `tools` | Tool[] | Yes | Exactly the five in-scope tools |
| `signals` | Signal[] | Yes | Weights 1-10; every `applicableTools` id must exist in `tools` |
| `redFlags` | RedFlag[] | Yes | Weights 1-10; every `applicableTools` id must exist in `tools` |
| `questions` | Question[] | Yes | 5-7 core questions plus optional tiebreakers; unique `id` and `position` |
| `questionMappings` | QuestionMapping[] | Yes | One entry per question option; ids must resolve to defined signals/red flags |
| `tiebreakers` | Tiebreaker[] | Yes | May be empty only if no tie is reachable |
| `metadata` | object | Yes | `lastUpdated` (ISO date), `frameworkVersion` |

`tests/unit/rules.test.ts` enforces every constraint in this table.

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
- A mapping MAY activate no signals and no red flags (a neutral answer)

### Signal/RedFlag Validation
- All signal and red flag IDs referenced by mappings MUST exist in rules.json
- Every `applicableTools` entry MUST reference a defined tool
- Signal weight and redFlag weight MUST be in range 1-10

### Recommendation Validation
- primaryTool MUST have the highest netScore, or be the tiebreaker-resolved tool among those tied for highest
- runnerUps MUST contain the next 1-2 highest-scoring tools
- justification MUST cite at least one signal whenever any signal matched
- score MUST equal sum(matched signal weights) - sum(matched red flag weights)

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
