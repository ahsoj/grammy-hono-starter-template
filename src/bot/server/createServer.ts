import { setLogger } from "#root/bot/middlewares/logger.js";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { webhookCallback } from "grammy";
import { getPath } from "hono/utils/url";
import { Hono } from "hono";

// Type import
import type { Env } from "#root/env.js";
import type { Bot } from "#root/bot/init.js";
import type { Config } from "#root/config.js";
import type { Logger } from "#root/logger.js";

interface Dependencies {
  bot: Bot;
  config: Config;
  logger: Logger;
}

export function createServer(dependencies: Dependencies) {
  const { bot, config, logger } = dependencies;
  const server = new Hono<Env>();

  server.use(requestId());
  server.use(setLogger(logger));

  server.onError(async (error, c) => {
    if (error instanceof HTTPException) {
      if (error.status < 500) c.var.logger.info(error);
      else c.var.logger.error(error);

      return error.getResponse();
    }

    // unexpected error
    c.var.logger.error({
      err: error,
      method: c.req.raw.method,
      path: getPath(c.req.raw),
    });
    return c.json(
      {
        error: "Oops! Something went wrong.",
      },
      500
    );
  });

  server.get("/", (c) => c.json({ status: true }));

  server.post(
    "/webhook",
    webhookCallback(bot, "hono", {
      secretToken: config.botWebhookSecret,
    })
  );

  return server;
}

export type Server = Awaited<ReturnType<typeof createServer>>;
