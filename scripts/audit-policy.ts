// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { isList, isRecord } from "./json-shape.ts";

export interface AuditException {
  readonly added: string;
  readonly evidence: string;
  readonly expires: string;
  readonly exposure: string;
  readonly id: string;
  readonly package: string;
  readonly version: string;
}

export interface AuditInputs {
  readonly auditStatus: number | null;
  readonly exceptions: readonly AuditException[];
  readonly installed: ReadonlyMap<string, string>;
  readonly newest: ReadonlyMap<string, string>;
  readonly now: number;
  readonly report: unknown;
}

export interface AuditVerdict {
  readonly failures: number;
  readonly lines: readonly string[];
}

interface Finding {
  readonly id: string;
  readonly name: string;
  readonly severity: string;
  readonly version: string;
}

interface Entry {
  readonly findings: readonly Finding[];
  readonly name: string;
  readonly reaches: readonly string[];
}

interface Reading {
  readonly entries: readonly Entry[];
  readonly problems: readonly string[];
}

export const MAX_EXCEPTION_DAYS = 14;
const DAY_MS = 86_400_000;
const SEVERITIES: readonly string[] = ["info", "low", "moderate", "high", "critical"];
const ADVISORY_URL = /^https:\/\/github\.com\/advisories\/(?<id>GHSA(?:-[\da-z]{4}){3})$/u;
const EVIDENCE = /^https:\/\/github\.com\/Xquik-dev\/tweetclaw\/issues\/\d+$/u;

function exceptionProblem(exception: AuditException): string | undefined {
  const added = Date.parse(exception.added);
  const expires = Date.parse(exception.expires);
  if (Number.isNaN(added) || Number.isNaN(expires) || expires <= added) {
    return `the exception for ${exception.id} has no valid added & expires dates`;
  }
  if (expires - added > MAX_EXCEPTION_DAYS * DAY_MS) {
    return `the exception for ${exception.id} lasts more than ${String(MAX_EXCEPTION_DAYS)} days`;
  }
  if (!EVIDENCE.test(exception.evidence) || exception.exposure.trim() === "") {
    return `the exception for ${exception.id} names no exposure or tweetclaw issue with its evidence`;
  }
  return undefined;
}

export function parseExceptions(value: unknown): readonly AuditException[] {
  const list = isRecord(value) ? value["exceptions"] : undefined;
  if (!isList(list)) {
    throw new TypeError("audit-exceptions.json must hold an exceptions list");
  }
  return list.map((item, index) => {
    const fields = ["added", "evidence", "expires", "exposure", "id", "package", "version"] as const;
    if (!isRecord(item) || !fields.every((field) => typeof item[field] === "string")) {
      throw new TypeError(`audit-exceptions.json entry ${String(index)} needs string ${fields.join(", ")}`);
    }
    return {
      added: String(item["added"]),
      evidence: String(item["evidence"]),
      expires: String(item["expires"]),
      exposure: String(item["exposure"]),
      id: String(item["id"]),
      package: String(item["package"]),
      version: String(item["version"]),
    };
  });
}

function advisoryOf(name: string, via: Readonly<Record<string, unknown>>): Omit<Finding, "version"> | undefined {
  const url = via["url"];
  const severity = via["severity"];
  const id = typeof url === "string" ? ADVISORY_URL.exec(url)?.groups?.["id"] : undefined;
  if (id === undefined || via["name"] !== name || typeof severity !== "string") return undefined;
  return { id, name, severity };
}

function entryOf(name: string, value: unknown, installed: ReadonlyMap<string, string>): Entry | string {
  if (!isRecord(value) || value["name"] !== name || !SEVERITIES.includes(String(value["severity"]))) {
    return `entry ${name} lacks its name or a known severity`;
  }
  const via = value["via"];
  const nodes = value["nodes"];
  if (!isList(via) || via.length === 0 || !isList(nodes) || nodes.length === 0 || !nodes.every((node) => typeof node === "string")) {
    return `entry ${name} lacks its via or nodes list`;
  }
  const versions = nodes.map((node) => installed.get(String(node)));
  if (versions.some((version) => version === undefined)) {
    return `entry ${name} names an install path package-lock.json doesn't hold`;
  }
  const advisories = via.filter((item) => isRecord(item)).map((item) => advisoryOf(name, item));
  if (advisories.some((advisory) => advisory === undefined) || !via.every((item) => isRecord(item) || typeof item === "string")) {
    return `entry ${name} has a via item that isn't a package name or an advisory with its GHSA link`;
  }
  const findings = advisories.flatMap((advisory) =>
    advisory === undefined ? [] : [...new Set(versions)].map((version) => ({ ...advisory, version: String(version) })),
  );
  return { findings, name, reaches: via.filter((item) => typeof item === "string").map(String) };
}

function countProblems(entries: Readonly<Record<string, unknown>>, counts: Readonly<Record<string, unknown>>): readonly string[] {
  const values = Object.values(entries).filter((entry) => isRecord(entry));
  const counted = new Map(SEVERITIES.map((severity) => [severity, values.filter((entry) => entry["severity"] === severity).length]));
  const problems = SEVERITIES.filter((severity) => counts[severity] !== counted.get(severity)).map(
    (severity) => `metadata counts ${String(counts[severity])} ${severity} entries & the report holds ${String(counted.get(severity))}`,
  );
  return counts["total"] === values.length ? problems : [...problems, `metadata counts ${String(counts["total"])} entries in total & the report holds ${String(values.length)}`];
}

function ungrounded(entries: readonly Entry[]): readonly string[] {
  const grounded = new Set(entries.filter(({ findings }) => findings.length > 0).map(({ name }) => name));
  let grew = true;
  while (grew) {
    const next = entries.filter(
      ({ name, reaches }) => !grounded.has(name) && reaches.some((reached) => grounded.has(reached)),
    );
    for (const { name } of next) grounded.add(name);
    grew = next.length > 0;
  }
  return entries.filter(({ name }) => !grounded.has(name)).map(({ name }) => `entry ${name} reaches no advisory`);
}

function readReport(report: unknown, installed: ReadonlyMap<string, string>): Reading {
  const vulnerabilities = isRecord(report) ? report["vulnerabilities"] : undefined;
  const metadata = isRecord(report) ? report["metadata"] : undefined;
  const counts = isRecord(metadata) ? metadata["vulnerabilities"] : undefined;
  if (!isRecord(vulnerabilities) || !isRecord(counts)) {
    return { entries: [], problems: ["it holds no vulnerabilities object & metadata.vulnerabilities counts"] };
  }
  const read = Object.entries(vulnerabilities).map(([name, value]) => entryOf(name, value, installed));
  const entries = read.filter((item): item is Entry => typeof item !== "string");
  const known = new Set(entries.map(({ name }) => name));
  const unknown = entries.flatMap(({ name, reaches }) =>
    reaches.filter((reached) => !known.has(reached)).map((reached) => `entry ${name} reaches ${reached}, which the report doesn't list`),
  );
  return {
    entries,
    problems: [
      ...read.filter((item): item is string => typeof item === "string"),
      ...unknown,
      ...ungrounded(entries),
      ...countProblems(vulnerabilities, counts),
    ],
  };
}

function exceptionFor(finding: Finding, inputs: AuditInputs): AuditException | undefined {
  return inputs.exceptions.find(
    (exception) =>
      exception.id === finding.id &&
      exception.package === finding.name &&
      exception.version === finding.version &&
      inputs.now >= Date.parse(exception.added) &&
      inputs.now < Date.parse(exception.expires) &&
      inputs.newest.get(finding.name) === finding.version,
  );
}

export function verify(inputs: AuditInputs): AuditVerdict {
  const exceptionProblems = inputs.exceptions.flatMap((exception) => exceptionProblem(exception) ?? []);
  const { entries, problems } = readReport(inputs.report, inputs.installed);
  const findings = entries.flatMap(({ findings: own }) => own);
  const expectedStatus = entries.length > 0 ? 1 : 0;
  const statusProblems =
    inputs.auditStatus === expectedStatus
      ? []
      : [`npm audit exited ${String(inputs.auditStatus)} for a report of ${String(entries.length)} entries`];
  const judged = findings.map((finding) => {
    const named = `${finding.id} (${finding.severity}) on ${finding.name} ${finding.version}`;
    const exception = exceptionProblems.length === 0 ? exceptionFor(finding, inputs) : undefined;
    return exception === undefined
      ? { failed: true, line: `${named} fails. Upgrade, override or replace that package.` }
      : {
          failed: false,
          line: `${named} passes until ${exception.expires} or a newer ${finding.name} release, since ${exception.exposure} ${exception.evidence}`,
        };
  });
  const unread = [...exceptionProblems, ...statusProblems, ...problems].map((problem) => ({ failed: true, line: `The audit fails, since ${problem}.` }));
  const lines = [...unread, ...judged];
  return { failures: lines.filter(({ failed }) => failed).length, lines: lines.map(({ line }) => line) };
}
