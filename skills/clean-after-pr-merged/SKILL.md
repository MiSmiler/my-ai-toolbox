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
gh pr view <PR_NUMBER> --json state,mergedAt,headRefName,baseRefName
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

### Step 3: Check Current Working Directory

**This is a required safety check.** Check whether the current working directory is inside the PR's associated worktree:

```bash
git worktree list
```

Look for a worktree path that contains the branch name or matches the PR context.

```bash
CWD=$(pwd)
[ "$(realpath "$CWD")" = "$(realpath "<WORKTREE_PATH>")" ]
```

**If CWD matches the worktree path:**
- **STOP immediately** and report error:
  ```
  Error: The worktree at <WORKTREE_PATH> is the current working directory.
  Cannot clean up a worktree that is currently in use by this session.
  Please change to a different directory and try again.
  ```
- Do not proceed to subsequent steps.

**If no worktree is associated with this PR:**
- Skip this check and continue to Step 4.

### Step 4: Gather Cleanup Information

From the PR data, extract:
- **Branch name**: `headRefName` (e.g., `feature-xyz`) — the source branch to delete
- **Base branch**: `baseRefName` (e.g., `main`) — the target branch the PR was merged into

### Step 5: Check for Uncommitted Changes

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
- Continue to Step 6

### Step 6: Determine Safe Branch to Switch To

Before deleting a branch, you must switch to a safe branch (you cannot delete the current branch).

**Check current branch:**
```bash
git branch --show-current
```

**If currently on the branch to be deleted:**
- Use the PR's **base branch** (`baseRefName` from Step 2) as the safe branch — this is the branch the PR was merged into.
- If `baseRefName` is already checked out in another worktree (you'll see this error in Step 8a: `'<baseRefName>' is already used by worktree at '<path>'`), you may skip the checkout step and proceed with worktree removal directly — the base branch is already the active branch in the main worktree.

### Step 7: Show Confirmation and Request User Approval

Present what will be deleted and ask for confirmation:

```
About to clean up for PR #<NUMBER> (merged into: <BASE_BRANCH>):
  - Worktree: <WORKTREE_PATH> (if exists)
  - Local branch: <BRANCH_NAME>
  - Remote branch: origin/<BRANCH_NAME>

Proceed? (y/n)
```

**Wait for user response:**
- If `y`: Proceed to Step 8
- If `n`: Cancel operation and report "Cleanup cancelled by user."

### Step 8: Execute Cleanup

Execute in this order:

**8a. Switch to safe branch** (if currently on the branch to delete)
```bash
git checkout <SAFE_BRANCH>  # baseRefName from Step 2
```
If the checkout fails with `'<SAFE_BRANCH>' is already used by worktree at '<path>'`, this is expected — the base branch is already active in the main worktree. Skip this step and proceed to 8b.

**8b. Remove worktree** (if exists)

Remove the worktree:
```bash
git worktree remove <WORKTREE_PATH> --force
```
The `--force` flag is safe here because Step 5 already confirmed there are no uncommitted changes. It only bypasses the "branch is checked out" restriction — no data will be lost.

**8c. Delete local branch**
```bash
git branch --delete <BRANCH_NAME>
```

**8d. Delete remote branch**
```bash
git push origin --delete <BRANCH_NAME>
```

**Note:** If remote branch is already deleted (GitHub auto-delete on merge), this command may fail. Treat this as normal and continue.

### Step 9: Report Results

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
| CWD is the worktree to be cleaned | STOP immediately, report error |
| Uncommitted changes in worktree | STOP immediately, report error with file list |
| Unable to determine PR base branch | Ask user which branch to switch to |
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
- The safe branch for switching is the PR's **base branch** (`baseRefName`), NOT the repository's default branch — the PR may have been merged into a non-default branch
- `git worktree remove --force` is safe because Step 5 already verified no uncommitted changes exist. The `--force` only bypasses the "branch is checked out" restriction