# Required Skills

The design-first workflow is two layers: the skills this repo owns, and the general-purpose skills it borrows from the `mattpocock/skills` set. This is the registry `setup-my-workflow-skills` checks, so a missing dependency or a conflicting install is caught at setup time rather than in the middle of a design session.

## Owned by this repo

Discovered from `skills/` in this repo, or from whatever this repo's `settings.json` points at. Each must be present, and the copy the harness actually loads must be this repo's.

| Skill | Role |
| --- | --- |
| `confirm-design` | The gate: closes functional design and interface design, grills the gaps, hands back an accepted contract. |
| `to-designed-spec` | Writes the confirmed design into `docs/specs/<feature-slug>.md`. |
| `to-designed-tickets` | Cuts the confirmed design into vertical slices on GitHub. |
| `implement-designed` | Builds a spec or a ticket. |
| `code-review-designed` | The two-axis review of the diff. |

## Borrowed: must be present

| Skill | Needed by | Itself depends on |
| --- | --- | --- |
| `grilling` | `confirm-design` — the rounds that close the design's gaps; also a dependency of `grill-with-docs` | — |
| `codebase-design` | `confirm-design` — the module / interface / depth / seam / adapter vocabulary | — |
| `domain-modeling` | `grill-with-docs` — writes `CONTEXT.md` and the ADRs | — |
| `grill-with-docs` | The design conversation that leaves a paper trail; `docs/agents/domain.md` names it as the entry that reaches `domain-modeling` | `grilling`, `domain-modeling` |
| `tdd` | `implement-designed` — the red-green loop at the pre-agreed seams | — |

Dependencies are transitive. `grill-with-docs` is unusable without both `grilling` and `domain-modeling`, so a missing dependency is as bad as a missing skill.

## Forbidden: must be absent

| Skill | Why |
| --- | --- |
| `code-review` | The `mattpocock` original. Retired here in favour of `code-review-designed`, which reads the spec from `docs/specs/` rather than `docs/agents/issue-tracker.md`. Two skills claiming the same review trigger is a coin flip, and it drags `docs/agents/issue-tracker.md` back in with it. Uninstall it rather than avoiding it. |

## Where skills are found

pi loads skills from the `skills` arrays in both settings files and from a set of conventional directories. Check them in this order, and record which one answered:

1. This repo's `.pi/settings.json` — its `skills` paths, resolved relative to `.pi`.
2. `~/.pi/agent/settings.json` — its `skills` paths, resolved relative to `~/.pi/agent`.
3. This project's skill directories, nearest first: `.pi/skills/`, then `.agents/skills/` in the working directory and each ancestor up to the git root, plus a `skills/` directory or a `pi.skills` entry named in this repo's `package.json`.
4. Global skill directories: `~/.pi/agent/skills/`, `~/.agents/skills/`.
5. Other harness directories declared in either `settings.json` (`~/.claude/skills`, `~/.codex/skills`, …).

Declared paths come first because that is where the harness actually loads from; the conventional directories are what is left when nothing is declared. A declared path pointing at a shared checkout while this repo's own skills come from a different array is exactly the split that hides a missing dependency.

A skill is present when a directory holds a `SKILL.md` whose frontmatter `name` equals the skill's name. pi does not require the directory name to match the skill name, and it keeps the first skill found on a collision, so read the frontmatter rather than trusting the folder name. A skill loaded with `--skill <path>` leaves no trace in `settings.json`; ask the user before reporting such a skill missing.
