// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

const COVERAGE_START = "<!-- api-coverage:start (npm run generate-api-contract writes this block) -->";
const COVERAGE_END = "<!-- api-coverage:end -->";
const OPENAPI_URL = "https://xquik.com/openapi.json";

function byText(left, right) {
  return left.localeCompare(right, "en");
}

function intern(values) {
  const table = [...new Set(values.map((value) => JSON.stringify(value)))].toSorted(byText);
  const positions = new Map(table.map((text, position) => [text, position]));
  return {
    positionOf: (value) => positions.get(JSON.stringify(value)),
    values: table.map((text) => JSON.parse(text)),
  };
}

function jsonLines(items) {
  return `[\n${items.map((item) => JSON.stringify(item)).join(",\n")}\n]`;
}

function serializeContract(contract) {
  const parameters = intern(contract.operations.flatMap((operation) => operation.parameters));
  const responseShapes = intern(contract.operations.map((operation) => operation.responseShape));
  const operations = contract.operations.map((operation) => ({
    ...operation,
    parameters: operation.parameters.map((parameter) => parameters.positionOf(parameter)),
    responseShape: responseShapes.positionOf(operation.responseShape),
  }));
  return [
    "{",
    `"counts": ${JSON.stringify(contract.counts)},`,
    `"approvalFreeReads": ${JSON.stringify(contract.approvalFreeReads)},`,
    `"blockedOperations": ${jsonLines(contract.blockedOperations)},`,
    `"sessionOnlyOperations": ${jsonLines(contract.sessionOnlyOperations)},`,
    `"parameters": ${jsonLines(parameters.values)},`,
    `"responseShapes": ${jsonLines(responseShapes.values)},`,
    `"operations": ${jsonLines(operations)}`,
    "}",
    "",
  ].join("\n");
}

function expandOperations(serialized) {
  const stored = JSON.parse(serialized);
  return new Map(stored.operations.map((operation) => [
    `${operation.method} ${operation.path}`,
    JSON.stringify({
      ...operation,
      parameters: operation.parameters.map((position) => stored.parameters[position]),
      responseShape: stored.responseShapes[operation.responseShape],
    }),
  ]));
}

function describeDrift(committed, generated) {
  if (committed === generated) return [];
  const before = expandOperations(committed);
  const after = expandOperations(generated);
  const lines = [];
  for (const [key, operation] of after) {
    if (!before.has(key)) lines.push(`the spec adds ${key}`);
    else if (before.get(key) !== operation) lines.push(`the spec changes ${key}`);
  }
  for (const key of before.keys()) {
    if (!after.has(key)) lines.push(`the spec drops ${key}`);
  }
  return lines.length === 0 ? ["counts, approval rules, blocked operations, or session-only operations differ"] : lines;
}

function coverageRow(label, count) {
  return count === 0 ? [] : [`| ${label} | ${String(count)} |`];
}

function renderCoverage(counts) {
  const leftOut = counts.specOperations - counts.callable;
  return [
    COVERAGE_START,
    `The live [Xquik OpenAPI spec](${OPENAPI_URL}) lists ${String(counts.specOperations)} operations. An operation is 1 method on 1 path.`,
    "",
    `Agents can call ${String(counts.callable)} of them through \`tweetclaw\`. TweetClaw leaves out the other ${String(leftOut)}.`,
    "",
    "| Left out | Operations |",
    "| --- | --- |",
    ...coverageRow("Account settings, API keys, billing & support, which stay in the dashboard", counts.agentProhibited),
    ...coverageRow("X account connection, guest wallet checkout & support file downloads", counts.excluded),
    ...coverageRow("Documentation search outside `/api/v1`", counts.outsideApiV1),
    ...coverageRow("Event streams, which the tool cannot read", counts.eventStreams),
    "",
    `${String(counts.mpp)} of the ${String(counts.callable)} accept MPP. Run \`explore\` with \`mpp\` set to \`true\` to list them.`,
    COVERAGE_END,
  ].join("\n");
}

function replaceCoverage(readme, counts) {
  const start = readme.indexOf(COVERAGE_START);
  const end = readme.indexOf(COVERAGE_END);
  if (start === -1 || end < start) return undefined;
  return `${readme.slice(0, start)}${renderCoverage(counts)}${readme.slice(end + COVERAGE_END.length)}`;
}

export { describeDrift, OPENAPI_URL, replaceCoverage, serializeContract };
