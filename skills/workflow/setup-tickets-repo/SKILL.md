---
name: setup-tickets-repo
description: Give this code repo a `.tickets/` worktree of the shared tickets repo.
disable-model-invocation: true
---

# Setup Tickets Repo

Bind this code repo to the shared tickets repo through a `.tickets/` worktree, so
tickets live beside the code while git ignores them.

`<code repo>` is this repo's absolute path; its last segment names the branch, so
`.tickets/` sits on `dev/<code repo>`. The tickets repo already exists and belongs
to the user, shared with other code repos — ask for its path, never search.

The run asks the user once: one todo list, one yes or no.

## 1. ask — one turn

Ask for the tickets repo's absolute path, and take the whole path before going on.
Then stop.

## 2. read, then a list — one turn

Read-only, in one pass. `-C` moves the working directory first, so a path beside it
is written absolute — relative would resolve against the tickets repo.

```sh
git -C <tickets repo> rev-parse --show-toplevel
git -C <tickets repo> worktree list --porcelain
git -C <tickets repo> rev-parse --verify --quiet refs/heads/dev/<code repo>
git -C <tickets repo> rev-parse --verify --quiet refs/heads/main
```

Then read `.gitignore` in `<code repo>`.

**The readings.** Name the branch `.tickets/` will bind to, and what each reading
came back as. One table turns the readings into items:

```
.tickets/ absent                           a
this repo's worktree, on dev/<code repo>   —
this repo's worktree, on main              a
not this tickets repo's worktree           blocker — files, or a foreign repo
registered, directory gone                 blocker — a deleted worktree owns it
.gitignore without /.tickets/              b
.gitignore with it                         —
```

`a` puts `.tickets/` on `dev/<code repo>`, in one of two forms — the worktree
added, or a worktree standing on `main` switched over:

```sh
# worktree absent — dev/<code repo> exists, then cut from main
git -C <tickets repo> worktree add <code repo>/.tickets dev/<code repo>
git -C <tickets repo> worktree add -b dev/<code repo> <code repo>/.tickets main

# worktree on main — dev/<code repo> exists, then cut from main
git -C <code repo>/.tickets switch dev/<code repo>
git -C <code repo>/.tickets switch -c dev/<code repo> main
```

`b` is the one line `/.tickets/`, appended to `.gitignore`.

Two blockers sit outside the table: a `dev/<code repo>` another worktree holds —
`worktree add` refuses it — and a tickets repo with no `main`, when `a` has to cut
the branch from it.

**The todo list.** Every item the readings produced, lettered `a`, `b`, `c`, one per
line, each with what carries it out. Then one question: run all of them, yes or no.

A blocker ends the run with nothing touched — say why, and hand the state back to
the user. An empty list says so and ends the run.

**Done when:** the readings, the todo list, and the question are on screen.

## 3. run the list — one turn

Run every item in the list, in order. A command that fails stops the run and leaves
the rest for the user.

**Done when** the list's items hold:

```sh
git -C <code repo>/.tickets rev-parse --show-toplevel   # <code repo>/.tickets
git -C <code repo>/.tickets branch --show-current       # dev/<code repo>
```

Report a line each: what now holds, and that `.gitignore` is left uncommitted.
