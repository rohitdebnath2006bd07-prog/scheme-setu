import { describe, it, expect } from "vitest";
import {
  evaluateScheme,
  evaluateAllSchemes,
  eligibilityEngine,
} from "@/lib/eligibility/engine";
import type { Scheme } from "@/lib/validation/scheme.schema";

function makeScheme(
  overrides: Partial<Scheme> = {}
): Scheme {
  return {
    id: "test-scheme",
    name: "Test Scheme",
    nameHi: "टेस्ट योजना",
    summary: "A test scheme",
    summaryHi: "एक टेस्ट योजना",
    category: "other",
    level: "central",
    ministry: "Ministry of Test",
    officialSourceUrl: "https://example.gov.in/scheme",
    lastVerified: "2026-01-01T00:00:00Z",
    verificationStatus: "needs-verification",
    benefits: [
      { title: "Benefit", text: "Test benefit", textHi: "टेस्ट लाभ" },
    ],
    eligibilityRules: [],
    ruleLogic: "AND",
    documentsRequired: ["Document A"],
    howToApply: [
      { step: 1, text: "Step 1", textHi: "चरण 1" },
    ],
    ...overrides,
  };
}

describe("evaluateScheme", () => {
  describe("eligible outcome (all rules match)", () => {
    it("returns eligible when all AND rules match", () => {
      const scheme = makeScheme({
        eligibilityRules: [
          { field: "age", op: "gte", value: 60, text: "Age 60+", textHi: "आयु 60+" },
          { field: "gender", op: "eq", value: "female", text: "Female", textHi: "महिला" },
        ],
        ruleLogic: "AND",
      });

      const result = evaluateScheme(scheme, { age: 65, gender: "female" });
      expect(result.outcome).toBe("eligible");
      expect(result.failedCount).toBe(0);
      expect(result.missingCount).toBe(0);
    });
  });

  describe("ineligible outcome (any rule fails)", () => {
    it("returns ineligible when any rule fails", () => {
      const scheme = makeScheme({
        eligibilityRules: [
          { field: "age", op: "gte", value: 60, text: "Age 60+", textHi: "आयु 60+" },
          { field: "gender", op: "eq", value: "female", text: "Female", textHi: "महिला" },
        ],
      });

      const result = evaluateScheme(scheme, { age: 30, gender: "female" });
      expect(result.outcome).toBe("ineligible");
      expect(result.failedCount).toBe(1);
    });

    it("returns ineligible when one fails even if others match", () => {
      const scheme = makeScheme({
        eligibilityRules: [
          { field: "age", op: "gte", value: 60, text: "Age 60+", textHi: "आयु 60+" },
          { field: "income", op: "lte", value: 500000, text: "Income ≤ 5L", textHi: "आयु ≤ 5 लाख" },
        ],
      });

      const result = evaluateScheme(scheme, { age: 65, income: 800000 });
      expect(result.outcome).toBe("ineligible");
      expect(result.failedCount).toBe(1);
      expect(result.matchedCount).toBe(1);
    });
  });

  describe("possibly outcome (missing info)", () => {
    it("returns possibly when no failures but some missing", () => {
      const scheme = makeScheme({
        eligibilityRules: [
          { field: "age", op: "gte", value: 60, text: "Age 60+", textHi: "आयु 60+" },
          { field: "gender", op: "eq", value: "female", text: "Female", textHi: "महिला" },
        ],
      });

      const result = evaluateScheme(scheme, { age: 65 });
      expect(result.outcome).toBe("possibly");
      expect(result.failedCount).toBe(0);
      expect(result.missingCount).toBe(1);
    });

    it("returns possibly when all fields are missing", () => {
      const scheme = makeScheme({
        eligibilityRules: [
          { field: "age", op: "gte", value: 60, text: "Age 60+", textHi: "आयु 60+" },
        ],
      });

      const result = evaluateScheme(scheme, {});
      expect(result.outcome).toBe("possibly");
      expect(result.missingCount).toBe(1);
    });
  });

  describe("boundary values", () => {
    it("age exactly at gte threshold matches", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }],
      });
      expect(evaluateScheme(scheme, { age: 60 }).outcome).toBe("eligible");
    });

    it("age one below gte threshold fails", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }],
      });
      expect(evaluateScheme(scheme, { age: 59 }).outcome).toBe("ineligible");
    });

    it("age exactly at lte threshold matches", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "lte", value: 25, text: "≤25", textHi: "≤25" }],
      });
      expect(evaluateScheme(scheme, { age: 25 }).outcome).toBe("eligible");
    });

    it("age one above lte threshold fails", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "lte", value: 25, text: "≤25", textHi: "≤25" }],
      });
      expect(evaluateScheme(scheme, { age: 26 }).outcome).toBe("ineligible");
    });
  });

  describe("evaluateAllSchemes sorting", () => {
    it("sorts eligible before possibly before ineligible", () => {
      const schemes: Scheme[] = [
        makeScheme({ id: "ineligible", eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }] }),
        makeScheme({ id: "eligible", eligibilityRules: [{ field: "age", op: "gte", value: 18, text: "18+", textHi: "18+" }] }),
        makeScheme({ id: "possibly", eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }] }),
      ];

      const results = evaluateAllSchemes(schemes, { age: 30 });
      expect(results[0].schemeId).toBe("eligible"); // age 30 >= 18 → eligible
      // Both remaining schemes fail age >= 60 → both ineligible (order between them is unspecified)
      expect(results[1].outcome).toBe("ineligible");
      expect(results[2].outcome).toBe("ineligible");
    });
  });

  describe("eligibilityEngine memoization", () => {
    it("returns cached result for same inputs", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }],
      });

      const result1 = eligibilityEngine.evaluate([scheme], { age: 65 });
      const result2 = eligibilityEngine.evaluate([scheme], { age: 65 });

      expect(result1).toBe(result2);
    });

    it("returns different result for different answers", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }],
      });

      const result1 = eligibilityEngine.evaluate([scheme], { age: 65 });
      const result2 = eligibilityEngine.evaluate([scheme], { age: 30 });

      expect(result1[0].outcome).toBe("eligible");
      expect(result2[0].outcome).toBe("ineligible");
    });

    it("clear() empties the cache", () => {
      const scheme = makeScheme({
        eligibilityRules: [{ field: "age", op: "gte", value: 60, text: "60+", textHi: "60+" }],
      });

      eligibilityEngine.evaluate([scheme], { age: 65 });
      eligibilityEngine.clear();
      const result = eligibilityEngine.evaluate([scheme], { age: 65 });

      expect(result[0].outcome).toBe("eligible");
    });
  });

  describe("empty rules", () => {
    it("returns eligible when no rules exist", () => {
      const scheme = makeScheme({ eligibilityRules: [] });
      const result = evaluateScheme(scheme, {});
      expect(result.outcome).toBe("eligible");
      expect(result.matchedCount).toBe(0);
    });
  });
});