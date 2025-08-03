import { serve } from "@hono/node-server";
import type { Server } from "#root/bot/server/createServer.js";

export function createServerManager(
  server: Server,
  options: { host: string; port: number }
) {
  let handle: undefined | ReturnType<typeof serve>;
  return {
    start() {
      return new Promise<{ url: string }>((resolve) => {
        handle = serve(
          {
            fetch: server.fetch,
            hostname: options.host,
            port: options.port,
          },
          (info) =>
            resolve({
              url:
                info.family === "IPv6"
                  ? `http://[${info.address}]:${info.port}`
                  : `http://${info.address}:${info.port}`,
            })
        );
      });
    },
    stop() {
      return new Promise<void>((resolve) => {
        if (handle) handle.close(() => resolve());
        else resolve();
      });
    },
  };
}

// serve(
//   {
//     fetch: app.fetch,
//     port: 3000,
//   },
//   async (info) => {
//     // await bot.api.setWebhook(`https://${DOMAIN}/${WEBHOOK_PATH}`);
//     console.log(`Server is running on http://localhost:${info.port}`);
//   }
// );
