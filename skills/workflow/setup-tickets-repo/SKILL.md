---
name: setup-tickets-repo
description: Give this code repo its Tickets Repo — the `.tickets/` worktree of the shared tickets repo, this repo's own `dev/` branch, and the two marks from the main repo.
disable-model-invocation: true
---

# Setup Tickets Repo

Hand the current code repo a **Tickets Repo** and the two marks that make it findable. The Tickets Repo is a worktree of one tickets repo shared by several code repos on this machine; that repo already exists and belongs to the user, so this skill only branches and appends. The commit and the push stay with the user.

## How each step runs

Two rules hold across the whole run:

- Every step that changes something says what it is about to do and waits for a yes. Reading inside the tickets repo and this code repo — listing branches, inspecting files — needs no confirmation.
- A check that fails is a report, not an exit. The run pauses, the user decides, and it resumes once they have.

`<tickets repo>` is the absolute path from step 1; `<code repo>` is this code repo's absolute path. Both are never written relative: `-C` moves the working directory first, so a relative path beside it resolves against the tickets repo. `dev/<code repo>` is the only branch this code repo ever uses — the last segment of that path; the tickets repo's other `dev/*` branches belong to other code repos.

## 1. Take the tickets repo

Ask the user for the tickets repo's absolute path and wait for their answer. The path comes from them, in conversation — reaching it is asking, never searching the machine. Confirm it is a git repo:

```sh
git -C <tickets repo> rev-parse --show-toplevel
```

Consuming that repo is this skill's job; creating it is the user's — never clone it, never init it.

**Done when:** the path the user gave resolves to a git repo.

## 2. Fetch

**You report** the confirm line, and run on a yes:

```
Fetch <tickets repo> with --all --prune? (y/n)
```

```sh
git -C <tickets repo> fetch --all --prune
```

Pruning is not cosmetic: without it, branches deleted on the shared remote linger as `origin/*` and Explore reads them as real.

Offline or missing credentials: report the error as it came, followed by —

```
This fetch failed, so every reading below trusts stale remote-tracking refs. Fix it and say done.
```

**Done when:** the command exits 0.

## 3. Explore

Read-only, so nothing to confirm. Three readings feed Setup the worktree.

**What `.tickets/` is** — one of five, each with the sentence reported to the user:

| `.tickets/` | state | report |
| --- | --- | --- |
| absent, no worktree naming this path | fresh | This repo has no `.tickets/` yet. |
| a worktree of the tickets repo | repair | `.tickets/` already stands as this tickets repo's worktree. |
| a git repo that is not that worktree | conflict | `.tickets/` is a git repo, but not this tickets repo's worktree. |
| not a git repo | conflict | `.tickets/` exists but is not a git repo. |
| absent, a prunable worktree still naming this path | fresh, prunable | This repo has no `.tickets/`, but a stale worktree entry still names the path. |

`git -C <tickets repo> worktree list --porcelain` lists every worktree of the tickets repo, marking a prunable one on a `prunable` line with its reason. One naming `<code repo>/.tickets` is what Setup the worktree prunes.

**The two alignments** — each reads as *ahead behind*:

```sh
git -C <tickets repo> rev-list --left-right --count main...origin/main
git -C <tickets repo> rev-list --left-right --count dev/<code repo>...origin/dev/<code repo>
```

`0 0` is aligned. A branch that exists on both sides with a count other than `0 0` is unaligned, and so is one that exists on only one side. A branch that exists on neither side is not an alignment at all — it is the fresh path in Setup the worktree.

**The branches** — every branch, local and remote-tracking, with the ones another worktree holds marked in parentheses: `dev/haha (D:/proj/other/.tickets)`. The other `dev/*` branches are reported for awareness only.

**You report** the three readings under three headings — the two alignments are not repeated under Other branches:

```md
### .tickets/
<the state's report sentence from the table above>

### Alignment
main...origin/main                         <ahead> <behind>
dev/<code repo>...origin/dev/<code repo>   <ahead> <behind>

### Other branches
<branch> (<holder>)
```

**Done when:** the state is one of the five, each alignment has an answer, and every branch is known with its holder if any.

## 4. Setup the code repo

Compare each mark against the text below, verbatim:

- `.gitignore` — does it carry `/.tickets/`?
- `AGENTS.md` — does it carry the `## About tickets repo` section?

**You report** each mark's status, and take one yes:

```md
### .gitignore
/.tickets/ — already there | missing | differs

### AGENTS.md
## About tickets repo — already there | missing | differs
<diff, only when it differs>
```

Both already there → no ask, and the report ends `→ next: setup the worktree`. Otherwise it ends:

```
→ write the missing / differing entries? (y/n)
```

A mark already carrying the text verbatim is left alone; one that mismatches is reported with its diff, and the user decides whether to overwrite it.

- Append `/.tickets/` to `.gitignore`, creating the file when absent.
- Append this to the end of `AGENTS.md`, creating the file when absent:

```md
## About tickets repo

Tickets live in `.tickets/` — a git repo of its own inside this working tree. A ticket change is a commit in that repo, never in this one. Nothing in this repo cites it — no comment, doc comment, test name, error message or ADR.

It is a worktree of the tickets repo: teardown belongs there.

`.tickets/README.md` is the rulebook for that repo — read it before touching anything there.
```

**Done when:** each mark either carries the prescribed text verbatim, or the user declined the overwrite and it keeps what it had.

## 5. Setup the worktree

**Unaligned** — report and wait. Setting it right is the user's move; the run resumes once both counts read `0 0`. The reading decides the line:

```md
### Unaligned
main — <ahead> ahead, <behind> behind origin/main (the base is not settled)

### Unaligned
dev/<code repo> — <ahead> ahead, <behind> behind origin/dev/<code repo> (the two copies disagree)

### Unaligned
dev/<code repo> — only origin/dev/<code repo> exists

### Unaligned
dev/<code repo> — only the local branch exists, holding commits never pushed
```

Branches another worktree holds are not on offer — taking one fails. They appear marked, for the user to see who holds them.

**Conflict** — report and wait for the user's call, touching nothing:

```md
### Conflict
<the state's report sentence> — it may hold tickets never pushed.

### Conflict
<the state's report sentence>
```

**Fresh** — build the Tickets Repo. The branch decides the shape:

- `dev/<code repo>` aligned on both sides → take it: `git -C <tickets repo> worktree add <code repo>/.tickets dev/<code repo>`
- `dev/<code repo>` exists on neither side → this is the first setup for this code repo. On a yes, create it: `git -C <tickets repo> worktree add -b dev/<code repo> <code repo>/.tickets main`

**You report**, matching the branch:

```md
### Fresh
dev/<code repo> is aligned on both sides.
→ build .tickets/ from dev/<code repo>? (y/n)

### Fresh
No dev/<code repo> exists on either side — this is the first setup for this repo.
→ create it from main? (y/n)
```

A prunable worktree naming this path blocks the build — `fatal: '<code repo>/.tickets' is a missing but already registered worktree`. Clear it first:

```sh
git -C <tickets repo> worktree prune
```

That is a write, so it takes its own yes — and it prunes every prunable worktree of the tickets repo, not only this one, so the announcement says so:

```md
### Fresh
This prunes every prunable worktree of the tickets repo, not only this one.
→ prune? (y/n)
```

A `.tickets/README.md` still missing afterwards means the base branch carries no rulebook — report that, since Setup the code repo promises one:

```md
### Fresh
Built .tickets/, but it carries no README.md — the base branch has no rulebook.
```

**Repair** — `.tickets/` already stands as this tickets repo's worktree. **You report** the branch it sits on, then the mismatch if there is one:

```md
### Repair
.tickets/ stands as this tickets repo's worktree, on dev/<code repo>.

### Repair
.tickets/ stands as this tickets repo's worktree, on <other branch>.
→ check out dev/<code repo>? (y/n)
```

Announce only what needs touching, confirm, and touch only that.

**Done when:** `git -C <code repo>/.tickets rev-parse --show-toplevel` prints the `.tickets/` directory itself, and `git -C <code repo>/.tickets branch --show-current` prints `dev/<code repo>`.
