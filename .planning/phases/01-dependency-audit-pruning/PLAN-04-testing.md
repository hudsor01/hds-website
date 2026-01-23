# Plan 4: Audit Testing Infrastructure

**Phase:** 1 - Dependency Audit & Pruning
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~50% (~100k tokens)

## Goal

Streamline testing dependencies by removing unused testing tools while maintaining coverage for critical paths (contact form, tool generators).

## Context

**Current State:**
- **E2E Testing**: Playwright 1.57.0 (3 browsers: chromium, firefox, webkit) + @axe-core/playwright 4.11.0
- **Unit Testing**: Bun test (native) + @testing-library/react 16.3.1 + @testing-library/jest-dom 6.9.1 + @testing-library/user-event 14.6.1
- **Mocking**: msw 2.12.7 (Mock Service Worker)
- **Test Environment**: happy-dom 20.1.0 + @happy-dom/global-registrator 20.1.0

**Preservation Requirements:**
- E2E tests for contact form submission
- E2E tests for tool page functionality
- Ability to test React components if needed
- Accessibility testing (a11y)

**Key Insight:** Bun test is built-in, Testing Library may be unused if no component tests exist

**Research:** None required - check test directory structure

## Tasks

### Task 1: Audit Testing Library usage

**What:** Check if Testing Library packages are actively used in tests

**How:**
```bash
# Find all test files
find tests/ e2e/ -name "*.test.*" -o -name "*.spec.*"

# Search for Testing Library imports
grep -r "from '@testing-library/react'" tests/
grep -r "from '@testing-library/jest-dom'" tests/
grep -r "from '@testing-library/user-event'" tests/

# Check test file count
ls -la tests/unit/ | wc -l
```

**Outcome:** Understanding of:
- How many unit tests exist
- If any tests use Testing Library (render, screen, fireEvent)
- If tests only use Bun's native test API (expect, describe, it)

**Verification:**
- [ ] All test files identified
- [ ] Testing Library usage documented
- [ ] Test count vs. coverage gap identified

**Decision Criteria:**
- **Remove Testing Library if**: Zero usage in existing tests (Bun test sufficient)
- **Keep Testing Library if**: Component tests actively use render/screen/fireEvent

**Checkpoint:** Per TESTING.md, coverage gaps include component tests. If no component tests exist, Testing Library is unused overhead.

---

### Task 2: Audit MSW and test environment

**What:** Check if Mock Service Worker and happy-dom are used in tests

**How:**
```bash
# Check MSW usage
grep -r "from 'msw'" tests/ e2e/
grep -r "setupServer\|setupWorker" tests/

# Check happy-dom usage
cat bunfig.toml | grep -i "preload\|environment"
grep -r "happy-dom" tests/

# Check test environment needs
cat tests/unit/*.test.* | head -20
```

**Outcome:** Determination of:
- **MSW**: Is it mocking API calls in tests?
- **happy-dom**: Is it the test environment for Bun test?

**Verification:**
- [ ] MSW usage documented (active vs unused)
- [ ] happy-dom configuration confirmed in bunfig.toml
- [ ] Test environment requirements identified

**Decision Criteria:**
- **MSW**: Remove if no API mocking in tests (Server Actions tested differently)
- **happy-dom**: Keep if Bun test uses it (likely configured in bunfig.toml)

**Note:** Bun test supports happy-dom natively, check if global-registrator package needed

---

### Task 3: Audit Playwright and accessibility testing

**What:** Review Playwright setup and @axe-core/playwright usage

**How:**
```bash
# Check Playwright tests
ls -la e2e/
cat e2e/*.spec.ts | head -30

# Check axe-core usage
grep -r "axe" e2e/
grep -r "toHaveNoViolations" e2e/
grep "@accessibility" e2e/

# Review Playwright config
cat playwright.config.ts | grep -i "project\|browser"
```

**Outcome:** Understanding of:
- How many E2E tests exist
- If a11y tests are active (@accessibility tag)
- If all 3 browsers (chromium, firefox, webkit) are needed

**Verification:**
- [ ] E2E test count documented
- [ ] Accessibility test usage confirmed
- [ ] Browser matrix reviewed (3 browsers vs 1 for speed)

**Decision Criteria:**
- **@axe-core/playwright**: Remove if no accessibility tests exist (check for @accessibility tag)
- **Browser count**: Consider if firefox/webkit needed for simple business site (chromium may suffice)

**Note:** package.json has `test:e2e:fast` using only chromium - suggests multi-browser may be overkill

---

### Task 4: Remove unused testing dependencies

**What:** Uninstall testing packages identified as unused in Tasks 1-3

**How:**
```bash
# Example removals (adjust based on findings)
bun remove @testing-library/react
bun remove @testing-library/jest-dom
bun remove @testing-library/user-event
bun remove msw
bun remove @happy-dom/global-registrator  # if not needed with Bun

# Keep: Playwright, @axe-core/playwright (if a11y tests exist), happy-dom

# Verify tests still run
bun test tests/
bun run test:e2e:fast
```

**Outcome:**
- Simpler testing dependency tree
- Reduced devDependencies count
- Faster install times

**Verification:**
- [ ] Unused testing packages removed
- [ ] Unit tests execute successfully
- [ ] E2E tests execute successfully
- [ ] No import errors in test files
- [ ] Test coverage unchanged (still covers critical paths)

**Rollback Plan:**
```bash
bun add @testing-library/react@16.3.1 --dev
# Restore other packages as needed
```

## Success Criteria

- [ ] Testing Library usage audited (used vs unused)
- [ ] MSW and happy-dom necessity confirmed
- [ ] Playwright and a11y testing reviewed
- [ ] Unused testing packages removed (expect 2-4 removals)
- [ ] All existing tests pass without modification
- [ ] E2E tests for contact form still run
- [ ] E2E tests for tool pages still run

## Scope Boundaries

**In Scope:**
- Auditing testing package usage
- Removing unused testing libraries
- Verifying test suites still pass
- Confirming critical path coverage maintained

**Out of Scope:**
- Adding new tests (addressed in PROJECT.md "testing infrastructure review")
- Improving test coverage
- Optimizing test execution speed (later phase)
- Writing component tests if they don't exist

## Estimated Impact

**Before:**
- 9 testing-related packages (@testing-library/*, msw, happy-dom, playwright, axe)
- Full Testing Library suite even without component tests
- MSW for API mocking (may be unused)

**After:**
- 4-6 testing-related packages (Playwright + essential tools)
- Bun test with minimal dependencies
- Only packages actively used in test suites

**Install Time:** Expect 15-20% faster install without unused Testing Library packages

## Risk Assessment

**Low Risk:**
- Static analysis shows clear usage (grep for imports)
- Tests fail immediately if dependencies are missing
- Easy to rollback individual package removals

**Mitigation:**
- Run full test suite after each removal
- Keep detailed removal log
- Verify both unit and E2E tests pass

## Notes

- Bun test: Built-in test runner, no additional test framework needed (Vitest/Jest not required)
- happy-dom: Lightweight DOM environment for Bun test (likely configured in bunfig.toml)
- Testing Library: Only needed if writing component tests (none may exist per TESTING.md)
- MSW: Useful for API mocking, but Server Components + Server Actions may not need it
- Playwright: Keep for E2E testing of critical user flows
- @axe-core/playwright: Keep only if accessibility tests exist (check for @accessibility tag)
- Multi-browser testing: chromium-only may suffice for internal business site (firefox/webkit optional)
- Per PROJECT.md: "may simplify but not eliminate safety" - keep core testing capability
