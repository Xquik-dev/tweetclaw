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
    "POST /api/v1/x/account-connection-links",
    "GET /api/v1/x/account-connection-links/{id}",
    "DELETE /api/v1/x/account-connection-links/{id}",
    "GET /api/v1/support/attachments/{id}",
  ],

  agentProhibited: [
    "POST /api/v1/subscribe",
    "POST /api/v1/credits/topup",
    "GET /api/v1/credits/topup/status",
    "GET /api/v1/x/account-connection-attempts/{id}",
    "DELETE /api/v1/x/accounts/{id}",
    "POST /api/v1/x/accounts/bulk-retry",
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
