---
name: to-pr
description: Create a GitHub PR or verify PR's issue linkage. Use when user explicitly invokes /to-pr to create a PR from recent code changes or check an existing PR's issue associations.
disable-model-invocation: true
---

# to-pr

Create or verify GitHub PRs with intelligent issue association.

## When to use

This skill only triggers when the user explicitly invokes `/to-pr`. It handles:
- Creating a PR from recent code changes with automatic issue linkage
- Verifying that an existing PR properly references related issues

## Workflow

### Step 1: Check current state

First, determine the current state:

```bash
# Check if there's already a PR for current branch
gh pr view --json number,url,title,body,state 2>/dev/null
```

- If this succeeds → **Existing PR flow**
- If this fails (no PR exists) → **New PR flow**

---

### Step 2A: New PR Flow

#### 1. Gather context

Collect information from multiple sources:

**a) Branch name** - Extract potential issue numbers:
```bash
git branch --show-current
# Patterns: issue-123, feature/456-add-login, fix-789, 123-some-desc
```

**b) Commit messages** - Look for issue references and keywords:
```bash
git log origin/main..HEAD --oneline
# Look for: #123, fixes #456, closes #789, issue-123, etc.
```

**c) Conversation context** - Scan the conversation for mentioned issue numbers.

**d) Changed files** - Understand what changed:
```bash
git diff origin/main...HEAD --stat
git log origin/main..HEAD --pretty=format:"%s%n%b"
```

#### 2. Extract and validate issues

Parse all sources for issue numbers:
- `fixes #123`, `closes #456`, `resolves #789`
- `#123`, `#456` (without keyword)
- Branch names with issue numbers

For each potential issue, verify it exists:
```bash
gh issue view 123 --json number,title,state 2>/dev/null
```

#### 3. Ask for the language

Before drafting the PR title and body, ask the user which language to use for the PR copy. Ask it as a single frontier question with a recommended default:

- **Language** — the language of the PR title and body. Recommend English; the user may pick another (e.g., Chinese).

The chosen language also governs the report and any proposed body edits in the Existing PR flow (Step 2B).

#### 4. Determine linkage keywords

Based on the change type, choose appropriate keywords:
- **Bug fixes**: `fixes #N` or `fix #N`
- **Features**: `closes #N` or `close #N`
- **Documentation**: `resolves #N` or `resolve #N`
- **General**: `relates to #N` (doesn't auto-close)

If commit messages already have keywords, preserve them. If they have bare issue numbers, add appropriate keywords based on change type.

#### 5. Handle no issues found

If no issues are found from any source:
1. Report to user: "I didn't find any issue references in commits, branch name, or our conversation."
2. Ask: "Is this PR related to any issues? If so, please provide the issue numbers. If not, I'll create the PR without issue linkage."
3. Wait for user response:
   - User provides issue numbers → Add them
   - User says "no" / "none" / "no issues" → Proceed without issue linkage
   - User doesn't respond after a reasonable wait → Proceed without issue linkage

#### 6. Confirm the title and body

Draft the PR title and body (in the chosen language), then show the complete title and body and ask to proceed (`y`) or abandon/edit (`n`).

- `y` → Create the PR (step 7)
- `n` → Let the user revise the title and/or body, or abandon the operation

#### 7. Create the PR

```bash
# Get default branch dynamically
DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | sed 's/.*: //')
```

Write the body to a temp file, then create the PR:

```bash
BODY_FILE="$(mktemp)"
# write the body into $BODY_FILE

gh pr create \
  --title "<title>" \
  --body-file "$BODY_FILE" \
  --base "$DEFAULT_BRANCH"
```

The PR body should include:
- Brief summary of changes
- Issue linkage using determined keywords (e.g., `Fixes #123, Closes #456`)
- Any relevant context from the conversation

---

### Step 2B: Existing PR Flow

#### 1. Ask for the language

Ask the user which language to use for the report and any proposed body edits. Recommend English; the user may pick another (e.g., Chinese).

#### 2. Get PR details

```bash
gh pr view --json number,title,body,headRefName,baseRefName,state
```

#### 3. Extract referenced issues

Parse the PR body and title for:
- `fixes #N`, `closes #N`, `resolves #N`, `relates to #N`
- Bare `#N` references

#### 4. Validate issues

For each referenced issue, check if it exists and is open:
```bash
gh issue view <number> --json number,title,state
```

#### 5. Report findings

Provide a clear report (in the chosen language):

```
PR #<number> Issue Linkage Report:

✅ Properly linked:
  - Fixes #123: Bug in login flow (open)
  - Closes #456: Add user dashboard (open)

⚠️  Issues found:
  - #789: Issue not found or doesn't exist

ℹ️  Notes:
  - Issue #999 is already closed

❌ Missing linkage:
  - Branch name suggests issue #111 but PR doesn't reference it
  - Commit 'abc1234' mentions #222 but PR doesn't reference it
```

#### 6. Suggest fixes

If there are issues with the linkage:
1. Show the current PR body
2. Propose an updated PR body with proper linkage (in the chosen language)
3. Ask if the user wants to update the PR — show the before/after and gate on `y`/`n`:
   - `y` → Update the PR body
   - `n` → Leave the PR as-is, or let the user revise the proposed body

Write the proposed body to a temp file, then update the PR:

```bash
BODY_FILE="$(mktemp)"
# write the proposed body into $BODY_FILE

gh pr edit <number> --body-file "$BODY_FILE"
```

---

## Important Notes

### Keyword semantics

- `fixes/close/closes` → Auto-close issue when PR merges
- `resolves/resolve` → Auto-close issue when PR merges
- `relates to`, `references` → Links without auto-closing

### Closing multiple issues

When a PR should close **multiple** issues, repeat the keyword for **each** issue number. A single keyword followed by a comma-separated list only closes the first one:

- ✅ `Closes #1, Closes #2` — closes both #1 and #2
- ❌ `Closes #1, #2` — closes only #1; #2 is merely linked

Same rule applies to the other keywords (`fixes #1, fixes #2`, `resolves #1, resolves #2`, etc.).

### Issue detection patterns

```regex
# Common patterns:
fixes #123, fix #123
closes #456, close #456
resolves #789, resolve #789
#123, #456

# Branch patterns:
issue-123, feature/456, fix-789, 123-description
```

### Git context

Always compare against the main branch (or the default branch):
```bash
git remote show origin | grep "HEAD branch"
```

### Body text with `gh`

Use `--body-file`, never `--body -`: `gh` reads the file directly, avoiding the stdin/pty pitfall on every platform.

### Communication style

- Be clear about what was found and where
- Explain the linkage keyword choices
- When suggesting updates, show before/after
- Respect user's choice if they say "no issues"
