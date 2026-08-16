/**
 * Model + Thinking Level Picker
 *
 * Replaces the editor with a list (alt+l or `/model-level`) of every available
 * (model, thinking level) combination. Arrow keys or digits 1-9 select;
 * the chosen combination is applied session-scoped via `pi.setModel()` +
 * `pi.setThinkingLevel()`.
 *
 * Behavior:
 * - The model list respects `--models` / `enabledModels` scoping
 *   (`ctx.scopedModels`), falling back to the full auth-available catalogue
 *   when no scoping is configured.
 * - Levels come from `getSupportedThinkingLevels(model)` (respects the
 *   model's `thinkingLevelMap`, including null holes and non-reasoning
 *   models). A model pinned to a level via scoping (e.g. `deepseek/*:high`)
 *   shows only that level.
 * - Current model+level is pre-highlighted with a checkmark.
 *
 * Install (manual): copy or symlink into `~/.pi/agent/extensions/` and
 * `/reload`. Quick test: `pi -e ./pi_extensions/model-level-picker.ts`.
 */

import type { ExtensionAPI, ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import type { Model, ModelThinkingLevel } from "@earendil-works/pi-ai";
import {
  truncateToWidth,
  visibleWidth,
  type Component,
  type KeybindingsManager,
} from "@earendil-works/pi-tui";

const THINKING_COLORS = {
  off: "thinkingOff",
  minimal: "thinkingMinimal",
  low: "thinkingLow",
  medium: "thinkingMedium",
  high: "thinkingHigh",
  xhigh: "thinkingXhigh",
  max: "thinkingMax",
} as const;

const ALL_THINKING_LEVELS: readonly ModelThinkingLevel[] = [
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

/**
 * Inlined from `@earendil-works/pi-ai` (getSupportedThinkingLevels).
 *
 * Keeping this locally avoids a runtime import of `@earendil-works/pi-ai`,
 * which pi's extension loader aliases to the heavy `dist/compat.js` legacy
 * entrypoint (all API wrappers + builtin provider registration). Importing
 * that at extension load slows pi startup; these two functions are pure and
 * cheap, so inlining them removes the dependency entirely.
 */
function getSupportedThinkingLevels(model: Model<any>): ModelThinkingLevel[] {
  if (!model.reasoning) return ["off"];
  return ALL_THINKING_LEVELS.filter((level) => {
    const mapped = model.thinkingLevelMap?.[level];
    if (mapped === null) return false;
    if (level === "xhigh" || level === "max") return mapped !== undefined;
    return true;
  });
}

/** Inlined from `@earendil-works/pi-ai` (clampThinkingLevel). */
function clampThinkingLevel(model: Model<any>, level: ModelThinkingLevel): ModelThinkingLevel {
  const available = getSupportedThinkingLevels(model);
  if (available.includes(level)) return level;
  const requestedIndex = ALL_THINKING_LEVELS.indexOf(level);
  if (requestedIndex === -1) return available[0] ?? "off";
  for (let i = requestedIndex; i < ALL_THINKING_LEVELS.length; i++) {
    const candidate = ALL_THINKING_LEVELS[i];
    if (available.includes(candidate)) return candidate;
  }
  for (let i = requestedIndex - 1; i >= 0; i--) {
    const candidate = ALL_THINKING_LEVELS[i];
    if (available.includes(candidate)) return candidate;
  }
  return available[0] ?? "off";
}

interface PickerEntry {
  model: Model<any>;
  level: ModelThinkingLevel;
}

type PickerRow =
  | { kind: "header"; label: string }
  | { kind: "entry"; entry: PickerEntry; entryIndex: number };

interface PickerData {
  rows: PickerRow[];
  entries: PickerEntry[];
}

/** Build the flat, header-grouped list of (model, level) options. */
function buildPicker(ctx: ExtensionContext): PickerData {
  const scoped = ctx.scopedModels;
  const base: Array<{ model: Model<any>; pinned?: ModelThinkingLevel }> =
    scoped.length > 0
      ? scoped.map((s) => ({ model: s.model, pinned: s.thinkingLevel }))
      : ctx.modelRegistry.getAvailable().map((m) => ({ model: m }));

  const providers = new Set(base.map((b) => b.model.provider));
  const showProvider = providers.size > 1;

  const rows: PickerRow[] = [];
  const entries: PickerEntry[] = [];
  const seen = new Set<string>();

  for (const item of base) {
    const model = item.model;
    const modelKey = `${model.provider}/${model.id}`;
    if (seen.has(modelKey)) continue;
    seen.add(modelKey);

    const levels: ModelThinkingLevel[] = item.pinned
      ? [clampThinkingLevel(model, item.pinned)]
      : getSupportedThinkingLevels(model);
    if (levels.length === 0) continue;

    rows.push({
      kind: "header",
      label: showProvider ? `${model.provider}/${model.id}` : model.id,
    });

    for (const level of levels) {
      const entry: PickerEntry = { model, level };
      entries.push(entry);
      rows.push({ kind: "entry", entry, entryIndex: entries.length - 1 });
    }
  }

  return { rows, entries };
}

interface ModelLevelPickerOptions {
  rows: PickerRow[];
  entries: PickerEntry[];
  initialIndex: number;
  currentKey: string | undefined;
  currentLevel: string;
  theme: Theme;
  terminalRows: number;
  keybindings: KeybindingsManager;
  requestRender: () => void;
}

class ModelLevelPicker implements Component {
  onSelect?: (entry: PickerEntry) => void;
  onCancel?: () => void;

  private selectedIdx: number;

  constructor(private readonly opts: ModelLevelPickerOptions) {
    this.selectedIdx = Math.max(
      0,
      Math.min(opts.initialIndex, Math.max(0, opts.entries.length - 1)),
    );
  }

  handleInput(data: string): void {
    const kb = this.opts.keybindings;
    if (this.opts.entries.length === 0) return;

    if (kb.matches(data, "tui.select.up")) {
      this.selectedIdx =
        this.selectedIdx === 0 ? this.opts.entries.length - 1 : this.selectedIdx - 1;
      this.opts.requestRender();
    } else if (kb.matches(data, "tui.select.down")) {
      this.selectedIdx =
        this.selectedIdx === this.opts.entries.length - 1 ? 0 : this.selectedIdx + 1;
      this.opts.requestRender();
    } else if (kb.matches(data, "tui.select.confirm")) {
      this.onSelect?.(this.opts.entries[this.selectedIdx]);
    } else if (kb.matches(data, "tui.select.cancel")) {
      this.onCancel?.();
    } else if (data.length === 1 && data >= "1" && data <= "9") {
      const n = data.charCodeAt(0) - 48;
      if (n >= 1 && n <= this.opts.entries.length) {
        this.onSelect?.(this.opts.entries[n - 1]);
      }
    }
  }

  invalidate(): void {
    // Rendering is stateless; nothing to cache.
  }

  render(width: number): string[] {
    const theme = this.opts.theme;
    const { rows, entries, currentKey, currentLevel } = this.opts;

    const contentWidth = Math.max(1, width);
    const border = (s: string) => theme.fg("border", s);
    const rowOf = (s: string) => padContent(s, contentWidth);

    // Window the rows around the selection (mirrors the built-in selector).
    const maxVisible = Math.max(4, Math.min(12, Math.floor(this.opts.terminalRows * 0.4)));
    let selectedRowIndex = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.kind === "entry" && row.entryIndex === this.selectedIdx) {
        selectedRowIndex = i;
        break;
      }
    }
    const start = Math.max(
      0,
      Math.min(selectedRowIndex - Math.floor(maxVisible / 2), rows.length - maxVisible),
    );
    const end = Math.min(start + maxVisible, rows.length);

    const lines: string[] = [];
    lines.push(border("─".repeat(contentWidth)));
    lines.push(rowOf(theme.fg("accent", theme.bold(" Model + Thinking Level "))));

    for (let i = start; i < end; i++) {
      const row = rows[i];
      if (row.kind === "header") {
        lines.push(rowOf(theme.fg("muted", row.label)));
      } else {
        const n = row.entryIndex + 1;
        const isSelected = row.entryIndex === this.selectedIdx;
        const isCurrent =
          currentKey !== undefined &&
          `${row.entry.model.provider}/${row.entry.model.id}` === currentKey &&
          String(row.entry.level) === currentLevel;

        const levelText = theme.fg(THINKING_COLORS[row.entry.level], String(row.entry.level));
        const text = isSelected
          ? theme.fg("accent", `> ${n}. `) + levelText
          : theme.fg("dim", `  ${n}. `) + levelText;

        lines.push(rowOf(isCurrent ? text + theme.fg("success", " ✓") : text));
      }
    }

    if (start > 0 || end < rows.length) {
      lines.push(rowOf(theme.fg("muted", `  (${this.selectedIdx + 1}/${entries.length})`)));
    }

    lines.push(rowOf(theme.fg("dim", " ↑↓ navigate • enter / 1-9 select • esc cancel")));
    lines.push(border("─".repeat(contentWidth)));

    return lines;
  }
}

/** Pad a (possibly ANSI-styled) string to a visible width. */
function padContent(s: string, width: number): string {
  const vis = visibleWidth(s);
  if (vis >= width) return truncateToWidth(s, width);
  return s + " ".repeat(width - vis);
}

async function openPicker(ctx: ExtensionContext, pi: ExtensionAPI): Promise<void> {
  if (ctx.mode !== "tui") {
    ctx.ui.notify("Model + Thinking Level picker requires TUI mode", "warning");
    return;
  }

  const { rows, entries } = buildPicker(ctx);
  if (entries.length === 0) {
    ctx.ui.notify("No models available for selection", "warning");
    return;
  }

  const current = ctx.model;
  const currentLevel = String(ctx.thinkingLevel ?? "off");
  const currentKey = current ? `${current.provider}/${current.id}` : undefined;
  const initialIndex = currentKey
    ? entries.findIndex(
        (e) =>
          `${e.model.provider}/${e.model.id}` === currentKey && String(e.level) === currentLevel,
      )
    : -1;

  const selected = await ctx.ui.custom<PickerEntry | null>(
    (tui, theme, keybindings, done) => {
      const picker = new ModelLevelPicker({
        rows,
        entries,
        initialIndex: initialIndex >= 0 ? initialIndex : 0,
        currentKey,
        currentLevel,
        theme,
        terminalRows: tui.terminal.rows,
        keybindings,
        requestRender: () => tui.requestRender(),
      });
      picker.onSelect = done;
      picker.onCancel = () => done(null);
      return picker;
    },
  );

  if (!selected) return;

  const { model, level } = selected;
  const ok = await pi.setModel(model);
  if (!ok) {
    ctx.ui.notify(`No API key for ${model.provider}/${model.id}`, "error");
    return;
  }
  pi.setThinkingLevel(level);
  ctx.ui.notify(`Model: ${model.provider}/${model.id} • thinking: ${level}`, "info");
}

export default function modelLevelPicker(pi: ExtensionAPI) {
  pi.registerShortcut("alt+l", {
    description: "Select model and thinking level",
    handler: async (ctx) => {
      await openPicker(ctx, pi);
    },
  });

  pi.registerCommand("model-level", {
    description: "Select model and thinking level",
    handler: async (_args, ctx) => {
      await openPicker(ctx, pi);
    },
  });
}
