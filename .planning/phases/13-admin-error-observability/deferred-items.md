# Deferred Items - Phase 13 (admin-error-observability)

Out-of-scope discoveries logged during plan execution. NOT fixed here (SCOPE BOUNDARY: only auto-fix issues directly caused by the current task's changes).

## 13-07 (blog error-state migration)

- **Pre-existing unit failures in `tests/unit/navigation.test.tsx` + `tests/unit/homepage.test.tsx` (21 tests).** All failures trace to `src/components/layout/Footer.tsx:51` (Footer Component, HomePage structural assertions, Navbar Polish, Navigation Accessibility). Unrelated to the admin blog data seam migrated in 13-07. Present before any 13-07 change. The targeted blog suite (`tests/unit/admin/blog-queries.test.ts`) is fully green (21/21). Defer to a layout/marketing-page fix; not a blocker for the blog error-state work.
