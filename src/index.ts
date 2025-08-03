import "module-alias/register.js";
import localTunnel from "localtunnel";
import process from "node:process";
import { logger } from "#root/logger.js";
import { createBot } from "#root/bot/init.js";
import { config, type Config } from "#root/config.js";
import { createServer } from "#root/bot/server/createServer.js";
import { createServerManager } from "#root/bot/server/createServerManager.js";

async function runApp(config: Config) {
  const bot = createBot(config.botToken, {
    config,
    logger,
  });

  const server = createServer({
    bot,
    config,
    logger,
  });

  const serverManager = createServerManager(server, {
    host: config.serverHost,
    port: config.serverPort,
  });

  let tunnel: localTunnel.Tunnel | null = null;

  if (config.isDebug) {
    // create a localTunnel here
    tunnel = await localTunnel({
      port: config.serverPort,
      subdomain: config.tunnelSubdomain,
    });

    tunnel.on("close", () => {
      logger.info("Tunnel closed!");
    });

    logger.info({
      msg: "Tunnel started",
      url: tunnel.url,
    });
  }

  // graceful shutdown
  onShutdown(async () => {
    logger.info("Shutdown");
    await serverManager.stop();
    tunnel?.close();
  });

  // to prevent receiving updates before the bot is ready
  await bot.init();

  // start server
  const info = await serverManager.start();
  logger.info({
    msg: "Server started",
    url: info.url,
  });

  // set webhook
  await bot.api.setWebhook(config.botWebhookUrl, {
    allowed_updates: config.botAllowedUpdates,
    secret_token: config.botWebhookSecret,
  });

  logger.info({
    msg: "Webhook was set",
    url: config.botWebhookUrl,
  });
}

function onShutdown(cleanUp: () => Promise<void>) {
  let isShuttingDown = false;
  const handleShutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    await cleanUp();
  };
  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
}

try {
  await runApp(config);
} catch (error) {
  logger.error(error);
  process.exit(1);
}
