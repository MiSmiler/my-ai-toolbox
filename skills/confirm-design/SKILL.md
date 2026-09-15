---
name: confirm-design
description: Close out the design of the work in hand — both functional design and interface design — by grilling the gaps and settling the seam and interface contract. Use when a design discussion has run and is about to be written down or built, when a spec or tickets are due, or when the user asks to confirm the current design.
---

# Confirm Design

Close the design of the work in hand, then hand back a summary the user has accepted.

A design has two halves. Both must be present before this skill is done, and both are what the rest of the chain builds from:

- **Functional design** — what the work does, grouped by function, and where its edges are.
- **Interface design** — the seams the work is cut at, and the contract at each seam.

A design is written in the project's own nouns, taken from `CONTEXT.md`, and stands alongside the ADRs touching this area — one it reopens gets named as reopened.

`codebase-design` is the reference for the vocabulary: **module**, **interface**, **depth**, **seam**, **adapter**. Consult it when the shape of a module is the open question. It is a reference, not a process; this skill is the process.

## 1. Check coverage

If a spec file already exists for this work, it passed this gate when it was written. Read it as the design, and take the conversation as the later word: where the two disagree, the conversation wins, and the summary carries the design as it now stands.

Otherwise, read the conversation for both halves. One half without the other is the design that produces code nobody wants: functional design alone gives nobody a contract to build against, interface design alone leaves the work's edges unstated.

A seam is finished only when its contract is sayable in full:

- signature or type shape
- invariants
- ordering constraints
- error modes

A functional item whose contract cannot be stated yet is a gap, not a finished item. Send it to the grilling round.

**Done when:** each half is complete, or its gaps are named.

## 2. Grill the gaps

Work the gaps the way `grilling` does: map them as a design tree, put the whole **frontier** to the user in one round — each question numbered, each with a recommended answer — then wait, recompute, and ask the next round.

Facts to look up are yours to find, never the user's. Decisions are theirs to make.

**Done when:** the frontier is empty — nothing about either half is left silently assumed.

## 3. Settle the contract

Draft the seams and the interface at each seam. Take the highest seam that works and the fewest that work; one is the target. Prefer a seam the codebase already has over a new one. Put the draft to the user.

**Done when:** the user has accepted the contract, with their corrections applied. A drafted contract is not an accepted one; wait for their word before moving on.

## 4. Hand back the summary

Output the confirmed design in the conversation:

```markdown
## Functional Design

<what the work does, grouped by function>

## Code Design

### Seams

<each seam: where it is, and why it sits there>

### Interfaces

<each seam's contract: signature or type shape, invariants, ordering constraints, error modes>
```

The summary stays in the conversation, and there the design is done. Carrying it further follows the user's intent, not this skill's initiative:

- Aligning on the design in the conversation and stopping there is a finished run. A design discussed without a spec is a complete outcome, not an unfinished one.
- Writing it into a spec file is `to-designed-spec`'s job, and it happens when the user wants a spec — not because this skill finished.
- When a spec for this work already exists, keeping it in step with the confirmed design is fair game: fold the changes into it, or say what changed and let the user decide.
- Cutting it into tickets is `to-designed-tickets`'s job, and only when the user asks for them.

**Done when:** the summary is in the conversation.
