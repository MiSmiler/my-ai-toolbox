---
name: setup-tickets-repo
description: Give this code repo its Tickets Repo — the `.tickets/` worktree of the shared tickets repo, this repo's own `dev/` branch, and the two pointers from the main repo.
disable-model-invocation: true
---

# Setup Tickets Repo

Hand the current code repo a **Tickets Repo** and the two pointers that make it findable. The Tickets Repo is a worktree of one tickets repo shared by several code repos on this machine; that repo already exists and belongs to the user, so this skill only branches and appends. The commit and the push stay with the user.

## How each step runs

Two rules hold across the whole run:

- Every step that changes something says what it is about to do and waits for a yes. Reading — listing branches, inspecting files — needs no confirmation.
- A check that fails is a report, not an exit. The run pauses, the user decides, and it resumes once they have.

`<tickets repo>` below is the path from step 1. `<code repo>` is the name this code repo goes by in branch names — its directory name, unless the user picks another at step 4.

## 1. Take the tickets repo

Ask the user for the path of the tickets repo — the single one shared across this machine's code repos. Confirm it is a git repo:

```sh
git -C <tickets repo> rev-parse --show-toplevel
```

Consuming that repo is this skill's job; creating it is the user's — never clone it, never init it.

**Done when:** the path the user gave resolves to a git repo.

## 2. Fetch

Announce and confirm, then:

```sh
git -C <tickets repo> fetch --all --prune
```

Pruning is not cosmetic: without it, branches deleted on the shared remote linger as `origin/*` and step 3 reads them as real.

Offline or missing credentials are reported, and the run waits — every reading below trusts remote-tracking refs.

**Done when:** the command exits 0.

## 3. Explore

Read-only, so nothing to confirm. Four readings feed step 4.

**What `.tickets/` is** — one of five:

| `.tickets/` | state |
| --- | --- |
| absent, no worktree naming this path | fresh |
| a worktree of the tickets repo | repair |
| a git repo that is not that worktree | conflict |
| not a git repo | conflict |
| absent, a prunable worktree still naming this path | fresh, prunable |

`git -C <tickets repo> worktree list --porcelain` lists every worktree of the tickets repo, marking a prunable one on a `prunable` line with its reason. One naming `<code repo>/.tickets` is what step 4 prunes.

**The two alignments** — each reads as *ahead behind*:

```sh
git -C <tickets repo> rev-list --left-right --count main...origin/main
git -C <tickets repo> rev-list --left-right --count dev/<code repo>...origin/dev/<code repo>
```

`0 0` is aligned. A branch missing on one side, a count that is not `0 0`, and a failed lookup are all unaligned.

**The branches** — every branch, local and remote-tracking, with the ones another worktree holds marked: `dev/haha (used by D:/proj/other/.tickets)`.

**The two pointers** — does `.gitignore` carry `/.tickets/` in any form? Does `AGENTS.md` carry `## About tickets repo`?

**Done when:** the state is one of the five, each alignment has an answer, every branch is known with its holder if any, and each pointer is known present or missing.

## 4. Act

**Unaligned** — report and wait. Setting it right is the user's move; the run resumes once both counts read `0 0`. Which side is which decides the wording:

| reading | report |
| --- | --- |
| `main` off `origin/main` | both counts; the base is not settled |
| `dev/<code repo>` off on both sides | both counts; the two copies disagree |
| only `origin/dev/<code repo>` exists | that copy, recommending it as the one to take |
| only local `dev/<code repo>` exists | that branch, holding commits never pushed |

Branches another worktree holds are not on offer — taking one fails. They appear marked, for the user to see who holds them.

**Conflict** — report what `.tickets/` is and wait for the user's call, touching nothing. The directory may hold tickets that were never pushed.

**Fresh** — build the Tickets Repo. The branch decides the shape:

- `dev/<code repo>` aligned on both sides → take it: `git -C <tickets repo> worktree add <code repo>/.tickets dev/<code repo>`
- the user chose to create it → `git -C <tickets repo> worktree add -b dev/<code repo> <code repo>/.tickets main`
- the user chose another branch → `-b <branch>` when only its remote side exists, naming it bare when the local branch is already there

A prunable worktree naming this path blocks the build — `fatal: '<code repo>/.tickets' is a missing but already registered worktree`. Clear it first:

```sh
git -C <tickets repo> worktree prune
```

That is a write, so it takes its own yes. Announce the build, confirm, and run.

A `.tickets/README.md` still missing afterwards means the base branch carries no rulebook — report that, since step 5 promises one.

**Repair** — `.tickets/` already stands as this tickets repo's worktree. Audit and report what is missing: a pointer, or the branch it sits on. Announce only the missing pieces, confirm, and touch only those.

**Done when:** `git -C .tickets rev-parse --show-toplevel` prints the `.tickets/` directory itself, and `git -C .tickets branch --show-current` prints the agreed branch.

## 5. Point

Announce both and take one yes:

- Append `/.tickets/` to `.gitignore`, creating the file when absent — unless step 3 found it already covered.
- Append this to the end of `AGENTS.md`, creating the file when absent:

```md
## About tickets repo

Tickets live in `.tickets/` — a git repo of its own inside this working tree. A ticket change is a commit in that repo, never in this one. Nothing in this repo cites it — no comment, doc comment, test name, error message or ADR.

It is a worktree of the tickets repo: teardown belongs there.

`.tickets/README.md` is the rulebook for that repo — read it before touching anything there.
```

**Done when:** both files carry their addition.
