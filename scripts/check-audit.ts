#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { EXCUSED, REGISTRY, verify } from "./audit-policy.ts";
import type { AuditRun, InstalledPackage } from "./audit-policy.ts";
import { isRecord } from "./json-shape.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({ options: { npm: { type: "string" } } });
const npmScript = values.npm ?? process.env["npm_execpath"];
const SOURCE = [
  `--registry=${REGISTRY}`,
  "--offline=false",
  "--proxy=null",
  "--https-proxy=null",
  "--noproxy=registry.npmjs.org",
  "--strict-ssl=true",
];
const TRUST_AND_PROXY_VARIABLES = [
  "NODE_EXTRA_CA_CERTS",
  "NODE_TLS_REJECT_UNAUTHORIZED",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "ALL_PROXY",
  "NO_PROXY",
  "http_proxy",
  "https_proxy",
  "all_proxy",
  "no_proxy",
];
for (const variable of TRUST_AND_PROXY_VARIABLES) Reflect.deleteProperty(process.env, variable);
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

const lock = parsed(readFileSync(join(root, "package-lock.json"), "utf8"));
const lockPackages = isRecord(lock) && isRecord(lock["packages"]) ? Object.keys(lock["packages"]) : [];
const installed = new Map(
  lockPackages.flatMap((node): ReadonlyArray<readonly [string, InstalledPackage]> => {
    const manifest = join(root, node, "package.json");
    if (!node.includes("node_modules/") || !existsSync(manifest)) return [];
    const read = parsed(readFileSync(manifest, "utf8"));
    return isRecord(read) ? [[node, { name: read["name"], version: read["version"] }]] : [];
  }),
);

const failures = verify({
  full: audit("--include=dev"),
  installed,
  lock,
  now: Date.now(),
  runtime: audit("--omit=dev"),
  versions: parsed(npm(["view", EXCUSED.package, "versions", "--json", ...SOURCE]).stdout),
});

for (const failure of failures) process.stderr.write(`check-audit: ${failure}.\n`);
if (failures.length > 0) process.exit(1);
process.stdout.write(`check-audit: runtime dependencies have no advisories, and dev tools hold only ${EXCUSED.advisory} until ${EXCUSED.expires}. ${EXCUSED.evidence}\n`);
