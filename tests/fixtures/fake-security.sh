#!/bin/sh

# SPDX-FileCopyrightText: 2026 Xquik Contributors
# SPDX-License-Identifier: MIT

printf '%s\n' "$*" >> "$FAKE_SECURITY_LOG"
if [ "$FAKE_SECURITY_MISSING" = "1" ]; then
  exit 44
fi
case " $* " in
  *" -w "*) printf '%s\n' "$FAKE_SECURITY_TOKEN" ;;
esac
