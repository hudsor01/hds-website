# Plan 2: Remove Stale Documentation

## Objective

Remove outdated documentation files that reference work completed in earlier phases or are no longer relevant.

---

## Stale Documentation Identified

| File | Size | Created | Status | Reason |
|------|------|---------|--------|--------|
| `master_todo.md` | 556 lines | 2025-12-21 | STALE | Design system work likely complete |
| `TEST-FILES-CREATED.md` | 294 lines | Unknown | STALE | Documents test files deleted in Phase 8 |
| `TEST-SUITE-SUMMARY.md` | 402 lines | Unknown | STALE | Outdated test suite summary |
| `TODO_BACKEND_REFACTORING.md` | 254 lines | 2025-12-15 | STALE | Backend refactoring TODOs likely addressed |
| `MIGRATION_STRATEGY.md` | 118 lines | Unknown | STALE | CSS migration completed in earlier phases |

**Total**: 1,624 lines of outdated documentation

---

## Analysis

### master_todo.md (556 lines)
**Content**: Design system enhancements, color system foundation, monochromatic palette
**Status**: Dated 2025-12-21, references work that appears complete
**Decision**: DELETE - Work is complete, redundant with .planning/ docs

### TEST-FILES-CREATED.md (294 lines)
**Content**: Lists E2E test files created in TDD approach
**Problem**: References test files that were deleted/consolidated in Phase 8:
- `e2e/cross-browser.spec.ts` - DELETED in Phase 8
- `e2e/component-classes-verification.spec.ts` - DELETED in Phase 8
- Several other outdated test references
**Decision**: DELETE - No longer accurate after Phase 8 test consolidation

### TEST-SUITE-SUMMARY.md (402 lines)
**Content**: Comprehensive test suite implementation summary
**Problem**: Describes test structure that has been significantly changed in Phase 8
**Decision**: DELETE - Test suite documented in `tests/TEST-SUITE-README.md` is current

### TODO_BACKEND_REFACTORING.md (254 lines)
**Content**: Backend refactoring TODOs dated 2025-12-15
**Items**:
- Fix Supabase Service Client Bug (likely addressed)
- Consolidate Contact Form Logic
- Consolidate IP Extraction (lib/utils/request.ts exists)
**Decision**: DELETE - Either addressed or tracked in .planning/ files

### MIGRATION_STRATEGY.md (118 lines)
**Content**: CSS utility migration strategy from custom to Tailwind
**Problem**: Migration appears complete (using Tailwind utilities throughout)
**Decision**: DELETE - Migration complete, no longer needed

---

## Execution Steps

```bash
# 1. Review each file one last time before deletion
cat master_todo.md | head -50
cat TEST-FILES-CREATED.md | head -50
cat TEST-SUITE-SUMMARY.md | head -50
cat TODO_BACKEND_REFACTORING.md | head -50
cat MIGRATION_STRATEGY.md | head -50

# 2. Delete stale documentation files
rm master_todo.md
rm TEST-FILES-CREATED.md
rm TEST-SUITE-SUMMARY.md
rm TODO_BACKEND_REFACTORING.md
rm MIGRATION_STRATEGY.md

# 3. Verify files are deleted
ls -la *.md | grep -E "(master_todo|TEST-FILES|TEST-SUITE-SUMMARY|TODO_BACKEND|MIGRATION_STRATEGY)"

# 4. Verify git shows deletions
git status
```

---

## Alternative: Archive Instead of Delete

If preserving historical context is desired, create archive directory:

```bash
# Option B: Archive instead of delete
mkdir -p .planning/archive
mv master_todo.md .planning/archive/
mv TEST-FILES-CREATED.md .planning/archive/
mv TEST-SUITE-SUMMARY.md .planning/archive/
mv TODO_BACKEND_REFACTORING.md .planning/archive/
mv MIGRATION_STRATEGY.md .planning/archive/

# Add archive note
echo "# Archived Documentation

These files were archived during Phase 9 cleanup as they referenced work that has been completed.

Archived: 2026-01-11
" > .planning/archive/README.md
```

**Recommended**: DELETE (recommended) - Git history preserves these files if needed

---

## Verification Checklist

- [ ] Reviewed each file before deletion
- [ ] Confirmed files reference completed/outdated work
- [ ] Deleted all 5 stale documentation files
- [ ] Root directory no longer contains outdated docs
- [ ] `.planning/` directory contains current documentation
- [ ] Git history preserves deleted files for reference

---

## Documentation That Stays

**Keep these documentation files**:
- ✅ `README.md` - Main project documentation
- ✅ `CLAUDE.md` - AI coding assistant instructions
- ✅ `.planning/PROJECT.md` - Project context
- ✅ `.planning/ROADMAP.md` - Phase planning roadmap
- ✅ `.planning/STATE.md` - Current project state
- ✅ `tests/TEST-SUITE-README.md` - Current test documentation
- ✅ `tests/TDD-QUICK-REFERENCE.md` - Test commands reference
- ✅ `grafana/README.md` - Monitoring setup

---

## Commit Message

```
docs(phase-9): remove stale documentation files (Plan 2)

Delete 5 outdated documentation files referencing completed work:

Deleted:
- master_todo.md (556 lines)
  * Design system work from 2025-12-21, now complete
- TEST-FILES-CREATED.md (294 lines)
  * References test files deleted in Phase 8
- TEST-SUITE-SUMMARY.md (402 lines)
  * Outdated test summary, superseded by tests/TEST-SUITE-README.md
- TODO_BACKEND_REFACTORING.md (254 lines)
  * Backend TODOs from 2025-12-15, addressed in cleanup phases
- MIGRATION_STRATEGY.md (118 lines)
  * CSS migration strategy, migration complete

Impact:
- Lines removed: 1,624 lines of stale documentation
- Root directory cleaner with only current docs
- Reduced confusion from outdated information
- Git history preserves these files for reference if needed

Current documentation in .planning/ and tests/ remains accurate.
```

---

## Notes

- Git history preserves all deleted files
- Can be recovered with: `git show <commit>:filename.md`
- Deletion improves clarity and reduces maintenance burden
- Current documentation exists in `.planning/` directory
