# Tool-Advisor Constitution

## Core Principles

### I. Transparent Decision Logic
Every recommendation must include a stated reason grounded in the decision framework. Users must understand why a particular tool is recommended, not just receive a binary answer. Recommendations must cite specific "best-fit signals" or "red flags" from the framework that apply to the user's scenario.

### II. Client-Side Only Architecture
The tool must run entirely in the browser with no backend services and no external data storage. All computation, decision logic, and state management occur locally. This ensures user privacy, simplifies deployment, and eliminates infrastructure dependencies. No calls to external APIs, databases, or analytics services are permitted.

### III. Decision Framework Authority
The decision framework defined in `docs/decision-framework.md` is the single source of truth for all recommendations. Do not invent new tools, criteria, or comparison matrices. All tool recommendations must be derived from the existing framework. Framework updates are required before adding support for new tools or decision categories.

### IV. Accessible & Responsive Design
The UI must be accessible to all users, including those using assistive technologies, and must perform smoothly across device sizes and network conditions. Follow WCAG 2.1 AA standards minimum. Design decisions must prioritize clarity and usability over visual complexity.

## Technical Constraints

- **No External Dependencies**: Application logic and state must not depend on external services, APIs, or CDNs beyond standard web platform APIs.
- **Data Residency**: All user input and decision context remains in the user's browser. No telemetry, logging, or data transmission beyond the local session.
- **Framework Fidelity**: Tool recommendations must map directly to rows/cells in the decision framework. No derived logic outside the framework is permitted.

## Development Workflow

- All features must align with one of the four core principles.
- Any proposal that violates principle II (client-side only) or principle III (framework authority) must be explicitly rejected.
- Code review must verify that new recommendations and UI features reference the decision framework and include stated reasons visible to users.
- When the decision framework is updated, the application must reflect those changes without additional release cycles; framework updates are authoritative.

## Governance

This constitution supersedes all other development practices for this project. Amendments to principles require explicit documentation and ratification. The decision framework takes precedence in all recommendation disputes.

**Version**: 1.0.0 | **Ratified**: 2025-09-01 | **Last Amended**: 2025-09-01
