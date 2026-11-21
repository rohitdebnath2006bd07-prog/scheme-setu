import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  schemeSchema,
  WIZARD_FIELDS,
  validateScheme,
  validateRuleFields,
  isStale,
  type Scheme,
} from "@/lib/validation/scheme.schema";

const SCHEMES_DIR = join(process.cwd(), "src/data/schemes");
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

let errors: string[] = [];
let warnings: string[] = [];
let checked = 0;

function loadSchemesFromDir(dir: string): Scheme[] {
  const schemes: Scheme[] = [];
  const entries: string[] = readdirSync(dir, { recursive: true }) as string[];

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const filePath = join(dir, entry);
    try {
      const raw = JSON.parse(readFileSync(filePath, "utf-8"));
      schemes.push(raw);
    } catch (err) {
      errors.push(`${entry}: Failed to parse JSON - ${String(err)}`);
    }
  }

  return schemes;
}

function validate() {
  console.log("🔍 Validating scheme data...\n");

  const schemes = loadSchemesFromDir(SCHEMES_DIR);
  console.log(`Found ${schemes.length} scheme files\n`);

  const seenIds = new Set<string>();

  for (const scheme of schemes) {
    checked++;

    // 1. Zod schema validation
    try {
      validateScheme(scheme);
    } catch (err) {
      errors.push(`${scheme.id}: Schema validation failed - ${err}`);
      continue;
    }

    // 2. Duplicate ID check
    if (seenIds.has(scheme.id)) {
      errors.push(`Duplicate scheme ID: ${scheme.id}`);
    }
    seenIds.add(scheme.id);

    // 3. Rule field validation
    try {
      validateRuleFields(scheme);
    } catch (err) {
      errors.push(`${scheme.id}: ${(err as Error).message}`);
    }

    // 4. URL validation (https only)
    if (!scheme.officialSourceUrl.startsWith("https://")) {
      errors.push(`${scheme.id}: officialSourceUrl must use https`);
    }
    if (scheme.officialApplyUrl && !scheme.officialApplyUrl.startsWith("https://")) {
      errors.push(`${scheme.id}: officialApplyUrl must use https`);
    }

    // 5. Staleness check (lastVerified > 6 months old)
    if (isStale(scheme)) {
      warnings.push(
        `${scheme.id}: lastVerified (${scheme.lastVerified}) is older than 6 months`
      );
    }

    // 6. Verification status check
    if (scheme.verificationStatus === "needs-verification") {
      warnings.push(
        `${scheme.id}: marked as NEEDS VERIFICATION - verify against official source`
      );
    }
  }

  // Summary
  console.log(`\n📊 Validation Summary:`);
  console.log(`   Schemes checked: ${checked}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach((w) => console.log(`   - ${w}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((e) => console.log(`   - ${e}`));
    process.exit(1);
  }

  if (warnings.length === 0 && errors.length === 0) {
    console.log("\n✅ All scheme data is valid!");
  }
}

validate();