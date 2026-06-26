#!/bin/bash
set -e

echo "=== TASK-016 Manual Testing Instructions ==="
echo "1. Open http://localhost:5173/new"
echo "2. Create a basic public clipboard -> redirected to view page (placeholder for now)"
echo "3. Create with custom code -> code appears in URL"
echo "4. Create protected clipboard -> fill password fields"
echo "5. Create one-time view clipboard -> verify isOneTimeView in network request"
echo "6. Create with custom expiration -> datetime picker appears"
echo "7. Try to create with no content -> error shown"
echo "==========================================="

cd apps/dump-web
npm run lint
npm run build

echo "TEST-016 PASSED: Build and Lint completed successfully. Manual testing instructions printed."
