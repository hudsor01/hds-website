# Phase 19 Summary — dependency-security

**Completed:** 2026-06-03
**Requirement:** SEC-01 — satisfied
**PR:** #344 (merged, CI-green)

## What shipped

`package.json` overrides pinning patched versions of 5 vulnerable transitive deps. `bun audit`: **5 vulnerabilities (2 high, 3 moderate) -> 0**.

| Dep | From | To | Severity | Via |
|-----|------|----|----------|-----|
| `fast-uri` | 3.1.0 | 3.1.2 | 2 HIGH (host confusion, path traversal) | react-email→ajv, @sentry→webpack |
| `postcss` | 8.4.31 | 8.5.15 | moderate (XSS unescaped `</style>`) | next, @tailwindcss/postcss, sanitize-html |
| `brace-expansion` | 5.0.5 | 5.0.6 | moderate (DoS) | minimatch |
| `ws` | 8.18.3/8.19.0 | 8.21.0 | moderate (memory disclosure) | happy-dom, socket.io |

## Why overrides

`bun update` (compatible) could not move them — intermediate deps held them below the patched versions. All fixes are same-major (non-breaking); no older-major consumers existed to break (`brace-expansion` was single-version 5.0.5). Overrides force the patched transitive versions deterministically. Diff is minimal: +4 override lines, ~46 bun.lock lines.

## Verification

- `bun audit` -> No vulnerabilities found
- typecheck clean, lint clean (413 files), `bun run build` compiled (postcss is build-critical for Next/Tailwind + runtime for sanitize-html), full suite 1073/0
- CI #344 green (Build/Test/Code Quality/Neon/Vercel)

## Notes

- Code-only PR off origin/main; planning trail stays on local main.
- Local `main` reconcile (`git merge origin/main`) is operator-run (gated for the agent).
