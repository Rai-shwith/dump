#!/bin/bash

echo "Starting tests for TASK-014..."

echo ""
echo "Test 1 — Check headers on any response"
curl -s -I http://localhost:8787/api/clipboard/test | grep -iE 'X-Content-Type-Options|X-Frame-Options|Referrer-Policy|Content-Security-Policy'

echo ""
echo "Test 2 — CORS from allowed origin"
curl -s -I -H "Origin: http://localhost:5173" http://localhost:8787/api/starred | grep -iE 'Access-Control-Allow-Origin|Vary'

echo ""
echo "Test 3 — CORS from disallowed origin (should NOT see Access-Control-Allow-Origin)"
curl -s -I -H "Origin: https://evil.com" http://localhost:8787/api/starred | grep -i 'Access-Control-Allow-Origin' || echo "No CORS headers (Expected)"

echo ""
echo "Test 4 — OPTIONS preflight"
curl -s -I -X OPTIONS -H "Origin: http://localhost:5173" http://localhost:8787/api/clipboard | grep -iE 'HTTP|Access-Control-Allow'

echo ""
echo "Done."
