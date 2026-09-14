# pi_extensions

Source code for self-developed pi coding-agent extensions.

These files are **not auto-loaded** from this directory. Extensions must be
installed manually using one of the methods below.

## Install methods

### Method 1: Place in the auto-discovery directory

The auto-discovery directory (`~/.pi/agent/extensions/`) picks up extensions
without any `settings.json` entry. Use this only if you want the extension
auto-discovered.

```bash
cp level-picker.ts ~/.pi/agent/extensions/
```

Then run `/reload` in pi to load it. The extension is now available in all
projects.

To test an extension without installing, use `pi -e`:

```bash
pi -e ./level-picker.ts
```

`-e` only loads the extension for that one run (temporary); it does not persist.

### Method 2: Configure in settings.json

Add the extension path to the `extensions` field of `settings.json`.

- Global: `~/.pi/agent/settings.json` (paths resolve relative to `~/.pi/agent`)
- Project: `.pi/settings.json` (paths resolve relative to `.pi`)

```json
{
  "extensions": [
    "/absolute/path/to/pi_extensions/level-picker.ts",
    "/absolute/path/to/pi_extensions/write-guard.ts"
  ]
}
```

Absolute paths and `~` are supported. Then run `/reload` in pi.

Should an extension ever grow to multiple files, point the entry at its
**directory** rather than a single file: a directory entry resolves to its
`index.ts` (pi checks `package.json`'s `pi.extensions`, then falls back to
`index.ts`/`index.js` via `resolveExtensionEntries`). Use an **absolute** path
so the sibling imports and bundled assets resolve correctly regardless of where
pi is started.

> Note: project-local settings and extensions load only after the project is
> trusted. Prefer the global settings file or Method 1 unless the extension is
> meant for a single project.

## Extensions

| File | Description | Entry points |
|------|-------------|--------------|
| `level-picker.ts` | Select the current model's thinking level in the editor slot | `alt+l`, `/level` |
| `write-guard.ts` | Confirm `write` tool calls before execution | auto |

### Why `alt+l` instead of `ctrl+shift+l`?

`ctrl+shift+l` was the first choice, but it collides with the built-in
`ctrl+l` (`app.model.select`): in terminals that do **not** support the
[Kitty keyboard protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol/)
(such as Windows Terminal), `ctrl+shift+l` is transmitted as the same byte as
`ctrl+l` (`0x0C`), so the built-in model selector opens instead of this
extension's panel.

`alt+l` sends `ESC l`, which is byte-wise distinct from `ctrl+l` in every
terminal, so it is reliably distinguishable. If you use a Kitty-protocol
terminal (Kitty, iTerm2, Ghostty, WezTerm with the protocol enabled, recent
Windows Terminal), `ctrl+shift+l` can be re-added as an additional binding.
