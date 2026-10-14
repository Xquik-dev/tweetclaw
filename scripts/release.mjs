#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { missingKeychainSetting } from "./with-npm-token.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repository = "Xquik-dev/tweetclaw";
const clawhubCli = ["--yes", "clawhub@0.23.3"];
const clawhubApi = "https://clawhub.ai/api/v1";
const skillSlug = "tweetclaw";
const legalNotice =
  'Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.';
const usage = "Run node scripts/release.mjs [--dry-run] [--only npm|clawhub].";
const { name, version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tag = `v${version}`;
const { dryRun, releasesClawhub, releasesNpm } = readOptions();

function capture(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}

function run(command, args) {
  execFileSync(command, args, { cwd: root, stdio: "inherit" });
}

function succeeds(command, args) {
  try {
    execFileSync(command, args, { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function stop(message) {
  process.stderr.write(`release: ${message}\n`);
  process.exit(1);
}

function say(message) {
  process.stdout.write(`release: ${message}\n`);
}

function readOptions() {
  let values;
  try {
    ({ values } = parseArgs({
      options: { "dry-run": { default: false, type: "boolean" }, only: { type: "string" } },
    }));
  } catch {
    stop(`an option is unknown. ${usage}`);
  }
  if (values.only !== undefined && values.only !== "npm" && values.only !== "clawhub") {
    stop(`--only takes npm or clawhub. ${usage}`);
  }
  return {
    dryRun: values["dry-run"],
    releasesClawhub: values.only !== "npm",
    releasesNpm: values.only !== "clawhub",
  };
}

function checkCredentials() {
  const missingSetting = releasesNpm ? missingKeychainSetting() : undefined;
  if (missingSetting !== undefined) {
    stop(missingSetting);
  }
  if (!releasesClawhub) {
    return;
  }
  const configPath = process.env.CLAWHUB_CONFIG_PATH ?? "";
  if (configPath === "") {
    stop("CLAWHUB_CONFIG_PATH is unset. Set it to the ClawHub CLI config file that holds your login, or pass --only npm.");
  }
  if (!existsSync(configPath)) {
    stop("CLAWHUB_CONFIG_PATH names no file. Run `npx clawhub@0.23.3 login`, or pass --only npm.");
  }
}

function checkClawhubLogin() {
  if (releasesClawhub && !succeeds("npx", [...clawhubCli, "whoami"])) {
    stop("ClawHub rejected the login. Run `npx clawhub@0.23.3 login`, or pass --only npm.");
  }
}

async function waitFor(label, check) {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    if (await check()) {
      return;
    }
    await sleep(10_000);
  }
  stop(`${label} did not show ${version} within 10 minutes. Check the registry, then rerun.`);
}

async function clawhubJson(path) {
  const response = await fetch(`${clawhubApi}/${path}`);
  return response.ok ? response.json() : {};
}

async function clawhubPackageVersion() {
  return (await clawhubJson(`packages/${encodeURIComponent(name)}`)).package?.latestVersion;
}

async function clawhubSkillVersion() {
  return (await clawhubJson(`skills/${skillSlug}`)).latestVersion?.version;
}

function npmHasVersion() {
  return succeeds("npm", ["view", `${name}@${version}`, "version"]);
}

function verifyReleaseRef() {
  if (capture("git", ["status", "--porcelain"]) !== "") {
    stop("the checkout has changes. Release from a clean checkout of the tag.");
  }
  run("git", ["fetch", "--quiet", "--tags", "origin", "master"]);
  const head = capture("git", ["rev-parse", "HEAD"]);
  if (!succeeds("git", ["rev-parse", "--verify", "--quiet", `refs/tags/${tag}`])) {
    stop(`tag ${tag} is missing. Tag the current master commit as ${tag} and push the tag.`);
  }
  if (capture("git", ["rev-list", "-n", "1", tag]) !== head) {
    stop(`HEAD is not ${tag}. Run \`git checkout ${tag}\`.`);
  }
  if (capture("git", ["rev-parse", "origin/master"]) !== head) {
    stop(`${tag} is not the current master commit. Tag the current master commit.`);
  }
  return head;
}

async function publishNpm() {
  if (npmHasVersion()) {
    say(`npm already has ${name}@${version}.`);
    return;
  }
  if (dryRun) {
    run("node", ["scripts/with-npm-token.mjs", "--check"]);
    run("node", ["scripts/publish-clean.mjs", "--dry-run"]);
    return;
  }
  run("node", ["scripts/with-npm-token.mjs", "node", "scripts/publish-clean.mjs"]);
  await waitFor("npm", () => npmHasVersion());
}

async function publishClawhubPackage(source) {
  if (!dryRun && (await clawhubPackageVersion()) === version) {
    say(`ClawHub already has package ${name}@${version}.`);
    return;
  }
  const folder = mkdtempSync(join(tmpdir(), "tweetclaw-release-"));
  try {
    run("npm", ["pack", "--pack-destination", folder]);
    const [archive] = readdirSync(folder);
    run("npx", [
      ...clawhubCli,
      "package",
      "publish",
      join(folder, archive),
      "--family",
      "code-plugin",
      ...source,
      ...(dryRun
        ? ["--dry-run"]
        : ["--manual-override-reason", "Local release from a maintainer machine", "--wait"]),
      "--json",
    ]);
  } finally {
    rmSync(folder, { force: true, recursive: true });
  }
}

async function publishClawhubSkill(source) {
  if (!dryRun && (await clawhubSkillVersion()) === version) {
    say(`ClawHub already has Skill ${skillSlug}@${version}.`);
    return;
  }
  run("npx", [
    ...clawhubCli,
    "skill",
    "publish",
    `skills/${skillSlug}`,
    "--owner",
    "xquik",
    "--slug",
    skillSlug,
    "--name",
    "TweetClaw",
    "--tags",
    "latest",
    "--version",
    version,
    "--changelog",
    `Sync with TweetClaw ${tag}.`,
    ...source,
    "--source-path",
    `skills/${skillSlug}`,
    ...(dryRun ? ["--dry-run"] : []),
    "--json",
  ]);
  if (!dryRun) {
    await waitFor("ClawHub", async () => (await clawhubSkillVersion()) === version);
  }
}

function createGithubRelease() {
  if (succeeds("gh", ["release", "view", tag, "--repo", repository])) {
    say(`GitHub release ${tag} exists.`);
    return;
  }
  const folder = mkdtempSync(join(tmpdir(), "tweetclaw-notes-"));
  try {
    const notes = join(folder, "notes.md");
    writeFileSync(notes, `${legalNotice}\n`);
    run("gh", ["release", "create", tag, "--repo", repository, "--verify-tag", "--generate-notes", "--notes-file", notes]);
  } finally {
    rmSync(folder, { force: true, recursive: true });
  }
}

checkCredentials();
const commit = dryRun ? capture("git", ["rev-parse", "HEAD"]) : verifyReleaseRef();
const source = [
  "--source-repo",
  repository,
  "--source-commit",
  commit,
  "--source-ref",
  dryRun ? capture("git", ["rev-parse", "--symbolic-full-name", "HEAD"]) : `refs/tags/${tag}`,
];

checkClawhubLogin();
if (releasesNpm) {
  await publishNpm();
}
if (releasesClawhub) {
  await publishClawhubPackage(source);
  await publishClawhubSkill(source);
}
const registries = [releasesNpm ? "npm" : "", releasesClawhub ? "ClawHub" : ""].filter(Boolean).join(" and ");
if (dryRun) {
  say(`dry run passed for ${name}@${version} on ${registries}. Nothing was published.`);
} else {
  createGithubRelease();
  say(`published ${name}@${version} to ${registries}, and released it on GitHub.`);
}
