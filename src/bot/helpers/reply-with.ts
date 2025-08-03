import type { Context } from "#root/bot/context.js";
import sendOptions from "#root/bot/helpers/send-options.js";

export async function replyWithLocalization(
  ctx: Context,
  key: string,
  options = {}
) {
  const text = ctx.t(key);
  return await ctx.reply(text, { ...sendOptions(ctx), ...options });
}

export function editMessageTextWithLocalization(
  ctx: Context,
  key: string,
  options = {}
) {
  const text = ctx.t(key);
  return ctx.editMessageText(text, { ...sendOptions(ctx), options });
}
