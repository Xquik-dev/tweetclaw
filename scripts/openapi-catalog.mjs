// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { RESTRICTED_BILLING_PATTERNS } from "./public-copy-rules.mjs";

const OPENAPI_METHODS = ["delete", "get", "head", "options", "patch", "post", "put", "trace"];
const TOOL_METHODS = new Set(["delete", "get", "patch", "post", "put"]);
const PARAMETER_LOCATIONS = new Set(["header", "path", "query"]);
const API_PREFIX = "/api/v1/";
const JSON_CONTENT = "application/json";
const EVENT_STREAM_CONTENT = "text/event-stream";
const PAYMENT_REQUIRED_STATUS = "402";
const MPP_UNITS_PER_DOLLAR = 1_000_000;
const MPP_PRICE_DECIMALS = 6;
const SHAPE_DEPTH = 3;
const WRITE_NOTICE = "Requires one-time approval after showing the exact target and payload.";
const PRIVATE_READ_NOTICE = "Requires explicit user request.";

function createResolver(openapi) {
  function lookup(reference) {
    if (!reference.startsWith("#/")) {
      throw new Error(`OpenAPI reference is not local: ${reference}`);
    }
    let node = openapi;
    for (const token of reference.slice(2).split("/")) {
      node = node?.[token.replaceAll("~1", "/").replaceAll("~0", "~")];
    }
    if (node === undefined) {
      throw new Error(`OpenAPI reference is missing: ${reference}`);
    }
    return node;
  }

  return function resolve(value) {
    let current = value;
    const followed = new Set();
    while (typeof current?.$ref === "string") {
      if (followed.has(current.$ref)) {
        throw new Error(`OpenAPI reference loops: ${current.$ref}`);
      }
      followed.add(current.$ref);
      current = lookup(current.$ref);
    }
    return current;
  };
}

function schemaName(schema) {
  const prefix = "#/components/schemas/";
  return typeof schema?.$ref === "string" && schema.$ref.startsWith(prefix)
    ? schema.$ref.slice(prefix.length)
    : undefined;
}

function catalogPath(path) {
  return path.replaceAll(/\{([^}]+)\}/gu, (_match, name) => `:${name}`);
}

function byPathThenMethod(left, right) {
  return left.path.localeCompare(right.path, "en") || left.method.localeCompare(right.method, "en");
}

function categoryFor(operation, key, policy) {
  const tag = operation.tags?.[0];
  if (typeof tag !== "string") {
    throw new Error(`${key} has no tag. TweetClaw names its category from the first tag.`);
  }
  return policy.categoryByTag[tag] ?? tag.toLowerCase().replaceAll(/\s+/gu, "-");
}

function cleanText(text) {
  if (typeof text !== "string") return "";
  return text
    .replaceAll(/\s+/gu, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .filter((sentence) => !RESTRICTED_BILLING_PATTERNS.some((pattern) => pattern.value.test(sentence)))
    .join(" ");
}

function schemaType(resolve, raw) {
  const schema = resolve(raw) ?? {};
  const variants = schema.oneOf ?? schema.anyOf;
  if (variants !== undefined) {
    const types = variants.map((variant) => schemaType(resolve, variant));
    return [...new Set(types)].filter((type) => type !== "null").join(" | ");
  }
  if (Array.isArray(schema.type)) {
    return schema.type.filter((type) => type !== "null").join(" | ");
  }
  if (schema.type === "array") return `${schemaType(resolve, schema.items)}[]`;
  if (schema.type !== undefined) return schema.type;
  return schema.properties === undefined && schema.allOf === undefined ? "unknown" : "object";
}

function enumNote(resolve, schema, description) {
  const values = schema.enum ?? resolve(schema.items)?.enum;
  if (values === undefined || values.every((value) => description.includes(String(value)))) {
    return "";
  }
  return `One of ${values.join(", ")}.`;
}

function describeField(resolve, field) {
  const schema = resolve(field.schema) ?? {};
  const description = cleanText(field.description ?? schema.description) || field.name;
  return {
    name: field.name,
    in: field.location,
    required: field.required,
    type: schemaType(resolve, schema),
    description: [
      field.deprecated === true || schema.deprecated === true ? "Deprecated." : "",
      description,
      enumNote(resolve, schema, description),
    ].filter((part) => part.length > 0).join(" "),
  };
}

function declaredParameters(resolve, pathItem, operation, key) {
  const declared = new Map();
  // An operation's own parameter replaces the path's parameter of that name. https://spec.openapis.org/oas/v3.1.0.html#operation-object
  for (const raw of [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]) {
    const parameter = resolve(raw);
    if (!PARAMETER_LOCATIONS.has(parameter.in)) {
      throw new Error(`${key} takes ${parameter.name} in ${parameter.in}. The tool sends header, path, query, and body values only.`);
    }
    declared.set(`${parameter.in}:${parameter.name}`, parameter);
  }
  return [...declared.values()].map((parameter) => describeField(resolve, {
    deprecated: parameter.deprecated,
    description: parameter.description,
    location: parameter.in,
    name: parameter.name,
    required: parameter.required === true,
    schema: parameter.schema,
  }));
}

function objectVariants(resolve, raw) {
  const schema = resolve(raw);
  if (schema === undefined) return [];
  const alternatives = schema.oneOf ?? schema.anyOf;
  if (alternatives !== undefined) {
    return alternatives.flatMap((alternative) => objectVariants(resolve, alternative));
  }
  const own = { properties: schema.properties ?? {}, required: schema.required ?? [] };
  return (schema.allOf ?? []).reduce(
    (combined, part) => combined.flatMap((base) =>
      objectVariants(resolve, part).map((variant) => ({
        properties: { ...base.properties, ...variant.properties },
        required: [...base.required, ...variant.required],
      }))),
    [own],
  );
}

function bodyParameters(resolve, operation) {
  const body = resolve(operation.requestBody);
  const variants = objectVariants(resolve, body?.content?.[JSON_CONTENT]?.schema);
  const names = new Set(variants.flatMap((variant) => Object.keys(variant.properties)));
  return [...names].map((name) => {
    const property = variants.find((variant) => variant.properties[name] !== undefined).properties[name];
    return describeField(resolve, {
      description: property.description,
      location: "body",
      name,
      required: variants.every((variant) => variant.required.includes(name)),
      schema: property,
    });
  });
}

function joinAlternatives(shapes) {
  return [...new Set(shapes)].filter((shape) => shape.length > 0).join(" | ");
}

function printShape(resolve, raw, depth, printed) {
  const name = schemaName(raw);
  const schema = resolve(raw) ?? {};
  const alternatives = schema.oneOf ?? schema.anyOf;
  if (alternatives !== undefined) {
    return joinAlternatives(alternatives.map((alternative) => printShape(resolve, alternative, depth, printed)));
  }
  if (schema.type === "array") {
    return `[${printShape(resolve, schema.items, depth, printed) || schemaType(resolve, schema.items)}]`;
  }
  const variants = objectVariants(resolve, schema).filter((variant) => Object.keys(variant.properties).length > 0);
  if (variants.length === 0) return "";
  if (depth === 0 || (name !== undefined && printed.has(name))) return name ?? "";
  if (name !== undefined) printed.add(name);
  const body = joinAlternatives(variants.map(({ properties, required }) => {
    const fields = Object.entries(properties).map(([field, property]) => {
      const label = required.includes(field) ? field : `${field}?`;
      const nested = printShape(resolve, property, depth - 1, printed);
      return nested.length === 0 ? label : `${label}: ${nested}`;
    });
    return `{ ${fields.join(", ")} }`;
  }));
  return name === undefined ? body : `${name} ${body}`;
}

function successResponses(resolve, operation) {
  return Object.entries(operation.responses ?? {})
    .filter(([status]) => status.startsWith("2"))
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([status, raw]) => ({ content: resolve(raw)?.content ?? {}, status }));
}

function responseShape(resolve, operation) {
  const shapes = successResponses(resolve, operation).map(({ content, status }) => {
    const types = Object.keys(content);
    if (types.length === 0) return `${status} No Content`;
    const json = content[JSON_CONTENT];
    if (json === undefined) return types.join(" or ");
    return printShape(resolve, json.schema, SHAPE_DEPTH, new Set()) || schemaType(resolve, json.schema);
  });
  return [...new Set(shapes)].join(" | ");
}

function isEventStream(resolve, operation) {
  return successResponses(resolve, operation).some(
    ({ content }) => content[EVENT_STREAM_CONTENT] !== undefined && content[JSON_CONTENT] === undefined,
  );
}

function needsBrowserSession(openapi, operation) {
  const requirements = operation.security ?? openapi.security ?? [];
  const schemes = openapi.components?.securitySchemes ?? {};
  return requirements.length > 0 && requirements.every((requirement) => {
    const names = Object.keys(requirement);
    return names.length > 0 && names.every((name) => schemes[name]?.in === "cookie");
  });
}

function mppOffer(operation, key) {
  const offers = operation["x-payment-info"]?.offers;
  if (offers === undefined) return undefined;
  const [offer] = offers;
  if (
    offers.length !== 1
    || offer.intent !== "charge"
    || !/^\d+$/u.test(offer.amount)
    || !/^0x[0-9a-fA-F]{40}$/u.test(offer.currency)
  ) {
    throw new Error(`${key} has an MPP offer TweetClaw cannot price. It reads 1 charge offer with a whole amount and a token address.`);
  }
  const dollars = (Number(offer.amount) / MPP_UNITS_PER_DOLLAR).toFixed(MPP_PRICE_DECIMALS);
  return {
    amount: offer.amount,
    currency: offer.currency.toLowerCase(),
    price: `$${dollars.replace(/\.?0+$/u, "")}/call`,
  };
}

function summaryFor(operation, isPrivateRead) {
  return [
    cleanText(operation.description),
    operation["x-write-action"] === undefined ? "" : WRITE_NOTICE,
    isPrivateRead ? PRIVATE_READ_NOTICE : "",
  ].filter((part) => part.length > 0).join(" ");
}

function describeOperation(context, entry) {
  const { openapi, policy, resolve } = context;
  const { key, method, operation, path, pathItem } = entry;
  const mpp = mppOffer(operation, key);
  const isPrivateRead = policy.privateReads.includes(key);
  const isAgentProhibited = policy.agentProhibited.includes(key) || needsBrowserSession(openapi, operation);
  return {
    method: method.toUpperCase(),
    path: catalogPath(path),
    summary: summaryFor(operation, isPrivateRead),
    category: categoryFor(operation, key, policy),
    free: operation.responses?.[PAYMENT_REQUIRED_STATUS] === undefined,
    ...(mpp === undefined ? {} : { mpp }),
    ...(isPrivateRead ? { sensitive: true } : {}),
    ...(isAgentProhibited ? { agentProhibited: true } : {}),
    parameters: [
      ...declaredParameters(resolve, pathItem, operation, key),
      ...bodyParameters(resolve, operation),
    ],
    responseShape: responseShape(resolve, operation),
  };
}

function listOperations(openapi) {
  return Object.entries(openapi.paths ?? {}).flatMap(([path, pathItem]) =>
    OPENAPI_METHODS.filter((method) => pathItem[method] !== undefined).map((method) => ({
      key: `${method.toUpperCase()} ${path}`,
      method,
      operation: pathItem[method],
      path,
      pathItem,
    })));
}

function placement(context, entry) {
  if (!entry.path.startsWith(API_PREFIX)) return "outsideApiV1";
  if (context.policy.excluded.includes(entry.key)) return "excluded";
  if (!TOOL_METHODS.has(entry.method)) {
    throw new Error(`${entry.key} uses a method the tool cannot send. Exclude it in catalog-policy.mjs or add the method to the tool.`);
  }
  return isEventStream(context.resolve, entry.operation) ? "eventStreams" : "cataloged";
}

function assertPolicyNamesCatalogedOperations(policy, operations) {
  const cataloged = new Map(operations.map((operation) => [`${operation.method} ${operation.path}`, operation]));
  for (const list of ["agentProhibited", "privateReads", "approvalFreeReads"]) {
    for (const key of policy[list]) {
      if (!cataloged.has(catalogPath(key))) {
        throw new Error(`catalog-policy.mjs lists ${key} in ${list}, and the catalog has no such operation. Remove or correct it.`);
      }
    }
  }
  for (const key of policy.approvalFreeReads) {
    const operation = cataloged.get(catalogPath(key));
    if (operation.method !== "GET" || !operation.free || operation.agentProhibited === true) {
      throw new Error(`catalog-policy.mjs lets ${key} run without approval, and it is not a free, callable GET. Remove it.`);
    }
  }
}

function operationKey(key) {
  const [method, path] = catalogPath(key).split(" ");
  return { method, path };
}

function buildContract(openapi, policy) {
  const context = { openapi, policy, resolve: createResolver(openapi) };
  const entries = listOperations(openapi);
  const placed = { cataloged: [], eventStreams: [], excluded: [], outsideApiV1: [] };
  for (const entry of entries) {
    placed[placement(context, entry)].push(entry);
  }

  const operations = placed.cataloged.map((entry) => describeOperation(context, entry)).toSorted(byPathThenMethod);
  assertPolicyNamesCatalogedOperations(policy, operations);
  const agentProhibited = operations.filter((operation) => operation.agentProhibited === true).length;
  const published = new Set(entries.map((entry) => entry.key));

  return {
    absentExclusions: policy.excluded.filter((key) => !published.has(key)),
    contract: {
      counts: {
        specOperations: entries.length,
        outsideApiV1: placed.outsideApiV1.length,
        eventStreams: placed.eventStreams.length,
        excluded: placed.excluded.length,
        cataloged: operations.length,
        agentProhibited,
        callable: operations.length - agentProhibited,
        mpp: operations.filter((operation) => operation.mpp !== undefined).length,
      },
      approvalFreeReads: policy.approvalFreeReads.map((key) => catalogPath(key)),
      blockedOperations: [...policy.excluded, ...placed.eventStreams.map((entry) => entry.key)]
        .map((key) => operationKey(key))
        .toSorted(byPathThenMethod),
      sessionOnlyOperations: entries
        .filter((entry) => entry.path.startsWith(API_PREFIX) && needsBrowserSession(openapi, entry.operation))
        .map((entry) => operationKey(entry.key))
        .toSorted(byPathThenMethod),
      operations,
    },
  };
}

export { buildContract };
