# My AI Toolbox

Self-used skills for the `pi` coding agent, plus the prompts and extensions built around them.

## Skills

- **[coding](./skills/utilities/coding/SKILL.md)** — The rules for code a human brain can hold; it fires on every code change and every code design, in any language or file. Adapted from [cognitive-load](https://github.com/zakirullin/cognitive-load/blob/main/README.agents.md) by Artem Zakirullin (CC BY 4.0).
- **[report-issues](./skills/utilities/report-issues/SKILL.md)** — Interviews you to sharpen a problem into a well-formed GitHub issue, then files it; it never proposes a fix.
- **[to-pr](./skills/utilities/to-pr/SKILL.md)** — Creates the PR for the current branch with its issue linkage, or audits the linkage of a PR that already exists.
- **[setup-tickets-repo](./skills/workflow/setup-tickets-repo/SKILL.md)** — Gives a code repo a `.tickets/` worktree of the shared tickets repo.
- **[manage-tickets](./skills/utilities/manage-tickets/SKILL.md)** — Routes ticket work to `.tickets/README.md`, the rulebook of the shared tickets repo.

## Also here

- **`prompts/`** — pi prompt templates: `/summary-for-next`, `/git-commit-staged`, `/git-message`.
- **`pi_extensions/`** — source for two self-developed pi extensions, installed by absolute path rather than discovered; the install steps are in [the extension README](./pi_extensions/README.md).
- **`DEV_AGENTS.md`** — agent instructions for development in this repo.
- **`USER_AGENTS.md`** — my user-level set: copy it to `~/.pi/agent/AGENTS.md` so it applies to every repo (language, Markdown formatting, presenting options).
