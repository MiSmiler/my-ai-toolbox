/**
 * Thinking Level Picker
 *
 * Replaces the editor with a list (alt+l or `/level`) of the thinking levels
 * supported by the current model. Arrow keys or digits 1-9 select; the chosen
 * level is applied session-scoped via `pi.setThinkingLevel()`. The model
 * itself is never changed by this picker.
 *
 * Behavior:
 * - Levels come from `getSupportedThinkingLevels(model)` (respects the
 *   model's `thinkingLevelMap`, including null holes and non-reasoning
 *   models). Scoped pins (`--models` / `enabledModels`, e.g.
 *   `deepseek/*:high`) only set a default level on model switch and do not
 *   restrict the levels offered here — same as the built-in Shift+Tab cycle.
 * - Current level is pre-highlighted with a checkmark.
 *
 * Install (manual): copy or symlink into `~/.pi/agent/extensions/` and
 * `/reload`. Quick test: `pi -e ./pi_extensions/level-picker.ts`.
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
 * NOTE: verbatim copy of pi-ai `dist/models.js` — verify on pi-ai upgrades.
 *
 * Keeping this locally avoids a runtime import of `@earendil-works/pi-ai`,
 * which pi's extension loader aliases to the heavy `dist/compat.js` legacy
 * entrypoint (all API wrappers + builtin provider registration). Importing
 * that at extension load slows pi startup; this function is pure and cheap,
 * so inlining it removes the dependency entirely.
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

interface LevelPickerOptions {
  levels: ModelThinkingLevel[];
  initialIndex: number;
  currentLevel: string;
  modelLabel: string;
  theme: Theme;
  terminalRows: number;
  keybindings: KeybindingsManager;
  requestRender: () => void;
}

class LevelPicker implements Component {
  onSelect?: (level: ModelThinkingLevel) => void;
  onCancel?: () => void;

  private selectedIdx: number;

  constructor(private readonly opts: LevelPickerOptions) {
    this.selectedIdx = Math.max(
      0,
      Math.min(opts.initialIndex, Math.max(0, opts.levels.length - 1)),
    );
  }

  handleInput(data: string): void {
    const kb = this.opts.keybindings;
    if (this.opts.levels.length === 0) return;

    if (kb.matches(data, "tui.select.up")) {
      this.selectedIdx =
        this.selectedIdx === 0 ? this.opts.levels.length - 1 : this.selectedIdx - 1;
      this.opts.requestRender();
    } else if (kb.matches(data, "tui.select.down")) {
      this.selectedIdx =
        this.selectedIdx === this.opts.levels.length - 1 ? 0 : this.selectedIdx + 1;
      this.opts.requestRender();
    } else if (kb.matches(data, "tui.select.confirm")) {
      this.onSelect?.(this.opts.levels[this.selectedIdx]);
    } else if (kb.matches(data, "tui.select.cancel")) {
      this.onCancel?.();
    } else if (data.length === 1 && data >= "1" && data <= "9") {
      const n = data.charCodeAt(0) - 48;
      if (n >= 1 && n <= this.opts.levels.length) {
        this.onSelect?.(this.opts.levels[n - 1]);
      }
    }
  }

  invalidate(): void {
    // Rendering is stateless; nothing to cache.
  }

  render(width: number): string[] {
    const theme = this.opts.theme;
    const { levels, currentLevel, modelLabel } = this.opts;

    const contentWidth = Math.max(1, width);
    const border = (s: string) => theme.fg("border", s);
    const rowOf = (s: string) => padContent(s, contentWidth);

    // Window the entries around the selection (mirrors the built-in selector).
    const maxVisible = Math.max(4, Math.min(12, Math.floor(this.opts.terminalRows * 0.4)));
    const start = Math.max(
      0,
      Math.min(this.selectedIdx - Math.floor(maxVisible / 2), Math.max(0, levels.length - maxVisible)),
    );
    const end = Math.min(start + maxVisible, levels.length);

    const lines: string[] = [];
    lines.push(border("─".repeat(contentWidth)));
    lines.push(rowOf(theme.fg("accent", theme.bold(` Thinking Level — ${modelLabel} `))));

    for (let i = start; i < end; i++) {
      const level = levels[i];
      const n = i + 1;
      const isSelected = i === this.selectedIdx;
      const isCurrent = String(level) === currentLevel;

      const levelText = theme.fg(THINKING_COLORS[level], String(level));
      const text = isSelected
        ? theme.fg("accent", `> ${n}. `) + levelText
        : theme.fg("dim", `  ${n}. `) + levelText;

      lines.push(rowOf(isCurrent ? text + theme.fg("success", " ✓") : text));
    }

    if (start > 0 || end < levels.length) {
      lines.push(rowOf(theme.fg("muted", `  (${this.selectedIdx + 1}/${levels.length})`)));
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
    ctx.ui.notify("Thinking level picker requires TUI mode", "warning");
    return;
  }

  const model = ctx.model;
  if (!model) {
    ctx.ui.notify("No model selected", "warning");
    return;
  }

  const levels = getSupportedThinkingLevels(model);
  if (levels.length === 0) {
    ctx.ui.notify("No thinking levels available for this model", "warning");
    return;
  }

  const currentLevel = String(ctx.thinkingLevel ?? "off");
  const initialIndex = levels.findIndex((level) => String(level) === currentLevel);

  const selected = await ctx.ui.custom<ModelThinkingLevel | null>(
    (tui, theme, keybindings, done) => {
      const picker = new LevelPicker({
        levels,
        initialIndex: initialIndex >= 0 ? initialIndex : 0,
        currentLevel,
        modelLabel: `${model.provider}/${model.id}`,
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

  pi.setThinkingLevel(selected);
  ctx.ui.notify(`thinking: ${selected}`, "info");
}

export default function levelPicker(pi: ExtensionAPI) {
  pi.registerShortcut("alt+l", {
    description: "Select thinking level",
    handler: async (ctx) => {
      await openPicker(ctx, pi);
    },
  });

  pi.registerCommand("level", {
    description: "Select thinking level",
    handler: async (_args, ctx) => {
      await openPicker(ctx, pi);
    },
  });
}
