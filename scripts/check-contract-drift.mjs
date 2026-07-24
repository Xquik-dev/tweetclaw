#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { API_SPEC } from "../dist/api-spec.js";

const OPENAPI_URL = "https://xquik.com/openapi.json";
const METHODS = ["delete", "get", "patch", "post", "put"];
const EXCLUDED_OPERATIONS = new Set([
  "GET /api/v1/credits/topup/redirect",
  "GET /api/v1/guest-wallets/status",
  "GET /api/v1/support/attachments/{id}",
  "POST /api/v1/guest-wallets",
  "POST /api/v1/guest-wallets/topups",
  "POST /api/v1/x/account-connection-challenges/{id}/submit",
  "POST /api/v1/x/accounts",
  "POST /api/v1/x/accounts/{id}/reauth",
]);

function normalizePath(path) {
  return path
    .replaceAll(/\{[^}]+\}/gu, ":param")
    .replaceAll(/:[^/]+/gu, ":param");
}

function operationKey(method, path) {
  return `${method.toUpperCase()} ${normalizePath(path)}`;
}

function dereference(openapi, value, componentType) {
  if (value?.$ref === undefined) return value;
  const name = value.$ref.split("/").at(-1);
  return openapi.components?.[componentType]?.[name];
}

function requestParameters(openapi, operation) {
  const parameters = (operation.parameters ?? []).map((parameter) =>
    dereference(openapi, parameter, "parameters"),
  );
  const rawSchema = operation.requestBody?.content?.["application/json"]?.schema;
  const schema = dereference(openapi, rawSchema, "schemas");
  const bodySchemas = (schema?.oneOf ?? [schema])
    .map((variant) => dereference(openapi, variant, "schemas"))
    .filter((variant) => variant !== undefined);
  const bodyFields = new Set(
    bodySchemas.flatMap((variant) => Object.keys(variant.properties ?? {})),
  );
  const bodyParameters = [...bodyFields].map((name) => ({
    in: "body",
    name,
    required:
      bodySchemas.length > 0
      && bodySchemas.every((variant) => (variant.required ?? []).includes(name)),
  }));
  return [
    ...parameters.map((parameter) => ({
      in: parameter.in,
      name: parameter.name,
      required: parameter.required === true,
    })),
    ...bodyParameters,
  ];
}

function parameterKey(parameter) {
  return `${parameter.in}:${parameter.name}:${String(parameter.required)}`;
}

function successfulJsonSchemas(openapi, operation) {
  const schemas = [];
  for (const [status, rawResponse] of Object.entries(operation.responses ?? {})) {
    if (!status.startsWith("2")) continue;
    const response = dereference(openapi, rawResponse, "responses");
    const rawSchema = response?.content?.["application/json"]?.schema;
    const schema = dereference(openapi, rawSchema, "schemas");
    if (schema !== undefined) schemas.push(schema);
  }
  return schemas;
}

function requiredResponseFields(openapi, schema) {
  if (schema.oneOf === undefined) return new Set(schema.required ?? []);
  const variants = schema.oneOf.map((variant) =>
    new Set(dereference(openapi, variant, "schemas")?.required ?? []),
  );
  if (variants.length === 0) return new Set();
  return new Set([...variants[0]].filter((field) => variants.every((set) => set.has(field))));
}

function mppPrice(amount) {
  const value = Number(amount) / 1_000_000;
  return `$${value.toFixed(6).replaceAll(/0+$/gu, "")}/call`;
}

async function loadOpenApi() {
  const response = await fetch(OPENAPI_URL, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`OpenAPI request failed with HTTP ${String(response.status)}.`);
  }
  return response.json();
}

const openapi = await loadOpenApi();
const canonical = new Map();
for (const [path, pathItem] of Object.entries(openapi.paths ?? {})) {
  for (const method of METHODS) {
    const operation = pathItem[method];
    const rawKey = `${method.toUpperCase()} ${path}`;
    if (operation === undefined || EXCLUDED_OPERATIONS.has(rawKey)) continue;
    canonical.set(operationKey(method, path), { method, operation, path });
  }
}

const catalog = new Map(
  API_SPEC.map((endpoint) => [operationKey(endpoint.method, endpoint.path), endpoint]),
);
const errors = [];

if (canonical.size !== 119) errors.push(`canonical operation count is ${String(canonical.size)}, expected 119`);
if (catalog.size !== 119) errors.push(`catalog operation count is ${String(catalog.size)}, expected 119`);
const callableCount = API_SPEC.filter((endpoint) => endpoint.agentProhibited !== true).length;
if (callableCount !== 102) errors.push(`callable operation count is ${String(callableCount)}, expected 102`);

for (const [key, { operation }] of canonical) {
  const endpoint = catalog.get(key);
  if (endpoint === undefined) {
    errors.push(`${key} is missing from the catalog`);
    continue;
  }

  const expectedParameters = new Set(
    requestParameters(openapi, operation).map(parameterKey),
  );
  const actualParameters = new Set((endpoint.parameters ?? []).map(parameterKey));
  for (const parameter of expectedParameters) {
    if (!actualParameters.has(parameter)) errors.push(`${key} is missing parameter ${parameter}`);
  }
  for (const parameter of actualParameters) {
    if (!expectedParameters.has(parameter)) errors.push(`${key} has extra parameter ${parameter}`);
  }

  for (const schema of successfulJsonSchemas(openapi, operation)) {
    for (const field of requiredResponseFields(openapi, schema)) {
      if (!(endpoint.responseShape ?? "").includes(field)) {
        errors.push(`${key} response shape is missing required field ${field}`);
      }
    }
  }

  const offer = operation["x-payment-info"]?.offers?.[0];
  if (offer === undefined && endpoint.mpp !== undefined) {
    errors.push(`${key} has stale MPP metadata`);
  }
  if (offer !== undefined) {
    const expectedPrice = mppPrice(offer.amount);
    if (endpoint.mpp?.intent !== offer.intent || endpoint.mpp?.price !== expectedPrice) {
      errors.push(`${key} MPP metadata differs from OpenAPI`);
    }
  }
}

for (const key of catalog.keys()) {
  if (!canonical.has(key)) errors.push(`${key} is not in the canonical catalog`);
}

if (errors.length > 0) {
  process.stderr.write(`Xquik contract drift found:\n${errors.map((error) => `  ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("TweetClaw matches 119 canonical operations and 102 callable operations.\n");
