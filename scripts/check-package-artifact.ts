#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isList, isRecord, listOf, parseJsonObject, recordOf } from "./json-shape.ts";
import { preparePackedPackageJson, restorePackedPackageJson } from "./pack-package-json.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = parseJsonObject(readFileSync(join(root, "package.json"), "utf8"), "package.json");
const pluginManifest = parseJsonObject(readFileSync(join(root, "openclaw.plugin.json"), "utf8"), "openclaw.plugin.json");

function normalizePackagePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^package\//u, "").replace(/^\.\//u, "");
}

function readCommandJson(command: string, args: readonly string[]): unknown {
  const output: unknown = JSON.parse(execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }));
  return output;
}

function readPackedPackage(): Readonly<Record<string, unknown>> {
  const output = readCommandJson("npm", ["pack", "--json", "--ignore-scripts"]);
  const rows = isRecord(output) || isList(output) ? Object.values(output) : [];
  const [row] = rows;
  if (rows.length !== 1 || !isRecord(row)) {
    throw new TypeError("npm pack did not return exactly one package row");
  }
  return row;
}

function readPackedFiles(packageRow: Readonly<Record<string, unknown>>): readonly string[] {
  const files = packageRow["files"];
  if (!isList(files)) {
    throw new TypeError("npm pack did not report package files");
  }
  return files.map((file) => {
    const path = recordOf(file)["path"];
    if (typeof path !== "string") {
      throw new TypeError("npm pack reported a file without a string path");
    }
    return normalizePackagePath(path);
  });
}

function readPackedPackageJson(filename: string): Readonly<Record<string, unknown>> {
  const parsed = readCommandJson("tar", ["-xOf", filename, "package/package.json"]);
  if (!isRecord(parsed)) {
    throw new TypeError("packed package.json must be a JSON object");
  }
  return parsed;
}

function readStringList(label: string, value: unknown): readonly string[] {
  return listOf(value).map((entry, index) => {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      throw new TypeError(`${label}[${index}] must be a non-empty string`);
    }
    return normalizePackagePath(entry);
  });
}

function normalizeSkillEntry(entry: string): string {
  const normalized = normalizePackagePath(entry);
  return normalized.endsWith(".md") ? normalized : `${normalized}/SKILL.md`;
}

function callFunction(value: unknown, label: string, thisArgument: unknown, args: readonly unknown[]): unknown {
  if (typeof value !== "function") {
    throw new TypeError(`${label} must be a function`);
  }
  const result: unknown = Reflect.apply(value, thisArgument, args);
  return result;
}

function callMethod(target: unknown, label: string, method: string, args: readonly unknown[]): unknown {
  return callFunction(recordOf(target)[method], `${label}.${method}`, target, args);
}

function firstText(result: unknown, label: string): string {
  const [first] = listOf(recordOf(result)["content"]);
  const text = recordOf(first)["text"];
  if (typeof text !== "string") {
    throw new TypeError(`${label} content[0].text must be a string`);
  }
  return text;
}

let packageRow: Readonly<Record<string, unknown>> | undefined;
let packedPackageJson: Readonly<Record<string, unknown>> | undefined;
let consumer: string | undefined;
preparePackedPackageJson();
try {
  mkdirSync(join(root, ".tmp"), { recursive: true });
  consumer = mkdtempSync(join(root, ".tmp", "package-consumer-"));
  packageRow = readPackedPackage();
  const filename = packageRow["filename"];
  if (typeof filename !== "string" || filename.length === 0) {
    throw new TypeError("npm pack did not report a package filename");
  }
  packedPackageJson = readPackedPackageJson(filename);
  execFileSync("tar", ["-xf", join(root, filename), "-C", consumer]);
  const pluginModule: unknown = await import(pathToFileURL(join(consumer, "package/dist/index.js")).href);
  const plugin = recordOf(pluginModule)["default"];
  const tools = new Map<unknown, { readonly tool: unknown; readonly options: unknown }>();
  const hooks = new Map<unknown, unknown>();
  const commands = new Set<unknown>();
  const host = {
    logger: { error: assert.fail, info(): void {}, warn(): void {} },
    registerCommand(command: unknown): void { commands.add(recordOf(command)["name"]); },
    registerService: assert.fail,
    registerTool(tool: unknown, options: unknown): void { tools.set(recordOf(tool)["name"], { tool, options }); },
    on(name: unknown, hook: unknown): void { hooks.set(name, hook); },
  };
  callMethod(plugin, "packed plugin", "register", [host]);
  assert.deepEqual(new Set(tools.keys()), new Set(["explore", "tweetclaw"]));
  assert.deepEqual(tools.get("tweetclaw")?.options, { name: "tweetclaw", optional: true });
  const catalog = await callMethod(tools.get("explore")?.tool, "explore tool", "execute", [
    "consumer",
    { path: "/api/v1/x/tweets", limit: 1 },
  ]);
  const catalogEntries: unknown = JSON.parse(firstText(catalog, "explore tool result"));
  assert.equal(listOf(catalogEntries).length, 1);
  const unavailable = await callMethod(tools.get("tweetclaw")?.tool, "tweetclaw tool", "execute", [
    "consumer",
    { path: "/api/v1/x/tweets" },
  ]);
  assert.equal(recordOf(unavailable)["isError"], true);
  assert.match(firstText(unavailable, "tweetclaw tool result"), /Add an Xquik API key/);
  const approval = await callFunction(hooks.get("before_tool_call"), "before_tool_call hook", undefined, [{
    toolName: "tweetclaw", params: { method: "POST", path: "/api/v1/x/tweets" },
  }]);
  const requireApproval = recordOf(recordOf(approval)["requireApproval"]);
  assert.deepEqual(requireApproval["allowedDecisions"], ["allow-once", "deny"]);
  assert.equal(requireApproval["timeoutBehavior"], "deny");
  commands.clear();
  callMethod(plugin, "packed plugin", "register", [{ ...host, pluginConfig: { apiKey: "test-key", pollingEnabled: false } }]);
  assert.deepEqual(commands, new Set(["xstatus", "xtrends"]));
} finally {
  restorePackedPackageJson();
  if (consumer !== undefined) {
    rmSync(consumer, { recursive: true, force: true });
  }
  const filename = packageRow?.["filename"];
  if (typeof filename === "string" && filename.length > 0) {
    rmSync(join(root, filename), { force: true });
  }
}

const files = readPackedFiles(packageRow);
const fileSet = new Set(files);
const openclaw = recordOf(packageJson["openclaw"]);
const sourceExtensions = readStringList("package.json openclaw.extensions", openclaw["extensions"]);
const runtimeExtensions = readStringList("package.json openclaw.runtimeExtensions", openclaw["runtimeExtensions"]);
const skillFiles = readStringList("openclaw.plugin.json skills", pluginManifest["skills"]).map(normalizeSkillEntry);
const requiredFiles = [
  "LICENSE",
  "README.md",
  "openclaw.plugin.json",
  "package.json",
  "skills/tweetclaw/BENCHMARK.md",
  "skills/tweetclaw/evals/evals.json",
  "skills/tweetclaw/skill-card.md",
  "skills/tweetclaw/skillspector-report.md",
  ...sourceExtensions,
  ...runtimeExtensions,
  ...skillFiles,
];
const forbiddenFiles = [
  ".DS_Store",
  ".npmrc",
  "src/tools/executor.ts",
];
const forbiddenPrefixes = [
  ".env",
  ".github/",
  "coverage/",
  "node_modules/",
  "package/",
  "tests/",
];
const errors: string[] = [];

if (packageRow["version"] !== packageJson["version"]) {
  errors.push(`package version ${String(packageRow["version"] ?? "<missing>")} does not match package.json ${String(packageJson["version"])}`);
}
for (const forbiddenManifestField of ["devDependencies", "overrides", "scripts"]) {
  if (Object.hasOwn(packedPackageJson, forbiddenManifestField)) {
    errors.push(`packed package.json must omit ${forbiddenManifestField}`);
  }
}
if (recordOf(packedPackageJson["peerDependencies"])["openclaw"] !== recordOf(packageJson["peerDependencies"])["openclaw"]) {
  errors.push("packed package.json must preserve the OpenClaw host peer dependency");
}
if (recordOf(recordOf(packedPackageJson["peerDependenciesMeta"])["openclaw"])["optional"] === true) {
  errors.push("packed package.json must not mark the OpenClaw host peer optional");
}
if (runtimeExtensions.length === 0) {
  errors.push("package.json openclaw.runtimeExtensions must list built runtime entries");
}
if (sourceExtensions.length === 0) {
  errors.push("package.json openclaw.extensions must list source entries");
}
if (sourceExtensions.length !== runtimeExtensions.length) {
  errors.push("package.json openclaw.extensions and openclaw.runtimeExtensions must have matching lengths");
}
if (skillFiles.length === 0) {
  errors.push("openclaw.plugin.json skills must list packaged skill roots");
}
for (const runtimeEntry of runtimeExtensions) {
  if (!runtimeEntry.endsWith(".js")) {
    errors.push(`runtime extension must be built JavaScript: ${runtimeEntry}`);
  }
}
for (const requiredFile of requiredFiles) {
  if (!fileSet.has(requiredFile)) {
    errors.push(`required package file missing: ${requiredFile}`);
  }
}
for (const forbiddenFile of forbiddenFiles) {
  if (fileSet.has(forbiddenFile)) {
    errors.push(`forbidden package file included: ${forbiddenFile}`);
  }
}
for (const file of files) {
  if (file.endsWith(".tgz")) {
    errors.push(`forbidden tarball included: ${file}`);
  }
  for (const prefix of forbiddenPrefixes) {
    if (file.startsWith(prefix)) {
      errors.push(`forbidden package path included: ${file}`);
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`Package artifact check failed:\n${errors.map((error) => `  ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Package artifact OK: ${String(packageJson["name"])}@${String(packageJson["version"])} (${files.length} files)\n`);
