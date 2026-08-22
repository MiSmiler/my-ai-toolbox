# TypeScript preferences

Personal, TypeScript-specific preferences on top of the community best-practice baseline.

## Community baseline

- Style: Prettier defaults for formatting.
- Lints: ESLint `recommended` plus the `typescript-eslint` recommended rulesets.
- Strictness: `strict: true`; avoid `any` — prefer `unknown` with narrowing.
- Naming: `PascalCase` types and classes, `camelCase` functions and variables, `UPPER_SNAKE_CASE` constants; interfaces for object shapes, `type` for unions and mapped types.
- Idioms: prefer typed unions over stringly-typed values where the compiler helps; use narrowing and `satisfies` over casts.
- Guidance: [TS do's and don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html).

## My notes

No personal TypeScript-specific preferences recorded yet — rely on the baseline and `common.md`. Accumulate entries here.
