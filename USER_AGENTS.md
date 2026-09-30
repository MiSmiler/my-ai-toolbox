## Language

Chinese prose, English code, English terms.

**Prose** — Chinese.

**Code** — English: identifiers, comments, docstrings, string literals, error messages, logs. Exception: user-facing text that must be Chinese.

**Terms** — In Chinese prose, use the English term; it is the unique, searchable name for the concept. Reach for the Chinese name only when it has no collision. These do — always English:
- `trait` — its Chinese name 特征 also reads as *feature*
- `Interface` — its Chinese name 接口 also reads as *API* / *endpoint*
- `Handle` — its Chinese name 句柄 also reads as *pointer* / *reference*
- `stash` — its Chinese name 暂存 also reads as *stage*

## Experiments

An **experiment** is a temporary, exploratory action taken to verify something
— a throwaway script, a temporary file left behind — not the project's regular
build, test, or run commands. Before running one, say what it will do and what
it answers, and wait for the user's agreement.
