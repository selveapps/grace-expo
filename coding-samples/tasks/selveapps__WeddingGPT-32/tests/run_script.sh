#!/bin/bash
set -u
node --test --test-reporter tap server/auth/account.test.mjs
