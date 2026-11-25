#!/usr/bin/env bash
# Guard against process-global mock and state leaks in the bun:test suite.
#
# Every test file runs in ONE bun process, and `bun test --randomize` shuffles
# both file order and test order. Anything a file leaves behind reaches every
# later file. The default scan order hid most of these leaks until a seed put
# the polluter first (see .planning/research/test-isolation/SYNTHESIS.md).
#
# Why mock.module is dangerous: bun's mock.module(specifier, factory) registers
# the mock in a process-global module registry and is NOT undone by
# mock.restore() (oven-sh/bun#7823). Bun also fixes a module's export NAMES the
# first time it is evaluated, so a PARTIAL factory registered before that first
# load removes the missing names for the rest of the run ("Export named 'cn'
# not found", "Export named 'createServerLogger' not found", "Export named
# 'notFound' not found"). If the module was already loaded, the factory swaps
# its export values in place for every importer.
#
# Rules (comment lines are ignored, so prose may mention the patterns):
#
#  1. No mock.module() of the proven-pure shared modules @/lib/utils,
#     @/lib/constants/* or drizzle-orm outside tests/setup.ts. drizzle-orm was
#     added 2026-11-25: a per-file mock exporting only `eq` broke every later
#     DB test on CI with "Export named 'sql' not found". @/lib/schemas/* is
#     intentionally NOT banned -- newsletter-unsubscribe-route.test.ts stubs a
#     Drizzle table barrel as a column-key object.
#  2. No mock.module() of @/lib/logger, sonner or next/navigation outside
#     tests/setup.ts and tests/test-utils.ts. setup.ts owns the complete logger
#     mock; spy on the real sonner `toast` with spyOn(); mock next/navigation
#     only through mockNextNavigation() in tests/test-utils.ts, which spreads
#     the real module.
#  3. No `delete process.env.TZ`. Deleting it removes Bun's TZ accessor and
#     freezes ICU at the last zone set for the rest of the run. Capture the
#     effective zone and restore it by assignment.
#  4. A file that calls mock.module('@/lib/db', ...) must also call
#     restoreRealDb() (tests/test-utils.ts), normally in afterAll, so its
#     fixture rows do not reach later files.
#  5. A file that assigns globalThis.fetch / global.fetch directly must also
#     restore it with `... .fetch = originalFetch`. mock.restore() does not
#     undo a direct assignment.
#
# It is deterministic, sub-second and order-independent, unlike a canary test.
#
# Usage: bash scripts/check-test-mock-leaks.sh   (run from project root)

set -euo pipefail

TEST_DIR="tests"
failed=0

# Print "path:line:text" for every code (non-comment) line under tests/ that
# matches ERE $1. `command grep` bypasses any interactive alias (some dev
# shells alias grep to ripgrep, which changes flag semantics). grep exits 1 on
# no match -- that is the success case here, so guard with `|| true`.
code_matches() {
	{ command grep -REn "$1" "$TEST_DIR" --include='*.ts' --include='*.tsx' \
		2>/dev/null || true; } |
		{ command grep -Ev '^[^:]+:[0-9]+:[[:space:]]*(//|\*|/\*)' || true; }
}

# Drop matches from the files named in $1 (exact paths, "|"-separated).
without_files() {
	{ command grep -Ev "^($1):" || true; }
}

# Keep only matches from files that have NO code line matching ERE $1.
in_files_lacking() {
	local having
	having="$(code_matches "$1" | cut -d: -f1 | sort -u)"
	if [ -z "$having" ]; then
		cat
	else
		{ command grep -Fv -f <(sed 's#$#:#' <<<"$having") || true; }
	fi
}

report() {
	local title="$1" matches="$2" fix="$3"
	echo "ERROR: $title" >&2
	echo "" >&2
	echo "$matches" >&2
	echo "" >&2
	echo "$fix" >&2
	echo "" >&2
	failed=1
}

# Q matches either quote style around a mock.module specifier.
Q="['\"]"
SETUP="$TEST_DIR/setup\.ts"
UTILS="$TEST_DIR/test-utils\.ts"

pure_hits="$(code_matches "mock\.module\(${Q}(@/lib/(utils|constants/)|drizzle-orm${Q})" |
	without_files "$SETUP")"

shared_hits="$(code_matches "mock\.module\(${Q}(@/lib/logger|sonner|next/navigation)${Q}" |
	without_files "$SETUP|$UTILS")"

tz_hits="$(code_matches "delete[[:space:]]+process\.env\.TZ")"

db_hits="$(code_matches "mock\.module\(${Q}@/lib/db${Q}" |
	without_files "$SETUP|$UTILS" |
	in_files_lacking "restoreRealDb\(\)")"

fetch_hits="$(code_matches "(globalThis|global)\.fetch[[:space:]]*=[^=]" |
	without_files "$SETUP" |
	in_files_lacking "(globalThis|global)\.fetch[[:space:]]*=[[:space:]]*originalFetch")"

if [ -n "$pure_hits" ]; then
	report "partial mock of a shared pure module in a per-file test:" \
		"$pure_hits" \
		"Fix: use the REAL module (it is pure/deterministic), OR place a COMPLETE
shared mock in tests/setup.ts. See the convention note in tests/setup.ts."
fi

if [ -n "$shared_hits" ]; then
	report "per-file mock.module of @/lib/logger, sonner or next/navigation:" \
		"$shared_hits" \
		"Fix: @/lib/logger is already mocked completely by tests/setup.ts (read the
live spy with \`await import('@/lib/logger')\`); spy on the real sonner
\`toast\` with spyOn(toast, 'error'); mock next/navigation only through
mockNextNavigation(overrides) from tests/test-utils.ts."
fi

if [ -n "$tz_hits" ]; then
	report "delete process.env.TZ freezes the time zone for the rest of the run:" \
		"$tz_hits" \
		"Fix: capture \`process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone\`
before changing TZ and restore it by assignment."
fi

if [ -n "$db_hits" ]; then
	report "mock.module('@/lib/db') in a file that never calls restoreRealDb():" \
		"$db_hits" \
		"Fix: import { restoreRealDb } from tests/test-utils.ts and call it in
afterAll so later files get the real no-op db, not this file's fixture rows."
fi

if [ -n "$fetch_hits" ]; then
	report "direct fetch assignment in a file that never restores originalFetch:" \
		"$fetch_hits" \
		"Fix: capture \`const originalFetch = globalThis.fetch\` and assign it back in
afterEach (\`globalThis.fetch = originalFetch\`), or use spyOn(globalThis, 'fetch'),
which mock.restore() undoes."
fi

if [ "$failed" -ne 0 ]; then
	echo "bun mock.module() is process-global and is never cleared by mock.restore()" >&2
	echo "(oven-sh/bun#7823); every test file shares one process. See the header of" >&2
	echo "scripts/check-test-mock-leaks.sh for the rules." >&2
	exit 1
fi

echo "OK: no test mock or state leaks found in tests/"
exit 0
