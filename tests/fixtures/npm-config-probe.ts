// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { closeSync, fstatSync, openSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

const { NPM_CONFIG_USERCONFIG: config = "", PROBE_EXIT: exitCode = "0", PROBE_REPORT: report = "" } = process.env;
const descriptor = openSync(config, "r");
const probe = {
  content: readFileSync(descriptor, "utf8"),
  mode: (fstatSync(descriptor).mode & 0o777).toString(8),
};
closeSync(descriptor);
writeFileSync(report, JSON.stringify(probe));
process.exitCode = Number(exitCode);
