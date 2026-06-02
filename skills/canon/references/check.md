# Canon check

Use `check` when the user asks whether a repo is ready for Canon or wants to initialize Canon's project instruction/documentation layer.

`check` is read-only by default. It may recommend file creation or edits, but it must not write anything until the user approves.

## Purpose

Answer one question:

> Is this repo set up so Canon can operate correctly?

Do not perform a full code-quality audit. Do not duplicate the main Canon coding checklist. `check` inspects the repo's instruction and documentation readiness: `AGENTS.md`, `docs/domain-language.md`, and `docs/adr/`.

## Flow

1. Locate the repo root.
2. Check for root `AGENTS.md`.
3. If `AGENTS.md` exists, inspect whether it gives agents enough guidance to:
   - use Canon for non-trivial coding work,
   - explore before asking questions,
   - read `docs/domain-language.md` when present,
   - read relevant `docs/adr/*.md` when present,
   - surface conflicts between code, docs, user requests, and ADRs before implementation.
4. Check for `docs/domain-language.md`.
5. If `docs/domain-language.md` exists, verify that it is a glossary rather than a spec, task plan, architecture doc, schema, or scratchpad.
6. Check for `docs/adr/`.
7. If ADRs exist, verify that filenames are sequential and readable, such as `0001-short-slug.md`.
8. Lightly scan existing repo docs only as needed to identify obvious setup recommendations:
   - README files,
   - docs overview files,
   - architecture notes,
   - existing agent instruction files.
9. Report what is present, missing, or misaligned.
10. Recommend the smallest setup changes needed.
11. Ask for approval before creating or editing anything.

## What not to do

- Do not audit general code quality.
- Do not review every fallback, branch, test, error, or logging path.
- Do not create `docs/domain-language.md` just because it is missing.
- Do not create `docs/adr/` just because it is missing.
- Do not invent domain terms without evidence.
- Do not create ADRs unless a real architectural decision has been identified and the user approves.

## Expected file roles

### `AGENTS.md`

The root agent operating manual for the repo. It should contain the durable instructions agents need before coding.

A minimal Canon-compatible `AGENTS.md` should tell agents to:

```md
# Agent Instructions

This project follows Canon for non-trivial coding work.

Before changing code:

1. Explore the relevant code path and project docs before asking questions.
2. Read `docs/domain-language.md` when it exists and use its terms consistently.
3. Read relevant ADRs in `docs/adr/` when changing architecture, persistence, integrations, module boundaries, compatibility behavior, or cross-context communication.
4. Surface conflicts between code, docs, user requests, and ADRs before implementation.
5. Ask only questions that materially affect behavior, ownership, compatibility, domain language, or risk.
```

### `docs/domain-language.md`

The project's canonical vocabulary. It should be implementation-free.

Expected shape:

```md
# Domain Language

One or two sentences describing the domain this language covers.

## Language

**Order**:
A customer's request to purchase one or more products.
_Avoid_: Purchase, transaction
```

Only project/domain concepts belong here. General programming concepts do not.

### `docs/adr/`

Durable architectural decisions. ADRs should be short and created lazily.

Create or recommend an ADR only when all three are true:

1. The decision is hard to reverse.
2. The decision would be surprising without context.
3. The decision came from a real trade-off.

## Output format

Return a concise readiness report:

```md
## Canon check

### Status
- `AGENTS.md`: present / missing / needs update
- `docs/domain-language.md`: present / missing / needs update
- `docs/adr/`: present / missing / needs cleanup

### Findings
- Evidence-backed notes about what is present, missing, or misaligned.

### Recommended setup
- Minimal file creations or edits recommended.

### Approval needed
- Specific changes you need permission to make, if any.
```

If the repo is already ready, say so plainly and list the evidence checked.
