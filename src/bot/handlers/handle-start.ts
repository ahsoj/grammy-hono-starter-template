import { replyWithLocalization } from "#root/bot/helpers/reply-with.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { Composer } from "grammy";

// Tyep import
import type { Context } from "#root/bot/context.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command(["help", "start"], logHandle("command-start"), async (ctx) => {
  return await replyWithLocalization(ctx, "start");
});

export { composer as handleStartRequest };
