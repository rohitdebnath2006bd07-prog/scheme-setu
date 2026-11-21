import { z } from "zod";

// Known wizard fields that eligibility rules can reference.
// This is the single source of truth for wizard field names.
// The engine validates that every rule field is one of these.
export const WIZARD_FIELDS = [
  "age",
  "gender",
  "state",
  "residence",
  "occupation",
  "income",
  "category",
  "disability",
  "student",
  "bpl",
  "marital",
] as const;

export type WizardField = (typeof WIZARD_FIELDS)[number];

// Supported operators for eligibility rules.
// Each operator maps to a pure function in operators.ts.
export const RULE_OPS = [
  "gte",
  "lte",
  "eq",
  "neq",
  "in",
  "notIn",
  "exists",
  "notExists",
] as const;

export type RuleOp = (typeof RULE_OPS)[number];

export type RuleLogic = "AND" | "OR";

// Individual eligibility rule.
// A rule evaluates a single wizard field against a value.
// `text` and `textHi` are human-readable explanations in English and Hindi.
export interface EligibilityRule {
  field: WizardField;
  op: RuleOp;
  value: unknown;
  text: string;
  textHi: string;
}

// Outcome of evaluating a single rule.
export type RuleResult = "matched" | "failed" | "missing";

// Outcome of evaluating a whole scheme.
export type SchemeOutcome = "eligible" | "possibly" | "ineligible";

// Per-scheme evaluation result with explanations.
export interface SchemeEvaluation {
  schemeId: string;
  outcome: SchemeOutcome;
  ruleResults: Array<{
    field: WizardField;
    op: RuleOp;
    result: RuleResult;
    text: string;
    textHi: string;
    value: unknown;
  }>;
  matchedCount: number;
  failedCount: number;
  missingCount: number;
}

// Zod schema for a single scheme record.
// Every record must include official source URL, ministry, and lastVerified.
// Records not yet verified against an official source must use
// verificationStatus: "needs-verification".
export const schemeSchema = z.object({
  id: z
    .string()
    .min(1, "Scheme ID is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Scheme ID must be a URL-safe slug (lowercase, hyphens only)"
    ),
  name: z.string().min(1, "Scheme name is required"),
  nameHi: z.string().min(1, "Hindi name is required"),
  nameAs: z.string().optional(),
  summary: z.string().min(1, "Plain-language summary is required"),
  summaryHi: z.string().min(1, "Hindi summary is required"),
  category: z.enum([
    "agriculture",
    "health",
    "education",
    "housing",
    "women-child",
    "senior-citizens",
    "employment",
    "disability",
    "finance",
    "food",
    "other",
  ]),
  level: z.enum(["central", "state"]),
  state: z.string().nullable().optional(),
  ministry: z.string().min(1, "Issuing ministry/department is required"),
  officialSourceUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((u) => u.startsWith("https://"), "Official source URL must use https"),
  officialApplyUrl: z
    .string()
    .url()
    .refine((u) => u.startsWith("https://"), "Apply URL must use https")
    .optional(),
  lastVerified: z
    .string()
    .datetime({ offset: true }, "Must be a valid ISO 8601 datetime"),
  verificationStatus: z.enum(["verified", "needs-verification"]),
  benefits: z
    .array(
      z.object({
        title: z.string().min(1),
        text: z.string().min(1),
        textHi: z.string().min(1),
      })
    )
    .min(1, "At least one benefit is required"),
  eligibilityRules: z
    .array(
      z.object({
        field: z.string(),
        op: z.enum(RULE_OPS),
        value: z.any(),
        text: z.string().min(1),
        textHi: z.string().min(1),
      })
    )
    .min(1, "At least one eligibility rule is required"),
  ruleLogic: z.enum(["AND", "OR"]).default("AND"),
  documentsRequired: z.array(z.string()).min(1, "At least one document is required"),
  howToApply: z
    .array(
      z.object({
        step: z.number().int().positive(),
        text: z.string().min(1),
        textHi: z.string().min(1),
      })
    )
    .min(1, "At least one application step is required"),
  tags: z.array(z.string()).default([]),
  incomeMin: z.number().int().nonnegative().nullable().optional(),
  incomeMax: z.number().int().nonnegative().nullable().optional(),
});

// Type inferred from the Zod schema.
export type Scheme = z.infer<typeof schemeSchema>;

// Validate a single scheme record. Throws on invalid data.
export function validateScheme(data: unknown): Scheme {
  return schemeSchema.parse(data);
}

// Validate that every rule field is a known wizard field.
// This is a build-time integrity check.
export function validateRuleFields(scheme: Scheme): void {
  const knownFields = new Set(WIZARD_FIELDS);
  for (const rule of scheme.eligibilityRules) {
    if (!knownFields.has(rule.field as WizardField)) {
      throw new Error(
        `Scheme "${scheme.id}": rule field "${rule.field}" is not a known wizard field. ` +
          `Known fields: ${Array.from(knownFields).join(", ")}`
      );
    }
  }
}

// Check if a scheme's lastVerified date is older than 6 months.
export function isStale(scheme: Scheme, referenceDate: Date = new Date()): boolean {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(scheme.lastVerified) < sixMonthsAgo;
}