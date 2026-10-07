---
name: setup-tickets-repo
description: Give this code repo a `.tickets/` worktree of the shared tickets repo.
disable-model-invocation: true
---

# Setup Tickets Repo

Give this code repo a `.tickets/` worktree of the shared tickets repo, plus the two entries in this repo that make it findable.

The tickets repo already exists and belongs to the user; it is shared by several code repos on this machine. Its path comes from the user, in conversation — never search the machine for it. This run never creates it.

`<code repo>` is this repo's absolute path, and its last segment names the branch: `.tickets/` binds to `dev/<code repo>` in the tickets repo. The other `dev/*` branches there belong to other code repos.

`-C` moves the working directory first, so a path beside it is always written absolute — relative would resolve against the tickets repo.

## How to run

```
1  check ticket repo
2  check code repo
3  build code repo
4  build ticket repo
5  confirm
```

Three rules hold across all five.

**One step at a time.** A step ends the moment its report is on screen — one step per turn. Do the work, report it, stop; the user answers or acknowledges, and the next step starts only then. Read-only steps wait their turn like the rest.

**The user decides; this run executes.** Every change is a decision point: lay out the situation, propose the move, ask, and act on the yes. Only changes ask; reading needs no permission.

**A bad reading is a report, not an exit.** When something is off — no `dev/<code repo>`, a `main` out of step, a `.tickets/` belonging to some other repo — say so, propose how to handle it, and let the user decide whether the run goes on.

Report each step in two parts: the situation, as a short list of points; then, under its own heading, the decisions waiting on the user, each with the move proposed. When nothing needs deciding, the situation alone.

## 1. check ticket repo

Ask for the tickets repo's absolute path and wait. Confirm it is a git repo:

```sh
git -C <tickets repo> rev-parse --show-toplevel
```

Then offer the fetch — the user takes it or skips it:

```sh
git -C <tickets repo> fetch --all --prune
```

Pruning keeps the view honest: without it, branches deleted on the shared remote linger as `origin/*`. When the user skips the fetch, say that the readings below rest on remote-tracking refs that may be out of date.

Now read three things, and report which branch `.tickets/` will bind to.

**`.tickets/`** — the state of the path in the code repo:

```
absent, no worktree names this path    build it — from dev/<code repo>, or from main when that branch is new
this tickets repo's worktree           leave it alone, unless it sits on another branch — then offer to check out dev/<code repo>
a git repo, but not that worktree      touch nothing, ask the user what to do
exists, but not a git repo             touch nothing, ask the user what to do
absent, a prunable worktree names it   offer to prune — this clears every prunable worktree of the tickets repo, not only this one
```

`git -C <tickets repo> worktree list --porcelain` lists the worktrees; a prunable one is marked on a `prunable` line with its reason.

**`dev/<code repo>`** — whether the branch exists, and whether another worktree holds it. A held branch cannot be taken: `git worktree add` refuses it. Report the holder and ask the user what to do.

**`main`** — how it stands against `origin/main`. When the two differ, say how and propose the move; the user decides, and the run goes on either way.

```
behind     offer to fast-forward local main to origin/main
ahead      name the commits origin is missing, and offer to push them
diverged   offer the choice — rebase local main onto origin/main, or merge origin/main into it
```

A `dev/<code repo>` that exists but no longer sits on `main`'s tip can be offered a rebase onto `main`. A rebase rewrites the branch's history, so a force-push follows — offered, never automatic.

**Done when:** the readings are in hand, and every decision they raised has been put to the user and answered.

## 2. check code repo

Read two files, and compare each against the text below, verbatim:

- `.gitignore` — does it carry `/.tickets/`?
- `AGENTS.md` — does it carry the `## About tickets repo` section?

Each lands in one of three states:

```
missing    offer to add it
differs    show the difference, offer to overwrite it with the text below
verbatim   leave it alone
```

The `.gitignore` line is `/.tickets/`. The `AGENTS.md` section is:

```md
## About tickets repo

Tickets live in `.tickets/` — a git repo of its own inside this working tree. A ticket change is a commit in that repo, never in this one. Nothing in this repo cites it — no comment, doc comment, test name, error message or ADR.

It is a worktree of the tickets repo: teardown belongs there.

`.tickets/README.md` is the rulebook for that repo — read it before touching anything there.
```

**Done when:** both files have been read, and each state has been put to the user and answered.

## 3. build code repo

Write what the user agreed to write, and nothing else. Create either file when it is absent. A file the user declined keeps what it had.

**Done when:** every agreed entry is in place, or the user declined both and the files are untouched.

## 4. build ticket repo

Carry out the decisions step 1 left, touching nothing else. Depending on them, this is some of:

- create the worktree: `git -C <tickets repo> worktree add <code repo>/.tickets dev/<code repo>`, or, for a new branch, `git -C <tickets repo> worktree add -b dev/<code repo> <code repo>/.tickets main`
- check out `dev/<code repo>` in a `.tickets/` that stands on another branch
- prune a prunable worktree naming the path: `git -C <tickets repo> worktree prune`
- fast-forward, rebase, or push, as the user agreed

**Done when:** `git -C <code repo>/.tickets rev-parse --show-toplevel` prints the `.tickets/` directory itself and `git -C <code repo>/.tickets branch --show-current` prints `dev/<code repo>` — or the user declined, and `.tickets/` was left as it was.

## 5. confirm

Check that the setup stands, then ask to commit.

`.tickets/` should be a worktree of the tickets repo sitting on `dev/<code repo>`, and both entries should be in place in the code repo. Say plainly what holds and what does not.

Then the git this run owes: the code repo has files this run wrote — ask to commit them, and commit only on a yes. Anything left to push — a new `dev/<code repo>`, a rebased branch, commits `main` is missing from origin — is named and offered in the same pass.
