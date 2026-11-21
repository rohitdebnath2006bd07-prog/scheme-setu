import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, defaultLocale } from "@/lib/i18n";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  as: "অসমীয়া",
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const locale = (await params).locale;
  const t = await getTranslations({ namespace: "common", locale });
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("scheme-setu-locale");
    if (saved && locales.includes(saved as any) && saved !== locale) {
      router.push(`/${saved}${pathname}`);
    }
  }, [locale, pathname, router]);

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full bg-white text-slate-900">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:border-slate-700">
          {t("skipToContent")}
        </a>

        <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-center py-4 gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-slate-900"
              >
                <span className="text-xl">SchemeSetu</span>
              </Link>

              <nav className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const next = locale === "en" ? "hi" : "en";
                    localStorage.setItem("scheme-setu-locale", next);
                    router.push(`/${next}${pathname}`);
                  }}
                  className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                  disabled={mounted ? false : true}
                >
                  {LOCALE_LABELS[locale === "en" ? "hi" : "en"]}
                </button>
              </nav>
            </div>
          </div>
        </header>

        <main id="main-content">{children}</main>

        <footer className="border-t border-slate-200 bg-slate-50 mt-auto py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-slate-500 text-center">
              {t("privacyText")}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}