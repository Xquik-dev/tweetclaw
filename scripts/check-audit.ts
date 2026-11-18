#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { parseExceptions, verify } from "./audit-policy.ts";
import { recordOf } from "./json-shape.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({ options: { npm: { type: "string" } } });
const npmScript = values.npm ?? process.env["npm_execpath"];
const NPM = npmScript === undefined ? ["npm"] : [process.execPath, npmScript];

function npm(args: readonly string[]): { readonly status: number | null; readonly stderr: string; readonly stdout: string } {
  const [command = "npm", ...prefix] = NPM;
  const run = spawnSync(command, [...prefix, ...args], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { status: run.status, stderr: run.stderr, stdout: run.stdout };
}

function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

const audit = npm(["audit", "--json", "--include=dev"]);
if (audit.status !== 0 && audit.status !== 1) {
  process.stderr.write(`check-audit: npm audit exited ${String(audit.status)}. ${audit.stderr}\n`);
  process.exit(1);
}

const lockPackages = recordOf(recordOf(readJson("package-lock.json"))["packages"]);
const installed = new Map(
  Object.entries(lockPackages).flatMap(([node, value]) => {
    const version = recordOf(value)["version"];
    return typeof version === "string" ? [[node, version] as const] : [];
  }),
);
const runtimeNodes = new Set(Object.keys(lockPackages).filter((node) => recordOf(lockPackages[node])["dev"] !== true));
const exceptions = parseExceptions(readJson("audit-exceptions.json"));
const newest = new Map(
  [...new Set(exceptions.map((exception) => exception.package))].map((name) => {
    const view = npm(["view", name, "version"]);
    return [name, view.status === 0 ? view.stdout.trim() : ""] as const;
  }),
);

const verdict = verify({ auditStatus: audit.status, exceptions, installed, newest, now: Date.now(), report: JSON.parse(audit.stdout), runtimeNodes });
for (const line of verdict.lines) process.stdout.write(`check-audit: ${line}\n`);
if (verdict.failures > 0) {
  process.stderr.write(`check-audit: ${String(verdict.failures)} lines above fail the dependency audit.\n`);
  process.exit(1);
}
process.stdout.write(`check-audit: the dependency audit passes with ${String(verdict.lines.length)} reviewed lines.\n`);
