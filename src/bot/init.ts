import { Bot as GrammyBot, MemorySessionStorage } from "grammy";
import { errorHandler } from "#root/bot/handlers/error.js";
import { session } from "#root/bot/middlewares/session.js";
import { autoChatAction } from "@grammyjs/auto-chat-action";
import { updateLogger } from "#root/bot/middlewares/update-logger.js";
import { handleLanguageRequest } from "#root/bot/handlers/handle-language.js";
import { unhandledRequest } from "#root/bot/handlers/unhandled.js";
import { handleStartRequest } from "#root/bot/handlers/handle-start.js";
import { handleAdminRequest } from "#root/bot/handlers/admin.js";
import { config, type Config } from "#root/config.js";
import { autoRetry } from "@grammyjs/auto-retry";
import { hydrate } from "@grammyjs/hydrate";
import { i18n } from "#root/bot/i18n.js";

// Type import
import type { BotConfig } from "grammy";
import type { Logger } from "#root/logger.js";
import type { Context } from "#root/bot/context.js";

interface Dependencies {
  config: Config;
  logger: Logger;
}

export function getSessionKey(
  ctx: Omit<Context, "session">
): string | undefined {
  return ctx.from?.id.toString();
}

const botConfigInfo: BotConfig<Context> = {
  botInfo: {
    id: config.botId,
    is_bot: true,
    first_name: config.botName,
    username: config.botUsername,
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: false,
  },
  client: {
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
};

export function createBot(token: string, { config, logger }: Dependencies) {
  const bot = new GrammyBot<Context>(token, botConfigInfo);

  bot.use(async (ctx, next) => {
    ctx.config = config;
    ctx.logger = logger.child({
      update_id: ctx.update.update_id,
    });

    await next();
  });

  bot.api.config.use(autoRetry());

  const protectedBot = bot.errorBoundary(errorHandler);

  if (config.isDebug) protectedBot.use(updateLogger());
  protectedBot.use(autoChatAction(bot.api));
  protectedBot.use(hydrate());
  protectedBot.use(
    session({
      getSessionKey,
      storage: new MemorySessionStorage(),
    })
  );
  protectedBot.use(i18n);

  // Handlers
  protectedBot.use(handleAdminRequest);
  protectedBot.use(handleStartRequest);
  protectedBot.use(handleLanguageRequest);
  protectedBot.use(unhandledRequest);

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
