#!/bin/bash
set -u
node --test --test-reporter tap server/auth/rsvp/rsvp.test.mjs
