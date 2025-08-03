import { session as createSession } from "grammy";
import type { Context, SessionOptions } from "#root/bot/context.js";
import type { Middleware } from "grammy";

export function session(options: SessionOptions): Middleware<Context> {
  return createSession({
    getSessionKey: options.getSessionKey,
    storage: options.storage,
    initial: () => ({}),
  });
}