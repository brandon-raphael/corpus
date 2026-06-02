---
name: canon
description: Provides strict coding principles for clear, simple, exhaustive, fail-fast implementation and refactoring using negative-space programming. Use for non-trivial coding tasks, feature work, refactors, code review, or bug fixes where the agent must trace existing flow, honor AGENTS.md/project docs/domain language/ADRs, preserve architecture, reduce branching, surface useful errors, add appropriate logging, and cover all cases; skip for tiny mechanical edits.
---

# Canon

Use Canon for non-trivial implementation, refactoring, debugging, and review work where code shape matters. The goal is code that feels inevitable: direct, exhaustive, easy to trace, and difficult to misuse.

Canon runs in big-bang/nuclear cleanup mode by default: do not preserve bad shapes for backwards compatibility unless the user explicitly requires compatibility. Prefer refactoring callers, data shapes, and boundaries to the better design instead of pandering to legacy mistakes.

## Quick start

Before editing, trace the flow you will touch. Identify the owning feature/module, current conventions, existing helpers, error surfaces, and logging patterns. Then implement the smallest clean design that covers all cases without hiding broken invariants behind fallbacks.

For file-size checks:

```bash
bun .agents/skills/canon/scripts/check-file-size.ts
bun .agents/skills/canon/scripts/check-file-size.ts --fail --threshold 1000
```

For a TypeScript lint/config audit, run Canon doctor from the project root:

```bash
bun .agents/skills/canon/scripts/doctor.ts
```

Use doctor only when linting/configuration is part of the task, when the user asks for a lint setup review, or when lint output suggests the project lacks Canon-aligned TypeScript guardrails. Do not run it during ordinary implementation just because Canon is active.

For examples, see [EXAMPLES.md](EXAMPLES.md).

## Subcommands

Canon currently supports one explicit subcommand: `check`.

If the user invokes `check`, you MUST read `references/check.md` next. This is non-optional. The reference defines the command's flow; without it you will skip steps the user expects.

- `check`: run a read-only Canon readiness check for the repo's agent instruction and project documentation layer. Read [references/check.md](references/check.md).

## Before coding

- Trace the relevant code path end-to-end before changing it.
- Find the canonical owner: feature/module first, shared layer only for truly shared concepts.
- Search for existing helpers, contracts, error types, logging utilities, and tests before adding new ones.
- Read the project instruction layer when present: root `AGENTS.md`, `docs/domain-language.md`, and relevant `docs/adr/*.md`.
- If root `AGENTS.md` is missing and the task is non-trivial, ask before creating one. If it exists but lacks Canon/project-doc guidance, ask before adding a short reference to `docs/domain-language.md` and `docs/adr/`.
- If `docs/domain-language.md` or `docs/adr/` is missing, do not create them preemptively. Create them only with user approval when a real domain term or architectural decision needs to be recorded.
- If logging conventions are missing in the package/module you will touch, alert the user and offer to set logging up before proceeding.
- If the clean solution requires large cross-module restructuring, ownership moves, new logging/error infrastructure, domain-language changes, or ADR-worthy decisions, explain what needs to change, why the smaller path would preserve bad design, and ask for approval before proceeding.
- Only pause for large scope expansion or material ambiguity; do not interrupt the user for small local refactors that directly support the task.
- Identify legacy compatibility constraints explicitly; do not assume backwards compatibility is required.

## Project context and ambiguity handling

Canon is exploration-first, not interview-first.

- Before asking the user questions, inspect the codebase and project docs deeply enough to infer the likely answer from existing implementation, tests, naming, ownership, and documented decisions.
- Prefer explored evidence over user interrogation. Do not ask questions that the code, tests, `AGENTS.md`, `docs/domain-language.md`, or ADRs can reasonably answer.
- After exploration, summarize the findings when they materially shape the implementation: what the repo establishes, what assumptions you are making, and what remains ambiguous or contradictory.
- Assume details from the best available evidence, then state those assumptions explicitly when they affect behavior, ownership, compatibility, data shape, user-visible language, or domain boundaries.
- Ask only questions that materially change the implementation or its risk profile. Group independent questions together; ask one at a time only when one answer determines the next branch of exploration.
- For every question, include a recommended answer and the evidence behind it.
- If docs and code conflict, or the user's request conflicts with established domain language or an ADR, stop and surface the contradiction before implementing.

### Domain language

Use `docs/domain-language.md` as the project's canonical vocabulary when it exists.

- Treat domain language as a coding constraint: names, UI copy, API concepts, feature ownership, and model boundaries should use the canonical terms.
- When the user uses a conflicting, vague, or overloaded term, map it to the existing canonical term if the evidence is clear. Ask only when the difference could represent a distinct domain concept.
- Keep `docs/domain-language.md` implementation-free. It is a glossary, not a spec, task plan, schema, or architecture document.
- Record only project/domain concepts, not general programming terms.
- When a term is resolved and the user approves updating docs, use this format:

```md
# Domain Language

## Language

**Order**:
A customer's request to purchase one or more products.
_Avoid_: Purchase, transaction
```

### ADRs

Use `docs/adr/` for durable architectural decisions.

- Read relevant ADRs before changing architectural shape, persistence, auth, integrations, module boundaries, compatibility behavior, or cross-context communication.
- Offer an ADR only when all three are true: the decision is hard to reverse, surprising without context, and the result of a real trade-off.
- Skip ADRs for obvious, easy-to-reverse, or purely mechanical choices.
- Create ADRs lazily, with user approval, using sequential filenames like `docs/adr/0001-short-slug.md`.
- Keep ADRs short: what was decided, why, and any non-obvious consequences worth remembering.

## Core principles

- Prefer direct, boring, maintainable code over clever or magical code.
- Fail fast at unclear boundaries; do not continue with invalid state.
- Make invalid states unrepresentable with explicit types, schemas, discriminated unions, and exhaustive switches.
- Use negative-space programming: delete branches by improving the model, not by centralizing messy conditionals.
- Prefer one clear path over many defensive paths.
- Keep feature-specific behavior out of general-purpose/shared paths.
- Small local cleanup is allowed when it directly supports the task; surprise rewrites are not.

## Fallback discipline

Fallbacks are presumptively guilty.

- Do not use `?? ""`, `?? []`, `|| default`, silent optional chaining, catch-and-ignore, or broad defaulting to hide missing state.
- A fallback is allowed only for real product default behavior, compatibility boundaries, degraded external dependencies, or documented recovery paths.
- Every fallback must answer: what invariant failed, and why is continuing safer than failing?
- Prefer required inputs, explicit validation, exhaustive handling, and clear errors.

## Errors and logging

- Surface clear, user-friendly errors instead of generic failures.
- Error messages should explain what failed, relevant context, and what the user/developer can do next.
- Match the project’s existing error and logging conventions first.
- Reuse canonical loggers, error classes, notification/toast systems, API error shapes, and service result patterns.
- Add meaningful logs for non-trivial flows:
  - `DEBUG`: decisions, branch selection, diagnostic context.
  - `INFO`: lifecycle milestones and user-visible operations.
  - `ERROR`: failures with enough structured context to diagnose.
- Do not invent a second logging framework or error style.

## Organization and extraction

- Organize code by feature ownership.
- Keep feature-specific UI, state, data access, and helpers near the feature.
- Duplicate once if it keeps local code clearer.
- On the third real use of the same concept, strongly consider extraction.
- Extract feature-local helpers before promoting to shared/common modules.
- Never create vague dumping grounds like generic `utils` without a clear owner.

## Refactoring standards

- Look for code-judo moves that delete concepts, branches, wrappers, or modes entirely.
- Treat ad-hoc conditionals, nullable modes, flag piles, and cast-heavy code as design smells.
- Replace repeated checks with a better model or explicit dispatcher.
- Delete wrappers that do not simplify the API or reduce mental load.
- Split files before they sprawl past 1000 lines unless there is a strong structural reason.
- Preserve intended product behavior, not accidental legacy shapes.
- Do not maintain duplicate old and new paths merely for compatibility unless explicitly required.
- Refactor call sites to the better contract instead of adding adapters around bad code.
- Remove obsolete branches, wrappers, and compatibility shims when the better model replaces them.

## TypeScript lint/config guardrails

When linting or reviewing lint setup in a TypeScript project, prefer compiler-owned invariants before linter approximations. Check for these `tsconfig.json` flags before adding lint rules that duplicate them:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

For Oxlint, scope Canon's stricter TypeScript lint rules to TypeScript files with an override such as `**/*.{ts,tsx}`. This keeps JavaScript files from inheriting TypeScript-only expectations while preserving strong guardrails where TypeScript can enforce them. Recommended Oxlint plugins are `typescript`, `react`, `react-hooks`, `jsx-a11y`, `import`, `promise`, `unicorn`, and `oxc`.

Canon-aligned Oxlint rules for TypeScript files should emphasize explicit boundaries, exhaustive control flow, and no hidden fallbacks: no explicit `any`, no unsafe `any` operations, no non-null assertions, no optional chaining as a default escape hatch, exhaustive switches, promise misuse checks, no raw `console`, no empty blocks/functions, no nested ternaries, no throw literals, duplicate import checks, and React hook/dependency checks when React is present.

Use `scripts/doctor.ts` to audit this setup on demand instead of loading these details into every implementation task.

## Verification

- If behavior changes, add or update targeted tests where the project has a test pattern.
- Cover representative success cases, failure paths, and exhaustive branches.
- If no test harness exists, say so and run the strongest available verification.
- Before finalizing, self-review for hidden fallbacks, missing cases, weak errors, missing logs, wrong ownership, and avoidable branching.
