---
name: to-designed-spec
description: Write the spec for the work in hand into the repo, carrying both halves of the confirmed design.
disable-model-invocation: true
---

# To Designed Spec

Write the spec into the repo, carrying the design with it: the functional design, and the code design of seams and interfaces.

## 1. Confirm the design

Load the `confirm-design` skill and run it. It checks that the conversation holds both functional design and interface design, grills the gaps, and hands back a contract the user has accepted.

**Done when:** `confirm-design` has handed back a design the user accepted. Otherwise stop here.

## 2. Write the spec

Path: `docs/specs/<feature-slug>.md`, where `<feature-slug>` is the branch's feature slug — branch `feat/csv-import` writes `docs/specs/csv-import.md`. `code-review` finds a spec under `docs/` by matching the branch or feature name, so aligning those two names is what keeps the spec reachable.

Create `docs/specs/` if it is not there.

<spec-template>

```markdown
# <Feature> — spec

## Problem

Why this work exists, and the constraints around it.

## Functional Design

What the work does, grouped by function: one paragraph of overview, then the functions
and their edges.

## Code Design

### Seams

Each seam: where it is, and why it sits there. The highest that works, and the fewest.

### Interfaces

At each seam: signature or type shape, invariants, ordering constraints, error modes.

### Testing Decisions

Which modules get tests, and the prior art — a similar test already in the codebase.

## Out of Scope

What this work deliberately does not do.

## Further Notes
```

</spec-template>

Write what was decided and nothing more, in the vocabulary `CONTEXT.md` already defines. A line the conversation never settled is a defect, not a gap to fill.

**Done when:** the file is written, every section carrying decided content.

## 3. Commit it to the branch

Commit the spec on its own, so it rides the branch, appears in the PR beside the code it describes, and leaves the implementation commits clean.

The spec lives on the branch and is reviewed with the PR. It leaves the branch by hand before the merge.

**Done when:** the spec is committed to the current branch.
