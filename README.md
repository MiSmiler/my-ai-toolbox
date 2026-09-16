# My AI Toolbox

Self-used skills for the `pi` coding agent, plus the prompts and extensions built around them.

The workflow here is a fork of [mattpocock/skills](https://github.com/mattpocock/skills), keeping the parts adapted to how I work. In a new repo, run [`setup-my-workflow-skills`](./skills/workflow/setup-my-workflow-skills/SKILL.md) first.

The skills below are the ones this repo owns. The general-purpose skills they borrow — `grilling`, `domain-modeling`, `codebase-design`, `tdd`, `grill-with-docs` — live outside this repo; [`required-skills.md`](./skills/workflow/setup-my-workflow-skills/required-skills.md) is the authoritative list, and `setup-my-workflow-skills` checks it at setup time.

## The workflow

The skills a piece of designed work moves through, in order.

- **[setup-my-workflow-skills](./skills/workflow/setup-my-workflow-skills/SKILL.md)** — Sets a repo up for this workflow, once per repo: the domain-doc layout indexed in `AGENTS.md`, and the skill set checked against the registry. *(from `/setup-matt-pocock-skills`)*
- **[confirm-design](./skills/workflow/confirm-design/SKILL.md)** — Close out the design before it gets built: settles both halves, functional and interface, grills the gaps, and hands back a contract you have accepted. *(from `/to-spec`)*
- **[to-designed-spec](./skills/workflow/to-designed-spec/SKILL.md)** — Writes the confirmed design into `docs/specs/<feature-slug>.md`, functional design and code design together. *(from `/to-spec`)*
- **[to-designed-tickets](./skills/workflow/to-designed-tickets/SKILL.md)** — Cuts the confirmed design into vertical-slice tickets on GitHub, each naming the tickets that block it. *(from `/to-tickets`)*
- **[implement-designed](./skills/workflow/implement-designed/SKILL.md)** — Builds a spec's or a ticket's work at the seams the design agreed. *(from `/implement`)*
- **[code-review-designed](./skills/workflow/code-review-designed/SKILL.md)** — Reviews the diff since a fixed point on two axes, Standards and Spec, reported side by side rather than merged. *(from `/code-review`)*

## Utilities skills

Off the chain — reach for them on their own.

- **[coding](./skills/utilities/coding/SKILL.md)** — The rules for code a human brain can hold; it fires on every code change, in any language or file. Adapted from [cognitive-load](https://github.com/zakirullin/cognitive-load/blob/main/README.agents.md) by Artem Zakirullin (CC BY 4.0).
- **[simple-subagent](./skills/utilities/simple-subagent/SKILL.md)** — Runs a brief in an isolated `pi` subprocess and hands the report back word for word; it researches, never implements.
- **[report-issues](./skills/utilities/report-issues/SKILL.md)** — Interviews you to sharpen a problem into a well-formed GitHub issue, then files it; it never proposes a fix.
- **[to-pr](./skills/utilities/to-pr/SKILL.md)** — Creates the PR for the current branch with its issue linkage, or audits the linkage of a PR that already exists.

## Also here

- **`prompts/`** — pi prompt templates: `/summary-for-next`, `/git-commit-staged`, `/git-message`.
- **`pi_extensions/`** — source for two self-developed pi extensions, installed by absolute path rather than discovered; the install steps are in [the extension README](./pi_extensions/README.md).
- **`AGENTS.md`** — this repo's own agent instructions.
- **`MY_USER_AGENTS.md`** — my user-level set: copy it to `~/.pi/agent/AGENTS.md` so it applies to every repo (language, Markdown formatting, presenting options).
