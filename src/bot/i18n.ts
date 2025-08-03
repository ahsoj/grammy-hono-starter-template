import type { Context } from "#root/bot/context.js";
import { I18n } from "@grammyjs/i18n";

export const i18n = new I18n<Context>({
  defaultLocale: "en",
  directory: "locales",
  useSession: true,
  fluentBundleOptions: {
    useIsolating: false,
  },
  // Define globally available placeables:
  globalTranslationContext(ctx) {
    return { name: ctx.from?.first_name ?? "" };
  },
});

export const isMultipleLocales = i18n.locales.length > 1;
