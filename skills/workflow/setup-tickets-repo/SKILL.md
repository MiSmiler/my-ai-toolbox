---
name: setup-tickets-repo
description: Give this repo its Tickets Repo — the nested `.tickets/` git repo, its rulebook, and the two pointers from the main repo.
disable-model-invocation: true
---

# Setup Tickets Repo

Give the current repo a **Tickets Repo** and the pointers that make it findable. This skill writes files and runs `git init`; the first commit and the remote stay the user's to make.

## 1. Explore

Read what is already there, and carry the four targets into the steps below:

- `.tickets/` — absent, or a directory that already answers to git?
- `.tickets/README.md` — absent, or does it still match [README_template.md](./README_template.md)?
- `.gitignore` — does it already cover `.tickets/` in any form, or does the line have to be added?
- `AGENTS.md` — absent, or carrying `## About tickets repo`, and does that section still match step 4's block?

**Done when:** every target is known to be missing, already in place, or differing.

## 2. Confirm

Show the user one line per target: what is already there, and what this run would create or overwrite. Each overwrite is named as an overwrite, with what it replaces. Nothing is written before the user has accepted the list.

**Done when:** the user has accepted the list.

## 3. Build the Tickets Repo

```sh
mkdir .tickets
cp <skill-dir>/README_template.md .tickets/README.md
git -C .tickets init
```

`<skill-dir>` is the directory holding this `SKILL.md`. The rulebook is a copy rather than a link, because `.tickets/README.md` is the one file an agent sitting in that repo reads — so an edit to [README_template.md](./README_template.md) reaches a repo by re-running this skill.

**Done when:** `.tickets/README.md` matches the template, and `git -C .tickets rev-parse --show-toplevel` prints the `.tickets/` directory itself rather than the main repo's root.

## 4. Point the main repo at it

Append `/.tickets/` to `.gitignore`, creating the file when absent — unless step 1 found it already covered.

Append this to the end of `AGENTS.md`, creating the file when absent:

```md
## About tickets repo

Tickets live in `.tickets/` — a git repo of its own inside this working tree. A ticket change is a commit in that repo, never in this one. Nothing in this repo cites it — no comment, doc comment, test name, error message or ADR.

`.tickets/README.md` is the rulebook for that repo — read it before touching anything there.
```

**Done when:** both files carry their addition.

