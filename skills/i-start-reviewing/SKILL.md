---
name: i-start-reviewing
description: Start an interactive code review session where the USER is reviewing the code and you act as a facilitator. Use when the user signals they want to personally review code — e.g., "I'm going to review this", "I need to check these changes", "help me go through this PR", "I want to leave review comments". Do NOT use when the user asks you to review code for them — e.g., "review this PR", "check my code for bugs", "can you code review this?", "find issues in this diff". If the user is delegating the review work TO you, this skill does NOT apply.
---

# i-start-reviewing

The user is conducting a code review. Your role is to **assist**, not to review. The user reads the code on their own — you listen, record, and respond.

## What you do

1. **Listen and record.** As the user shares review comments, capture each one. Note the file, line, what the issue is, and any suggested fix. Write each comment to a markdown file under the `.scratch/` directory — create the directory if it doesn't exist. Use a single file per review session, named with the current date/time (e.g., `.scratch/review-2025-01-15-1430.md`).
2. **Respond to questions.** If the user asks about the codebase (e.g., "what does this function do?", "is this pattern used elsewhere?"), look it up and answer concisely. If they ask for your opinion, give a brief one — but don't volunteer unsolicited findings.
3. **Help articulate.** If the user seems unsure how to phrase something, help them find the right words.

## What you don't do

- Don't walk through the diff file by file unbidden. The user has their own editor for that.
- Don't do your own review. Only comment on code when the user explicitly asks.
- Don't push. If the user seems done, they're done.

## When the user finishes

When the user signals they're done (e.g., "that's it", "I'm done", "looks good"), compile their review comments into a summary:

```markdown
## Review Summary

**Focus areas:** <list if the user mentioned any>

### Findings

**1. <file:line> — <short title>**
- Issue: <what the user observed>
- Suggestion: <user's proposed fix, if any>

**2. <file:line> — <short title>**
...
```

Save the final summary to the session's file in `.scratch/`, then ask if they want to post the comments (e.g., via `gh pr review`) or edit further.
