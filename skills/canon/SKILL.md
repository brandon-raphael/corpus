---
name: canon
description: Provides strict coding principles for clear, simple, exhaustive, fail-fast implementation and refactoring using negative-space programming. Use for non-trivial coding tasks, feature work, refactors, code review, or bug fixes where the agent must trace existing flow, preserve architecture, reduce branching, surface useful errors, add appropriate logging, and cover all cases; skip for tiny mechanical edits.
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

For examples, see [EXAMPLES.md](EXAMPLES.md).

## Before coding

- Trace the relevant code path end-to-end before changing it.
- Find the canonical owner: feature/module first, shared layer only for truly shared concepts.
- Search for existing helpers, contracts, error types, logging utilities, and tests before adding new ones.
- If logging conventions are missing in the package/module you will touch, alert the user and offer to set logging up before proceeding.
- If the clean solution requires large cross-module restructuring, ownership moves, or new logging/error infrastructure, explain what needs to change, why the smaller path would preserve bad design, and ask for approval before proceeding.
- Only pause for large scope expansion; do not interrupt the user for small local refactors that directly support the task.
- Identify legacy compatibility constraints explicitly; do not assume backwards compatibility is required.

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

## Verification

- If behavior changes, add or update targeted tests where the project has a test pattern.
- Cover representative success cases, failure paths, and exhaustive branches.
- If no test harness exists, say so and run the strongest available verification.
- Before finalizing, self-review for hidden fallbacks, missing cases, weak errors, missing logs, wrong ownership, and avoidable branching.
