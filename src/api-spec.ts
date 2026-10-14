// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import GENERATED_API_CONTRACT from '../generated-api-contract.json' with { type: 'json' };
import type { EndpointInfo, EndpointParameter, MppOffer } from './types.js';

interface OperationKey {
  readonly method: string;
  readonly path: string;
}

interface StoredParameter extends Omit<EndpointParameter, 'in'> {
  readonly in: string;
}

interface StoredOperation extends Omit<EndpointInfo, 'mpp' | 'parameters' | 'responseShape'> {
  readonly mpp?: MppOffer & { readonly price: string };
  readonly parameters: readonly number[];
  readonly responseShape: number;
}

interface StoredContract {
  readonly approvalFreeReads: readonly string[];
  readonly blockedOperations: readonly OperationKey[];
  readonly operations: readonly StoredOperation[];
  readonly parameters: readonly StoredParameter[];
  readonly responseShapes: readonly string[];
  readonly sessionOnlyOperations: readonly OperationKey[];
}

interface ApiContract {
  readonly approvalFreeReads: ReadonlySet<string>;
  readonly blockedOperations: readonly OperationKey[];
  readonly endpoints: readonly EndpointInfo[];
  readonly mppOffers: ReadonlyMap<EndpointInfo, MppOffer>;
  readonly sessionOnlyOperations: readonly OperationKey[];
}

const PARAMETER_LOCATIONS = ['body', 'header', 'path', 'query'] as const;

function parameterLocation(value: string): EndpointParameter['in'] {
  const location = PARAMETER_LOCATIONS.find((candidate) => candidate === value);
  if (location === undefined) throw new Error(`Invalid parameter location: ${value}`);
  return location;
}

function storedValue<T>(values: readonly T[], position: number, operation: OperationKey): T {
  const value = values.at(position);
  if (value === undefined) {
    throw new Error(`Missing generated contract for ${operation.method} ${operation.path}`);
  }
  return value;
}

function mppInfo(offer: StoredOperation['mpp']): Pick<EndpointInfo, 'mpp'> {
  return offer === undefined ? {} : { mpp: { intent: 'charge', price: offer.price } };
}

function loadApiContract(contract: StoredContract): ApiContract {
  const parameters = contract.parameters.map(
    (parameter): EndpointParameter => ({ ...parameter, in: parameterLocation(parameter.in) }),
  );
  const mppOffers = new Map<EndpointInfo, MppOffer>();
  const endpoints = contract.operations.map((operation): EndpointInfo => {
    const { mpp, parameters: positions, responseShape, ...described } = operation;
    const endpoint: EndpointInfo = {
      ...described,
      ...mppInfo(mpp),
      parameters: positions.map((position) => storedValue(parameters, position, operation)),
      responseShape: storedValue(contract.responseShapes, responseShape, operation),
    };
    if (mpp !== undefined) mppOffers.set(endpoint, { amount: mpp.amount, currency: mpp.currency });
    return endpoint;
  });
  return {
    approvalFreeReads: new Set(contract.approvalFreeReads),
    blockedOperations: contract.blockedOperations,
    endpoints,
    mppOffers,
    sessionOnlyOperations: contract.sessionOnlyOperations,
  };
}

const {
  approvalFreeReads: APPROVAL_FREE_READS,
  blockedOperations: BLOCKED_OPERATIONS,
  endpoints: API_SPEC,
  mppOffers: MPP_OFFERS,
  sessionOnlyOperations: SESSION_ONLY_OPERATIONS,
} = loadApiContract(GENERATED_API_CONTRACT);

export { API_SPEC, APPROVAL_FREE_READS, BLOCKED_OPERATIONS, loadApiContract, MPP_OFFERS, SESSION_ONLY_OPERATIONS };
export type { StoredContract };
