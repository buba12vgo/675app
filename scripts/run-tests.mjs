#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const runE2e = args.has("--e2e") || args.has("--full") || process.env.RUN_E2E === "1";
const runRules = args.has("--rules") || args.has("--full");
const runIntegration = !args.has("--no-integration");

function run(label, command, commandArgs = []) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, commandArgs, { stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.error(`\n✘ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

run("Lint", "npm", ["run", "lint"]);
run("Build", "npm", ["run", "build"]);
run("Unit tests", "npm", ["run", "test:unit"]);

if (runIntegration) {
  run("Firebase integration", "npm", ["run", "test:integration"]);
}

if (runE2e) {
  run("E2E Playwright", "npm", ["run", "test:e2e"]);
}

if (runRules) {
  run("Firestore rules (emulator)", "npm", ["run", "test:rules"]);
}

console.log("\n✔ Test suite completed");
