// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

const RESTRICTED_BILLING_PATTERNS = [
  { label: "exact currency amount", value: /\$\d/iu },
  { label: "credit-to-currency conversion", value: /\b1\s+credit\s*(?:=|equals)\s*\$/iu },
  { label: "exact credit charge", value: /\b\d+(?:\s*(?:-|to)\s*\d+)?\s+credits?(?:\s*\/\s*(?:entry|hour|result)|\s+per\s+(?:entry|hour|result))?\b/iu },
  { label: "exact checkout threshold", value: /\$\d+(?:\.\d+)?\s*(?:max(?:imum)?|min(?:imum)?)/iu },
  { label: "exact non-MPP result price", value: /\$\d+(?:\.\d+)?\s*\/\s*(?:entry|hour|result)/iu },
  { label: "duplicated direct MPP price table", value: /\bdirect\s+mpp\s+pricing\b/iu },
];

const MPP_PRICE_PATTERN = /\$\d+(?:\.\d+)?\/call/gu;

export { MPP_PRICE_PATTERN, RESTRICTED_BILLING_PATTERNS };
