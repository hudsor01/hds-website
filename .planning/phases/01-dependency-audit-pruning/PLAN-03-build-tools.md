# Plan 3: Audit Build & Development Tools

**Phase:** 1 - Dependency Audit & Pruning
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~50% (~100k tokens)

## Goal

Identify and remove redundant build and development tools that duplicate Bun or Next.js 16 built-in capabilities, reducing complexity and installation overhead.

## Context

**Current State:**
- **Package Manager**: Bun 1.3.4 (fast, built-in bundler, test runner, TypeScript execution)
- **Build Tools**:
  - tsx 4.21.0 (TypeScript execution for scripts)
  - sharp 0.34.5 (image optimization)
  - postcss 8.5.6 + @tailwindcss/postcss 4.1.18 (CSS processing)
  - vercel 50.1.6 (CLI tool)
- **Scripts**: 17 npm scripts (dev, build, test, optimize, db)
- **Additional**: cross-env, supazod

**Preservation Requirements:**
- Development workflow (dev, build, start)
- Image optimization for WebP conversion
- Database type generation (Supabase types)
- Deployment capability (Vercel)

**Key Insight:** Bun can replace tsx for TypeScript execution, Next.js includes image optimization

**Research:** None required - compare package capabilities

## Tasks

### Task 1: Audit TypeScript execution tools

**What:** Check if tsx is needed or if Bun can replace it

**How:**
```bash
# Find scripts using tsx
grep "tsx " package.json

# Identify what tsx scripts do
ls scripts/*.ts
cat scripts/generate-sitemap.ts | head -10
cat scripts/optimize-images.ts | head -10
```

**Outcome:** List of scripts using tsx and determination:
- Can Bun run these TypeScript files directly? (Yes - `bun run script.ts`)
- Is tsx providing any unique value beyond TypeScript execution?

**Verification:**
- [ ] All tsx usage documented
- [ ] Test running one script with Bun: `bun run scripts/generate-sitemap.ts`
- [ ] Confirm Bun can replace tsx for all scripts

**Decision Criteria:**
- **Remove tsx if**: Bun successfully runs all TypeScript scripts (very likely)
- **Keep tsx if**: Scripts have specific tsx dependencies (unlikely)

---

### Task 2: Audit image optimization tools

**What:** Check if sharp is needed or if Next.js built-in optimization suffices

**How:**
```bash
# Find sharp usage
grep -r "from 'sharp'" src/
grep -r "sharp" scripts/

# Check optimize-images script
cat scripts/optimize-images.ts

# Review Next.js image optimization
grep -i "image" next.config.ts
```

**Outcome:** Understanding of:
- What optimize-images script does (convert to WebP?)
- If sharp is used at runtime or only in build scripts
- If Next.js Image component handles all optimization

**Verification:**
- [ ] sharp usage documented (build-time vs runtime)
- [ ] Next.js Image optimization reviewed
- [ ] Alternative approach identified if removing sharp

**Decision Criteria:**
- **Remove sharp if**: Only used for one-time image conversion (run once, then remove)
- **Keep sharp if**: Used at runtime for dynamic image generation

**Note:** Next.js 16 includes automatic image optimization for static images

---

### Task 3: Audit Vercel CLI and database tools

**What:** Check if vercel CLI and supazod are actively used

**How:**
```bash
# Check Vercel CLI usage in scripts
grep "vercel" package.json
grep -r "vercel" scripts/

# Check supazod usage
grep "supazod" package.json
grep -r "supazod" src/

# Review database script
cat package.json | grep "db:"
```

**Outcome:** Usage determination for:
- **vercel CLI**: Is this for local development only?
- **supazod**: Is this for Supabase → Zod schema generation?

**Verification:**
- [ ] Vercel CLI usage documented
- [ ] supazod usage documented (db:zod:generate script)
- [ ] Deployment method confirmed (auto-deploy vs CLI)

**Decision Criteria:**
- **vercel CLI**: Remove if deployments are automatic via GitHub integration
- **supazod**: Keep if actively generating Zod schemas from database

**Note:** Check if db:zod:generate is run regularly or was one-time setup

---

### Task 4: Remove redundant build tools

**What:** Uninstall tools identified as redundant in Tasks 1-3

**How:**
```bash
# Example removals (adjust based on findings)
bun remove tsx
bun remove vercel  # if not used
bun remove sharp   # if one-time conversion complete

# Update scripts to use Bun instead of tsx
# Before: "generate-sitemap": "tsx scripts/generate-sitemap.ts"
# After:  "generate-sitemap": "bun run scripts/generate-sitemap.ts"

# Verify changes
bun install
bun run generate-sitemap
bun run dev
```

**Outcome:**
- Simpler package.json
- Fewer dev dependencies
- Scripts use Bun directly (one tool instead of many)

**Verification:**
- [ ] Redundant tools removed
- [ ] Scripts updated to use Bun where applicable
- [ ] All scripts still execute successfully
- [ ] Dev server starts
- [ ] Build completes successfully

**Rollback Plan:**
```bash
bun add tsx@4.21.0 --dev
bun add sharp@0.34.5
# Revert package.json scripts
```

## Success Criteria

- [ ] tsx usage audited and removal plan determined
- [ ] sharp usage audited (build-time vs runtime)
- [ ] vercel CLI and supazod necessity confirmed
- [ ] Redundant tools removed (expect 1-2 removals)
- [ ] Scripts updated to use Bun where possible
- [ ] All npm scripts execute successfully
- [ ] Development and build workflows unaffected

## Scope Boundaries

**In Scope:**
- Auditing build and development tool usage
- Removing tools redundant with Bun or Next.js
- Updating scripts to use Bun directly
- Verifying all workflows still function

**Out of Scope:**
- Optimizing build performance (later phase)
- Changing core build configuration
- Adding new development tools
- Refactoring scripts for better patterns

## Estimated Impact

**Before:**
- 5-7 build/dev tool packages
- tsx, sharp, vercel CLI, supazod, postcss, tailwind postcss
- Mixed tool usage across scripts

**After:**
- 3-5 build/dev tool packages
- Consolidated to Bun + essential tools
- Consistent Bun usage for script execution

**Install Time:** Expect 10-15% faster npm install without tsx and potentially sharp/vercel CLI

## Risk Assessment

**Low Risk:**
- Bun is already the package manager, proven to run TypeScript
- Next.js handles most build complexity
- Easy to rollback individual tool removals

**Mitigation:**
- Test each script after changing from tsx to Bun
- Keep sharp if image optimization script is actively used
- Verify builds before committing changes

## Notes

- Bun features: Built-in TypeScript runner, bundler, test runner (eliminates tsx need)
- Next.js 16: Automatic image optimization (reduces sharp need for static images)
- Vercel: Auto-deploys from GitHub (CLI may be redundant for typical workflow)
- supazod: Useful if database schema changes frequently, otherwise one-time generation
- postcss + @tailwindcss/postcss: Required for Tailwind 4, must keep
- cross-env: Windows compatibility for env vars (check if needed given Bun cross-platform support)
