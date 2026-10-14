// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import typescriptParser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import { noCodeComments } from '../eslint-no-code-comments';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parser: typescriptParser } });
const comment = { messageId: 'comment' };

tester.run('no-code-comments', noCodeComments, {
  valid: [
    '// SPDX-FileCopyrightText: 2026 Xquik Contributors\n// SPDX-License-Identifier: MIT\nconst a = 1;',
    '// A URL parser turns a backslash into a slash.\n// https://url.spec.whatwg.org/#path-state\nconst a = 1;',
    '/// <reference types="node" />\nconst a = 1;',
    'const a = /* #__PURE__ */ make();',
    '#!/usr/bin/env node\nconst a = 1;',
  ],
  invalid: [
    { code: '// Explains the next line.\nconst a = 1;', errors: [comment] },
    { code: 'const a = 1; // says what a is', errors: [comment] },
    { code: 'const a = add(/* first */ 1, 2);', errors: [comment] },
    { code: '/** Describes a helper. */\nexport function helper(): void {}', errors: [comment] },
    { code: '// First line.\n// Second line, still no proof.\nconst a = 1;', errors: [comment, comment] },
    { code: '// Unrelated note.\n\n// https://example.com/doc\nconst a = 1;', errors: [comment] },
  ],
});
