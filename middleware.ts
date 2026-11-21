import { createMiddleware } from "next-intl/middleware";
import { locales, defaultLocale } from "./src/lib/i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Always show locale in URL: /en, /hi, /as
});

export const config = {
  // Skip Next.js internals and static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};