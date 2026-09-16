---
name: simple-subagent
description: Dispatch a subagent — run a brief in an isolated `pi` subprocess and take its report back word for word. Use when work should run in a separate process rather than in this conversation — an independent review axis, a fact to look up while the user waits, a background agent for a design alternative, or any exploration the main context should not see. It researches and reports; it never implements.
---

# Simple Subagent

A **brief** goes into an isolated `pi` subprocess; a **report** comes back.

The subprocess starts with a fresh context: it sees the repo and the brief, never this conversation. That isolation is the point — the report is an independent read, and nothing but the brief steers it. It researches and reports; it never implements. One brief per dispatch.

## 1. Compose the brief

Fill this skeleton. Every fixed clause stays as written; the slots carry the task.

```
<Task — what to find out, and the commands or paths that carry it.>
<Report — what to cover, and how long.>

Research and report only. Read and run read-only commands (git, grep, ls); the working tree stays untouched. Stop after reporting — dispatch nothing further. Write the whole report in your final message: anything said before it is dropped.
```

`<Report>` is also where a claim carries its evidence: code claims cite `file:line`, behaviour claims cite the command that showed it.

**Done when:** every slot carries task-specific detail and the fixed clauses are intact.

## 2. Write the brief to a temp file

```bash
BRIEF="$(mktemp)"
cat > "$BRIEF" <<'EOF'
<the brief from step 1>
EOF
```

`mktemp` gives a unique path, and the quoted heredoc keeps backticks and quotes literal. The file survives the run, so a failed dispatch can be read back verbatim.

**Done when:** `$BRIEF` holds the whole brief.

## 3. Dispatch

```bash
ERR="$(mktemp)"
REPORT="$(pi -p --no-session --no-skills --tools read,bash "$(cat "$BRIEF")" 2>"$ERR")"
STATUS=$?
```

`--no-session` keeps the run out of session storage, `--no-skills` stops the subprocess from discovering this skill and fanning out into more of them, and `--tools read,bash` is the whole toolset a research run needs. One brief per dispatch; N reports take N dispatches, one after the other.

**Done when:** the subprocess has exited and `$STATUS`, `$REPORT` and `$ERR` are all in hand.

## 4. Hand back the report

- `$STATUS` is 0 and `$REPORT` is non-empty → it is the report. Hand it back word for word; it is the caller's material, not something to summarize or merge.
- Anything else → hand back `$STATUS`, `$ERR` and `$REPORT` as they are. The caller judges what a failed dispatch means, and a gap reported is a finding.
