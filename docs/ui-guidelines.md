# UI Guidelines

These guidelines govern the presentation layer of the Microsoft Tool Advisor. They sit alongside
[coding-guidelines.md](coding-guidelines.md) (formatting, imports, DRY) and
[testing-guidelines.md](testing-guidelines.md), and they must be read together with the design
requirements DR-001 to DR-008 in `specs/001-microsoft-tool-advisor/spec.md`.

## Component library

The app uses **Fluent UI React v9** (`@fluentui/react-components`) with its **default theme**.

- Wrap the application once in `FluentProvider` using `webLightTheme`. Do not fork, extend, or
  hand-roll the theme; if a colour or spacing value is needed, take it from the theme tokens
  (`tokens.colorNeutralForeground1`, `tokens.spacingVerticalM`, and so on) rather than a literal.
- Prefer a Fluent component over custom markup whenever one exists: `Card`, `Button`, `RadioGroup`,
  `Radio`, `Field`, `ProgressBar`, `Table`, `Text`, `Title1`/`Title2`/`Body1`.
- Use `makeStyles` / `mergeClasses` from `@fluentui/react-components` for component-scoped styles.
  Inline `style` props are reserved for genuinely dynamic values.
- Fluent's defaults already satisfy WCAG 2.1 AA contrast and focus indicators. If you find yourself
  overriding focus or colour, stop — you are probably about to break DR-001.

## Wizard layout

The wizard is a **stepper**: exactly one question on screen at a time.

- **One question per step.** Never show two questions simultaneously, and never reveal the next
  question before the current one is answered.
- **Progress indicator** above the question, always visible. It states `Question X of Y` (or
  `Tiebreaker question X of Y`) with percent complete, and uses Fluent's `ProgressBar` so the
  `progressbar` role and `aria-valuenow`/`aria-valuemin`/`aria-valuemax` come for free. The textual
  label sits in an `aria-live="polite"` region.
- **Back / Next controls** at the foot of the card, Back on the left as a `secondary` button, Next on
  the right as the `primary` button. Next is disabled until an option is selected; Back is disabled on
  the first question. On the final question Next reads **See recommendation**.
- **Clickable steps.** Below the progress bar, a `nav` landmark lists one numbered `Button` per core
  question. The current step carries `aria-current="step"`; answered steps use the `outline`
  appearance; steps beyond the furthest question reached are disabled. Selecting a step jumps
  straight to it with answers intact. The tiebreaker is never directly selectable — it exists only
  while a tie stands.
- **Options are radios.** Use `RadioGroup` with one `Radio` per option so keyboard and screen reader
  behaviour is Fluent's, not ours. The question text is the group's `Field` label.
- The step card is a Fluent `Card` centred in a column no wider than ~720px.

## Recommendation output

Two elements, in this order, and no more:

1. **Winner card.** A visually prominent Fluent `Card` containing the recommended tool name as the
   only `h1` on the page, an eyebrow label ("Recommended tool"), a fit percentage bar, the
   plain-language justification, a **Learn more** link to the tool's official documentation, and the
   **Start over** button. It must be unmistakably the primary element: brand-tinted surface,
   larger type, and clear separation from what follows. A secondary **Change an answer** action
   returns to the questions with every answer preserved.
2. **Comparison table.** A Fluent `Table` beneath the winner card with exactly three columns —
   *Tool*, *Use case*, *Why not this one?* — one row per runner-up, ordered by descending score. The
   Tool cell carries the tool name, its fit percentage bar, and its documentation link. Cells stay
   under 60 words. On narrow viewports rows stack, with each cell prefixed by its column label.

Fit bars use Fluent `ProgressBar` with a visible `NN% fit` label and an `aria-valuetext` naming the
tool, so the percentage is never conveyed by the bar alone.

Each runner-up row carries a **collapsed-by-default** disclosure listing the framework red flags that
lowered its fit score and their point cost. The toggle is a Fluent `Button` with `aria-expanded` and
`aria-controls`, operable by click, tap, and keyboard. The content comes from the engine's
`redFlagBreakdown` — never recompute scoring in a component.

Never render more than one winner. Never let the comparison table compete visually with the winner
card — it is supporting evidence, not an alternative call to action.

## Responsive behaviour

Three breakpoints, matching DR-002:

| Breakpoint | Behaviour |
|------------|-----------|
| ≤480px (mobile) | Single column, full-width stacked buttons, reduced type scale |
| ≤768px (tablet) | Reduced padding, comparison table rows stack with visible field labels |
| >768px (desktop) | Full table layout |

Interactive targets: primary actions (Back, Next, See recommendation, Start over) are at least 44px
tall at every breakpoint; inline informational affordances such as glossary triggers are at least
24px, the WCAG 2.2 AA minimum. No horizontal scrolling at any width — this is asserted in
`tests/e2e/responsive.spec.ts`.

## Glossary definitions

Technical vocabulary in question and recommendation copy carries an inline definition affordance
(`GlossaryTerm`), rendered immediately after the first mention of each term.

- Content lives in `src/data/glossary.ts` — a plain-English definition plus exactly one concrete
  example per term. Never write definitions inline in a component.
- The trigger is a Fluent `Popover` opened by a small circular `Button`. It must work three ways:
  **mouse hover**, **touch tap**, and **keyboard** (Enter/Space, Escape to dismiss). Hover is
  restricted to `pointerType === 'mouse'` so a tap is not opened by a synthesized hover and then
  immediately closed by the click.
- Never nest the trigger inside a radio's `<label>`; place it as a sibling so opening a definition
  cannot change the user's answer.
- Annotate only the first mention of a term in a given block of copy.

## Content and tone

- Business language, never developer jargon (FR-009).
- Fixed interaction copy (DR-007): **Back**, **Next**, **See recommendation**, **Start over**,
  **Try again**.
- All recommendation prose is generated from framework signal and red flag text. Never hard-code
  persuasive copy into a component.

## Error states

Error views reuse the same card layout, carry `role="alert"`, and offer a single clear action. They
show plain language only — no stack traces, no error codes, no technical identifiers (DR-008).
