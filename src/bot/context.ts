import type { Config } from "#root/config.js";
import type { Logger } from "#root/logger.js";
import type { AutoChatActionFlavor } from "@grammyjs/auto-chat-action";
import type { HydrateFlavor } from "@grammyjs/hydrate";
import type { I18nFlavor } from "@grammyjs/i18n";
import type {
  Context as BaseContext,
  SessionFlavor,
  SessionOptions as DefaultSessionOptions,
} from "grammy";

export interface SessionData {
  // __language_code?: string;
}

export type Context = HydrateFlavor<
  BaseContext &
    SessionFlavor<SessionData> &
    I18nFlavor &
    AutoChatActionFlavor & {
      logger: Logger;
      config: Config;
    }
>;

export type SessionOptions = Pick<
  DefaultSessionOptions<SessionData, Context>,
  "getSessionKey" | "storage"
>;
