#!/bin/bash
set -u
node --test --test-reporter tap src/services/offlineQueue.test.js
