import { homedir } from "node:os";
import { isAbsolute, relative, resolve } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

/** Same resolution rules pi itself applies to tool paths: `~` expansion and a leading `@`. */
function resolveTarget(rawPath: string, cwd: string): string {
  const withoutAtPrefix = rawPath.startsWith("@") ? rawPath.slice(1) : rawPath;
  const expanded = withoutAtPrefix.startsWith("~")
    ? resolve(homedir(), withoutAtPrefix.slice(1))
    : withoutAtPrefix;
  return resolve(cwd, expanded);
}

function isOutsideCwd(cwd: string, target: string): boolean {
  const fromCwd = relative(cwd, target);
  const climbsOut = fromCwd.startsWith("..");
  const onAnotherRoot = isAbsolute(fromCwd);
  return climbsOut || onAnotherRoot;
}

/** Only write and edit touch files; every other tool gets undefined. */
function filePathOf(event: { toolName: string; input: unknown }): string | undefined {
  const touchesFile = event.toolName === "write" || event.toolName === "edit";
  if (!touchesFile) return undefined;

  const input = event.input as { path?: string };
  return input.path;
}

export default function (pi: ExtensionAPI) {
  let guardEnabled = true;

  pi.on("session_start", async () => {
    guardEnabled = true;
  });

  pi.on("tool_call", async (event, ctx) => {
    if (!guardEnabled) return;
    if (ctx.mode !== "tui") return;

    const rawPath = filePathOf(event);
    if (rawPath === undefined) return;

    const target = resolveTarget(rawPath, ctx.cwd);
    if (!isOutsideCwd(ctx.cwd, target)) return;

    const ok = await ctx.ui.confirm(
      "Write Guard — outside working directory",
      `Allow ${event.toolName} outside the working directory?\n` +
        `  file: ${target}\n` +
        `  cwd:  ${ctx.cwd}`,
    );
    if (ok) return;

    ctx.ui.notify("Blocked: file is outside the working directory", "warning");
    return { block: true, reason: "Rejected by user" };
  });

  function toggle(ctx: Pick<ExtensionContext, "ui">) {
    guardEnabled = !guardEnabled;
    ctx.ui.notify(
      `Write guard ${guardEnabled ? "enabled" : "disabled"}`,
      "info",
    );
  }

  pi.registerCommand("toggle-write-guard", {
    description: "Toggle write guard on/off",
    handler: async (_args, ctx) => toggle(ctx),
  });
}
