import { getTranslations } from "next-intl/client";
import { useWizard } from "@/components/wizard/WizardContext";
import { evaluateAllSchemes, explainEvaluation } from "@/lib/eligibility";
import { schemes } from "@/data/index";
import type { Locale } from "@/lib/i18n";

export default function ResultsPage() {
  const { answers, clearAnswers } = useWizard();
  const t = getTranslations({ namespace: "results" });
  const ct = getTranslations({ namespace: "common" });
  const locale = (typeof window !== "undefined" &&
    (window as any).__locale) as Locale || "en";

  const results = evaluateAllSchemes(schemes, answers);

  const eligible = results.filter((r) => r.outcome === "eligible");
  const possibly = results.filter((r) => r.outcome === "possibly");
  const ineligible = results.filter((r) => r.outcome === "ineligible");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-slate-600">{t("subtitle")}</p>

        <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700">
          <p className="font-medium mb-2">{t("disclaimer")}</p>
          <p className="text-slate-600">{t("privacy")}</p>
        </div>
      </div>

      {eligible.length === 0 && possibly.length === 0 && ineligible.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">{ct("common.noResults")}</p>
          <button
            onClick={() => {
              clearAnswers();
              window.location.href = "/";
            }}
            className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium"
          >
            {ct("common.startWizard")}
          </button>
        </div>
      ) : null}

      {eligible.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-green-700 mb-4">
            ✓ {ct("common.likelyEligible")}
          </h2>
          <div className="space-y-3">
            {eligible.map((r) => {
              const scheme = schemes.find((s) => s.id === r.schemeId);
              if (!scheme) return null;
              const explanation = explainEvaluation(r, scheme, locale);
              return (
                <div
                  key={r.schemeId}
                  className="p-4 border border-green-100 rounded-lg bg-green-50"
                >
                  <h3 className="font-bold text-slate-900">{scheme.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {explanation.summary}
                  </p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {explanation.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {d.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {possibly.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-amber-700 mb-4">
            ⚠ {ct("common.possiblyEligible")}
          </h2>
          <div className="space-y-3">
            {possibly.map((r) => {
              const scheme = schemes.find((s) => s.id === r.schemeId);
              if (!scheme) return null;
              const explanation = explainEvaluation(r, scheme, locale);
              return (
                <div
                  key={r.schemeId}
                  className="p-4 border border-amber-100 rounded-lg bg-amber-50"
                >
                  <h3 className="font-bold text-slate-900">{scheme.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {explanation.summary}
                  </p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {explanation.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={d.type === "missing" ? "text-amber-500" : "text-slate-500"}>
                          {d.type === "missing" ? "?" : d.type === "matched" ? "✓" : "✗"}
                        </span>
                        {d.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-8 p-6 border border-slate-200 rounded-lg bg-white">
        <h3 className="font-bold text-slate-900 mb-4">
          {ct("common.editAnswers")}
        </h3>
        <button
          onClick={() => {
            clearAnswers();
            window.location.href = "/wizard/step/1";
          }}
          className="px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium"
        >
          {ct("results.editAnswers")}
        </button>
        <button
          onClick={() => {
            clearAnswers();
            window.location.href = "/";
          }}
          className="ml-4 px-6 py-3 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium"
        >
          {ct("results.startOver")}
        </button>
      </div>
    </div>
  );
}