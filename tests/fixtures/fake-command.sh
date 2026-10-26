#!/bin/sh

# SPDX-FileCopyrightText: 2026 Xquik Contributors
# SPDX-License-Identifier: MIT

name="${0##*/}"
printf '%s %s\n' "$name" "$*" >> "$FAKE_COMMAND_LOG"

case "$name $*" in
  "git rev-parse --symbolic-full-name HEAD") printf 'refs/heads/release\n' ;;
  "git rev-parse"* | "git rev-list"*) printf 'abc123\n' ;;
  "npm view"*) [ -e "$FAKE_PUBLISHED_MARKER" ] || exit 1 ;;
  "node scripts/with-npm-token.ts node scripts/publish-clean.ts") : > "$FAKE_PUBLISHED_MARKER" ;;
  "npm pack --pack-destination "*) : > "$3/package.tgz" ;;
  "npx --yes clawhub@0.23.3 whoami") [ "$FAKE_CLAWHUB_LOGIN" != "rejected" ] || exit 1 ;;
  "gh release view"*) exit 1 ;;
  "uvx "*) exit "${FAKE_UVX_EXIT:-0}" ;;
esac
exit 0
