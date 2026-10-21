## Development habits

### Apply the `coding` skill

The `coding` skill governs every code decision in this repo — an interface design, a module boundary, a naming choice, and a trade-off proposal as much as the code that lands. Read it before proposing a design and before writing or editing code, in any language or file.

### Before touching files: present first, then confirm

Before you edit any file, present what you're about to do and **wait for the
user's confirmation**. The form of that presentation depends on what the user
asked:

- **A question** ("what do you think?" / "why?" / any `?`): it is a request for
  analysis and explanation, **not** a cue to edit. Give the analysis first; edit
  only after the user confirms they want the change made.
- **Investigating a problem** (debugging, diagnosing, exploring the codebase):
  report your findings first; do not jump from investigation straight to editing.
- **Implementing a feature/fix**: lay out the interface design and the shape of
  the change first; the implementation is not underway until the design is
  agreed.
  - Present interface design as **code in a fenced code block** — read the
    shape as code, not as prose or bulleted markdown.

### Label options with ASCII

When listing options, alternatives, or steps in conversation, label them with ASCII — `a`, `b`, `c` or `1`, `2`, `3` — not ① ② or 甲乙丙丁.

### Git commits

Ask before every commit — one yes covers one commit, so a follow-up commit or an `--amend` needs its own. Every message follows Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...).

Yes to a commit is yes to staging it: the user may have staged part of the change by hand, so complete the index and commit the whole of it. The index only grows — `git reset` and `git restore --staged` stay in the user's hands, even for a staged file that looks unrelated.
