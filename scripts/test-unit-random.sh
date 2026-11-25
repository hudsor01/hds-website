#!/usr/bin/env bash
# Run the unit suite in 5 random orders (`bun test --randomize`) and stop at
# the first failing seed. Every test file shares one bun process, so a leak
# between files or tests only shows up when the order changes; the default
# scan order hides it. Each seed is printed first so a failure can be
# replayed exactly with `bun test tests/ --randomize --seed=<seed>`.
#
# Usage: bun run test:unit:random   (runs the mock-leak guard and blog build first)

set -euo pipefail

RUNS=5

for run in $(seq 1 "$RUNS"); do
	seed=$((RANDOM * 32768 + RANDOM))
	echo "=== test:unit:random run $run/$RUNS: --seed=$seed ==="
	if ! command bun test tests/ --randomize --seed="$seed"; then
		echo "" >&2
		echo "FAILED at seed $seed. Replay: bun test tests/ --randomize --seed=$seed" >&2
		exit 1
	fi
done

echo "OK: $RUNS randomized runs passed"
