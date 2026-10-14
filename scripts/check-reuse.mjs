#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REUSE_VERSION = "6.2.0";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("uvx", ["--from", `reuse==${REUSE_VERSION}`, "reuse", "lint"], {
  cwd: root,
  stdio: "inherit",
});
if (result.error !== undefined) {
  process.stderr.write("check-reuse: uvx is missing. Install uv from https://docs.astral.sh/uv, then run again.\n");
  process.exit(1);
}
process.exit(result.status ?? 1);
