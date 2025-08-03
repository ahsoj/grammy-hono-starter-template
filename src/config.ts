import process from "node:process";
import { API_CONSTANTS } from "grammy";
import * as vb from "valibot";

const configSchema = vb.pipe(
  vb.object({
    debug: vb.optional(
      vb.pipe(vb.string(), vb.transform(JSON.parse), vb.boolean()),
      "false"
    ),
    logLevel: vb.optional(
      vb.pipe(
        vb.string(),
        vb.picklist([
          "trace",
          "debug",
          "info",
          "warn",
          "error",
          "fatal",
          "silent",
        ])
      ),
      "info"
    ),
    botName: vb.string(),
    botUsername: vb.string(),
    botId: vb.pipe(vb.string(), vb.transform(Number), vb.number()),
    botToken: vb.pipe(vb.string(), vb.regex(/^\d+:[\w-]+$/, "Invalid token")),
    botAllowedUpdates: vb.optional(
      vb.pipe(
        vb.string(),
        vb.transform(JSON.parse),
        vb.array(vb.picklist(API_CONSTANTS.ALL_UPDATE_TYPES))
      ),
      "[]"
    ),
    botAdmins: vb.optional(
      vb.pipe(vb.string(), vb.transform(JSON.parse), vb.array(vb.number())),
      "[]"
    ),
    botWebhookUrl: vb.pipe(vb.string(), vb.url()),
    botWebhookPath: vb.optional(vb.string(), "/webhook"),
    botWebhookSecret: vb.pipe(vb.string(), vb.minLength(12)),
    tunnelSubdomain: vb.optional(vb.string(), "grammy"),
    serverHost: vb.optional(vb.string(), "0.0.0.0"),
    serverPort: vb.optional(
      vb.pipe(vb.string(), vb.transform(Number), vb.number()),
      "8080"
    ),
  }),
  vb.transform((input) => ({
    ...input,
    isDebug: input.debug,
  }))
);

export type Config = vb.InferOutput<typeof configSchema>;

export function createConfig(input: vb.InferInput<typeof configSchema>) {
  return vb.parse(configSchema, input);
}

export const config = createConfigFromEnvironment();

function createConfigFromEnvironment() {
  type CamelCase<S extends string> =
    S extends `${infer P1}_${infer P2}${infer P3}`
      ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
      : Lowercase<S>;

  type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends object
      ? KeysToCamelCase<T[K]>
      : T[K];
  };

  function toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/_([a-z])/g, (_match, p1) => p1.toUpperCase());
  }

  function convertKeysToCamelCase<T>(obj: T): KeysToCamelCase<T> {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelCaseKey = toCamelCase(key);
        result[camelCaseKey] = obj[key];
      }
    }
    return result;
  }

  try {
    process.loadEnvFile();
  } catch {
    // No .env file found
  }

  try {
    // @ts-expect-error create config from environment variables
    const config = createConfig(convertKeysToCamelCase(process.env));

    return config;
  } catch (error) {
    throw new Error("Invalid config", {
      cause: error,
    });
  }
}
