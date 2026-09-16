---
name: code-review-designed
description: Review the changes since a fixed point along two axes — Standards (does the code follow this repo's documented standards?) and Spec (does the code do what the spec and its code design asked for?) — each in its own isolated subprocess, reported side by side. Use when the user wants to review a branch, a PR, or work in progress, or asks to review the changes since some commit, branch, tag, or merge-base.
---

# Code Review Designed

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented standards?
- **Spec** — does the code do what the spec asked for, seams and interfaces included?

Each axis is dispatched as its own `simple-subagent` process. Isolation is the point: neither axis sees the other's reasoning, so a clean Standards pass cannot quietly raise the bar the Spec pass is judged against. Parallelism is only a speed question, so run them one after the other.

## 1. Pin the fixed point

Whatever the user named — a commit SHA, a branch, a tag, `main`, `HEAD~5` — is the fixed point. If they named none, ask.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, against the merge-base). Note the commits too: `git log <fixed-point>..HEAD --oneline`.

Confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty before dispatching anything. A bad ref or an empty diff should fail here, in front of the user, not inside two subprocesses.

**Done when:** the fixed point resolves and the diff is non-empty.

## 2. Find the spec

Look in this order, and take the first that lands:

1. `docs/specs/<feature-slug>.md`, where `<feature-slug>` is the branch's feature slug — branch `feat/csv-import` gives `docs/specs/csv-import.md`.
2. A path the user passed as an argument.
3. An issue reference in the commit messages (`#12`, `Closes #45`), read with `gh issue view <n> --comments`.
4. Nothing found → ask. If there is no spec, the **Spec** axis is skipped and the report says so.

The local spec path comes first because that file holds the whole design: the functional design, and the code design of seams, interfaces, invariants, ordering constraints and error modes. An issue reference usually names a single ticket, which carries only that ticket's slice.

**Done when:** the spec is located, or its absence is established.

## 3. Find the standards sources

Anything in the repo documenting how code should be written: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, `AGENTS.md`, and the like.

On top of what the repo documents, the Standards axis always carries the **smell baseline** below — twelve Fowler code smells (_Refactoring_, ch.3) that apply even where a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Skip whatever tooling already enforces.

Each reads *what it is* → *how to fix*:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design is murky.
- **Duplicated Code**: the same logic shape in more than one hunk or file. → extract the shared shape, call it from both.
- **Feature Envy**: a method reaching into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params travelling together. → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurring across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forcing scattered edits across many files. → gather what changes together into one module.
- **Divergent Change**: one file or module edited for several unrelated reasons. → split so each changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: a long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer ignoring or overriding most of what it inherits. → drop the inheritance, use composition.

**Done when:** the standards files are listed, or their absence is established.

## 4. Dispatch the two axes

Dispatch each axis through the `simple-subagent` skill, one after the other. The axis content below is what goes into its brief.

**Standards brief.** Carry the diff command, the commit list, the standards files from step 3, and the twelve smells above pasted in full — the subprocess has no other access to them.

> Review the diff from `git diff <fixed-point>...HEAD`; the commits are `<list>`.
>
> Report, per file and hunk: (a) every place the diff violates a documented standard, citing the standards file and the rule; (b) any baseline smell you spot, naming it and quoting the hunk. Documented-standard breaches can be hard; baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip whatever tooling already enforces.
>
> Review only. Do not modify anything, and do not dispatch further work or look for another review skill. Under 400 words.

**Spec brief.** Carry the diff command, the commit list, and the spec location from step 2 as a path the subprocess can read.

> Read the spec at `<path>`, then review the diff from `git diff <fixed-point>...HEAD`; the commits are `<list>`.
>
> Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that was not asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong; (d) places where the diff crosses a different **seam** than the spec agreed, or breaks an invariant, an ordering constraint, or an error mode the spec records. Quote the spec line for every finding.
>
> Review only. Do not modify anything, and do not dispatch further work or look for another review skill. Under 400 words.

When there is no spec, skip this dispatch and note the gap in the report.

**Done when:** each dispatched axis has handed back its report, or its failure. A failed axis is reported as a failed axis; the gap is the finding.

## 5. Aggregate

Present the two reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. Never merge or rerank them: a change can pass one axis and fail the other, and a blended verdict lets the passing axis hide the failing one.

- Code that follows every standard but implements the wrong thing → Standards pass, Spec fail.
- Code that does exactly what the spec asked while breaking the repo's conventions → Spec pass, Standards fail.

Close with findings per axis and the worst issue *within each axis*. Pick no overall winner — that is the reranking the separation exists to prevent.

**Done when:** both reports are presented and the closing summary names a worst issue per axis without choosing between them.
