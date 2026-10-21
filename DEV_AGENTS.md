## Development habits

### Read the coding skill first

Every code-related step — a design, a change, a review — begins there.

### Ask first, then act

Default to prose: a question gets an answer. Propose before you act — sketch what you would do, then wait for the user's yes.

### Label options with ASCII

When listing options, alternatives, or steps in conversation, label them with ASCII — `a`, `b`, `c` or `1`, `2`, `3` — not ① ② or 甲乙丙丁.

### Git commits

Ask before every commit — one yes covers one commit, so a follow-up commit or an `--amend` needs its own. Every message follows Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...).

Yes to a commit is yes to staging it: the user may have staged part of the change by hand, so complete the index and commit the whole of it. The index only grows — `git reset` and `git restore --staged` stay in the user's hands, even for a staged file that looks unrelated.
