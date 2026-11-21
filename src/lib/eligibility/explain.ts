import type { Scheme } from "../validation/scheme.schema";
import type { SchemeEvaluation, WizardField } from "../validation/scheme.schema";

/**
 * Generate a plain-language explanation for a scheme evaluation result.
 *
 * `locale` determines which language text to use ("en" or "hi").
 * Returns:
 *  - summary: one-line plain-language outcome
 *  - details: array of { type: "matched" | "failed" | "missing", text }
 */
export function explainEvaluation(
  evaluation: SchemeEvaluation,
  scheme: Scheme,
  locale: "en" | "hi"
): {
  summary: string;
  details: Array<{ type: "matched" | "failed" | "missing"; text: string }>;
} {
  const t = (key: "matched" | "failed" | "missing") => {
    if (locale === "hi") {
      const map = {
        matched: "मिलान",
        failed: "मिलता नहीं",
        missing: "अधिक जानकारी चाहिए",
      };
      return map[key];
    }
    const map = {
      matched: "Matched",
      failed: "Does not match",
      missing: "More info needed",
    };
    return map[key];
  };

  const details = evaluation.ruleResults.map((rr) => {
    const text = locale === "hi" ? rr.textHi : rr.text;
    return { type: rr.result, text };
  });

  let summary: string;
  if (locale === "hi") {
    switch (evaluation.outcome) {
      case "eligible":
        summary = `यह योजना आपके लिए उपयुक्त प्रतीत होती है।`;
        break;
      case "possibly":
        summary = `आप इस योजना के लिए पात्र हो सकते हैं, लेकिन अधिक जानकारी की आवश्यकता है।`;
        break;
      case "ineligible":
        summary = `यह योजना आपकी स्थिति से मेल नहीं खाती।`;
        break;
    }
  } else {
    switch (evaluation.outcome) {
      case "eligible":
        summary = "This scheme looks like a good match for you.";
        break;
      case "possibly":
        summary = "You may be eligible for this scheme — more info needed.";
        break;
      case "ineligible":
        summary = "This scheme does not match your situation.";
        break;
    }
  }

  return { summary, details };
}

/**
 * Format a rule result into a human-readable sentence for display.
 * Used in the results page to explain each matched/failed/missing rule.
 */
export function formatRuleExplanation(
  rr: { field: WizardField; result: string; text: string; textHi: string },
  locale: "en" | "hi"
): string {
  const text = locale === "hi" ? rr.textHi : rr.text;
  return text;
}