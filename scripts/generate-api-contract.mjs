#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import fs from "node:fs";

const source = process.argv[2] ?? "https://xquik.com/openapi.json";
const output = new URL("../generated-api-contract.json", import.meta.url);
const openapi = await (source.startsWith("http")
  ? fetch(source).then((response) => response.json())
  : Promise.resolve(JSON.parse(fs.readFileSync(source, "utf8"))));
const excluded = new Set([
  "GET /api/v1/credits/topup/redirect", "GET /api/v1/guest-wallets/status",
  "GET /api/v1/support/attachments/{id}", "POST /api/v1/guest-wallets",
  "POST /api/v1/guest-wallets/topups", "POST /api/v1/x/account-connection-challenges/{id}/submit",
  "POST /api/v1/x/accounts", "POST /api/v1/x/accounts/{id}/reauth",
]);
const rich = ["SearchTweet", "TweetDetail", "TweetMedia", "UserProfile"];
const locations = ["body", "header", "path", "query"];
const resolve = (value, type) => value?.$ref === undefined
  ? value
  : openapi.components?.[type]?.[value.$ref.split("/").at(-1)];
const nested = (schema) => schema === undefined || schema === null || typeof schema !== "object"
  ? []
  : [...Object.values(schema.properties ?? {}), ...(schema.allOf ?? []), ...(schema.anyOf ?? []),
    ...(schema.oneOf ?? []), schema.items].filter(Boolean);
function includes(schema, name, seen = new Set()) {
  if (schema?.$ref === `#/components/schemas/${name}`) return true;
  if (schema?.$ref !== undefined && !seen.has(schema.$ref)) {
    seen.add(schema.$ref);
    return includes(resolve(schema, "schemas"), name, seen);
  }
  return nested(schema).some((value) => includes(value, name, new Set(seen)));
}
const parameterType = (schema) => schema?.type === "array"
  ? `${schema.items?.type ?? "unknown"}[]`
  : schema?.type ?? "unknown";
function parameters(operation) {
  const direct = (operation.parameters ?? []).map((raw) => resolve(raw, "parameters")).map((value) => ({
    description: value.name, in: locations.indexOf(value.in), name: value.name,
    required: value.required === true, type: parameterType(resolve(value.schema, "schemas")),
  }));
  const body = resolve(operation.requestBody?.content?.["application/json"]?.schema, "schemas");
  const variants = (body?.oneOf ?? [body]).map((value) => resolve(value, "schemas")).filter(Boolean);
  const names = [...new Set(variants.flatMap((value) => Object.keys(value.properties ?? {})))];
  return [...direct, ...names.map((name) => {
    const property = variants.find((value) => value.properties?.[name] !== undefined)?.properties[name];
    return { description: name, in: 0, name,
      required: variants.length > 0 && variants.every((value) => value.required?.includes(name)),
      type: parameterType(resolve(property, "schemas")) };
  })];
}
function responseFields(operation) {
  const fields = new Set();
  for (const [status, raw] of Object.entries(operation.responses ?? {})) {
    if (!status.startsWith("2")) continue;
    const rawSchema = resolve(raw, "responses")?.content?.["application/json"]?.schema;
    const schema = resolve(rawSchema, "schemas");
    for (const name of schema?.required ?? []) fields.add(name);
    for (const name of rich) if (includes(rawSchema, name)) {
      for (const field of Object.keys(openapi.components?.schemas?.[name]?.properties ?? {})) fields.add(`${name}.${field}`);
    }
  }
  return [...fields].sort().join(", ");
}
const contract = {};
for (const path of Object.keys(openapi.paths ?? {}).sort()) for (const method of ["delete", "get", "patch", "post", "put"]) {
  const operation = openapi.paths[path][method];
  const rawKey = `${method.toUpperCase()} ${path}`;
  if (operation === undefined || excluded.has(rawKey)) continue;
  contract[rawKey.replaceAll(/\{[^}]+\}/gu, ":param")] = {
    parameters: parameters(operation), responseFields: responseFields(operation),
  };
}
fs.writeFileSync(output, `${JSON.stringify(contract)}\n`);
