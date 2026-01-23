# Plan 5: Final Cleanup & Verification

**Phase:** 1 - Dependency Audit & Pruning
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~50% (~100k tokens)

## Goal

Remove remaining low-hanging fruit dependencies, clean up package.json metadata, and thoroughly verify all core features still work after dependency removals.

## Context

**Current State:**
- Plans 1-4 have removed unused UI, state management, build tools, and testing packages
- Additional packages not yet audited: next-seo, next-themes, react-markdown, dompurify, etc.
- package.json may have stale metadata (unused resolutions, overrides)

**Preservation Requirements:**
- Contact form must submit and send email
- All tool pages must load and generate outputs
- No broken features after all removals

**Final Check:** Comprehensive end-to-end verification that nothing broke

**Research:** None required - final cleanup and testing

## Tasks

### Task 1: Audit miscellaneous utility packages

**What:** Check usage of remaining utility packages not covered in Plans 1-4

**How:**
```bash
# Check next-seo (SEO utilities)
grep -r "from 'next-seo'" src/

# Check next-themes (dark mode)
grep -r "from 'next-themes'" src/
grep -r "ThemeProvider\|useTheme" src/

# Check react-markdown
grep -r "from 'react-markdown'" src/

# Check dompurify (XSS sanitization)
grep -r "from 'dompurify'" src/

# Check react-day-picker (date picker)
grep -r "from 'react-day-picker'" src/

# Check react-intersection-observer
grep -r "from 'react-intersection-observer'" src/
grep -r "useInView" src/

# Check react-error-boundary
grep -r "from 'react-error-boundary'" src/
grep -r "ErrorBoundary" src/

# Check clsx and class-variance-authority (styling utilities)
grep -r "from 'clsx'" src/
grep -r "from 'class-variance-authority'" src/
```

**Outcome:** Usage report for each package:
- **next-seo**: Likely used for metadata (alternative: Next.js metadata export)
- **next-themes**: Dark mode support (check if theme toggle exists)
- **react-markdown**: Markdown rendering (check if blog/content exists)
- **dompurify**: XSS sanitization (check if user-generated content displayed)
- **react-day-picker**: Date selection (check if date inputs exist in tools)
- **react-intersection-observer**: Scroll-based animations/lazy loading
- **react-error-boundary**: Error boundaries (production error handling)
- **clsx**: Class name concatenation (very lightweight, likely used)
- **cva**: Component variants (likely used with Radix UI)

**Verification:**
- [ ] All 9 utility packages checked
- [ ] Usage documented with file paths
- [ ] Removal candidates identified

**Decision Criteria:**
- **Remove if**: Zero usage in codebase
- **Keep if**: Actively used OR provides critical functionality (error boundaries, sanitization)

**Note:** Some utilities are best practices even if lightly used (dompurify for security, error boundaries for reliability)

---

### Task 2: Remove unused utility packages

**What:** Uninstall utility packages with zero usage from Task 1

**How:**
```bash
# Example removals (adjust based on Task 1 findings)
bun remove next-seo        # if Next.js metadata used instead
bun remove react-markdown  # if no markdown content
bun remove react-day-picker # if no date pickers in tools

# Verify removal
bun install
bun run dev
```

**Outcome:**
- Further reduced package.json
- Only essential utilities remain

**Verification:**
- [ ] Unused utilities removed
- [ ] Dev server starts
- [ ] No import errors
- [ ] All pages render

**Rollback Plan:**
```bash
bun add {package-name}@{version}
```

---

### Task 3: Clean up package.json metadata

**What:** Review and potentially remove resolutions and overrides

**How:**
```bash
# Review package.json sections
cat package.json | grep -A 5 "resolutions"
cat package.json | grep -A 5 "overrides"

# Check if these are still needed
# resolutions/overrides: path-to-regexp, esbuild, undici
# Research: Were these for security patches? Are they outdated?

# Verify purpose of each override
npm why path-to-regexp
npm why esbuild
npm why undici
```

**Outcome:** Determination of:
- Are resolutions/overrides still necessary?
- Were they for security patches that are now resolved?
- Can they be safely removed?

**Verification:**
- [ ] Purpose of each resolution/override documented
- [ ] Outdated overrides identified
- [ ] Security implications checked

**Decision Criteria:**
- **Remove if**: Package versions are now updated upstream and override no longer needed
- **Keep if**: Still required for security or compatibility

**Note:** resolutions and overrides can be outdated after dependency removals

---

### Task 4: Comprehensive feature verification

**What:** End-to-end testing of all core features to ensure nothing broke

**How:**
```bash
# Build the project
bun run build

# Start production build
bun run start

# Manual testing checklist:
# 1. Home page loads
# 2. Navigation works
# 3. Contact form submits and sends email
# 4. Paystub generator loads and creates PDF
# 5. Invoice generator loads and creates PDF
# 6. Timesheet generator loads and creates PDF
# 7. No console errors in any page
# 8. All images load
# 9. Styles render correctly

# Run automated tests
bun run test:unit
bun run test:e2e:fast

# Check bundle size
du -sh .next/standalone
```

**Outcome:**
- Confidence that all features work after dependency removals
- Bundle size comparison (before vs after)
- Test suite passes

**Verification:**
- [ ] Production build succeeds
- [ ] Home page renders
- [ ] Contact form submits successfully
- [ ] Email delivered via Resend
- [ ] Paystub tool generates PDF
- [ ] Invoice tool generates PDF
- [ ] Timesheet tool generates PDF
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No console errors
- [ ] Bundle size reduced from baseline

**Success Metrics:**
- 0 broken features
- 0 failing tests
- Reduced first load JS (target: 10-20% improvement)

---

### Task 5: Document dependency cleanup results

**What:** Create summary of what was removed and impact achieved

**How:**
```bash
# Count dependencies before and after
# (Baseline from package.json at phase start)

# Create summary report
echo "# Phase 1: Dependency Audit & Pruning Results" > RESULTS.md
echo "" >> RESULTS.md
echo "## Removed Packages" >> RESULTS.md
# List each removed package with category

echo "## Impact" >> RESULTS.md
# Document: count reduction, bundle size change, install time change

echo "## Verification" >> RESULTS.md
# Document: all tests pass, features work, no regressions
```

**Outcome:** Clear documentation of:
- Total packages removed (target: 15-25 packages)
- Categories cleaned (UI, state management, build tools, testing, utilities)
- Measurable improvements (bundle size, install time)
- Zero regression confirmation

**Verification:**
- [ ] RESULTS.md created with summary
- [ ] Before/after package count documented
- [ ] Bundle size improvement documented
- [ ] All removals categorized
- [ ] Success criteria from each plan met

## Success Criteria

- [ ] Miscellaneous utilities audited (9 packages)
- [ ] Unused utilities removed
- [ ] package.json metadata cleaned (resolutions/overrides)
- [ ] Production build succeeds
- [ ] All core features verified working:
  - [ ] Contact form submission + email delivery
  - [ ] Paystub generator PDF output
  - [ ] Invoice generator PDF output
  - [ ] Timesheet generator PDF output
- [ ] All tests pass (unit + E2E)
- [ ] No console errors
- [ ] Bundle size reduced by 10-20%
- [ ] Results documented in RESULTS.md

## Scope Boundaries

**In Scope:**
- Auditing remaining utility packages
- Cleaning package.json metadata
- Comprehensive feature verification
- Documenting cleanup results

**Out of Scope:**
- Optimizing bundle further (Phase 7)
- Refactoring code patterns
- Adding new features
- Performance optimization

## Estimated Impact

**Overall Phase 1 Target:**

**Before:**
- 90 total packages (40 prod + 50 dev)
- ~250MB node_modules
- ~180-200kB first load JS

**After:**
- 65-75 total packages (30-35 prod + 35-40 dev)
- ~150-180MB node_modules
- ~160-180kB first load JS

**Time Savings:**
- 25-35% faster npm install
- Cleaner dependency tree
- Simpler mental model

## Risk Assessment

**Low Risk:**
- All removals based on static analysis
- Comprehensive testing before completion
- Easy to rollback any removal

**Mitigation:**
- Manual testing of every core feature
- Automated test suite execution
- Production build verification
- Document exact versions for rollback

## Notes

- This plan completes Phase 1 with thorough verification
- Results document becomes input for PROJECT.md decisions table
- Bundle size baseline important for measuring Phase 7 (Build & Bundle Optimization)
- Any issues found here should be addressed before moving to Phase 2
- Consider keeping some "best practice" packages even if lightly used:
  - react-error-boundary (production reliability)
  - dompurify (security for any user input display)
  - clsx (tiny size, widely used pattern)
