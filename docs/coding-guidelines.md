# Coding Guidelines

## Formatting

Formatting is not a matter of taste here — Prettier owns it. The configuration lives in `.prettierrc`:
single quotes, semicolons, two-space indentation, a 100-character print width, ES5 trailing commas,
and always-parenthesised arrow parameters. Run `npm run format` before you push, or let your editor
format on save. ESLint is configured with `eslint-config-prettier` so the two never argue; if a lint
rule and a formatting rule appear to conflict, the formatting rule wins and the lint rule is wrong.

Beyond the automated rules, favour code that reads top-to-bottom. Give things names that say what
they are (`generateRunnerUpDifferentiator`, not `getText2`), and let those names carry the
explanation. Comments should say only what the code cannot: a non-obvious constraint, a reason for an
unusual choice, a link to the requirement being satisfied. A comment that restates the next line is
noise that will drift out of date.

TypeScript runs in strict mode with `noUnusedLocals`, `noUnusedParameters`, and `noImplicitReturns`
enabled. Do not reach for `any` or a non-null assertion to silence the compiler; if the type is
genuinely uncertain, narrow it at the boundary where the uncertainty enters, then let the rest of the
code work with a clean type.

## Import organization

Group imports in a consistent order, separated by blank lines where it aids readability:

1. Node built-ins (`node:fs`, `node:path`) — test and script files only
2. External packages (`react`, `vitest`, `@playwright/test`)
3. Internal modules by distance: engine and types, then hooks and utils, then components
4. Styles (`./index.css`), always last

Use `import type { ... }` for type-only imports so the compiler can erase them cleanly — this matters
because `isolatedModules` is on. Prefer relative paths within a feature and the `@/` alias when
reaching across the tree. Never import a component into the engine: `src/engine/` and `src/utils/`
must stay free of React so they remain testable without a DOM and reusable outside the browser.

## The DRY principle

Duplication is worth removing when the copies represent the *same decision*, not merely the same
characters. The scoring formula lives in exactly one place, `src/utils/scoring.ts`, because it encodes
one decision about how tools are ranked; if it lived in two places, one would eventually drift and
recommendations would silently disagree with the specification. The same applies to framework text:
justifications and runner-up differentiators are generated from the `text` fields in `rules.json`
rather than restated in components, so the decision framework stays the single source of truth.

The inverse trap is just as costly. Two blocks that happen to look alike today but answer to different
requirements should stay apart — collapsing them creates a helper with a boolean flag, then two flags,
then a function nobody can safely change. Wait until the third occurrence before extracting, and when
you extract, name the concept rather than the shape.

In practice this means: put shared data in `rules.json`, shared logic in `src/engine/` or
`src/utils/`, shared UI state in `src/hooks/`, and shared test paths in helpers such as
`tests/e2e/helpers.ts`. Everything else can afford to repeat itself a little.
