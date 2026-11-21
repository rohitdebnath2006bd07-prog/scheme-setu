import type { Scheme, SchemeEvaluation, SchemeOutcome, WizardField } from "../validation/scheme.schema";
import type { RuleEvalResult } from "./operators";
import { evaluateRule } from "./operators";

/**
 * Answers collected from the wizard. Every field is optional —
 * a missing value means the user skipped or chose "prefer not to say".
 * Answers live only in browser memory and are never persisted.
 */
export interface WizardAnswers {
  age?: number;
  gender?: string;
  state?: string;
  residence?: string;
  occupation?: string;
  income?: string;
  category?: string;
  disability?: string;
  student?: string;
  bpl?: string;
  marital?: string;
}

/**
 * Evaluate a single scheme against the user's answers.
 *
 * Logic:
 *   - If any rule with a definitive answer fails → "ineligible"
 *   - If no rules fail but at least one rule is "missing" → "possibly"
 *   - If all rules match → "eligible"
 *
 * Returns a SchemeEvaluation with per-rule results and counts.
 */
export function evaluateScheme(
  scheme: Scheme,
  answers: WizardAnswers
): SchemeEvaluation {
  const ruleResults = scheme.eligibilityRules.map((rule) => {
    const answer = answers[rule.field as keyof WizardAnswers];
    const result = evaluateRule(rule.op, answer, rule.value);

    return {
      field: rule.field as WizardField,
      op: rule.op,
      result,
      text: rule.text,
      textHi: rule.textHi,
      value: rule.value,
    };
  });

  const failedCount = ruleResults.filter((r) => r.result === "failed").length;
  const missingCount = ruleResults.filter((r) => r.result === "missing").length;
  const matchedCount = ruleResults.filter((r) => r.result === "matched").length;

  let outcome: SchemeOutcome;
  if (failedCount > 0) {
    outcome = "ineligible";
  } else if (missingCount > 0) {
    outcome = "possibly";
  } else {
    outcome = "eligible";
  }

  return {
    schemeId: scheme.id,
    outcome,
    ruleResults,
    matchedCount,
    failedCount,
    missingCount,
  };
}

/**
 * Evaluate all schemes against the user's answers and return results
 * sorted by match quality (eligible first, then possibly, then ineligible),
 * with eligible schemes ranked by matched count.
 */
export function evaluateAllSchemes(
  schemes: Scheme[],
  answers: WizardAnswers
): SchemeEvaluation[] {
  const results = schemes.map((scheme) => evaluateScheme(scheme, answers));

  return results.sort((a, b) => {
    // Priority: eligible > possibly > ineligible
    const rank = (o: SchemeOutcome) =>
      o === "eligible" ? 2 : o === "possibly" ? 1 : 0;
    const rankDiff = rank(b.outcome) - rank(a.outcome);
    if (rankDiff !== 0) return rankDiff;

    // Within the same outcome tier, more matches = higher rank
    return b.matchedCount - a.matchedCount;
  });
}

/**
 * Memoized wrapper for evaluateAllSchemes.
 * Prevents re-evaluation when answers or schemes haven't changed.
 * The cache key is a simple JSON string of answers + scheme IDs.
 */
export class EligibilityEngine {
  private cache: Map<string, SchemeEvaluation[]> = new Map();

  evaluate(schemes: Scheme[], answers: WizardAnswers): SchemeEvaluation[] {
    const cacheKey = this.makeCacheKey(schemes, answers);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const result = evaluateAllSchemes(schemes, answers);
    this.cache.set(cacheKey, result);
    return result;
  }

  clear(): void {
    this.cache.clear();
  }

  private makeCacheKey(schemes: Scheme[], answers: WizardAnswers): string {
    const schemeIds = schemes.map((s) => s.id).join(",");
    return JSON.stringify({ schemeIds, answers });
  }
}

// Singleton engine instance for use throughout the app.
export const eligibilityEngine = new EligibilityEngine();