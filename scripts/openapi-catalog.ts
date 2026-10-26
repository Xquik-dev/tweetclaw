// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import type { CatalogPolicy } from "./catalog-policy.ts";
import { isList, isRecord } from "./json-shape.ts";
import { RESTRICTED_BILLING_PATTERNS } from "./public-copy-rules.ts";

const OPENAPI_METHODS = ["delete", "get", "head", "options", "patch", "post", "put", "trace"] as const;
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
const NO_FIELDS: JsonObject = {};

type JsonObject = Readonly<Record<string, unknown>>;
type Method = (typeof OPENAPI_METHODS)[number];
type Placement = "cataloged" | "eventStreams" | "excluded" | "outsideApiV1";
type Resolve = (value: unknown) => unknown;

interface Fields {
  readonly list: (name: string) => readonly unknown[] | undefined;
  readonly object: (name: string) => JsonObject | undefined;
  readonly objects: (name: string) => readonly JsonObject[] | undefined;
  readonly text: (name: string) => string | undefined;
  readonly texts: (name: string) => readonly string[] | undefined;
  readonly value: (name: string) => unknown;
}

interface Document {
  readonly cookieSchemes: ReadonlySet<string>;
  readonly paths: JsonObject;
  readonly security: readonly JsonObject[];
}

interface Entry {
  readonly description: string | undefined;
  readonly key: string;
  readonly method: Method;
  readonly parameters: readonly unknown[];
  readonly path: string;
  readonly pathParameters: readonly unknown[];
  readonly paymentOffers: readonly unknown[] | undefined;
  readonly requestBody: unknown;
  readonly responses: JsonObject;
  readonly security: readonly JsonObject[] | undefined;
  readonly tag: string | undefined;
  readonly writeAction: boolean;
}

interface Schema {
  readonly allOf: readonly unknown[] | undefined;
  readonly alternatives: readonly unknown[] | undefined;
  readonly deprecated: boolean;
  readonly description: string | undefined;
  readonly enum: readonly unknown[] | undefined;
  readonly items: unknown;
  readonly properties: JsonObject | undefined;
  readonly required: readonly string[] | undefined;
  readonly type: string | readonly string[] | undefined;
}

interface Field {
  readonly deprecated: boolean;
  readonly description: string | undefined;
  readonly location: string;
  readonly name: string;
  readonly required: boolean;
  readonly schema: unknown;
}

interface Media {
  readonly schema: unknown;
}

type Content = Readonly<Record<string, Media>>;

interface SuccessResponse {
  readonly content: Content;
  readonly status: string;
}

interface Variant {
  readonly properties: JsonObject;
  readonly required: readonly string[];
}

interface Context {
  readonly document: Document;
  readonly policy: CatalogPolicy;
  readonly resolve: Resolve;
}

interface OperationKey {
  readonly method: string;
  readonly path: string;
}

interface MppOffer {
  readonly amount: string;
  readonly currency: string;
  readonly price: string;
}

interface CatalogParameter {
  readonly name: string;
  readonly in: string;
  readonly required: boolean;
  readonly type: string;
  readonly description: string;
}

interface CatalogOperation extends OperationKey {
  readonly summary: string;
  readonly category: string;
  readonly free: boolean;
  readonly mpp?: MppOffer;
  readonly sensitive?: boolean;
  readonly agentProhibited?: boolean;
  readonly parameters: readonly CatalogParameter[];
  readonly responseShape: string;
}

interface ContractCounts {
  readonly specOperations: number;
  readonly outsideApiV1: number;
  readonly eventStreams: number;
  readonly excluded: number;
  readonly cataloged: number;
  readonly agentProhibited: number;
  readonly callable: number;
  readonly mpp: number;
}

interface ApiContract {
  readonly counts: ContractCounts;
  readonly approvalFreeReads: readonly string[];
  readonly blockedOperations: readonly OperationKey[];
  readonly sessionOnlyOperations: readonly OperationKey[];
  readonly operations: readonly CatalogOperation[];
}

function fieldsOf(value: unknown, owner: string): Fields {
  if (!isRecord(value)) {
    throw new Error(`${owner} is not an object.`);
  }
  const source = value;
  function fail(name: string, expected: string): Error {
    return new Error(`${owner} field ${name} is not ${expected}.`);
  }
  function list(name: string): readonly unknown[] | undefined {
    const field = source[name];
    if (field === undefined || isList(field)) return field;
    throw fail(name, "a list");
  }
  function object(name: string): JsonObject | undefined {
    const field = source[name];
    if (field === undefined || isRecord(field)) return field;
    throw fail(name, "an object");
  }
  function objects(name: string): readonly JsonObject[] | undefined {
    const field = list(name);
    if (field === undefined || field.every((item) => isRecord(item))) return field;
    throw fail(name, "a list of objects");
  }
  function text(name: string): string | undefined {
    const field = source[name];
    if (field === undefined || typeof field === "string") return field;
    throw fail(name, "text");
  }
  function texts(name: string): readonly string[] | undefined {
    const field = list(name);
    if (field === undefined || field.every((item) => typeof item === "string")) return field;
    throw fail(name, "a list of text");
  }
  return { list, object, objects, text, texts, value: (name) => source[name] };
}

function refOf(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const reference = value["$ref"];
  return typeof reference === "string" ? reference : undefined;
}

function createResolver(openapi: unknown): Resolve {
  function lookup(reference: string): unknown {
    if (!reference.startsWith("#/")) {
      throw new Error(`OpenAPI reference is not local: ${reference}`);
    }
    let node = openapi;
    for (const token of reference.slice(2).split("/")) {
      node = isRecord(node) ? node[token.replaceAll("~1", "/").replaceAll("~0", "~")] : undefined;
    }
    if (node === undefined) {
      throw new Error(`OpenAPI reference is missing: ${reference}`);
    }
    return node;
  }

  return function resolve(value: unknown): unknown {
    let current = value;
    let reference = refOf(current);
    const followed = new Set<string>();
    while (reference !== undefined) {
      if (followed.has(reference)) {
        throw new Error(`OpenAPI reference loops: ${reference}`);
      }
      followed.add(reference);
      current = lookup(reference);
      reference = refOf(current);
    }
    return current;
  };
}

function readDocument(openapi: unknown): Document {
  const document = fieldsOf(openapi, "OpenAPI document");
  const components = fieldsOf(document.object("components") ?? NO_FIELDS, "OpenAPI components");
  const schemes = Object.entries(components.object("securitySchemes") ?? NO_FIELDS);
  return {
    cookieSchemes: new Set(schemes.filter(([, scheme]) => isRecord(scheme) && scheme["in"] === "cookie").map(([name]) => name)),
    paths: document.object("paths") ?? NO_FIELDS,
    security: document.objects("security") ?? [],
  };
}

function readSchema(resolve: Resolve, raw: unknown): Schema {
  const schema = fieldsOf(resolve(raw) ?? NO_FIELDS, "OpenAPI schema");
  const type = schema.value("type");
  return {
    allOf: schema.list("allOf"),
    alternatives: schema.list("oneOf") ?? schema.list("anyOf"),
    deprecated: schema.value("deprecated") === true,
    description: schema.text("description"),
    enum: schema.list("enum"),
    items: schema.value("items"),
    properties: schema.object("properties"),
    required: schema.texts("required"),
    type: typeof type === "string" ? type : schema.texts("type"),
  };
}

function readContent(resolve: Resolve, raw: unknown, owner: string): Content {
  const content = fieldsOf(resolve(raw) ?? NO_FIELDS, owner).object("content") ?? NO_FIELDS;
  return Object.fromEntries(Object.entries(content).map(([type, media]): [string, Media] => [
    type,
    { schema: fieldsOf(media, `${owner} ${type}`).value("schema") },
  ]));
}

function schemaName(raw: unknown): string | undefined {
  const prefix = "#/components/schemas/";
  const reference = refOf(raw);
  return reference !== undefined && reference.startsWith(prefix) ? reference.slice(prefix.length) : undefined;
}

function catalogPath(path: string): string {
  return path.replaceAll(/\{([^}]+)\}/gu, (_match: string, name: string) => `:${name}`);
}

function byPathThenMethod(left: OperationKey, right: OperationKey): number {
  return left.path.localeCompare(right.path, "en") || left.method.localeCompare(right.method, "en");
}

function categoryFor(entry: Entry, policy: CatalogPolicy): string {
  const { key, tag } = entry;
  if (tag === undefined) {
    throw new Error(`${key} has no tag. TweetClaw names its category from the first tag.`);
  }
  return policy.categoryByTag[tag] ?? tag.toLowerCase().replaceAll(/\s+/gu, "-");
}

function cleanText(text: string | undefined): string {
  if (text === undefined) return "";
  return text
    .replaceAll(/\s+/gu, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .filter((sentence) => !RESTRICTED_BILLING_PATTERNS.some((pattern) => pattern.value.test(sentence)))
    .join(" ");
}

function schemaType(resolve: Resolve, raw: unknown): string {
  const schema = readSchema(resolve, raw);
  if (schema.alternatives !== undefined) {
    const types = schema.alternatives.map((variant) => schemaType(resolve, variant));
    return [...new Set(types)].filter((type) => type !== "null").join(" | ");
  }
  if (isList(schema.type)) {
    return schema.type.filter((type) => type !== "null").join(" | ");
  }
  if (schema.type === "array") return `${schemaType(resolve, schema.items)}[]`;
  if (schema.type !== undefined) return schema.type;
  return schema.properties === undefined && schema.allOf === undefined ? "unknown" : "object";
}

function enumNote(resolve: Resolve, schema: Schema, description: string): string {
  const values = schema.enum ?? readSchema(resolve, schema.items).enum;
  if (values === undefined || values.every((value) => description.includes(String(value)))) {
    return "";
  }
  return `One of ${values.join(", ")}.`;
}

function describeField(resolve: Resolve, field: Field): CatalogParameter {
  const schema = readSchema(resolve, field.schema);
  const description = cleanText(field.description ?? schema.description) || field.name;
  return {
    name: field.name,
    in: field.location,
    required: field.required,
    type: schemaType(resolve, field.schema),
    description: [
      field.deprecated || schema.deprecated ? "Deprecated." : "",
      description,
      enumNote(resolve, schema, description),
    ].filter((part) => part.length > 0).join(" "),
  };
}

function readParameter(value: unknown, key: string): Field {
  const parameter = fieldsOf(value, `OpenAPI ${key} parameter`);
  const name = parameter.text("name");
  const location = parameter.value("in");
  if (typeof location !== "string" || !PARAMETER_LOCATIONS.has(location)) {
    throw new Error(`${key} takes ${String(name)} in ${String(location)}. The tool sends header, path, query, and body values only.`);
  }
  if (name === undefined) {
    throw new Error(`OpenAPI ${key} parameter field name is missing.`);
  }
  return {
    deprecated: parameter.value("deprecated") === true,
    description: parameter.text("description"),
    location,
    name,
    required: parameter.value("required") === true,
    schema: parameter.value("schema"),
  };
}

function declaredParameters(resolve: Resolve, entry: Entry): CatalogParameter[] {
  const declared = new Map<string, Field>();
  // An operation's own parameter replaces the path's parameter of that name. https://spec.openapis.org/oas/v3.1.0.html#operation-object
  for (const raw of [...entry.pathParameters, ...entry.parameters]) {
    const parameter = readParameter(resolve(raw), entry.key);
    declared.set(`${parameter.location}:${parameter.name}`, parameter);
  }
  return [...declared.values()].map((parameter) => describeField(resolve, parameter));
}

function objectVariants(resolve: Resolve, raw: unknown): Variant[] {
  const schema = readSchema(resolve, raw);
  if (schema.alternatives !== undefined) {
    return schema.alternatives.flatMap((alternative) => objectVariants(resolve, alternative));
  }
  const own: Variant = { properties: schema.properties ?? NO_FIELDS, required: schema.required ?? [] };
  return (schema.allOf ?? []).reduce<Variant[]>(
    (combined, part) => combined.flatMap((base) =>
      objectVariants(resolve, part).map((variant) => ({
        properties: { ...base.properties, ...variant.properties },
        required: [...base.required, ...variant.required],
      }))),
    [own],
  );
}

function bodyParameters(resolve: Resolve, entry: Entry): CatalogParameter[] {
  const owner = `OpenAPI ${entry.key} request body`;
  const variants = objectVariants(resolve, readContent(resolve, entry.requestBody, owner)[JSON_CONTENT]?.schema);
  const names = new Set(variants.flatMap((variant) => Object.keys(variant.properties)));
  return [...names].map((name) => {
    const property = variants.find((variant) => variant.properties[name] !== undefined)?.properties[name];
    return describeField(resolve, {
      deprecated: false,
      description: fieldsOf(property, `${owner} property ${name}`).text("description"),
      location: "body",
      name,
      required: variants.every((variant) => variant.required.includes(name)),
      schema: property,
    });
  });
}

function joinAlternatives(shapes: readonly string[]): string {
  return [...new Set(shapes)].filter((shape) => shape.length > 0).join(" | ");
}

function printShape(resolve: Resolve, raw: unknown, depth: number, printed: Set<string>): string {
  const name = schemaName(raw);
  const schema = readSchema(resolve, raw);
  if (schema.alternatives !== undefined) {
    return joinAlternatives(schema.alternatives.map((alternative) => printShape(resolve, alternative, depth, printed)));
  }
  if (schema.type === "array") {
    return `[${printShape(resolve, schema.items, depth, printed) || schemaType(resolve, schema.items)}]`;
  }
  const variants = objectVariants(resolve, raw).filter((variant) => Object.keys(variant.properties).length > 0);
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

function successResponses(resolve: Resolve, entry: Entry): SuccessResponse[] {
  return Object.entries(entry.responses)
    .filter(([status]) => status.startsWith("2"))
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([status, raw]) => ({ content: readContent(resolve, raw, `OpenAPI ${entry.key} response ${status}`), status }));
}

function responseShape(resolve: Resolve, entry: Entry): string {
  const shapes = successResponses(resolve, entry).map(({ content, status }) => {
    const types = Object.keys(content);
    if (types.length === 0) return `${status} No Content`;
    const json = content[JSON_CONTENT];
    if (json === undefined) return types.join(" or ");
    return printShape(resolve, json.schema, SHAPE_DEPTH, new Set()) || schemaType(resolve, json.schema);
  });
  return [...new Set(shapes)].join(" | ");
}

function isEventStream(resolve: Resolve, entry: Entry): boolean {
  return successResponses(resolve, entry).some(
    ({ content }) => content[EVENT_STREAM_CONTENT] !== undefined && content[JSON_CONTENT] === undefined,
  );
}

function needsBrowserSession(document: Document, entry: Entry): boolean {
  const requirements = entry.security ?? document.security;
  return requirements.length > 0 && requirements.every((requirement) => {
    const names = Object.keys(requirement);
    return names.length > 0 && names.every((name) => document.cookieSchemes.has(name));
  });
}

function mppOffer(entry: Entry): MppOffer | undefined {
  const offers = entry.paymentOffers;
  if (offers === undefined) return undefined;
  const [offer] = offers;
  const { amount, currency, intent } = isRecord(offer) ? offer : NO_FIELDS;
  if (
    offers.length !== 1
    || intent !== "charge"
    || typeof amount !== "string"
    || !/^\d+$/u.test(amount)
    || typeof currency !== "string"
    || !/^0x[0-9a-fA-F]{40}$/u.test(currency)
  ) {
    throw new Error(`${entry.key} has an MPP offer TweetClaw cannot price. It reads 1 charge offer with a whole amount and a token address.`);
  }
  const dollars = (Number(amount) / MPP_UNITS_PER_DOLLAR).toFixed(MPP_PRICE_DECIMALS);
  return {
    amount,
    currency: currency.toLowerCase(),
    price: `$${dollars.replace(/\.?0+$/u, "")}/call`,
  };
}

function summaryFor(entry: Entry, isPrivateRead: boolean): string {
  return [
    cleanText(entry.description),
    entry.writeAction ? WRITE_NOTICE : "",
    isPrivateRead ? PRIVATE_READ_NOTICE : "",
  ].filter((part) => part.length > 0).join(" ");
}

function describeOperation(context: Context, entry: Entry): CatalogOperation {
  const { document, policy, resolve } = context;
  const { key, method, path } = entry;
  const mpp = mppOffer(entry);
  const isPrivateRead = policy.privateReads.includes(key);
  const isAgentProhibited = policy.agentProhibited.includes(key) || needsBrowserSession(document, entry);
  return {
    method: method.toUpperCase(),
    path: catalogPath(path),
    summary: summaryFor(entry, isPrivateRead),
    category: categoryFor(entry, policy),
    free: entry.responses[PAYMENT_REQUIRED_STATUS] === undefined,
    ...(mpp === undefined ? {} : { mpp }),
    ...(isPrivateRead ? { sensitive: true } : {}),
    ...(isAgentProhibited ? { agentProhibited: true } : {}),
    parameters: [
      ...declaredParameters(resolve, entry),
      ...bodyParameters(resolve, entry),
    ],
    responseShape: responseShape(resolve, entry),
  };
}

function readEntry(value: unknown, method: Method, path: string, pathParameters: readonly unknown[]): Entry {
  const key = `${method.toUpperCase()} ${path}`;
  const operation = fieldsOf(value, `OpenAPI ${key}`);
  const [tag] = operation.list("tags") ?? [];
  return {
    description: operation.text("description"),
    key,
    method,
    parameters: operation.list("parameters") ?? [],
    path,
    pathParameters,
    paymentOffers: fieldsOf(operation.object("x-payment-info") ?? NO_FIELDS, `OpenAPI ${key} x-payment-info`).list("offers"),
    requestBody: operation.value("requestBody"),
    responses: operation.object("responses") ?? NO_FIELDS,
    security: operation.objects("security"),
    tag: typeof tag === "string" ? tag : undefined,
    writeAction: operation.value("x-write-action") !== undefined,
  };
}

function listOperations(document: Document): Entry[] {
  return Object.entries(document.paths).flatMap(([path, value]) => {
    const pathItem = fieldsOf(value, `OpenAPI path ${path}`);
    const pathParameters = pathItem.list("parameters") ?? [];
    return OPENAPI_METHODS.filter((method) => pathItem.value(method) !== undefined).map((method) =>
      readEntry(pathItem.value(method), method, path, pathParameters));
  });
}

function placement(context: Context, entry: Entry): Placement {
  if (!entry.path.startsWith(API_PREFIX)) return "outsideApiV1";
  if (context.policy.excluded.includes(entry.key)) return "excluded";
  if (!TOOL_METHODS.has(entry.method)) {
    throw new Error(`${entry.key} uses a method the tool cannot send. Exclude it in catalog-policy.ts or add the method to the tool.`);
  }
  return isEventStream(context.resolve, entry) ? "eventStreams" : "cataloged";
}

function assertPolicyNamesCatalogedOperations(policy: CatalogPolicy, operations: readonly CatalogOperation[]): void {
  const cataloged = new Map(operations.map((operation): [string, CatalogOperation] => [`${operation.method} ${operation.path}`, operation]));
  for (const list of ["agentProhibited", "privateReads", "approvalFreeReads"] as const) {
    for (const key of policy[list]) {
      if (!cataloged.has(catalogPath(key))) {
        throw new Error(`catalog-policy.ts lists ${key} in ${list}, and the catalog has no such operation. Remove or correct it.`);
      }
    }
  }
  for (const key of policy.approvalFreeReads) {
    const operation = cataloged.get(catalogPath(key));
    if (operation?.method !== "GET" || !operation.free || operation.agentProhibited === true) {
      throw new Error(`catalog-policy.ts lets ${key} run without approval, and it is not a free, callable GET. Remove it.`);
    }
  }
}

function operationKey(key: string): OperationKey {
  const [method, path] = catalogPath(key).split(" ");
  if (method === undefined || path === undefined) {
    throw new Error(`catalog-policy.ts names ${key}, which is not a method and a path.`);
  }
  return { method, path };
}

function buildContract(openapi: unknown, policy: CatalogPolicy): { readonly absentExclusions: string[]; readonly contract: ApiContract } {
  const document = readDocument(openapi);
  const context: Context = { document, policy, resolve: createResolver(openapi) };
  const entries = listOperations(document);
  const placed: Record<Placement, Entry[]> = { cataloged: [], eventStreams: [], excluded: [], outsideApiV1: [] };
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
        .filter((entry) => entry.path.startsWith(API_PREFIX) && needsBrowserSession(document, entry))
        .map((entry) => operationKey(entry.key))
        .toSorted(byPathThenMethod),
      operations,
    },
  };
}

export { buildContract };
export type { ApiContract, ContractCounts };
