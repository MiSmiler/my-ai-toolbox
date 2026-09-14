---
name: setup-my-workflow-skills
description: Configure this repo for the design-first workflow — its domain doc layout, indexed in AGENTS.md, and the shared skills it depends on. Run once per repo, or to retrofit a repo set up for a different skill set.
disable-model-invocation: true
---

# Setup My Workflow Skills

Scaffold the per-repo configuration the design-first workflow assumes:

- **Domain docs**: the `CONTEXT.md` glossary and the `docs/adr/` decision records, plus the rules the other skills follow when reading them.
- **Required skills**: the skills this repo owns, the borrowed skills it depends on, and the one skill that must not be installed — checked against the registry in [required-skills.md](./required-skills.md).

The workflow's other two needs are not configured here. Tickets go to GitHub through `gh`, and the skills carry no label vocabulary, so there is no `docs/agents/issue-tracker.md` and no `docs/agents/triage-labels.md` to write.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

Where a choice goes to the user, lead with the recommended answer so they can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the choice entirely when exploration already settled it.

## 1. Explore

Read what is there; assume nothing:

- `AGENTS.md` at the repo root: does it exist, and does it already carry an `## Agent skills` section?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/`, and any `src/*/docs/adr/` directories
- `docs/agents/`: a prior run of this skill, or of a different skill set
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Their absence means single-context, which is almost every repo.

**Done when:** every path above is either read or established as absent.

## 2. Settle the layout

Default to **single-context** — one `CONTEXT.md` and `docs/adr/` at the repo root — and write it without asking. Offer **multi-context** (a root `CONTEXT-MAP.md` pointing at one `CONTEXT.md` per context) only when exploration found monorepo signals.

**Done when:** the layout is single-context, or the user has chosen multi-context.

## 3. Check the skill set

This workflow is not self-contained: it borrows general-purpose skills installed elsewhere. [required-skills.md](./required-skills.md) is the registry — the skills that must be present, the one that must be absent, their transitive dependencies, and the locations to search.

Search in the order the registry gives: the `skills` paths declared in this repo's `.pi/settings.json`, then those in `~/.pi/agent/settings.json`, then the conventional skill directories. Read each candidate's `SKILL.md` frontmatter for its real `name` rather than trusting the directory name.

Report the whole registry as a table — skill, verdict, and the path that answered — then act on it:

- **A required skill missing**, including a missing transitive dependency such as `domain-modeling` under `grill-with-docs` → stop and tell the user. An uninstalled dependency fails silently in the middle of a design session, so this is not a warning to move past.
- **A forbidden skill found** (`code-review`) → tell the user where it lives and that it must be uninstalled, not merely avoided. Two skills claiming the same review trigger is a coin flip, and this workflow depends on `code-review-designed` being the one that answers.
- **A required skill found only in an external install** → say so. The workflow runs either way, but the user should know the repo is not carrying its own copy.

If a required skill is found nowhere, ask before declaring it missing: a skill can be loaded with `--skill <path>`, which leaves no trace in `settings.json`.

**Done when:** every registry entry resolves to a path or a confirmed absence, and every gap and forbidden skill has been raised with the user.

## 4. Retrofit a repo set up for another skill set

When `docs/agents/` already holds files from a different setup, settle each one:

- **`triage-labels.md`** — this workflow carries no labels, so nothing reads it once `triage` is out of the picture. Remove it.
- **`issue-tracker.md`** — remove it. Nothing here reads the file: `to-designed-tickets` publishes through `gh` directly, and `code-review-designed` finds its spec under `docs/specs/` and reads issues with `gh issue view`. That file exists for the `mattpocock` `code-review`, and that skill is retired here.

Ask before removing anything.

**Done when:** each file found in `docs/agents/` is either kept deliberately or removed with the user's word.

## 5. Confirm

Show the user a draft of:

- The `## Agent skills` block, and the file it goes into
- The contents of `docs/agents/domain.md`
- The skill-set report from step 3

Let them edit before writing.

**Done when:** the user has accepted the drafts.

## 6. Write

Pick the file to edit:

- `AGENTS.md` exists → edit it.
- Otherwise → create it.

If an `## Agent skills` block is already there, update it in place rather than appending a duplicate, and leave the surrounding sections untouched. Drop a `### Triage labels` sub-block and a `### Issue tracker` sub-block when either is present: this workflow writes neither.

```markdown
## Agent skills

### Domain docs

<single-context | multi-context>. See `docs/agents/domain.md`.
```

Write `docs/agents/domain.md` from the seed in [domain.md](./domain.md), adjusting the layout section to the choice from step 2. Keep it at that exact path and name. Both this workflow and the original `mattpocock` set expect the domain-doc consumer rules at `docs/agents/domain.md`, which is what keeps `grill-with-docs` and the `domain-modeling` behind it working against the same `CONTEXT.md` and `docs/adr/`.

**Done when:** the block is in the file and `docs/agents/domain.md` is written.

## 7. Done

Name the layout and the skills that now read from it: `confirm-design` and the two `to-designed-*` skills take their vocabulary from the glossary, and `code-review-designed` reviews the branch against the spec in `docs/specs/`.

Setup is complete only when step 3 reported no missing requirement and no forbidden skill. In particular, `code-review` must not be reachable from any discovered skill path; if it is, the user uninstalls it and step 3 runs again.

`docs/agents/domain.md` is editable by hand from here. Re-running this skill is only needed to change the layout, to re-check the skill set, or to retrofit another repo.
