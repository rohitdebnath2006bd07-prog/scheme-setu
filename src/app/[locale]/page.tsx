import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default function Home() {
  const t = getTranslations({ namespace: "common" });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        {t("appName")}
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        {t("tagline")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/wizard/step/1"
          className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-medium transition-colors"
        >
          <span className="text-2xl mb-2">📋</span>
          {t("startWizard")}
        </a>

        <a
          href="/search"
          className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 font-medium transition-colors"
        >
          <span className="text-2xl mb-2">🔍</span>
          {t("browseSchemes")}
        </a>
      </div>

      <div className="mt-12 p-6 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
        <p className="font-medium text-slate-900 mb-2">
          {t("privacyText")}
        </p>
        <p className="text-slate-600">
          No accounts. No tracking. Your answers stay in your browser.
        </p>
      </div>
    </div>
  );
}