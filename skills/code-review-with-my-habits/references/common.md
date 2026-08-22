# Common habits

Personal habits that apply to every language, on top of the community best-practice baseline. Each entry is a check the review runs.

## Naming

- Class and type names say what the thing is, at the level the caller needs — no generic suffixes that dodge the question of what the type actually does.
- Variable names say what the value holds, not how it was produced. A name that takes effort to decode is a finding.
- The same concept carries the same name across the codebase — consistency wins over cleverness.
- When a refactor changes what an identifier now means, rename it to match; don't inherit a name that no longer fits.

## Function logic

- Prefer early return / guard clauses: handle exceptional or cheap cases first, keep the happy path linear and unindented.
- Keep `if/else` structure simple and mutually exclusive when the branches are; order the branches so the reading order matches the intent.
- Shallow nesting over deep nesting: depth is a finding even when each line is fine.
- A function does one thing; if it needs a comment to explain what it does, consider splitting it.

## Extending this file

Add a section here when a habit applies to all languages; put language-specific ones in `references/<lang>.md`. The review suggests candidates at the end of its report — the edits are always the user's.
