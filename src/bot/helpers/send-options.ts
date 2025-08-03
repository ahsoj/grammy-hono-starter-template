import type { Context } from "#root/bot/context.js";

export default function sendOptions(ctx: Context, extra: any = {}) {
  return {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_to_message_id: ctx.msg?.message_id,
    ...extra,
  };
}
