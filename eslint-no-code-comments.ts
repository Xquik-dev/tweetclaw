// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import type { Rule } from 'eslint';

const PROOF = /https:\/\/|SPDX-|REUSE-Ignore/u;
const DIRECTIVE = /^\/\s*<reference\s|[#@]__(?:PURE|NO_SIDE_EFFECTS)__/u;
const MAX_ADJACENT_LINE_BREAKS = 1;

export const noCodeComments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    messages: {
      comment: 'Code has no comments. Put the meaning in names, types and tests.',
    },
    schema: [],
  },
  create(context) {
    const { sourceCode } = context;
    return {
      Program(): void {
        const comments = sourceCode
          .getAllComments()
          .filter((comment) => !(comment.range?.[0] === 0 && sourceCode.text.startsWith('#!')));
        let laterProven = false;
        let laterStart = -1;
        const proven = comments
          .toReversed()
          .map((comment) => {
            const end = comment.range?.[1] ?? 0;
            const between = sourceCode.text.slice(end, laterStart);
            const adjacent =
              laterStart >= end &&
              between.trim() === '' &&
              between.split('\n').length - 1 <= MAX_ADJACENT_LINE_BREAKS;
            laterProven = PROOF.test(comment.value) || (laterProven && adjacent);
            laterStart = comment.range?.[0] ?? 0;
            return laterProven;
          })
          .toReversed();
        for (const [index, comment] of comments.entries()) {
          if (proven.at(index) !== true && !DIRECTIVE.test(comment.value) && comment.loc) {
            context.report({ loc: comment.loc, messageId: 'comment' });
          }
        }
      },
    };
  },
};
