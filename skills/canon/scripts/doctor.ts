#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type JsonObject = Record<string, unknown>;

type Check = {
  label: string;
  ok: boolean;
  detail: string;
};

const requiredCompilerOptions: Record<string, unknown> = {
  strict: true,
  noImplicitReturns: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noFallthroughCasesInSwitch: true,
  exactOptionalPropertyTypes: true,
  noUncheckedIndexedAccess: true,
};

const recommendedOxlintRules: Record<string, string> = {
  "eslint/array-callback-return": "error",
  "eslint/default-case-last": "error",
  "eslint/eqeqeq": "error",
  "eslint/no-console": "error",
  "eslint/no-empty": "error",
  "eslint/no-empty-function": "error",
  "eslint/no-eq-null": "error",
  "eslint/no-nested-ternary": "error",
  "eslint/no-return-assign": "error",
  "eslint/no-throw-literal": "error",
  "eslint/prefer-const": "error",
  "import/no-duplicates": "error",
  "oxc/no-optional-chaining": "error",
  "promise/always-return": "error",
  "promise/catch-or-return": "error",
  "promise/prefer-await-to-then": "error",
  "react/exhaustive-deps": "error",
  "react/jsx-no-duplicate-props": "error",
  "typescript/no-empty-object-type": "error",
  "typescript/no-explicit-any": "error",
  "typescript/no-floating-promises": "error",
  "typescript/no-misused-promises": "error",
  "typescript/no-non-null-asserted-nullish-coalescing": "error",
  "typescript/no-non-null-asserted-optional-chain": "error",
  "typescript/no-non-null-assertion": "error",
  "typescript/no-unsafe-argument": "error",
  "typescript/no-unsafe-assignment": "error",
  "typescript/no-unsafe-call": "error",
  "typescript/no-unsafe-member-access": "error",
  "typescript/no-unsafe-return": "error",
  "typescript/no-unsafe-type-assertion": "error",
  "typescript/only-throw-error": "error",
  "typescript/prefer-nullish-coalescing": "error",
  "typescript/prefer-promise-reject-errors": "error",
  "typescript/switch-exhaustiveness-check": "error",
  "unicorn/no-anonymous-default-export": "error",
  "unicorn/no-null": "error",
  "unicorn/no-useless-undefined": "error",
  "unicorn/throw-new-error": "error",
};

const expectedPlugins = [
  "typescript",
  "react",
  "react-hooks",
  "jsx-a11y",
  "import",
  "promise",
  "unicorn",
  "oxc",
];

function stripJsonComments(source: string): string {
  let output = "";
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringQuote = char;
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
      output += "\n";
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (
        index < source.length &&
        !(source[index] === "*" && source[index + 1] === "/")
      ) {
        index += 1;
      }
      index += 1;
      continue;
    }

    output += char;
  }

  return output;
}

function readJson(path: string): JsonObject | null {
  if (!existsSync(path)) return null;
  return JSON.parse(stripJsonComments(readFileSync(path, "utf8"))) as JsonObject;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function severityOf(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function hasTsOverride(config: JsonObject): boolean {
  const overrides = config.overrides;
  if (!Array.isArray(overrides)) return false;

  return overrides.some((override) => {
    if (!isObject(override)) return false;
    const files = override.files;
    const patterns = Array.isArray(files) ? files : [files];
    return patterns.some(
      (pattern) =>
        typeof pattern === "string" &&
        (pattern.includes("*.ts") || pattern.includes("*.tsx")),
    );
  });
}

function mergedTsRules(config: JsonObject): JsonObject {
  const rootRules = isObject(config.rules) ? config.rules : {};
  const overrides = Array.isArray(config.overrides) ? config.overrides : [];

  const tsOverrideRules = overrides.reduce<JsonObject>((rules, override) => {
    if (!isObject(override) || !isObject(override.rules)) return rules;
    const files = override.files;
    const patterns = Array.isArray(files) ? files : [files];
    const appliesToTs = patterns.some(
      (pattern) =>
        typeof pattern === "string" &&
        (pattern.includes("*.ts") || pattern.includes("*.tsx")),
    );
    return appliesToTs ? { ...rules, ...override.rules } : rules;
  }, {});

  return { ...rootRules, ...tsOverrideRules };
}

const root = process.cwd();
const tsconfigPath = join(root, "tsconfig.json");
const oxlintPath = join(root, ".oxlintrc.json");
const packagePath = join(root, "package.json");

const tsconfig = readJson(tsconfigPath);
const packageJson = readJson(packagePath);
const hasTypeScriptDependency =
  isObject(packageJson?.dependencies) && "typescript" in packageJson.dependencies ||
  isObject(packageJson?.devDependencies) && "typescript" in packageJson.devDependencies;

if (!tsconfig && !hasTypeScriptDependency) {
  console.log("Canon doctor: no TypeScript project detected. Nothing to check.");
  process.exit(0);
}

const checks: Check[] = [];

if (!tsconfig) {
  checks.push({
    label: "tsconfig.json exists",
    ok: false,
    detail: "TypeScript dependency found, but tsconfig.json is missing.",
  });
} else {
  const compilerOptions = isObject(tsconfig.compilerOptions)
    ? tsconfig.compilerOptions
    : {};

  for (const [option, expected] of Object.entries(requiredCompilerOptions)) {
    const actual = compilerOptions[option];
    checks.push({
      label: `tsconfig compilerOptions.${option}`,
      ok: actual === expected,
      detail: actual === expected ? "configured" : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    });
  }
}

const oxlint = readJson(oxlintPath);

if (!oxlint) {
  checks.push({
    label: ".oxlintrc.json exists",
    ok: false,
    detail: "Oxlint config not found. Skip if this project uses a different linter.",
  });
} else {
  const plugins = Array.isArray(oxlint.plugins) ? oxlint.plugins : [];
  for (const plugin of expectedPlugins) {
    checks.push({
      label: `oxlint plugin ${plugin}`,
      ok: plugins.includes(plugin),
      detail: plugins.includes(plugin) ? "enabled" : "missing",
    });
  }

  checks.push({
    label: "oxlint TypeScript override",
    ok: hasTsOverride(oxlint),
    detail: hasTsOverride(oxlint)
      ? "rules can be scoped to TypeScript files"
      : "recommended: place Canon rules under overrides for **/*.{ts,tsx}",
  });

  const rules = mergedTsRules(oxlint);
  for (const [rule, expected] of Object.entries(recommendedOxlintRules)) {
    const actual = severityOf(rules[rule]);
    checks.push({
      label: `oxlint rule ${rule}`,
      ok: actual === expected,
      detail: actual === expected ? "configured" : `expected ${expected}, got ${actual ?? "missing"}`,
    });
  }
}

const failed = checks.filter((check) => !check.ok);

for (const check of checks) {
  console.log(`${check.ok ? "✓" : "✗"} ${check.label}: ${check.detail}`);
}

if (failed.length > 0) {
  console.log(`\nCanon doctor found ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("\nCanon doctor passed.");
