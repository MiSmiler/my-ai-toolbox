# Rust habits

Personal, Rust-specific habits on top of the community best-practice baseline.

## Community baseline

- Style and lints: `rustfmt` defaults; `cargo clippy` with `-D warnings` (consider pedantic lints).
- Naming conventions: RFC 430 — `snake_case` items, `CamelCase` types, `SCREAMING_SNAKE_CASE` constants; `is_`/`has_` for boolean getters.
- API design: [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/).
- Error handling: idiomatic `Result`; `anyhow` for application errors, `thiserror` for library errors; no `unwrap`/`expect` outside tests and thin `main` glue.
- Idioms: [rust-unofficial/patterns](https://rust-unofficial.github.io/patterns/) — prefer `match` and iterators where they read clearer than manual control flow.

## My notes

No personal Rust-specific habits recorded yet — rely on the baseline and `common.md`. Accumulate entries here.
