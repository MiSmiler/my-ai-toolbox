---
name: setup-my-workflow-skills
description: Configure this repo for the design-first workflow — its domain doc layout, indexed in AGENTS.md. Run once per repo, or to retrofit a repo set up for a different skill set.
disable-model-invocation: true
---

# Setup My Workflow Skills

Scaffold the per-repo configuration the design-first workflow assumes: where `CONTEXT.md` and ADRs live, and the consumer rules for reading them.

- **Domain docs**: the `CONTEXT.md` glossary and the `docs/adr/` decision records, plus the rules the other skills follow when reading them.

The workflow's other two needs are not configured here. Tickets go to GitHub through `gh`, and the skills carry no label vocabulary.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## 1. Explore

Read what is there; assume nothing:

- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist, and does it already carry an `## Agent skills` section?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/`, and any `src/*/docs/adr/` directories
- `docs/agents/`: a prior run of this skill, or of a different skill set
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Their absence means single-context, which is almost every repo.

**Done when:** every path above is either read or established as absent.

## 2. Settle the layout

Default to **single-context** — one `CONTEXT.md` and `docs/adr/` at the repo root — and write it without asking. Offer **multi-context** (a root `CONTEXT-MAP.md` pointing at one `CONTEXT.md` per context) only when exploration found monorepo signals.

**Done when:** the layout is single-context, or the user has chosen multi-context.

## 3. Retrofit a repo set up for another skill set

When `docs/agents/` already holds files from a different setup, settle each one:

- **`triage-labels.md`** — this workflow carries no labels, so nothing reads it once `triage` is out of the picture. Offer to remove it.
- **`issue-tracker.md`** — keep it. `code-review` reads this file to turn an issue reference in a commit message into the issue's contents, so the Spec axis of a review stops working without it. Its label and pull-request sections can go; its "Create an issue", "Read an issue" and "List issues" conventions are what `to-designed-tickets` and `code-review` act on.

Ask before removing anything.

**Done when:** each file found in `docs/agents/` is either kept deliberately or removed with the user's word.

## 4. Confirm

Show the user a draft of:

- The `## Agent skills` block, and the file it goes into
- The contents of `docs/agents/domain.md`

Let them edit before writing.

**Done when:** the user has accepted both drafts.

## 5. Write

Pick the file to edit:

- `CLAUDE.md` exists → edit it.
- Otherwise `AGENTS.md` exists → edit it.
- Neither exists → ask the user which to create.

Never create one of the two when the other already exists.

If an `## Agent skills` block is already there, update it in place rather than appending a duplicate, and leave the surrounding sections untouched. Drop a `### Triage labels` sub-block when one is present; keep a `### Issue tracker` sub-block when `docs/agents/issue-tracker.md` stays.

```markdown
## Agent skills

### Domain docs

<single-context | multi-context>. See `docs/agents/domain.md`.
```

Write `docs/agents/domain.md` from the seed in [domain.md](./domain.md), adjusting the layout section to the choice from step 2.

**Done when:** the block is in the file and `docs/agents/domain.md` is written.

## 6. Done

Name the layout and the skills that now read from it: `confirm-design` and the two `to-designed-*` skills take their vocabulary from the glossary, and `code-review` flags a change that contradicts a recorded ADR.

`docs/agents/domain.md` is editable by hand from here. Re-running this skill is only needed to change the layout or to retrofit another repo.
