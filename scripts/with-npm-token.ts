#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const REGISTRY_HOST = "registry.npmjs.org";
const KEYCHAIN_SETTINGS = [
  ["NPM_KEYCHAIN_SERVICE", "service"],
  ["NPM_KEYCHAIN_ACCOUNT", "account"],
] as const;
const MISSING_ITEM =
  "The Keychain has no item for NPM_KEYCHAIN_SERVICE and NPM_KEYCHAIN_ACCOUNT. Add the npm token to the Keychain, then run again.";

function missingKeychainSetting(env: NodeJS.ProcessEnv = process.env): string | undefined {
  for (const [name, field] of KEYCHAIN_SETTINGS) {
    if ((env[name] ?? "") === "") {
      return `${name} is unset. Set it to the ${field} name of the Keychain item that holds the npm token.`;
    }
  }
  return undefined;
}

function findKeychainItem(env: NodeJS.ProcessEnv, ...extraArguments: readonly string[]): string {
  return execFileSync(
    "security",
    ["find-generic-password", "-s", env["NPM_KEYCHAIN_SERVICE"] ?? "", "-a", env["NPM_KEYCHAIN_ACCOUNT"] ?? "", ...extraArguments],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
}

function stop(message: string): never {
  process.stderr.write(`with-npm-token: ${message}\n`);
  process.exit(1);
}

function readNpmToken(env: NodeJS.ProcessEnv): string {
  let token = "";
  try {
    token = findKeychainItem(env, "-w").trim();
  } catch {
    stop(MISSING_ITEM);
  }
  if (token === "") stop("The Keychain item is empty. Store the npm token in it, then run again.");
  return token;
}

function checkKeychainItem(env: NodeJS.ProcessEnv): void {
  try {
    findKeychainItem(env);
  } catch {
    stop(MISSING_ITEM);
  }
}

function runWithNpmToken(command: string, commandArguments: readonly string[], env: NodeJS.ProcessEnv): number {
  const token = readNpmToken(env);
  const folder = mkdtempSync(join(tmpdir(), "tweetclaw-npm-"));
  const removeFolder = () => rmSync(folder, { force: true, recursive: true });
  process.on("exit", removeFolder);
  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => process.exit(1));
  }
  const userConfig = join(folder, "npmrc");
  writeFileSync(userConfig, `registry=https://${REGISTRY_HOST}/\n//${REGISTRY_HOST}/:_authToken=${token}\n`, { mode: 0o600 });
  const result = spawnSync(command, commandArguments, {
    env: { ...env, NPM_CONFIG_USERCONFIG: userConfig },
    stdio: "inherit",
  });
  removeFolder();
  return result.status ?? 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [command, ...commandArguments] = process.argv.slice(2);
  const missing = missingKeychainSetting();
  if (missing !== undefined) stop(missing);
  if (command === undefined) stop("Name the command to run, or pass --check.");
  if (command === "--check") {
    checkKeychainItem(process.env);
  } else {
    process.exit(runWithNpmToken(command, commandArguments, process.env));
  }
}

export { missingKeychainSetting };
