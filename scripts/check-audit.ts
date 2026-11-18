#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { EXCUSED, REGISTRY, verify } from "./audit-policy.ts";
import type { AuditRun } from "./audit-policy.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({ options: { npm: { type: "string" } } });
const npmScript = values.npm ?? process.env["npm_execpath"];
const SOURCE = [`--registry=${REGISTRY}`, "--offline=false"];
const WHOLE_TREE = ["--include=optional", "--include=peer", "--workspaces=null"];

function npm(args: readonly string[]): { readonly status: number | null; readonly stdout: string } {
  const command = npmScript === undefined ? ["npm"] : [process.execPath, npmScript];
  const [program = "npm", ...prefix] = command;
  const run = spawnSync(program, [...prefix, ...args], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { status: run.status, stdout: run.stdout };
}

function parsed(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function audit(scope: string): AuditRun {
  const run = npm(["audit", "--json", scope, ...WHOLE_TREE, ...SOURCE]);
  return { report: parsed(run.stdout), status: run.status };
}

const failures = verify({
  full: audit("--include=dev"),
  lock: parsed(readFileSync(join(root, "package-lock.json"), "utf8")),
  now: Date.now(),
  runtime: audit("--omit=dev"),
  versions: parsed(npm(["view", EXCUSED.package, "versions", "--json", ...SOURCE]).stdout),
});

for (const failure of failures) process.stderr.write(`check-audit: ${failure}.\n`);
if (failures.length > 0) process.exit(1);
process.stdout.write(`check-audit: runtime dependencies have no advisories, and dev tools hold only ${EXCUSED.advisory} until ${EXCUSED.expires}. ${EXCUSED.evidence}\n`);
