#!/usr/bin/env bash
# Guard against process-global mock leaks in the bun:test suite.
#
# bun's mock.module(specifier, factory) registers the mock in a process-global
# module registry and is NOT undone by mock.restore() (oven-sh/bun#7823). A
# per-file PARTIAL mock of a shared pure module therefore freezes that module's
# exports for every later test file in the run. The proven case (Phase 17):
# tests/unit/ttl-calculator-actions.test.ts partial-mocked @/lib/utils (dropping
# cn) and @/lib/constants/business (dropping links.facebook), breaking ~21 later
# homepage/navigation/Footer tests with "Export named 'cn' not found".
#
# This guard greps tests/ for mock.module() calls targeting the proven-pure
# shared modules and fails if any appear OUTSIDE tests/setup.ts (the single
# sanctioned place a COMPLETE shared mock may live). It is deterministic,
# sub-second, and order-independent, unlike a last-running canary test.
#
# Denylist scope (see .planning/phases/17-test-suite-isolation/17-01-PLAN.md
# guard_scope_note): @/lib/utils and @/lib/constants/* only. @/lib/schemas/* is
# intentionally NOT banned -- blog.test.ts and newsletter-unsubscribe-route.test.ts
# legitimately stub Drizzle table barrels as complete column-key objects.
#
# Usage: bash scripts/check-test-mock-leaks.sh   (run from project root)

set -euo pipefail

# Denylist pattern: mock.module('@/lib/utils'...) or mock.module('@/lib/constants/...')
# Single or double quotes accepted. tests/setup.ts is the sanctioned exception.
PATTERN="mock\.module\((['\"])@/lib/(utils|constants/)"

# -R recursive, -E extended regex, -n line numbers. Restrict to TS/TSX test files.
# grep exits 1 when no match -> that is the success case here, so guard with `|| true`.
matches="$(grep -REn "$PATTERN" tests/ --include='*.ts' --include='*.tsx' 2>/dev/null \
	| grep -v '^tests/setup\.ts:' || true)"

if [ -n "$matches" ]; then
	echo "ERROR: partial mock of a shared pure module detected in a per-file test:" >&2
	echo "" >&2
	echo "$matches" >&2
	echo "" >&2
	echo "bun mock.module() is process-global and is never cleared by mock.restore()" >&2
	echo "(oven-sh/bun#7823). A partial mock of a shared pure module freezes its" >&2
	echo "exports for every later test file, breaking unrelated suites." >&2
	echo "" >&2
	echo "Fix: use the REAL module (it is pure/deterministic), OR place a COMPLETE" >&2
	echo "shared mock in tests/setup.ts. See the convention note at the top of" >&2
	echo "tests/setup.ts." >&2
	exit 1
fi

echo "OK: no partial shared-module mock leaks found in tests/"
exit 0
