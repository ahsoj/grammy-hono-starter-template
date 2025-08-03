import type { Context } from "#root/bot/context.js";
import { setCommandsHandler } from "#root/bot/handlers/commands/set-commands.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { chatAction } from "@grammyjs/auto-chat-action";
import { Composer } from "grammy";

const composer = new Composer<Context>();

export function isAdmin(ctx: Context) {
  return !!ctx.from && ctx.config.botAdmins.includes(ctx.from.id);
}

const feature = composer.chatType("private").filter(isAdmin);

feature.command(
  "setcommands",
  logHandle("command-setcommands"),
  chatAction("typing"),
  setCommandsHandler
);

export { composer as handleAdminRequest };
