#!/usr/bin/env bash
# Delete orphan Neon preview branches that survived their PR closing,
# freeing quota slots so future PRs don't fail at "Create Neon Branch".
#
# Usage:
#   1. Put your Neon API key in .env.neon.local (NEON_API_KEY=...)
#   2. Run from project root:   bash scripts/neon-cleanup-orphans.sh
#
# Refuses to delete `main` and `vercel-dev`. Prints the post-cleanup
# inventory so you can confirm the project is back under the quota cap.

set -euo pipefail

PROJECT_ID="soft-bush-38066584"
ENV_FILE=".env.neon.local"
API="https://console.neon.tech/api/v2"

if [[ ! -f "$ENV_FILE" ]]; then
	echo "Missing $ENV_FILE — paste NEON_API_KEY there first." >&2
	exit 1
fi
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

if [[ -z "${NEON_API_KEY:-}" ]]; then
	echo "NEON_API_KEY is empty in $ENV_FILE." >&2
	exit 1
fi

# Identified by the failure-diagnostic step on PR #302
# (commit fd4216a). Refresh by re-running the diagnostic if the list
# drifts.
ORPHANS=(
	"preview/chore/audit-fix-visual-polish"
	"preview/chore/audit-fix-form-polish"
	"preview/chore/audit-fix-copy-voice-dates"
	"preview/chore/v5-audit"
	"preview/pr-227-chore/v5-audit"
	"preview/pr-297-chore/audit-fix-copy-voice-dates"
	"preview/dependabot/npm_and_yarn/react-email-6.3.3"
	"preview/dependabot/npm_and_yarn/production-dependencies-91f93ffcad"
)
PROTECTED=("main" "vercel-dev")

echo "Fetching current branch inventory..."
all=$(curl -sS -H "Authorization: Bearer $NEON_API_KEY" \
	"$API/projects/$PROJECT_ID/branches")

before=$(jq -r '.branches | length' <<<"$all")
echo "Before: $before branches"
echo

for name in "${ORPHANS[@]}"; do
	for guard in "${PROTECTED[@]}"; do
		if [[ "$name" == "$guard" ]]; then
			echo "REFUSING to touch protected branch '$name'"
			continue 2
		fi
	done

	bid=$(jq -r --arg n "$name" '.branches[] | select(.name==$n) | .id' <<<"$all")
	if [[ -z "$bid" ]]; then
		printf '  skip   %s (not present)\n' "$name"
		continue
	fi

	printf '  delete %-65s id=%s ... ' "$name" "$bid"
	code=$(curl -sS -o /tmp/neon-del.json -w "%{http_code}" -X DELETE \
		-H "Authorization: Bearer $NEON_API_KEY" \
		"$API/projects/$PROJECT_ID/branches/$bid")
	echo "HTTP $code"
	if [[ ! "$code" =~ ^2 ]]; then
		cat /tmp/neon-del.json
		echo
	fi
done

echo
echo "Post-cleanup inventory:"
curl -sS -H "Authorization: Bearer $NEON_API_KEY" \
	"$API/projects/$PROJECT_ID/branches" \
	| jq '{count:(.branches|length),names:[.branches[].name]}'
