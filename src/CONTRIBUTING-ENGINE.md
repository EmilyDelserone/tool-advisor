# Extending the Recommendation Engine

All decision logic lives in `src/engine/recommendationEngine.ts` (pure functions, no React) with
scoring delegated to `src/utils/scoring.ts`. `src/data/rules.json` is the only source of framework
data and is bundled at build time — never fetched.

## Scoring model

```text
netScore(tool) = Σ weight(matched signals) − Σ weight(matched red flags)
```

A signal or red flag matches a tool only when the user's answers activated it **and** the tool
appears in its `applicableTools` list.

## Adding a tool

1. Confirm the tool has a row in `docs/decision-framework.md`. If it does not, update the framework
   first — the constitution forbids recommendations outside it.
2. Add the tool to `rules.json → tools[]` with `id`, `name`, `description`, `primaryUseCase`.
3. Add its id to the `applicableTools` of every relevant signal and red flag.
4. Extend `tests/unit/quickstart-scenarios.test.ts` with a scenario that resolves to the new tool.

## Adding a signal or red flag

1. Copy the wording from the framework row so justifications stay traceable.
2. Choose a weight of 1–10 reflecting how decisive the framework treats it.
3. Wire it into at least one entry in `questionMappings[]`; unmapped entries can never activate.

## Adding a question

1. Append to `rules.json → questions[]` with a unique `id` and `position`. Core questions must stay
   within 5–7 (FR-001); set `isTiebreaker: true` for tiebreakers.
2. Multiple-choice questions need `options[]`; yes/no questions default to `yes` / `no`.
3. Add a `questionMappings[]` entry for **every** option — `tests/unit/rules.test.ts` enforces this.

## Tiebreakers

`evaluateAnswers()` scores the core answers, calls `detectTie()`, and if the top tools tie it looks
for a `tiebreakers[]` entry whose `appliesWhen` covers all tied tool ids and whose question has not
been answered yet. After the tiebreaker is answered, `applyTiebreakerSignals()` resolves the winner
and `findPrimaryRecommendation(answers, rules, preferredToolId)` promotes it.

## Justification text

`generateJustification()` and `generateRunnerUpDifferentiator()` build copy exclusively from signal
and red flag `text` values, which is what keeps recommendations traceable to the framework
(Constitution I & III). Keep new copy plain-language — see `src/utils/formatting.ts`.
