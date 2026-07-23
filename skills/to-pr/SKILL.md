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

#### 3. Determine linkage keywords

Based on the change type, choose appropriate keywords:
- **Bug fixes**: `fixes #N` or `fix #N`
- **Features**: `closes #N` or `close #N`
- **Documentation**: `resolves #N` or `resolve #N`
- **General**: `relates to #N` (doesn't auto-close)

If commit messages already have keywords, preserve them. If they have bare issue numbers, add appropriate keywords based on change type.

#### 4. Handle no issues found

If no issues are found from any source:
1. Report to user: "I didn't find any issue references in commits, branch name, or our conversation."
2. Ask: "Is this PR related to any issues? If so, please provide the issue numbers. If not, I'll create the PR without issue linkage."
3. Wait for user response:
   - User provides issue numbers → Add them
   - User says "no" / "none" / "no issues" → Proceed without issue linkage
   - User doesn't respond after a reasonable wait → Proceed without issue linkage

#### 5. Create the PR

```bash
# Get default branch dynamically
DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | sed 's/.*: //')

gh pr create \
  --title "<title>" \
  --body "<description>" \
  --base "$DEFAULT_BRANCH"
```

The PR body should include:
- Brief summary of changes
- Issue linkage using determined keywords (e.g., `Fixes #123, Closes #456`)
- Any relevant context from the conversation

---

### Step 2B: Existing PR Flow

#### 1. Get PR details

```bash
gh pr view --json number,title,body,headRefName,baseRefName,state
```

#### 2. Extract referenced issues

Parse the PR body and title for:
- `fixes #N`, `closes #N`, `resolves #N`, `relates to #N`
- Bare `#N` references

#### 3. Validate issues

For each referenced issue, check if it exists and is open:
```bash
gh issue view <number> --json number,title,state
```

#### 4. Report findings

Provide a clear report:

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

#### 5. Suggest fixes

If there are issues with the linkage:
1. Show the current PR body
2. Propose an updated PR body with proper linkage
3. Ask if the user wants to update the PR

```bash
gh pr edit <number> --body "<updated-body>"
```

---

## Important Notes

### Keyword semantics

- `fixes/close/closes` → Auto-close issue when PR merges
- `resolves/resolve` → Auto-close issue when PR merges
- `relates to`, `references` → Links without auto-closing

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

### Platform: body text with `gh` on Windows (Git Bash)

**Do NOT use `--body -` (stdin mode).** Git Bash on Windows routes pipes through a pty that can close stdin before `gh` reads it, resulting in an empty body:

```bash
# ❌ BROKEN on Git Bash — stdin from heredoc / here-string
cat <<'EOF' | gh pr edit 2 --body -
gh issue edit 4 --body - <<<"...content..."
```

**Always pass `--body` as a direct argument instead:**

```bash
# ✅ Short bodies — inline string
gh pr create --title "..." --body "Short body text here"

# ✅ Long / multi-line bodies — write to file, pass via command substitution
gh pr edit 2 --body "$(cat path/to/body.md)"
```

This applies to all `gh` commands that accept `--body`: `pr create`, `pr edit`, `issue create`, `issue edit`.

### Communication style

- Be clear about what was found and where
- Explain the linkage keyword choices
- When suggesting updates, show before/after
- Respect user's choice if they say "no issues"