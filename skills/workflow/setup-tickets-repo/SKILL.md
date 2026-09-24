---
name: setup-tickets-repo
description: Give this code repo its Tickets Repo — the `.tickets/` clone of the shared tickets remote, this repo's own `dev/` branch, and the two pointers from the main repo.
disable-model-invocation: true
---

# Setup Tickets Repo

Hand the current code repo a **Tickets Repo** and the two pointers that make it findable. The Tickets Repo is a clone of one remote shared by several code repos, and it arrives carrying the rulebook — this skill clones, branches, and appends; the commit and the push stay with the user.

## 1. Explore

Read three targets; `.tickets/` picks the run's branch:

- `.tickets/` — absent (**fresh**), a clone of a tickets remote (**repair**), or a directory that is neither (**conflict**)?
- `.gitignore` — does it already carry `.tickets/` in any form?
- `AGENTS.md` — absent, or carrying `## About tickets repo`?

**Done when:** `.tickets/` is classified fresh, repair, or conflict, and each pointer is known present or missing.

## 2. Confirm

**Fresh** — ask for the tickets remote URL; the remote already exists, so there is none for this skill to create. Offer a branch name `dev/<code repo>`, candidates being the code repo's directory name and its remote repo name — take either, or a custom name. Show one line per thing this run creates: the clone, the branch, the two pointer additions. Wait for acceptance.

**Repair** — audit three things and report each present or missing: `.tickets` carries a remote; the tickets repo rests on its own `dev/` branch; both pointers are present. Ask whether to repair the missing ones, and touch only those. A missing branch takes a name as in fresh.

**Conflict** — report `.tickets/` and stop, leaving the directory untouched; it may hold tickets the user has not pushed.

**Done when:** the user has accepted the fresh list, answered the repair question, or heard the conflict.

## 3. Build the Tickets Repo

Fresh:

```sh
git clone <remote-url> .tickets
git -C .tickets switch -c dev/<code repo>
```

A remote already carrying `origin/dev/<code repo>` needs no `-c`: `git -C .tickets switch dev/<code repo>` lands on it and tracks it.

Repair: only the missing pieces from step 2. A clone bringing no `README.md` means the remote carries no rulebook — report that.

**Done when:** `git -C .tickets rev-parse --show-toplevel` prints the `.tickets/` directory itself, and `git -C .tickets branch --show-current` prints a `dev/` branch.

## 4. Point the main repo at it

Append `/.tickets/` to `.gitignore`, creating the file when absent — unless step 1 found it already covered.

Append this to the end of `AGENTS.md`, creating the file when absent:

```md
## About tickets repo

Tickets live in `.tickets/` — a git repo of its own inside this working tree. A ticket change is a commit in that repo, never in this one. Nothing in this repo cites it — no comment, doc comment, test name, error message or ADR.

`.tickets/README.md` is the rulebook for that repo — read it before touching anything there.
```

**Done when:** both files carry their addition.
