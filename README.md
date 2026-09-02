# Microsoft Tool Advisor

A wizard that asks a short series of guided questions and recommends the right
Microsoft tool: Power Automate, Power Apps, Copilot Studio, Azure Logic Apps, or Azure Functions using
plain-language reason and a comparison of runner-up options.

Every recommendation is derived from the decision framework in
[docs/decision-framework.md](docs/decision-framework.md). Nothing leaves the browser: no backend,
no API calls, no storage, no telemetry.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL. The wizard asks 7 core questions, plus a tiebreaker question when two or
more tools score equally.

## Tech stack

- React 18 + TypeScript (strict) on Vite 8
- Fluent UI React v9 (`@fluentui/react-components`) with the default `webLightTheme`
- Vitest + React Testing Library (unit, integration)
- Playwright + axe-core (end-to-end, accessibility)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check + production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src/` and `tests/` |
| `npm run format` | Prettier write |
| `npm run test:unit` | Engine, rules schema, scenario, and offline checks |
| `npm run test:integration` | Wizard flow and rendering with jsdom |
| `npm run test:e2e` | Real-browser flow, offline, security, accessibility |
| `npm run check:size` | Fail if the gzipped bundle exceeds 200KB |

Playwright needs browsers once: `npx playwright install chromium`.

## How it works

1. `src/data/rules.json` holds the curated framework: tools, weighted signals, weighted red flags,
   questions, answer→signal mappings, and tiebreakers. It is imported as a module and bundled.
2. Each answer activates signals and red flags. Each tool scores
   `Σ signal weights − Σ red flag weights`.
3. If the top tools tie, a tiebreaker question is asked; residual ties resolve deterministically.
4. The justification and the "Why not this one?" column are generated from the matched framework
   text, so every recommendation is traceable.

More detail: [docs/architecture-overview.md](docs/architecture-overview.md),
[docs/ui-guidelines.md](docs/ui-guidelines.md), and
[src/CONTRIBUTING-ENGINE.md](src/CONTRIBUTING-ENGINE.md).

## Project layout

```text
src/
  components/   UI plus WizardContainer and ErrorBoundary
  engine/       Pure recommendation logic and shared types
  hooks/        useWizardState — all wizard state
  utils/        Scoring and plain-language formatting helpers
  data/         rules.json
tests/          unit | integration | e2e
specs/          Feature specification, plan, tasks, contracts
docs/           Decision framework and architecture overview
```

## Deployment

`npm run build` emits a static bundle in `dist/` with a relative base path, so it can be hosted from
any static path (including GitHub Pages) with no server-side configuration.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
