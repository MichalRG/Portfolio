# Smoke Tests

Quick, portable post-deploy checks for the public site.

Usage:

```bash
node tests/smoke/smoke-check.js https://mkrzyzowski.com
```

Checks:
- `/` responds (EN preference)
- `/` redirects to `/pl/` for Polish `Accept-Language`
- `/pl/` returns HTML with `<base href="/pl/"`
- `/robots.txt` responds
- key security headers are present (CSP, HSTS)

Notes:
- These are lightweight checks, not full E2E tests.
- If you change headers or routing rules, update the checks accordingly.
