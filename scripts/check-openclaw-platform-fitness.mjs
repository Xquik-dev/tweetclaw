#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const openclawBaseline = "2026.6.8";
const openclawRange = `>=${openclawBaseline}`;
const errors = [];

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function addError(message) {
  errors.push(`  ${message}`);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    addError(`${label}: ${String(actual ?? "<missing>")} (expected ${String(expected)})`);
  }
}

function assertArrayIncludes(label, value, expected) {
  if (!Array.isArray(value) || !value.includes(expected)) {
    addError(`${label}: missing ${expected}`);
  }
}

function assertFileExists(path) {
  if (!existsSync(join(root, path))) {
    addError(`${path}: missing file`);
  }
}

function assertTextIncludes(path, fragment) {
  if (!readText(path).includes(fragment)) {
    addError(`${path}: missing "${fragment}"`);
  }
}

function assertStringList(label, value) {
  if (!Array.isArray(value) || value.length === 0) {
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

const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const manifest = readJson("openclaw.plugin.json");
const openclawPackage = packageJson.openclaw ?? {};
const openclawCompat = openclawPackage.compat ?? {};
const openclawBuild = openclawPackage.build ?? {};
const openclawInstall = openclawPackage.install ?? {};

assertEqual("package.json openclaw.compat.pluginApi", openclawCompat.pluginApi, openclawRange);
assertEqual("package.json openclaw.compat.minGatewayVersion", openclawCompat.minGatewayVersion, openclawBaseline);
assertEqual("package.json openclaw.build.openclawVersion", openclawBuild.openclawVersion, openclawBaseline);
assertEqual("package.json openclaw.build.pluginSdkVersion", openclawBuild.pluginSdkVersion, openclawBaseline);
assertEqual("package.json openclaw.install.minHostVersion", openclawInstall.minHostVersion, openclawRange);
assertEqual("package.json peerDependencies.openclaw", packageJson.peerDependencies?.openclaw, openclawRange);
assertEqual("package.json openclaw.install.defaultChoice", openclawInstall.defaultChoice, "npm");
assertEqual("package.json openclaw.install.npmSpec", openclawInstall.npmSpec, `${packageJson.name}@${packageJson.version}`);

if (Object.hasOwn(openclawInstall, "clawhubSpec")) {
  addError("package.json openclaw.install.clawhubSpec must stay absent until ClawHub publishes the current scoped package");
}
if (packageJson.peerDependenciesMeta?.openclaw?.optional === true) {
  addError("package.json peerDependenciesMeta.openclaw must not mark the host peer optional");
}

assertEqual("package-lock root version", packageLock.packages?.[""]?.version, packageJson.version);
assertEqual("package-lock root peerDependencies.openclaw", packageLock.packages?.[""]?.peerDependencies?.openclaw, openclawRange);
assertEqual("package-lock node_modules/openclaw version", packageLock.packages?.["node_modules/openclaw"]?.version, openclawBaseline);

const sourceEntries = assertStringList("package.json openclaw.extensions", openclawPackage.extensions);
const runtimeEntries = assertStringList("package.json openclaw.runtimeExtensions", openclawPackage.runtimeExtensions);

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

assertEqual("openclaw.plugin.json id", manifest.id, "tweetclaw");
assertEqual("openclaw.plugin.json version", manifest.version, packageJson.version);
assertEqual("openclaw.plugin.json activation.onStartup", manifest.activation?.onStartup, false);
assertArrayIncludes("openclaw.plugin.json activation.onCapabilities", manifest.activation?.onCapabilities, "tool");
assertArrayIncludes("openclaw.plugin.json contracts.tools", manifest.contracts?.tools, "explore");
assertArrayIncludes("openclaw.plugin.json contracts.tools", manifest.contracts?.tools, "tweetclaw");
assertEqual("openclaw.plugin.json toolMetadata.tweetclaw.optional", manifest.toolMetadata?.tweetclaw?.optional, true);

const commandAliases = new Map(
  Array.isArray(manifest.commandAliases)
    ? manifest.commandAliases.map((alias) => [alias?.name, alias?.kind])
    : [],
);
assertEqual("openclaw.plugin.json commandAliases.xstatus", commandAliases.get("xstatus"), "runtime-slash");
assertEqual("openclaw.plugin.json commandAliases.xtrends", commandAliases.get("xtrends"), "runtime-slash");

assertEqual("openclaw.plugin.json configSchema.type", manifest.configSchema?.type, "object");
assertEqual("openclaw.plugin.json configSchema.additionalProperties", manifest.configSchema?.additionalProperties, false);

const configProperties = manifest.configSchema?.properties ?? {};
const uiHints = manifest.uiHints ?? {};
for (const key of ["apiKey", "tempoSigningKey", "baseUrl", "pollingInterval", "pollingEnabled"]) {
  if (!Object.hasOwn(configProperties, key)) {
    addError(`openclaw.plugin.json configSchema.properties.${key}: missing`);
  }
  if (!Object.hasOwn(uiHints, key)) {
    addError(`openclaw.plugin.json uiHints.${key}: missing`);
  }
}
assertEqual("openclaw.plugin.json uiHints.apiKey.sensitive", uiHints.apiKey?.sensitive, true);
assertEqual("openclaw.plugin.json uiHints.tempoSigningKey.sensitive", uiHints.tempoSigningKey?.sensitive, true);
assertEqual("openclaw.plugin.json configSchema.properties.baseUrl.pattern", configProperties.baseUrl?.pattern, "^https://");
assertEqual("openclaw.plugin.json configSchema.properties.pollingInterval.minimum", configProperties.pollingInterval?.minimum, 5);

const skillEntries = assertStringList("openclaw.plugin.json skills", manifest.skills);
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
      "openclaw plugins install npm:@xquik/tweetclaw",
      "openclaw plugins update tweetclaw",
      "openclaw plugins install npm:@xquik/tweetclaw@<version> --pin",
      "openclaw plugins inspect tweetclaw --runtime --json",
      "openclaw gateway restart",
      "OPENCLAW_PLUGIN_LIFECYCLE_TRACE=1",
      "OPENCLAW_NIX_MODE=1",
      "tools.alsoAllow",
      "one-time approval or deny",
    ],
  },
  {
    path: "docs/openclaw-setup.md",
    fragments: [
      "openclaw plugins install npm:@xquik/tweetclaw",
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
      "openclaw plugins install npm:@xquik/tweetclaw",
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

process.stdout.write(`OpenClaw platform fitness OK: ${packageJson.name}@${packageJson.version} targets OpenClaw ${openclawBaseline}\n`);
