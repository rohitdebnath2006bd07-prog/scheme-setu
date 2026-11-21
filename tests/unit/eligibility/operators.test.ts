import { describe, it, expect } from "vitest";
import {
  evaluateRule,
  opGte,
  opLte,
  opEq,
  opNeq,
  opIn,
  opNotIn,
  opExists,
  opNotExists,
} from "@/lib/eligibility/operators";

describe("eligibility operators", () => {
  describe("opGte (greater than or equal)", () => {
    it("returns true when answer >= rule value", () => {
      expect(opGte(60, 60)).toBe(true);
      expect(opGte(61, 60)).toBe(true);
      expect(opGte(100, 50)).toBe(true);
    });

    it("returns false when answer < rule value", () => {
      expect(opGte(59, 60)).toBe(false);
      expect(opGte(0, 60)).toBe(false);
    });

    it("returns false for non-numeric inputs", () => {
      expect(opGte("60", 60)).toBe(false);
      expect(opGte(60, "60")).toBe(false);
      expect(opGte(undefined, 60)).toBe(false);
    });

    it("handles boundary: age exactly 60", () => {
      expect(opGte(60, 60)).toBe(true);
    });
  });

  describe("opLte (less than or equal)", () => {
    it("returns true when answer <= rule value", () => {
      expect(opLte(60, 60)).toBe(true);
      expect(opLte(59, 60)).toBe(true);
      expect(opLte(0, 60)).toBe(true);
    });

    it("returns false when answer > rule value", () => {
      expect(opLte(61, 60)).toBe(false);
      expect(opLte(100, 60)).toBe(false);
    });

    it("returns false for non-numeric inputs", () => {
      expect(opLte("60", 60)).toBe(false);
      expect(opLte(undefined, 60)).toBe(false);
    });

    it("handles boundary: age exactly 60", () => {
      expect(opLte(60, 60)).toBe(true);
    });
  });

  describe("opEq (equal)", () => {
    it("returns true for equal strings", () => {
      expect(opEq("male", "male")).toBe(true);
      expect(opEq("female", "female")).toBe(true);
    });

    it("returns true for equal numbers", () => {
      expect(opEq(5, 5)).toBe(true);
    });

    it("returns false for different values", () => {
      expect(opEq("male", "female")).toBe(false);
      expect(opEq(5, 10)).toBe(false);
    });

    it("returns false for undefined/null", () => {
      expect(opEq(undefined, "male")).toBe(false);
      expect(opEq(null, "male")).toBe(false);
    });
  });

  describe("opNeq (not equal)", () => {
    it("returns true for different values", () => {
      expect(opNeq("male", "female")).toBe(true);
      expect(opNeq(5, 10)).toBe(true);
    });

    it("returns false for equal values", () => {
      expect(opNeq("male", "male")).toBe(false);
    });
  });

  describe("opIn (value in array)", () => {
    it("returns true when answer is in array", () => {
      expect(opIn("SC", ["SC", "ST", "OBC"])).toBe(true);
      expect(opIn("OBC", ["SC", "ST", "OBC"])).toBe(true);
    });

    it("returns false when answer is not in array", () => {
      expect(opIn("General", ["SC", "ST", "OBC"])).toBe(false);
    });

    it("returns false for non-array ruleValue", () => {
      expect(opIn("SC", "not-an-array")).toBe(false);
    });
  });

  describe("opNotIn (value not in array)", () => {
    it("returns true when answer is not in array", () => {
      expect(opNotIn("General", ["SC", "ST", "OBC"])).toBe(true);
    });

    it("returns false when answer is in array", () => {
      expect(opNotIn("SC", ["SC", "ST", "OBC"])).toBe(false);
    });
  });

  describe("opExists (field is answered)", () => {
    it("returns true when answer is provided", () => {
      expect(opExists(25)).toBe(true);
      expect(opExists("male")).toBe(true);
      expect(opExists(0)).toBe(true);
    });

    it("returns false when answer is missing", () => {
      expect(opExists(undefined)).toBe(false);
      expect(opExists(null)).toBe(false);
      expect(opExists("")).toBe(false);
    });
  });

  describe("opNotExists (field is NOT answered)", () => {
    it("returns true when answer is missing", () => {
      expect(opNotExists(undefined)).toBe(true);
      expect(opNotExists(null)).toBe(true);
      expect(opNotExists("")).toBe(true);
    });

    it("returns false when answer is provided", () => {
      expect(opNotExists(25)).toBe(false);
      expect(opNotExists("male")).toBe(false);
    });
  });

  describe("evaluateRule (integration of operators with missing handling)", () => {
    it("returns 'missing' for comparison operators when answer is undefined", () => {
      expect(evaluateRule("gte", undefined, 60)).toBe("missing");
      expect(evaluateRule("lte", undefined, 60)).toBe("missing");
      expect(evaluateRule("eq", undefined, "male")).toBe("missing");
      expect(evaluateRule("in", undefined, ["SC", "ST"])).toBe("missing");
    });

    it("returns 'matched' when rule is satisfied", () => {
      expect(evaluateRule("gte", 65, 60)).toBe("matched");
      expect(evaluateRule("eq", "female", "female")).toBe("matched");
      expect(evaluateRule("in", "SC", ["SC", "ST"])).toBe("matched");
    });

    it("returns 'failed' when rule is not satisfied", () => {
      expect(evaluateRule("gte", 30, 60)).toBe("failed");
      expect(evaluateRule("eq", "male", "female")).toBe("failed");
      expect(evaluateRule("in", "General", ["SC", "ST"])).toBe("failed");
    });

    it("exists returns matched/failed based on answer presence", () => {
      expect(evaluateRule("exists", 25)).toBe("matched");
      expect(evaluateRule("exists", undefined)).toBe("failed");
    });

    it("notExists returns matched/failed based on answer absence", () => {
      expect(evaluateRule("notExists", undefined)).toBe("matched");
      expect(evaluateRule("notExists", 25)).toBe("failed");
    });
  });
});