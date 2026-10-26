#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { at, isList, readJsonObject, recordOf } from "./json-shape.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const openclawMinimumVersion = "2026.7.1";
const openclawBuildVersion = "2026.9.6";
const openclawRange = `>=${openclawMinimumVersion}`;
const errors: string[] = [];

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function addError(message: string): void {
  errors.push(`  ${message}`);
}

function assertEqual(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    addError(`${label}: ${String(actual ?? "<missing>")} (expected ${String(expected)})`);
  }
}

function assertArrayIncludes(label: string, value: unknown, expected: string): void {
  if (!isList(value) || !value.includes(expected)) {
    addError(`${label}: missing ${expected}`);
  }
}

function assertFileExists(path: string): void {
  if (!existsSync(join(root, path))) {
    addError(`${path}: missing file`);
  }
}

function assertTextIncludes(path: string, fragment: string): void {
  if (!readText(path).includes(fragment)) {
    addError(`${path}: missing "${fragment}"`);
  }
}

function assertStringList(label: string, value: unknown): readonly string[] {
  if (!isList(value) || value.length === 0) {
    addError(`${label}: expected a non-empty string array`);
    return [];
  }

  return value.flatMap((entry, index) => {
    if (typeof entry !== "string" || entry.length === 0) {
      addError(`${label}[${String(index)}]: expected a non-empty string`);
      return [];
    }
    return [entry];
  });
}

const packageJson = readJsonObject("package.json");
const packageLock = readJsonObject("package-lock.json");
const manifest = readJsonObject("openclaw.plugin.json");
const openclawPackage = recordOf(packageJson["openclaw"]);
const openclawCompat = recordOf(openclawPackage["compat"]);
const openclawBuild = recordOf(openclawPackage["build"]);
const openclawInstall = recordOf(openclawPackage["install"]);

assertEqual("package.json openclaw.compat.pluginApi", openclawCompat["pluginApi"], openclawRange);
assertEqual("package.json openclaw.compat.minGatewayVersion", openclawCompat["minGatewayVersion"], openclawMinimumVersion);
assertEqual("package.json openclaw.build.openclawVersion", openclawBuild["openclawVersion"], openclawBuildVersion);
assertEqual("package.json openclaw.build.pluginSdkVersion", openclawBuild["pluginSdkVersion"], openclawBuildVersion);
assertEqual("package.json openclaw.install.minHostVersion", openclawInstall["minHostVersion"], openclawRange);
assertEqual("package.json peerDependencies.openclaw", at(packageJson, "peerDependencies", "openclaw"), openclawRange);
assertEqual("package.json openclaw.install.defaultChoice", openclawInstall["defaultChoice"], "clawhub");
assertEqual("package.json openclaw.install.clawhubSpec", openclawInstall["clawhubSpec"], `clawhub:${String(packageJson["name"])}`);
assertEqual(
  "package.json openclaw.install.npmSpec",
  openclawInstall["npmSpec"],
  `${String(packageJson["name"])}@${String(packageJson["version"])}`,
);

if (at(packageJson, "peerDependenciesMeta", "openclaw", "optional") === true) {
  addError("package.json peerDependenciesMeta.openclaw must not mark the host peer optional");
}

assertEqual("package-lock root version", at(packageLock, "packages", "", "version"), packageJson["version"]);
assertEqual("package-lock root peerDependencies.openclaw", at(packageLock, "packages", "", "peerDependencies", "openclaw"), openclawRange);
assertEqual("package-lock node_modules/openclaw version", at(packageLock, "packages", "node_modules/openclaw", "version"), openclawBuildVersion);

const sourceEntries = assertStringList("package.json openclaw.extensions", openclawPackage["extensions"]);
const runtimeEntries = assertStringList("package.json openclaw.runtimeExtensions", openclawPackage["runtimeExtensions"]);

assertEqual("package.json openclaw.extensions length", sourceEntries.length, runtimeEntries.length);
for (const entry of sourceEntries) {
  if (!entry.endsWith(".ts")) {
    addError(`package.json openclaw.extensions entry must be TypeScript source: ${entry}`);
  }
  assertFileExists(entry.replace(/^\.\//u, ""));
}
for (const entry of runtimeEntries) {
  if (!entry.endsWith(".js")) {
    addError(`package.json openclaw.runtimeExtensions entry must be built JavaScript: ${entry}`);
  }
  assertFileExists(entry.replace(/^\.\//u, ""));
}

assertEqual("openclaw.plugin.json id", manifest["id"], "tweetclaw");
assertEqual("openclaw.plugin.json version", manifest["version"], packageJson["version"]);
assertEqual("openclaw.plugin.json activation.onStartup", at(manifest, "activation", "onStartup"), false);
assertArrayIncludes("openclaw.plugin.json activation.onCapabilities", at(manifest, "activation", "onCapabilities"), "tool");
assertArrayIncludes("openclaw.plugin.json contracts.tools", at(manifest, "contracts", "tools"), "explore");
assertArrayIncludes("openclaw.plugin.json contracts.tools", at(manifest, "contracts", "tools"), "tweetclaw");
assertEqual("openclaw.plugin.json toolMetadata.tweetclaw.optional", at(manifest, "toolMetadata", "tweetclaw", "optional"), true);

const manifestAliases = manifest["commandAliases"];
const commandAliases = new Map(
  isList(manifestAliases)
    ? manifestAliases.map((alias) => [at(alias, "name"), at(alias, "kind")] as const)
    : [],
);
assertEqual("openclaw.plugin.json commandAliases.xstatus", commandAliases.get("xstatus"), "runtime-slash");
assertEqual("openclaw.plugin.json commandAliases.xtrends", commandAliases.get("xtrends"), "runtime-slash");

assertEqual("openclaw.plugin.json configSchema.type", at(manifest, "configSchema", "type"), "object");
assertEqual("openclaw.plugin.json configSchema.additionalProperties", at(manifest, "configSchema", "additionalProperties"), false);

const configProperties = recordOf(at(manifest, "configSchema", "properties"));
const uiHints = recordOf(manifest["uiHints"]);
for (const key of ["apiKey", "tempoSigningKey", "baseUrl", "pollingInterval", "pollingEnabled"]) {
  if (!Object.hasOwn(configProperties, key)) {
    addError(`openclaw.plugin.json configSchema.properties.${key}: missing`);
  }
  if (!Object.hasOwn(uiHints, key)) {
    addError(`openclaw.plugin.json uiHints.${key}: missing`);
  }
}
assertEqual("openclaw.plugin.json uiHints.apiKey.sensitive", at(uiHints, "apiKey", "sensitive"), true);
assertEqual("openclaw.plugin.json uiHints.tempoSigningKey.sensitive", at(uiHints, "tempoSigningKey", "sensitive"), true);
assertEqual(
  "openclaw.plugin.json configSchema.properties.tempoSigningKey.pattern",
  at(configProperties, "tempoSigningKey", "pattern"),
  "^0x[0-9a-fA-F]{64}$",
);
assertEqual("openclaw.plugin.json configSchema.properties.baseUrl.pattern", at(configProperties, "baseUrl", "pattern"), "^https://");
assertEqual("openclaw.plugin.json configSchema.properties.pollingInterval.minimum", at(configProperties, "pollingInterval", "minimum"), 5);

const skillEntries = assertStringList("openclaw.plugin.json skills", manifest["skills"]);
for (const entry of skillEntries) {
  assertFileExists(`${entry}/SKILL.md`);
}

const indexSource = readText("src/index.ts");
const requiredRuntimeFragments = [
  "import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';",
  "definePluginEntry({",
  "registerService",
  "registerCommand",
  "before_tool_call",
  "allowedDecisions: ['allow-once', 'deny']",
  "{ name: 'tweetclaw', optional: true }",
  "registerWriteApprovalHook(api);",
  "MISSING_CREDENTIALS_MESSAGE",
];
for (const fragment of requiredRuntimeFragments) {
  if (!indexSource.includes(fragment)) {
    addError(`src/index.ts: missing "${fragment}"`);
  }
}

const docChecks = [
  {
    path: "README.md",
    fragments: [
      "openclaw plugins install clawhub:@xquik/tweetclaw",
      "openclaw plugins update tweetclaw",
      "openclaw plugins install npm:@xquik/tweetclaw@<version> --pin",
      "[OpenClaw setup guide](docs/openclaw-setup.md)",
      "OPENCLAW_NIX_MODE=1",
      "tools.alsoAllow",
      "one-time approval or deny",
    ],
  },
  {
    path: "docs/openclaw-setup.md",
    fragments: [
      "openclaw plugins install clawhub:@xquik/tweetclaw",
      "openclaw plugins update tweetclaw",
      "openclaw plugins install npm:@xquik/tweetclaw@<version> --pin",
      "openclaw plugins inspect tweetclaw --runtime --json",
      "openclaw gateway restart",
      "npm-pack:",
      "OPENCLAW_PLUGIN_LIFECYCLE_TRACE=1",
      "OPENCLAW_NIX_MODE=1",
      "definePluginEntry",
    ],
  },
  {
    path: "docs/agent-workflows.md",
    fragments: [
      "OpenClaw",
      "TweetClaw",
      "approval",
    ],
  },
  {
    path: "skills/tweetclaw/SKILL.md",
    fragments: [
      "openclaw plugins install clawhub:@xquik/tweetclaw",
      "openclaw plugins update tweetclaw",
      "openclaw plugins install npm:@xquik/tweetclaw@<version> --pin",
      "openclaw plugins inspect tweetclaw --runtime --json",
      "openclaw gateway restart",
      "OPENCLAW_NIX_MODE=1",
      "one-time approval or deny",
    ],
  },
];

for (const check of docChecks) {
  for (const fragment of check.fragments) {
    assertTextIncludes(check.path, fragment);
  }
}

if (errors.length > 0) {
  process.stderr.write(`OpenClaw platform fitness check failed:\n${errors.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(
  `OpenClaw platform fitness OK: ${String(packageJson["name"])}@${String(packageJson["version"])} supports ${openclawRange} and builds with ${openclawBuildVersion}\n`,
);
