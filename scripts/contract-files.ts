// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { isList, isRecord } from "./json-shape.ts";
import type { ApiContract, ContractCounts } from "./openapi-catalog.ts";

const COVERAGE_START = "<!-- api-coverage:start (npm run generate-api-contract writes this block) -->";
const COVERAGE_END = "<!-- api-coverage:end -->";
const OPENAPI_URL = "https://xquik.com/openapi.json";
const CONTRACT_FILE = "generated-api-contract.json";

function byText(left: string, right: string): number {
  return left.localeCompare(right, "en");
}

function intern(values: readonly unknown[]): { readonly positionOf: (value: unknown) => number | undefined; readonly values: unknown[] } {
  const table = [...new Set(values.map((value) => JSON.stringify(value)))].toSorted(byText);
  const positions = new Map(table.map((text, position): [string, number] => [text, position]));
  return {
    positionOf: (value) => positions.get(JSON.stringify(value)),
    values: table.map((text): unknown => JSON.parse(text)),
  };
}

function jsonLines(items: readonly unknown[]): string {
  return `[\n${items.map((item) => JSON.stringify(item)).join(",\n")}\n]`;
}

function serializeContract(contract: ApiContract): string {
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

function storedList(source: Readonly<Record<string, unknown>>, field: string): readonly unknown[] {
  const value = source[field];
  if (!isList(value)) {
    throw new Error(`${CONTRACT_FILE} field ${field} is not a list.`);
  }
  return value;
}

function storedAt(table: readonly unknown[], position: unknown, field: string): unknown {
  if (typeof position !== "number") {
    throw new Error(`${CONTRACT_FILE} operation field ${field} holds a value that is not a position.`);
  }
  return table[position];
}

function expandOperations(serialized: string): Map<string, string> {
  const stored: unknown = JSON.parse(serialized);
  if (!isRecord(stored)) {
    throw new Error(`${CONTRACT_FILE} is not an object.`);
  }
  const parameters = storedList(stored, "parameters");
  const responseShapes = storedList(stored, "responseShapes");
  return new Map(storedList(stored, "operations").map((operation): [string, string] => {
    if (!isRecord(operation)) {
      throw new Error(`${CONTRACT_FILE} field operations holds an entry that is not an object.`);
    }
    const { method, path } = operation;
    if (typeof method !== "string" || typeof path !== "string") {
      throw new Error(`${CONTRACT_FILE} has an operation whose method or path is not text.`);
    }
    return [
      `${method} ${path}`,
      JSON.stringify({
        ...operation,
        parameters: storedList(operation, "parameters").map((position) => storedAt(parameters, position, "parameters")),
        responseShape: storedAt(responseShapes, operation["responseShape"], "responseShape"),
      }),
    ];
  }));
}

function describeDrift(committed: string, generated: string): string[] {
  if (committed === generated) return [];
  const before = expandOperations(committed);
  const after = expandOperations(generated);
  const lines: string[] = [];
  for (const [key, operation] of after) {
    if (!before.has(key)) lines.push(`the spec adds ${key}`);
    else if (before.get(key) !== operation) lines.push(`the spec changes ${key}`);
  }
  for (const key of before.keys()) {
    if (!after.has(key)) lines.push(`the spec drops ${key}`);
  }
  return lines.length === 0 ? ["counts, approval rules, blocked operations, or session-only operations differ"] : lines;
}

function coverageRow(label: string, count: number): string[] {
  return count === 0 ? [] : [`| ${label} | ${String(count)} |`];
}

function renderCoverage(counts: ContractCounts): string {
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

function replaceCoverage(readme: string, counts: ContractCounts): string | undefined {
  const start = readme.indexOf(COVERAGE_START);
  const end = readme.indexOf(COVERAGE_END);
  if (start === -1 || end < start) return undefined;
  return `${readme.slice(0, start)}${renderCoverage(counts)}${readme.slice(end + COVERAGE_END.length)}`;
}

export { describeDrift, OPENAPI_URL, replaceCoverage, serializeContract };
