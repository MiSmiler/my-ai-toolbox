---
name: code-review-with-my-habits
description: Reviews code against my personal habits — naming and function-logic clarity, plus community best practices per language — reporting findings by severity without touching the code.
disable-model-invocation: true
---

# Review Code Against My Habits

Audit the target source files and report findings. The deliverable is a report, never edits — present findings and wait for the user's confirmation before modifying anything.

## Scope

- Default: all source files. Follow the user's call if they narrow the scope (a file, a module, a diff).
- Judge each language by its own conventions. In mixed-language projects, judge each part separately.

## Process

1. Read the target files in full.
2. Read the domain docs if present: `CONTEXT.md` (or `CONTEXT-MAP.md`) at the repo root, plus `docs/adr/`. If none exist, skip this step silently.
3. Identify the languages in scope. For each language that has no `references/<lang>.md` file, report that fact, ask whether to proceed with `common.md` + baseline for it, and wait for the user's consent. Ask once per language per session; do not re-ask.
4. Review against three layers:
   - **Baseline** — community best practices for the language, judged on the spot: conventions (case styles, idioms), standard idioms, common pitfalls. Always on, for every language.
   - **Habits** — `references/common.md` (applies to all languages) plus `references/<lang>.md` if it exists (language-specific emphases). These files are the single source of truth for what the user cares about beyond the baseline.
   - **Domain docs** — if present: do identifiers use the glossary's vocabulary? Flag conflicts with defined terms and avoid-lists, plus gaps or inaccuracies in the docs themselves.
5. Report, grouped by severity: domain-language conflicts first, then habit violations, then baseline deviations, then minor issues. Each finding: file:line, what's wrong, suggested fix. If nothing stands out, say so plainly — an honest clean bill beats padding.
6. End the report with light suggestions for growing the habit files — "consider adding this to `references/<lang>.md`" — when a finding looks like a stable taste rather than a one-off mistake. Suggest only, never edit.
