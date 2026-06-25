---
name: clean-after-pr-merged
description: Clean up local worktree and branch after a PR is merged. 
disable-model-invocation: true
---

# Clean After PR Merged

This skill cleans up the local worktree and branches after a GitHub PR has been merged.

## Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- Current directory must be in a git repository

## Workflow

### Step 1: Identify the PR

**Check conversation context first.** Look for:
- PR number mentioned in previous messages (e.g., "PR #42", "pr 42")
- Branch names discussed (e.g., "feature-xyz branch")
- GitHub PR URLs

**If context is found:**
- Extract PR number and proceed to Step 2

**If no context is found:**
- Prompt the user: "Please provide the PR number (e.g., 42)"
- Wait for user input, then proceed to Step 2

### Step 2: Verify PR is Merged

**This is a required pre-check.** Before any further processing:

```bash
gh pr view <PR_NUMBER> --json state,mergedAt,headRefName
```

Check that:
- `state` is `MERGED`
- `mergedAt` has a valid timestamp

**If PR is NOT merged:**
- **STOP immediately** and report error:
  ```
  Error: PR #<NUMBER> has not been merged yet (state: <STATE>).
  Only merged PRs can be cleaned up.
  ```
- Do not proceed to subsequent steps.

**If PR is merged:**
- Continue to Step 3

### Step 3: Gather Cleanup Information

From the PR data, extract:
- **Branch name**: `headRefName` (e.g., `feature-xyz`)

Check for associated worktree:

```bash
git worktree list
```

Look for a worktree path that contains the branch name or matches the PR context.

### Step 4: Check for Uncommitted Changes

**If a worktree exists**, check its status:

```bash
git -C <WORKTREE_PATH> status --porcelain
```

**If there are uncommitted changes:**
- **STOP immediately** and report error:
  ```
  Error: Worktree at <WORKTREE_PATH> has uncommitted changes:
    - modified: <file>
    - new file: <file>
    - ...

  Please commit or stash these changes before cleanup.
  ```
- Do not proceed to subsequent steps.

**If no uncommitted changes:**
- Continue to Step 5

### Step 5: Determine Safe Branch to Switch To

Before deleting a branch, you must switch to a safe branch (you cannot delete the current branch).

**Check current branch:**
```bash
git branch --show-current
```

**If currently on the branch to be deleted:**
- Get the repository's default branch:
  ```bash
  gh repo view --json defaultBranchRef --jq .defaultBranchRef.name
  ```
- Plan to switch to this default branch
- If the command fails (e.g., no remote access), ask the user: "Unable to determine default branch. Which branch should I switch to before cleanup?"

### Step 6: Show Confirmation and Request User Approval

Present what will be deleted and ask for confirmation:

```
About to clean up for PR #<NUMBER> (branch: <BRANCH_NAME>):
  - Worktree: <WORKTREE_PATH> (if exists)
  - Local branch: <BRANCH_NAME>
  - Remote branch: origin/<BRANCH_NAME>

Proceed? (y/n)
```

**Wait for user response:**
- If `y`: Proceed to Step 7
- If `n`: Cancel operation and report "Cleanup cancelled by user."

### Step 7: Execute Cleanup

Execute in this order:

**7a. Switch to safe branch** (if currently on the branch to delete)
```bash
git checkout <SAFE_BRANCH>  # default branch or user-specified
```

**7b. Remove worktree** (if exists)
```bash
git worktree remove <WORKTREE_PATH>
```

**7c. Delete local branch**
```bash
git branch --delete <BRANCH_NAME>
```

**7d. Delete remote branch**
```bash
git push origin --delete <BRANCH_NAME>
```

**Note:** If remote branch is already deleted (GitHub auto-delete on merge), this command may fail. Treat this as normal and continue.

### Step 8: Report Results

Summarize what was cleaned up:

```
✓ Cleanup complete for PR #<NUMBER>
  - Removed worktree: <WORKTREE_PATH>
  - Deleted local branch: <BRANCH_NAME>
  - Deleted remote branch: origin/<BRANCH_NAME>

Currently on branch: <CURRENT_BRANCH>
```

If remote branch was already deleted:
```
✓ Cleanup complete for PR #<NUMBER>
  - Removed worktree: <WORKTREE_PATH>
  - Deleted local branch: <BRANCH_NAME>
  - Remote branch: already deleted (GitHub auto-cleanup)

Currently on branch: <CURRENT_BRANCH>
```

## Error Handling Summary

| Scenario | Action |
|----------|--------|
| PR not found | Report error, suggest checking PR number or repo access |
| PR not merged | STOP immediately, report error |
| Uncommitted changes in worktree | STOP immediately, report error with file list |
| Unable to determine default branch | Ask user which branch to switch to |
| Worktree not found | Continue with branch cleanup only |
| Local branch not found | Continue with remote cleanup only |
| Remote branch already deleted | Treat as normal, report in final summary |
| Permission denied | Suggest checking GitHub auth |

## Important Notes

- Always verify PR is merged BEFORE any other checks
- Always check for uncommitted changes before cleanup
- Always ask for user confirmation before deleting anything
- Handle cases where some components are already deleted (idempotent behavior)
- One PR per invocation only