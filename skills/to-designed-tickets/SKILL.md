---
name: to-designed-tickets
description: Break confirmed work into tracer-bullet tickets on the issue tracker, each carrying its slice of the design and its blocking edges.
disable-model-invocation: true
---

# To Designed Tickets

Cut confirmed work into **tickets**: vertical slices, each carrying its slice of the design and naming the tickets that block it.

## 1. Confirm the design

Load the `confirm-design` skill and run it — the same gate as the spec: functional design and interface design, both settled, with the user's word on the contract.

**Done when:** it has handed back a design the user accepted. Otherwise stop here.

## 2. Read the spec, if there is one

If the user passed a spec path, or `docs/specs/<feature-slug>.md` exists for the current branch, read it in full. Its **Functional Design** is the raw material for each ticket's `What to build`; its **Code Design** is the raw material for each ticket's `Interface` and acceptance criteria.

Some work is cut without a spec, the design living in the conversation. Then the conversation is the source.

**Done when:** the source material is read, or its absence is established.

## 3. Cut vertical slices

<vertical-slice-rules>

- Each slice cuts a narrow but complete path through every layer it needs: vertical, not one layer of the change.
- A finished slice is demonstrable on its own.
- Each slice fits one fresh context window.
- Prefactoring goes first.
- Each slice is cut along a **seam** from the design, so the contract it builds against is one the user agreed to.

</vertical-slice-rules>

A **wide refactor** is the exception: one mechanical change whose blast radius fans across the codebase cannot land green as a slice. Sequence it expand–contract — add the new form beside the old, migrate the call sites in batches sized by blast radius, then delete the old form once no caller remains. Each step is its own ticket, with the same blocking edges as any other. When even a batch cannot stay green on its own, keep the sequence but let the batches share an integration branch, and have them all block a final integrate-and-verify ticket: green is promised only there.

Give every ticket its **blocking edges**: the tickets that must finish first. A ticket with no blockers can start immediately.

**Done when:** every slice is vertical, fits one window, and carries its edges.

## 4. Quiz the user

Present the breakdown as a numbered list. For each ticket show its **title**, its **blocked by**, and the **end-to-end behaviour it delivers**.

Ask: is the granularity right; does each ticket depend only on tickets that genuinely gate it; should anything merge or split?

Iterate until the user approves.

**Done when:** the user has approved the breakdown.

## 5. Publish

**Structure** follows the context:

- Grilling started from an existing issue → that issue is the parent: `gh issue create --parent <n>`.
- Otherwise → no parent. Tickets stand alone, held together by their `## Spec` section and their edges.

**Edges** are native blocking, via `--blocked-by`. Publish blockers first, in dependency order, so every number a ticket references already exists. Any ticket whose blockers are all done is on the **frontier** and can be started.

Leave any parent issue open and untouched.

### Ticket body

<issue-template>

```markdown
## What to build

The end-to-end behaviour this ticket makes work, stated as behaviour.

## Interface

The seams and signatures this ticket touches — its slice, not the whole contract. Derived from `docs/specs/<feature-slug>.md`, which is authoritative: where they disagree, the spec wins.

## Acceptance criteria

- [ ] <each one observable, and false at the commit the implementer starts from>

## Blocked by

- <the blocking tickets, or "None (can start immediately)">

## Spec

`docs/specs/<feature-slug>.md`
```

</issue-template>

Include the `## Spec` section when a spec exists.

Anchor the body in behaviour and contract: the domain nouns `CONTEXT.md` defines, type shapes, signatures, invariants. The code holds the file paths and line numbers, and it moves under them.

**Done when:** every ticket is published with its body and its native blocking edges, and the numbers reported back match the breakdown the user approved.
