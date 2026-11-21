import type { } from "next-intl";

export const locales = ["en", "hi", "as"] as const;
export const defaultLocale = "en";

export const i18n = {
  locales: ["en", "hi", "as"],
  defaultLocale,
  localeDetection: false,
} as const;

export type Locale = (typeof locales)[number];
