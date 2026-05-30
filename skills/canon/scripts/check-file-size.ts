#!/usr/bin/env bun

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const DEFAULT_THRESHOLD = 1000;
const SOURCE_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cs",
  ".css",
  ".go",
  ".java",
  ".js",
  ".jsx",
  ".kt",
  ".md",
  ".mjs",
  ".py",
  ".rs",
  ".scss",
  ".sql",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]);
const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".parcel-cache",
  ".svelte-kit",
  ".turbo",
  ".venv",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "vendor",
]);

type Config = {
  root: string;
  threshold: number;
  fail: boolean;
};

function parseArgs(argv: string[]): Config {
  let root = process.cwd();
  let threshold = DEFAULT_THRESHOLD;
  let fail = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--fail") {
      fail = true;
      continue;
    }

    if (arg === "--threshold") {
      const value = argv[index + 1];
      if (!value) throw new Error("--threshold requires a numeric value");
      threshold = parseThreshold(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--threshold=")) {
      threshold = parseThreshold(arg.slice("--threshold=".length));
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    root = arg;
  }

  return { root: resolve(root), threshold, fail };
}

function parseThreshold(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid threshold: ${value}`);
  }
  return parsed;
}

function printHelp(): void {
  console.log(`Canon file-size scanner\n\nUsage:\n  bun .agents/skills/canon/scripts/check-file-size.ts [root] [--threshold 1000] [--fail]\n\nOptions:\n  --threshold <lines>  Maximum healthy line count. Default: ${DEFAULT_THRESHOLD}.\n  --fail               Exit 1 when oversized files are found. Default: advisory exit 0.\n`);
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
      continue;
    }

    if (!entry.isFile()) continue;

    const path = join(dir, entry.name);
    if (SOURCE_EXTENSIONS.has(extname(path))) yield path;
  }
}

function countLines(path: string): number {
  const content = readFileSync(path, "utf8");
  if (content.length === 0) return 0;
  return content.split(/\r\n|\r|\n/).length;
}

function main(): void {
  const config = parseArgs(process.argv.slice(2));
  const rootStat = statSync(config.root, { throwIfNoEntry: false });

  if (!rootStat?.isDirectory()) {
    throw new Error(`Root is not a directory: ${config.root}`);
  }

  const oversized = [...walk(config.root)]
    .map((path) => ({ path, lines: countLines(path) }))
    .filter((file) => file.lines > config.threshold)
    .sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

  if (oversized.length === 0) {
    console.log(`No files exceed ${config.threshold} lines.`);
    return;
  }

  console.log(`Files over ${config.threshold} lines:`);
  for (const file of oversized) {
    console.log(`${String(file.lines).padStart(5, " ")}  ${relative(config.root, file.path)}`);
  }

  if (config.fail) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
