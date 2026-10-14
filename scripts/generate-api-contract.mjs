#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { CATALOG_POLICY } from "./catalog-policy.mjs";
import { describeDrift, OPENAPI_URL, replaceCoverage, serializeContract } from "./contract-files.mjs";
import { buildContract } from "./openapi-catalog.mjs";

const FETCH_TIMEOUT_MS = 30_000;
const REGENERATE = "Run `npm run generate-api-contract`, review the diff, and commit it.";

async function readSpec(source) {
  if (!/^https?:\/\//u.test(source)) return JSON.parse(readFileSync(source, "utf8"));
  const response = await fetch(source, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`${source} returned HTTP ${String(response.status)}. Check the address, then run again.`);
  }
  return response.json();
}

function report(message) {
  process.stdout.write(`generate-api-contract: ${message}\n`);
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      check: { default: false, type: "boolean" },
      root: { default: join(dirname(fileURLToPath(import.meta.url)), ".."), type: "string" },
    },
  });
  const contractPath = join(values.root, "generated-api-contract.json");
  const readmePath = join(values.root, "README.md");

  const spec = await readSpec(positionals[0] ?? OPENAPI_URL);
  const { absentExclusions, contract } = buildContract(spec, CATALOG_POLICY);
  const serialized = serializeContract(contract);
  const committedReadme = readFileSync(readmePath, "utf8");
  const readme = replaceCoverage(committedReadme, contract.counts);
  if (readme === undefined) {
    throw new Error("README.md has no api-coverage block. Restore its start and end markers.");
  }

  const { callable, specOperations } = contract.counts;
  const summary = `${String(callable)} of ${String(specOperations)} spec operations are agent-callable.`;
  for (const key of absentExclusions) {
    report(`the spec does not publish ${key}. It stays excluded.`);
  }

  if (!values.check) {
    writeFileSync(contractPath, serialized);
    writeFileSync(readmePath, readme);
    report(`wrote the catalog. ${summary}`);
    return;
  }

  const drift = [
    ...describeDrift(readFileSync(contractPath, "utf8"), serialized),
    ...(committedReadme === readme ? [] : ["the README coverage block differs"]),
  ];
  if (drift.length > 0) {
    throw new Error(`the catalog is behind the spec.\n${drift.map((line) => `  ${line}`).join("\n")}\n${REGENERATE}`);
  }
  report(`the catalog matches the spec. ${summary}`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`generate-api-contract: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
