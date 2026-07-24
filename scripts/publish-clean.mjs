#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { preparePackedPackageJson, restorePackedPackageJson } from "./pack-package-json.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishArgs = ["publish", "--access", "public", "--ignore-scripts", ...process.argv.slice(2)];

function runNpmScript(scriptName) {
  execFileSync("npm", ["run", scriptName], {
    cwd: root,
    stdio: "inherit",
  });
}

runNpmScript("check-public-copy");
runNpmScript("check-skill-frontmatter");
runNpmScript("check-versions");
runNpmScript("build");
runNpmScript("check-package-artifact");

preparePackedPackageJson();
try {
  execFileSync("npm", publishArgs, {
    cwd: root,
    stdio: "inherit",
  });
} finally {
  restorePackedPackageJson();
}
