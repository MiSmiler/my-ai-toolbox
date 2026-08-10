import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const RM_PATTERN = /\brm\b/;

function extractRmLines(command: string): string[] {
  return command.split("\n")
    .filter((line) => RM_PATTERN.test(line))
    .map((line) => line.trim());
}

export default function (pi: ExtensionAPI) {
  let guardEnabled = true;

  pi.on("session_start", async (_event, ctx) => {
    guardEnabled = true;
    ctx.ui.setStatus("wg", "wg:on");
  });

  pi.on("tool_call", async (event, ctx) => {
    if (!guardEnabled) return;
    if (ctx.mode !== "tui") return;

    if (event.toolName === "write") {
      const input = event.input as { path: string; content: string };
      const lines = input.content.split("\n").length;
      const size = humanSize(Buffer.byteLength(input.content, "utf-8"));
      const ok = await ctx.ui.confirm(
        "Write Guard — write",
        `Allow write to:\n  ${input.path}\n\nLines: ${lines}  |  Size: ${size}`,
      );
      if (!ok) {
        ctx.ui.notify("Write blocked by guard", "warning");
        ctx.abort();
        return { block: true, reason: "Rejected by user" };
      }
    } else if (event.toolName === "edit") {
      const input = event.input as {
        path: string;
        edits: Array<{ oldText: string; newText: string }>;
      };
      const editCount = input.edits.length;
      const ok = await ctx.ui.confirm(
        `Write Guard — edit (${editCount} edit${editCount > 1 ? "s" : ""})`,
        `Allow edit to:\n  ${input.path}\n\nEdits: ${editCount} change${editCount > 1 ? "s" : ""}`,
      );
      if (!ok) {
        ctx.ui.notify("Edit blocked by guard", "warning");
        ctx.abort();
        return { block: true, reason: "Rejected by user" };
      }
    } else if (event.toolName === "bash") {
      const input = event.input as { command: string; timeout?: number };
      const cmd = input.command ?? "";
      if (!cmd) return;

      const matchLines = extractRmLines(cmd);
      if (matchLines.length === 0) return;

      const maxDisplay = 5;
      const displayLines = matchLines.slice(0, maxDisplay).map((line) => {
        if (line.length > 200) {
          return `  > ${line.slice(0, 200)}...(truncated)`;
        }
        return `  > ${line}`;
      });

      let body = `Allow bash command?\n${displayLines.join("\n")}`;
      const remaining = matchLines.length - maxDisplay;
      if (remaining > 0) {
        body += `\n  ... and ${remaining} more match(es)`;
      }

      const countSuffix = matchLines.length > 1 ? ` ×${matchLines.length}` : "";

      const ok = await ctx.ui.confirm(
        `Write Guard — delete (rm${countSuffix})`,
        body,
      );
      if (!ok) {
        ctx.ui.notify("Delete blocked by guard", "warning");
        ctx.abort();
        return { block: true, reason: "Rejected by user" };
      }
    }
  });

  function toggle(ctx: Pick<ExtensionContext, "ui">) {
    guardEnabled = !guardEnabled;
    const status = guardEnabled ? "wg:on" : "wg:off";
    ctx.ui.setStatus("wg", status);
    ctx.ui.notify(
      `Write guard ${guardEnabled ? "enabled" : "disabled"}`,
      "info",
    );
  }

  pi.registerCommand("toggle-write-guard", {
    description: "Toggle write guard on/off",
    handler: async (_args, ctx) => toggle(ctx),
  });

  pi.registerShortcut("alt+g", {
    description: "Toggle write guard on/off",
    handler: async (ctx) => toggle(ctx),
  });
}
