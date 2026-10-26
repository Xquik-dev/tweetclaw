// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { readFileSync, statSync, writeFileSync } from "node:fs";
import process from "node:process";

const { NPM_CONFIG_USERCONFIG: config = "", PROBE_EXIT: exitCode = "0", PROBE_REPORT: report = "" } = process.env;
writeFileSync(report, JSON.stringify({
  content: readFileSync(config, "utf8"),
  mode: (statSync(config).mode & 0o777).toString(8),
}));
process.exitCode = Number(exitCode);
