#!/bin/bash
set -e

cd apps/dump-web
npm install
npm run build
npm run lint
echo "TEST-015 PASSED: Build and Lint completed successfully."
