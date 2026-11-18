// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { isList, isRecord } from "./json-shape.ts";

export const EXCUSED = {
  added: "2026-11-18T13:00:00Z",
  advisory: "GHSA-fc5q-39xc-vjpf",
  evidence: "https://github.com/Xquik-dev/tweetclaw/issues/131",
  expires: "2026-12-02T13:00:00Z",
  newestVersion: "4.0.7",
  package: "picomatch",
} as const;

export const REGISTRY = "https://registry.npmjs.org/";

export interface AuditRun {
  readonly report: unknown;
  readonly status: number | null;
}

export interface AuditInputs {
  readonly full: AuditRun;
  readonly lock: unknown;
  readonly now: number;
  readonly runtime: AuditRun;
  readonly versions: unknown;
}

interface Advisory {
  readonly id: string;
  readonly name: string;
}

interface Reading {
  readonly advisories: readonly Advisory[];
  readonly problems: readonly string[];
}

interface Entry {
  readonly advisories: readonly Advisory[];
  readonly name: string;
  readonly reaches: readonly string[];
}

const SEVERITIES = ["info", "low", "moderate", "high", "critical"] as const;
const ADVISORY_URL = /^https:\/\/github\.com\/advisories\/(?<id>GHSA(?:-[\da-z]{4}){3})$/u;

function entryOf(name: string, value: unknown): Entry | string {
  const via = isRecord(value) ? value["via"] : undefined;
  if (!isRecord(value) || value["name"] !== name || !isList(via) || via.length === 0) {
    return `entry ${name} lacks its name or via list`;
  }
  const advisories: Advisory[] = [];
  const reaches: string[] = [];
  for (const item of via) {
    const url = isRecord(item) ? item["url"] : undefined;
    const id = typeof url === "string" ? ADVISORY_URL.exec(url)?.groups?.["id"] : undefined;
    if (typeof item === "string") reaches.push(item);
    else if (id !== undefined && isRecord(item) && item["name"] === name) advisories.push({ id, name });
    else return `entry ${name} has a via item that is no package name or advisory link`;
  }
  return { advisories, name, reaches };
}

function unreached(entries: readonly Entry[]): readonly string[] {
  const reached = new Set(entries.filter(({ advisories }) => advisories.length > 0).map(({ name }) => name));
  let grew = true;
  while (grew) {
    const next = entries.filter(({ name, reaches }) => !reached.has(name) && reaches.some((item) => reached.has(item)));
    for (const { name } of next) reached.add(name);
    grew = next.length > 0;
  }
  return entries.filter(({ name }) => !reached.has(name)).map(({ name }) => `entry ${name} reaches no advisory`);
}

function metadataProblems(metadata: unknown, entries: number): readonly string[] {
  const counts = isRecord(metadata) ? metadata["vulnerabilities"] : undefined;
  const dependencies = isRecord(metadata) ? metadata["dependencies"] : undefined;
  const audited = isRecord(dependencies) ? dependencies["total"] : undefined;
  if (!isRecord(counts) || typeof audited !== "number" || audited <= 0) return ["it audited no dependencies"];
  const sum = SEVERITIES.reduce((total, severity) => total + Number(counts[severity]), 0);
  return counts["total"] === entries && sum === entries ? [] : [`its counts disagree with its ${String(entries)} entries`];
}

function readRun(label: string, { report, status }: AuditRun): Reading {
  const vulnerabilities = isRecord(report) ? report["vulnerabilities"] : undefined;
  if (!isRecord(report) || report["auditReportVersion"] !== 2 || "error" in report || !isRecord(vulnerabilities)) {
    return { advisories: [], problems: [`${label} wrote no readable report`] };
  }
  const read = Object.entries(vulnerabilities).map(([name, value]) => entryOf(name, value));
  const entries = read.filter((item): item is Entry => typeof item !== "string");
  const known = new Set(entries.map(({ name }) => name));
  const problems = [
    ...read.filter((item): item is string => typeof item === "string"),
    ...entries.flatMap(({ name, reaches }) => reaches.filter((item) => !known.has(item)).map((item) => `entry ${name} reaches unlisted ${item}`)),
    ...unreached(entries),
    ...metadataProblems(report["metadata"], read.length),
    ...(status === (read.length > 0 ? 1 : 0) ? [] : [`npm exited ${String(status)} for ${String(read.length)} entries`]),
  ];
  return {
    advisories: entries.flatMap(({ advisories }) => advisories),
    problems: problems.map((problem) => `${label} fails, since ${problem}`),
  };
}

function isNewer(version: string): boolean {
  const parts = version.split(/[.+-]/u).slice(0, 3).map(Number);
  const newest = EXCUSED.newestVersion.split(".").map(Number);
  const index = newest.findIndex((part, at) => parts[at] !== part);
  return index !== -1 && Number(parts[index]) > Number(newest[index]);
}

function excuseProblems(now: number, versions: unknown): readonly string[] {
  const named = `${EXCUSED.advisory} on ${EXCUSED.package}`;
  if (now < Date.parse(EXCUSED.added) || now >= Date.parse(EXCUSED.expires)) {
    return [`${named} is outside its excuse, from ${EXCUSED.added} to ${EXCUSED.expires}`];
  }
  if (!isList(versions) || !versions.includes(EXCUSED.newestVersion)) {
    return [`npm listed no ${EXCUSED.package} versions, so ${named} can't be excused`];
  }
  const newer = versions.filter((version) => isNewer(String(version)));
  return newer.length === 0 ? [] : [`${named} needs review, since npm now has ${EXCUSED.package} ${newer.map(String).join(", ")}`];
}

function lockEntryProblem(node: string, value: unknown): readonly string[] {
  if (!node.includes("node_modules/") || !isRecord(value) || value["link"] === true || value["inBundle"] === true) return [];
  const name = typeof value["name"] === "string" ? value["name"] : String(node.split("node_modules/").at(-1));
  const version = String(value["version"]);
  const expected = `${REGISTRY}${name}/-/${String(name.split("/").at(-1))}-${version}.tgz`;
  return value["resolved"] === expected ? [] : [`package-lock.json entry ${node} says ${version} but resolves to ${String(value["resolved"])}`];
}

function lockProblems(lock: unknown): readonly string[] {
  const packages = isRecord(lock) ? lock["packages"] : undefined;
  if (!isRecord(packages)) return ["package-lock.json holds no packages"];
  return Object.entries(packages).flatMap(([node, value]) => lockEntryProblem(node, value));
}

export function verify({ full, lock, now, runtime, versions }: AuditInputs): readonly string[] {
  const all = readRun("the full audit", full);
  const shipped = readRun("the runtime audit", runtime);
  const isExcused = ({ id, name }: Advisory): boolean => id === EXCUSED.advisory && name === EXCUSED.package;
  return [
    ...lockProblems(lock),
    ...all.problems,
    ...shipped.problems,
    ...shipped.advisories.map(({ id, name }) => `${id} on ${name} reaches runtime dependencies, which no excuse covers`),
    ...all.advisories.filter((advisory) => !isExcused(advisory)).map(({ id, name }) => `${id} on ${name} fails. Upgrade, override or replace that package`),
    ...(all.advisories.some((advisory) => isExcused(advisory)) ? excuseProblems(now, versions) : []),
  ];
}
