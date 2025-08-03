import { replyWithLocalization } from "#root/bot/helpers/reply-with.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { i18n } from "#root/bot/i18n.js";
import { Composer } from "grammy";
import { Menu } from "@grammyjs/menu";

// Type import
import type { Context } from "#root/bot/context.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

// Create inline menu for language selection
const languageMenu = new Menu<Context>("language-menu");

const languages: Record<string, string> = {
  en: "🇺🇸 English",
  et: "🇪🇹 አማርኛ",
  es: "🇪🇸 Español",
};

// Dynamically add a button for each locale
for (const locale of i18n.locales) {
  const text = languages[locale];
  languageMenu
    .text(text, async (ctx) => {
      const current = await ctx.i18n.getLocale();
      if (current === locale) {
        await ctx.reply(ctx.t("language.already-set"));
      } else {
        await ctx.i18n.setLocale(locale);
        await ctx.editMessageText(ctx.t("language.language-set"), {
          reply_markup: undefined,
        });
      }
    })
    .row();
}

// Register the menu middleware
feature.use(languageMenu);

feature.command("language", logHandle("command-language"), async (ctx) => {
  if (ctx.match === "") {
    return await replyWithLocalization(ctx, "language.specify-a-locale", {
      reply_markup: languageMenu,
    });
  }
});

export { composer as handleLanguageRequest };
