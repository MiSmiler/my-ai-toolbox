# Domain Docs

How the workflow skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

When these files don't exist, proceed silently. Their absence is the normal starting state, not a gap to report. The `domain-modeling` skill (reached via `grill-with-docs`) creates them lazily, when a term or a decision is actually resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept — in a spec, a seam, an interface, a ticket title, a test name — use the term as `CONTEXT.md` defines it. Drift to a synonym the glossary explicitly avoids is a finding.

A concept you need that the glossary doesn't carry is a signal: either the project doesn't use that language (reconsider), or there is a real gap worth naming.

## Flag ADR conflicts

When the design you are about to write contradicts a recorded decision, surface it rather than quietly overriding it:

> _Contradicts ADR-0007 (event-sourced orders) — worth reopening because…_
