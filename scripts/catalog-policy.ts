// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

interface CatalogPolicy {
  readonly excluded: readonly string[];
  readonly agentProhibited: readonly string[];
  readonly privateReads: readonly string[];
  readonly approvalFreeReads: readonly string[];
  readonly categoryByTag: Readonly<Record<string, string>>;
}

const CATALOG_POLICY: CatalogPolicy = {
  excluded: [
    "GET /api/v1/credits/topup/redirect",
    "GET /api/v1/guest-wallets/status",
    "POST /api/v1/guest-wallets",
    "POST /api/v1/guest-wallets/topups",
    "POST /api/v1/x/account-connection-challenges/{id}/submit",
    "POST /api/v1/x/accounts",
    "POST /api/v1/x/accounts/{id}/reauth",
    "GET /api/v1/support/attachments/{id}",
  ],

  agentProhibited: [
    "PATCH /api/v1/account",
    "PUT /api/v1/account/x-identity",
    "POST /api/v1/subscribe",
    "POST /api/v1/credits/topup",
    "GET /api/v1/credits/topup/status",
    "GET /api/v1/x/account-connection-attempts/{id}",
    "GET /api/v1/x/accounts/{id}",
    "DELETE /api/v1/x/accounts/{id}",
    "POST /api/v1/x/accounts/bulk-retry",
    "GET /api/v1/support/tickets",
    "POST /api/v1/support/tickets",
    "GET /api/v1/support/tickets/{id}",
    "PATCH /api/v1/support/tickets/{id}",
    "POST /api/v1/support/tickets/{id}/messages",
  ],

  privateReads: [
    "GET /api/v1/x/bookmarks",
    "GET /api/v1/x/bookmarks/folders",
    "GET /api/v1/x/dm/{userId}/history",
    "GET /api/v1/x/notifications",
    "GET /api/v1/x/timeline",
  ],

  approvalFreeReads: ["GET /api/v1/radar"],

  categoryByTag: {
    "API Keys": "account",
    Articles: "twitter",
    Broadcasts: "twitter",
    Communities: "twitter",
    "Community Notes": "twitter",
    Draws: "extraction",
    Events: "monitoring",
    Extractions: "extraction",
    Jobs: "twitter",
    Lists: "twitter",
    Monitors: "monitoring",
    Spaces: "twitter",
    Subscribe: "credits",
    Trends: "twitter",
    Tweets: "twitter",
    Users: "twitter",
    Webhooks: "monitoring",
  },
};

export { CATALOG_POLICY };
export type { CatalogPolicy };
