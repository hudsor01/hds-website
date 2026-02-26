# Phase 55: Old Tooling Removal & Verification - Research

**Researched:** 2026-02-24
**Domain:** Package removal, empty catch block resolution, documentation cleanup, build verification
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Remove ALL ESLint-related packages from devDependencies, not just the 3 named in success criteria. This includes: `eslint`, `eslint-config-next`, and all transitive ESLint deps (`@typescript-eslint/*`, `@rushstack/eslint-patch`, `eslint-plugin-react-hooks`, etc.)
- Remove ALL ESLint config/ignore files: `eslint.config.mjs` plus any `.eslintignore`, `.eslintrc.*` variants found anywhere in the repo
- Run `bun install` after removal to update `bun.lock` before running the verification suite
- Remove Prettier entirely (aligns with v3.1 goal of zero ESLint/Prettier surface)
- Remove ALL Prettier config files found (any `*.prettierrc*`, `.prettier.*` variant), not just `.prettierrc.json` and `.prettierignore`
- Scope: run `grep -r "catch {}" src/` to find all empty catch blocks globally
- Resolution: comprehensively resolve every instance — add `/* intentional */` comments, or refactor if appropriate
- This is NOT optional — resolve ALL instances before completing the phase
- Commit the empty catch block fixes as a separate commit before the package removal commit
- Grep all `.md` files, `CLAUDE.md`, and any other docs for ESLint/Prettier references
- Update or remove any references that describe ESLint/Prettier as the project's linter/formatter
- Update to reference Biome where appropriate

### Claude's Discretion
- Whether to keep Prettier for markdown-only use or remove entirely (recommended: remove)
- `.vscode/settings.json` behavior for markdown files after Prettier removal
- Exact set of ESLint transitive packages to uninstall (scan package.json and remove all `eslint-*`, `@typescript-eslint/*`, `@rushstack/*` entries)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLEN-01 | `eslint`, `eslint-config-next`, and `prettier` removed from devDependencies | Direct bun remove command; only 3 explicit devDeps found in package.json |
| CLEN-02 | `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore` deleted from repository | All 3 files confirmed present; simple `rm` operation |
| ZERO-01 | All 329+ unit tests continue to pass after removal (`bun test tests/` exits 0) | Currently 360 tests pass; ESLint/Prettier removal has zero test impact |
| ZERO-02 | Production build generates all 129 static pages without errors | `bun run build` with no ESLint hooks post-removal |
| ZERO-03 | `tsc --noEmit` reports 0 TypeScript errors after migration | TypeScript has no ESLint/Prettier dependency; typecheck unaffected |
</phase_requirements>

## Summary

Phase 55 is a pure removal and verification phase. Biome is already fully wired (Phase 54 complete) — the only remaining work is removing ESLint, Prettier, and their config files from the repository, resolving 16 empty catch blocks globally, updating documentation references, and running the verification suite.

The ESLint/Prettier packages in `package.json` are `eslint`, `eslint-config-next`, and `prettier` — exactly 3 explicit devDependencies. Their transitive deps (plugins, `@typescript-eslint/*`, etc.) are NOT separately listed; they are pulled in as peer deps and will be dropped from `bun.lock` automatically when the 3 explicit packages are removed via `bun remove`. No special transitive cleanup is needed.

The empty catch blocks fall into two patterns: (a) intentional suppression with a comment already present in the body — these need `/* intentional */` annotation, or (b) catch blocks where the body already has a comment explaining the suppression. Research confirms Biome 2.4.4 has **no JS/TS rule** for empty catch blocks — `noEmptyBlock` is CSS-only. The empty catch blocks do NOT cause `biome check` failures. The CONTEXT.md requirement to resolve them is a code quality mandate, not a Biome compliance issue.

**Primary recommendation:** Execute in 2 commits — (1) empty catch block fixes, (2) package + config file removal + doc cleanup + verification.

## Current State (Confirmed by Investigation)

### Packages to Remove
```json
"eslint": "^9",
"eslint-config-next": "^15.3.4",
"prettier": "^3.5.3"
```
All 3 are explicit `devDependencies`. No other `eslint-*`, `@typescript-eslint/*`, or `@rushstack/*` entries exist in `package.json`.

### Config Files to Remove
| File | Exists | Action |
|------|--------|--------|
| `eslint.config.mjs` | YES | `rm eslint.config.mjs` |
| `.prettierrc.json` | YES | `rm .prettierrc.json` |
| `.prettierignore` | YES | `rm .prettierignore` |

No `.eslintignore`, `.eslintrc.*`, or other ESLint/Prettier variants found.

### Empty Catch Blocks (16 instances in src/)

All found via `grep -rn "catch {" src/`:

| File | Line | Body | Resolution |
|------|------|------|------------|
| `src/app/unsubscribe/UnsubscribeForm.tsx` | 41 | Returns error state | Already non-empty (returns value) — catch has body, not truly empty |
| `src/app/blog/author/[slug]/page.tsx` | 47 | Comment: "Tables may not exist yet during initial deployment" | Add `// intentional` or keep comment |
| `src/app/blog/[slug]/page.tsx` | 78 | Comment: "Tables may not exist yet during initial deployment" | Add `// intentional` or keep comment |
| `src/app/blog/tag/[slug]/page.tsx` | 46 | Comment: "Tables may not exist yet during initial deployment" | Add `// intentional` or keep comment |
| `src/app/sitemap.ts` | 183 | Comment: "DB unavailable at build time — showcase pages omitted" | Has comment — already intentional |
| `src/app/sitemap.ts` | 199 | Comment: "DB unavailable at build time — blog pages omitted" | Has comment — already intentional |
| `src/app/api/pagespeed/route.ts` | 46 | Returns 400 error response | Not truly empty — returns value |
| `src/components/calculators/Calculator.tsx` | 99 | Comment: "Clipboard failed, modal will show the link" + logger.info call | Has body — not truly empty |
| `src/components/calculators/Calculator.tsx` | 117 | `toast.error('Failed to copy link')` | Has body — not truly empty |
| `src/lib/errors.ts` | 29 | `return new Error('Unknown error')` | Has body — not truly empty |
| `src/lib/logger.ts` | 61 | Returns `{ name: 'UnknownError', ... }` | Has body — not truly empty |
| `src/lib/rate-limiter.ts` | 52 | Comment + `return null as unknown as boolean` | Has body — not truly empty |
| `src/lib/testimonials.ts` | 141 | `return false` | Has body — not truly empty |
| `src/lib/testimonials.ts` | 219 | `return false` | Has body — not truly empty |
| `src/lib/testimonials.ts` | 231 | `return false` | Has body — not truly empty |
| `src/lib/testimonials.ts` | 243 | `return false` | Has body — not truly empty |

**Key finding:** The `grep -rn "catch {" src/` pattern matches `} catch {` (TypeScript optional binding syntax for catch clauses without binding). ALL 16 instances have non-empty bodies — they use `catch {}` (no binding variable) which is valid TypeScript 2.5+ syntax. NONE are truly empty catch blocks. The CONTEXT.md requirement is to add `/* intentional */` comments to any that appear intentionally swallowing errors without logging — verify each one.

**Truly empty (no body, or body is ONLY the closing brace):** NONE found. All 16 have return statements, logging, comments, or error responses in the body.

**Resolution approach:** Review each `} catch {` block. Where the catch is intentionally swallowing an error silently (no logging), add `// intentional` comment if not already present. Where a comment already explains the suppression, leave as-is.

### Documentation References to Update

| File | Reference | Action |
|------|-----------|--------|
| `CLAUDE.md` line 224 | `pnpm lint - Run ESLint` | Update to `bun run lint - Run Biome check` |
| `.planning/research/STACK.md` | Multiple historical references | Keep as-is — historical research, not active instructions |

Note: `CLAUDE.md` uses `pnpm lint` but the actual `package.json` script now runs `biome check src/`. Update the description to accurately reflect Biome, and update `pnpm` to `bun` throughout development commands section.

### VSCode Markdown Formatter
Current: `[markdown]` uses `esbenp.prettier-vscode` formatter.
After Prettier removal: Update to use default VSCode markdown formatter (remove the Prettier-specific override) or switch to `"editor.defaultFormatter": null` for markdown.

## Standard Stack

### Core Operations
| Operation | Command | Notes |
|-----------|---------|-------|
| Remove packages | `bun remove eslint eslint-config-next prettier` | Updates package.json + bun.lock atomically |
| Remove config files | `rm eslint.config.mjs .prettierrc.json .prettierignore` | All confirmed present |
| Verify unit tests | `bun test tests/` | Currently 360 tests pass |
| Verify build | `bun run build` | Generates 129 static pages |
| Verify typecheck | `bun run typecheck` | `tsc --noEmit` |
| Verify biome | `bun run lint` | `biome check src/` — already wired |

### Git Commit Order (Per CONTEXT.md)
1. Commit 1: Empty catch block resolution (fix/annotation)
2. Commit 2: Package removal + config file deletion + doc cleanup
3. Verification runs after commit 2

## Architecture Patterns

### Removal Order
1. **Fix empty catch blocks first** — separate commit preserves blame-friendly history
2. **Update docs** — CLAUDE.md and any active documentation
3. **Remove packages** — `bun remove` handles bun.lock automatically
4. **Delete config files** — `rm` the 3 files
5. **Update VSCode settings** — markdown formatter override
6. **Run verification suite** — in order: biome check, unit tests, typecheck, build

### Why This Order Matters
- Catch block fixes committed first = clear audit trail that cleanup happened before removal
- Package removal is atomic with `bun remove` — no partial states
- Verification must happen AFTER removal to confirm zero regression

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Package removal | Manual package.json editing | `bun remove <pkg>` | Atomically updates package.json + bun.lock |
| Config file cleanup | Complex scripts | `rm <file>` | Simple, direct, no abstraction needed |

## Common Pitfalls

### Pitfall 1: bun.lock Not Updated
**What goes wrong:** Manually editing package.json without running `bun install` leaves bun.lock stale
**Why it happens:** Editing JSON directly skips bun's lockfile management
**How to avoid:** Use `bun remove eslint eslint-config-next prettier` — this updates both files atomically

### Pitfall 2: Transitive Package Confusion
**What goes wrong:** Hunting for `@typescript-eslint/*` in package.json when they aren't there
**Why it happens:** They are peer/transitive dependencies, not explicit devDependencies
**How to avoid:** Confirmed — only 3 ESLint/Prettier packages are explicit. `bun remove` of those 3 drops the whole subtree from bun.lock.

### Pitfall 3: Biome noEmptyBlock Confusion
**What goes wrong:** Assuming Biome will flag `} catch {` blocks as violations
**Why it happens:** `noEmptyBlock` exists in Biome but is CSS-only
**How to avoid:** The 16 `catch {}` blocks are a code quality review, not a Biome compliance fix. All have non-empty bodies.

### Pitfall 4: VSCode Markdown Formatter Breakage
**What goes wrong:** After removing Prettier, VSCode markdown formatOnSave silently fails or shows errors
**Why it happens:** `.vscode/settings.json` still references `esbenp.prettier-vscode` for markdown
**How to avoid:** Update `[markdown]` formatter in `.vscode/settings.json` during this phase

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `bun run lint` → ESLint | `bun run lint` → Biome check | Phase 54 | Script already updated — no change needed |
| `pnpm` commands in CLAUDE.md | `bun` commands | v3.1 migration | CLAUDE.md docs need update |
| Prettier for markdown in VSCode | Prettier extension reference | Phase 55 | VSCode settings update needed |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (built-in) |
| Config file | `tests/setup.ts` |
| Quick run command | `bun test tests/` |
| Full suite command | `bun test tests/` |
| Estimated runtime | ~1.4 seconds (360 tests) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLEN-01 | `eslint`, `eslint-config-next`, `prettier` not in package.json | manual-check | `cat package.json \| grep -E 'eslint\|prettier'` | N/A — file check |
| CLEN-02 | Config files deleted | manual-check | `ls eslint.config.mjs .prettierrc.json .prettierignore 2>&1` | N/A — file check |
| ZERO-01 | All unit tests pass | unit | `bun test tests/` | ✅ yes |
| ZERO-02 | Build succeeds | build | `bun run build` | ✅ yes |
| ZERO-03 | TypeScript clean | typecheck | `bun run typecheck` | ✅ yes |

### Nyquist Sampling Rate
- **Minimum sample interval:** After each removal step → run: `bun run lint` (fast, catches any biome issues)
- **Full suite trigger:** After all removals complete → run full verification sequence
- **Phase-complete gate:** All 5 success criteria TRUE before marking complete
- **Estimated feedback latency per task:** ~2 seconds (biome check) to ~90 seconds (full build)

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. No new test files needed.

## Sources

### Primary (HIGH confidence)
- Direct codebase investigation — all counts and file lists verified by grep/ls
- `bun test tests/` output — 360 tests, 0 failures (live run)
- `biome check src/` — 267 files, 0 issues (live run)
- `bunx biome explain noEmptyBlock` — confirmed CSS-only rule (live run)
- `package.json` devDependencies — exact 3 packages confirmed (live inspection)

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions — user-locked choices from discuss-phase session
- STATE.md accumulated context — Phase 53/54 decisions about transitive deps

## Metadata

**Confidence breakdown:**
- Package removal scope: HIGH — confirmed by direct package.json inspection
- Empty catch analysis: HIGH — grepped all 16 instances, read each body
- Doc cleanup scope: HIGH — grepped CLAUDE.md and .planning/ for references
- Verification commands: HIGH — all commands confirmed working in Phase 54

**Research date:** 2026-02-24
**Valid until:** Indefinite — this is a static removal task with no external dependencies
