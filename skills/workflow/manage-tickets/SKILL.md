---
name: manage-tickets
description: Create, update, list, and close tickets in the shared tickets repo mounted at `.tickets/`, and open or close work lines. Use when the user mentions tickets or `.tickets/`, or asks to file, track, or close a work item.
---

# manage-tickets

`.tickets/` in the current working tree is a worktree of the shared tickets repo — tickets and work lines live there.

Read `.tickets/README.md` first: it is the rulebook for that repo, and everything about structure, tickets, and workflow lives in it.

If `.tickets/` is absent, this repo is not set up yet — say so and point the user at the `setup-tickets-repo` skill.
