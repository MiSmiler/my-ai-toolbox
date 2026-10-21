## Development habits

### Apply the `coding` skill

The `coding` skill governs every code decision in this repo — an interface design, a module boundary, a naming choice, and a trade-off proposal as much as the code that lands. Read it before proposing a design and before writing or editing code, in any language or file. Present an interface design as code in a fenced code block — the shape reads as code, not as prose or bullets.

### Ask first, then edit

Default to prose: a question gets an answer. Propose before you change anything — say what you would do, then edit once the user says yes.

### Label options with ASCII

When listing options, alternatives, or steps in conversation, label them with ASCII — `a`, `b`, `c` or `1`, `2`, `3` — not ① ② or 甲乙丙丁.

### Git commits

Ask before every commit — one yes covers one commit, so a follow-up commit or an `--amend` needs its own. Every message follows Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...).

Yes to a commit is yes to staging it: the user may have staged part of the change by hand, so complete the index and commit the whole of it. The index only grows — `git reset` and `git restore --staged` stay in the user's hands, even for a staged file that looks unrelated.
