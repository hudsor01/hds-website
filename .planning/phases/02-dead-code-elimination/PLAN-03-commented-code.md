# Plan 3: Remove Commented Code and Dead Imports

**Phase:** 2 - Dead Code Elimination
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~20% (~40k tokens)

## Goal

Remove commented-out code, obsolete TODO comments, and unused import statements throughout the codebase. Keep legitimate documentation comments (JSDoc, explanatory comments).

## Context

**Current State:**
- ~1949 comment lines detected (includes JSDoc)
- May include commented-out code from debugging
- May include obsolete TODO comments
- Unused imports after Phase 1 package removals

**Types of Comments:**
1. **JSDoc comments** - KEEP (documentation)
2. **Explanatory comments** - KEEP (clarify complex logic)
3. **Commented-out code** - REMOVE (dead code)
4. **Obsolete TODOs** - REMOVE or UPDATE (stale tasks)
5. **Debug comments** - REMOVE (temporary debugging)

**Preservation Requirements:**
- Keep all JSDoc comments (/** */)
- Keep explanatory comments that clarify non-obvious logic
- Keep copyright headers
- Keep configuration comments

**Strategy:** Manual review of commented code, automated cleanup of unused imports

**Research:** None required

## Tasks

### Task 1: Find and review commented-out code

**What:** Identify blocks of commented-out code (not documentation)

**How:**
```bash
# Find multiline comment blocks (potential code)
grep -rn "^/\*[^*]" src/ --include="*.ts" --include="*.tsx" | head -50

# Find single-line comments that look like code
grep -rn "^\s*//\s*\(const\|function\|export\|import\|return\)" src/ --include="*.ts" --include="*.tsx"

# Find TODO/FIXME comments
grep -rn "//.*TODO\|//.*FIXME\|//.*HACK" src/ --include="*.ts" --include="*.tsx"
```

**Outcome:** List of potential commented-out code locations

**Verification:**
- [ ] Commented code blocks identified
- [ ] TODO/FIXME comments found
- [ ] JSDoc vs code comments distinguished

**Decision Criteria:**
- **Remove if**: Commented-out code (imports, functions, logic)
- **Remove if**: Obsolete TODO (feature completed or abandoned)
- **Keep if**: JSDoc documentation
- **Keep if**: Explanatory comment clarifying complex logic
- **Update if**: TODO is still relevant but outdated

**Sample Pattern to Remove:**
```typescript
// Old implementation - delete this
// function oldWay() {
//   return something()
// }

// TODO: Fix this later  // ← Obsolete if from months ago
```

**Sample Pattern to Keep:**
```typescript
/**
 * JSDoc documentation for function
 * @param value - The input value
 */

// Workaround for Next.js hydration issue #12345
// See: https://github.com/vercel/next.js/issues/12345
```

---

### Task 2: Remove commented-out imports

**What:** Find and remove commented import statements

**How:**
```bash
# Find commented imports
grep -rn "^\s*//\s*import" src/ --include="*.ts" --include="*.tsx"

# Review each one - likely dead after Phase 1
```

**Outcome:** Commented imports removed

**Verification:**
- [ ] All commented imports reviewed
- [ ] Dead imports removed
- [ ] Legitimate disabled imports kept (with explanation)

**Decision Criteria:**
- **Remove if**: Import is commented out with no explanation
- **Keep if**: Import is temporarily disabled with reason (rare)

---

### Task 3: Find and remove unused imports

**What:** Identify import statements for symbols never used in file

**How:**
```bash
# Check for common unused import patterns
# TypeScript compiler will show these, but we can grep too

# Run TypeScript checker
bun run typecheck 2>&1 | grep "is declared but its value is never read"

# Manual check in critical files
# For each file, verify all imports are used
```

**Outcome:** Unused imports removed

**Verification:**
- [ ] TypeScript unused import warnings addressed
- [ ] Manual review of high-churn files
- [ ] Build succeeds
- [ ] No new TypeScript errors

**Decision Criteria:**
- **Remove if**: TypeScript reports "never read"
- **Remove if**: Symbol imported but never referenced in file
- **Keep if**: Import has side effects (CSS, polyfills)

**Note:** TypeScript strict mode should already catch most unused imports

---

### Task 4: Review and clean TODO/FIXME comments

**What:** Update or remove obsolete TODO/FIXME comments

**How:**
```bash
# Find all TODO/FIXME
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" > /tmp/todos.txt

# Review each one
cat /tmp/todos.txt

# For each TODO:
# 1. Is it still relevant? → Keep and update
# 2. Was it completed? → Remove
# 3. Was it abandoned? → Remove
```

**Outcome:** Updated or removed TODOs based on current state

**Verification:**
- [ ] All TODOs reviewed
- [ ] Obsolete TODOs removed
- [ ] Current TODOs updated with context
- [ ] Abandoned features' TODOs removed

**Decision Criteria:**
- **Remove if**: Feature was built and TODO is complete
- **Remove if**: Feature was abandoned
- **Update if**: TODO is still valid but needs clearer context
- **Keep if**: TODO is actionable and relevant

**Example Cleanup:**
```typescript
// Before:
// TODO: Add error handling  // ← Was added 6 months ago

// After: (removed - error handling exists)

// Before:
// TODO: Implement caching  // ← Vague, no context

// After:
// TODO: Add React Query cache for this API call to reduce server costs
```

---

### Task 5: Remove debug and temporary comments

**What:** Remove console.log statements and debug comments

**How:**
```bash
# Find console.log (should use logger instead)
grep -rn "console\\.log\|console\\.warn\|console\\.error" src/ --include="*.ts" --include="*.tsx"

# Find debug comments
grep -rn "//.*debug\|//.*test" src/ --include="*.ts" --include="*.tsx" | grep -vi "test file"
```

**Outcome:** Debug code and temporary comments removed

**Verification:**
- [ ] console.* statements replaced with logger
- [ ] Debug comments removed
- [ ] Temporary testing code removed
- [ ] Build succeeds
- [ ] No functionality broken

**Decision Criteria:**
- **Remove**: console.log, console.warn, console.error (use logger instead)
- **Remove**: "// testing" or "// debug" comments
- **Keep**: Intentional debugging setup for development
- **Replace**: console.* with logger.* if logging is needed

---

### Task 6: Commit cleanup changes

**What:** Commit all comment and import cleanup

**How:**
```bash
# Verify changes don't break anything
bun run build
bun run typecheck
bun run test:unit

# Commit
git add src/
git commit -m "refactor: remove commented code and unused imports (Plan 3)

- Remove commented-out code blocks
- Remove obsolete TODO comments
- Update relevant TODOs with context
- Remove unused import statements
- Replace console.* with logger.*
- Clean up debug comments

Result: Cleaner codebase, easier to maintain"
```

**Verification:**
- [ ] Build succeeds
- [ ] Type check passes
- [ ] Tests pass
- [ ] Git commit created
- [ ] No functionality broken

## Success Criteria

- [ ] Commented-out code removed
- [ ] Obsolete TODOs removed or updated
- [ ] Unused imports removed
- [ ] Debug comments removed
- [ ] console.* replaced with logger
- [ ] Build succeeds
- [ ] Tests pass (313/313)
- [ ] TypeScript has no new errors
- [ ] Documentation comments preserved

## Scope Boundaries

**In Scope:**
- Commented-out code (imports, functions, blocks)
- Obsolete TODO/FIXME comments
- Unused import statements
- Debug comments and console.log statements

**Out of Scope:**
- JSDoc documentation comments (keep all)
- Explanatory comments (keep if they clarify logic)
- Copyright headers (keep)
- Configuration comments (keep)
- Active, relevant TODO comments (update if needed)

## Estimated Impact

**Expected Cleanup:**
- 10-30 commented code blocks removed
- 5-15 obsolete TODOs removed/updated
- 10-20 unused imports removed
- 5-10 console.log statements replaced

**Lines Removed:** 50-150 lines

## Risk Assessment

**Very Low Risk:**
- Removing comments doesn't affect functionality
- TypeScript will catch any import errors
- Tests will catch any broken logic
- Easy to review changes in git diff

**Mitigation:**
- Review each comment before removal
- Keep explanatory comments that add value
- Run full build and test suite
- Git commit allows easy rollback

## Notes

**Types of comments to KEEP:**
```typescript
/**
 * JSDoc documentation
 */

// IMPORTANT: This workaround is needed for [specific reason]

// Complex algorithm explanation:
// 1. First we do X
// 2. Then we do Y
```

**Types of comments to REMOVE:**
```typescript
// const oldValue = 123  // ← Commented-out code

// TODO: Fix this  // ← Vague, no context, months old

// Testing something  // ← Debug comment

console.log('debug')  // ← Should use logger
```

**Conservative approach:**
- When in doubt about a comment, keep it
- Focus on obvious dead code in comments
- Don't remove complex algorithm explanations
- Keep workaround comments with issue links
