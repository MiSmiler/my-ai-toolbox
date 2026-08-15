---
name: report-issues
description: Interview you step by step to sharpen a problem into a GitHub issue, then create it in the current repo.
disable-model-invocation: true
---

# report-issues

Interview the reporter to sharpen a problem into a well-formed GitHub issue, then create it in the repo of the current working directory. The interview asks the whole open frontier in one round: number each question, and give a recommended answer. Here the recommended answer is a proposed draft for one section of the issue.

The skill reports problems. It does not ask how to fix anything, and it does not propose or analyze fixes. If the reporter offers a fix idea, record it in the issue as given.

One issue per invocation.

## Prerequisites

- `gh` installed and authenticated (`gh auth status`).
- Current directory inside a git clone with a GitHub remote.

## Workflow

### Step 1: Resolve the target repo

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner
```

- On success, capture `REPO="owner/repo"`.
- On failure (e.g. `not a git repository`, or `gh` not authenticated), stop and report the error. Do not guess a repo.

Done when `REPO` is captured or the session has stopped.

### Step 2: Open with a free-form description

Ask the reporter to describe the problem in their own words — one sentence to a short paragraph. Do not structure it yet; capture it verbatim.

Done when the reporter has described the problem.

### Step 3: First frontier round — type and language

Ask these two questions together, numbered, each with a recommended answer:

1. **Type** — bug, enhancement, or neither. Recommend one from the description.
2. **Language** — the language of the issue title and body. Recommend English; the reporter may pick another.

Done when both are decided.

### Step 4: Fill the title and template in rounds

Map the description into the title and the template sections for the chosen type (see [Template](#template)). Work them as a frontier: in each round, ask only the entries still missing or ambiguous — all of them in one round, numbered, each with a proposed draft the reporter can accept or edit. When the title appears in a round, number it first.

Draft the title in the first round, from the reporter's description, alongside every template section. In later rounds, re-propose it only when the accepted sections no longer match it — their meaning changed, not just a cosmetic edit. Treat the title like any other section: the reporter may accept or edit it, and may stop early at any time.

Keep the posture: propose descriptions of the problem, never fixes.

Done when the title and every required section carry text the reporter accepted and nothing is left ambiguous. The reporter may stop early at any time.

### Step 5: Confirm the draft

Show the complete title and body and ask to proceed (`y`) or abandon (`n`).

### Step 6: Create the issue

Write the body to a temp file, then create the issue:

```bash
BODY_FILE="$(mktemp)"
# write the body into $BODY_FILE

TYPE="bug"   # or "enhancement", or "" for neither
LABEL_ARG=""
if [ -n "$TYPE" ] && gh label list --repo "$REPO" --json name --jq '.[].name' | grep -qx "$TYPE"; then
  LABEL_ARG="--label $TYPE"
fi

gh issue create --repo "$REPO" --title "<title>" --body-file "$BODY_FILE" $LABEL_ARG
```

- Apply a label only for bug or enhancement; if the target repo lacks that label, drop it silently.
- Use `--body-file`, never `--body -`: gh reads the file directly, avoiding the Windows Git Bash stdin/pty pitfall on every platform.

### Step 7: Report

Report the created issue number and URL.

## Template

Title: a concise, specific summary. No type prefix — the label carries the type.

Any type may carry an optional `## Possible fix` section — present only when the reporter supplied a fix idea; record it as given.

Bug:

```
## Summary
## Steps to reproduce
## Expected
## Actual
## Environment
```

`Environment` only when relevant (OS, version, branch, …). Drop it otherwise.

Enhancement:

```
## Summary
## Motivation
## Desired outcome
```

`Desired outcome` stays at the user level (what good looks like), never implementation.

Neither bug nor enhancement: `## Summary` only, and no type label.
