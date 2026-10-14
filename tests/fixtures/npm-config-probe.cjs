// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

const fs = require("node:fs");
const process = require("node:process");

const config = process.env.NPM_CONFIG_USERCONFIG;
fs.writeFileSync(process.env.PROBE_REPORT, JSON.stringify({
  content: fs.readFileSync(config, "utf8"),
  mode: (fs.statSync(config).mode & 0o777).toString(8),
}));
process.exit(Number(process.env.PROBE_EXIT ?? 0));
