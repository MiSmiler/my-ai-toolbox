## Development habits

### Apply the `coding` skill

The `coding` skill governs every code decision in this repo — an interface design, a module boundary, a naming choice, and a trade-off proposal as much as the code that lands. Read it before proposing a design and before writing or editing code, in any language or file.

### Design before code

Rounds of discussion converging is not the design being settled. Both halves — functional design and interface design — are aligned with the user first, and only then does implementation open; a few rounds is the expected cost, not a delay to be cut short.

So when a design discussion has run and you see yourself edging toward the code, stop: the design is not settled until both halves are closed with the user, and no edit lands before that. Treat the pull toward editing as the signal that the design is *not yet* done — stay in the design rather than drifting toward an edit.

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

### Git staging

Treat the index as the user's to manage: **never stage or unstage on your own**. Both `git add` (moving work into the index) and `git reset` / `git restore --staged` (moving work back out of it) change what the user has committed there, so either one needs the user's explicit consent *before* you run it. If you believe a staging change is genuinely necessary mid-round, **ask first**; do not run it unprompted.

### Before committing

Before executing `git commit`, **show the proposed commit message and wait for confirmation**. Use Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`, etc.).