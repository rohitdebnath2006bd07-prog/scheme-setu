import { NextIntlConfig } from "next-intl";

export const locales = ["en", "hi", "as"] as const;
export const defaultLocale = "en";

export const i18n: NextIntlConfig = {
  locales: ["en", "hi", "as"],
  defaultLocale,
  localeDetection: false, // We manage language via localStorage + explicit switcher
};

export type Locale = (typeof locales)[number];