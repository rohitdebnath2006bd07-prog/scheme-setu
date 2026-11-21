import type { RuleOp, WizardField } from "../validation/scheme.schema";

/**
 * Result of evaluating a single rule against a set of answers.
 * - "matched": the rule condition is satisfied by the answer
 * - "failed": the rule condition is NOT satisfied by the answer
 * - "missing": the field was not answered (skipped / prefer not to say)
 */
export type RuleEvalResult = "matched" | "failed" | "missing";

/**
 * Check whether a wizard field has been answered.
 * A field is "missing" if it's undefined, null, or an empty string.
 */
function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

/**
 * Compare two values for equality. Handles strings, numbers, and booleans.
 */
function eq(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return a === b;
  if (typeof a === "string" && typeof b === "string") return a === b;
  if (typeof a === "boolean" && typeof b === "boolean") return a === b;
  return String(a) === String(b);
}

/**
 * gte: field value >= rule value. Requires numeric comparison.
 */
export function opGte(answer: unknown, ruleValue: unknown): boolean {
  if (typeof answer !== "number" || typeof ruleValue !== "number") return false;
  return answer >= ruleValue;
}

/**
 * lte: field value <= rule value.
 */
export function opLte(answer: unknown, ruleValue: unknown): boolean {
  if (typeof answer !== "number" || typeof ruleValue !== "number") return false;
  return answer <= ruleValue;
}

/**
 * eq: field value == rule value.
 */
export function opEq(answer: unknown, ruleValue: unknown): boolean {
  return eq(answer, ruleValue);
}

/**
 * neq: field value != rule value.
 */
export function opNeq(answer: unknown, ruleValue: unknown): boolean {
  return !eq(answer, ruleValue);
}

/**
 * in: field value is one of the ruleValue array elements.
 */
export function opIn(answer: unknown, ruleValue: unknown): boolean {
  if (!Array.isArray(ruleValue)) return false;
  return ruleValue.some((v) => eq(answer, v));
}

/**
 * notIn: field value is NOT one of the ruleValue array elements.
 */
export function opNotIn(answer: unknown, ruleValue: unknown): boolean {
  if (!Array.isArray(ruleValue)) return false;
  return !ruleValue.some((v) => eq(answer, v));
}

/**
 * exists: the field has been answered (not skipped).
 * ruleValue is ignored for this operator.
 */
export function opExists(answer: unknown): boolean {
  return isAnswered(answer);
}

/**
 * notExists: the field has NOT been answered (skipped / prefer not to say).
 */
export function opNotExists(answer: unknown): boolean {
  return !isAnswered(answer);
}

/**
 * Operator lookup table. Maps each RuleOp to its evaluation function.
 * All functions are pure: same inputs always produce same output.
 */
export const OPERATORS: Record<RuleOp, (answer: unknown, ruleValue: unknown) => boolean> = {
  gte: opGte,
  lte: opLte,
  eq: opEq,
  neq: opNeq,
  in: opIn,
  notIn: opNotIn,
  exists: () => true, // handled specially — existence doesn't compare values
  notExists: () => false, // handled specially
} as const;

/**
 * Evaluate a single rule against a single answer value.
 * Returns "missing" if the field was not answered (unless op is exists/notExists).
 */
export function evaluateRule(
  op: RuleOp,
  answer: unknown,
  ruleValue: unknown
): RuleEvalResult {
  // exists/notExists don't need an actual value to compare — they check presence.
  if (op === "exists") {
    return isAnswered(answer) ? "matched" : "failed";
  }
  if (op === "notExists") {
    return !isAnswered(answer) ? "matched" : "failed";
  }

  // For all comparison operators, a missing answer means "missing" info.
  if (!isAnswered(answer)) {
    return "missing";
  }

  const fn = OPERATORS[op];
  if (!fn) {
    throw new Error(`Unknown operator: ${op}`);
  }

  return fn(answer, ruleValue) ? "matched" : "failed";
}