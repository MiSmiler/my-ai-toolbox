## Communication Guidelines

Align **one point at a time**. Put a single question or decision to the user, then wait for the answer before raising the next: the reader answers one thing at a time; everything else sits in their head as cognitive load, and the one needing an answer is lost among them. This holds even when a skill's own process calls for a batch of questions.

**Ask before summarising.** When a discussion looks settled, ask whether to summarise and write it only on a yes. An unasked-for summary arrives as a surprise, and can close a branch the user meant to keep open.

## Development habits

### Design before code

Rounds of discussion converging is not the design being settled. Both halves — functional design and interface design — are aligned with the user first, and only then does implementation open; a few rounds is the expected cost, not a delay to be cut short.

So when a design discussion has run and you are ready to start coding, the next move is the `confirm-design` skill: it closes both halves with the user before any edit lands. The user reaches for that skill themselves when they see you edging toward the code — the invocation answers "is the design settled?" with *not yet*, so stay in the design rather than drifting toward an edit.

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

## Agent skills

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
