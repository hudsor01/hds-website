# Plan 3: Config File Audit

**Status**: Ready for execution
**Priority**: LOW
**Estimated Impact**: Review only, minimal changes expected

---

## Goal

Audit all configuration files to ensure each is necessary, optimized, and well-documented. Remove redundant settings and add comments explaining non-obvious configurations.

---

## Configuration Files in Project

Based on analysis, the following config files exist:

### Essential Config Files (Keep)

1. **`next.config.ts`** - Next.js configuration
2. **`tsconfig.json`** - TypeScript configuration
3. **`tailwind.config.ts`** - Tailwind CSS configuration
4. **`postcss.config.mjs`** - PostCSS configuration
5. **`eslint.config.mjs`** - ESLint configuration
6. **`playwright.config.ts`** - E2E testing configuration
7. **`next-sitemap.config.js`** - Sitemap generation
8. **`vitest.config.ts`** - Unit testing configuration

### Additional Files (Verify)

9. **`package.json`** - Dependencies and scripts
10. **`tsconfig.node.json`** - TypeScript for Node.js (Vite config)
11. **`.gitignore`** - Git ignore patterns
12. **`.eslintignore`** - ESLint ignore patterns (if exists)
13. **`bun.lockb`** - Bun lock file

---

## Audit Process

For each configuration file:

1. **Verify necessity**: Is this file required for the project?
2. **Check for redundancy**: Are there duplicate settings?
3. **Review complexity**: Can any settings be simplified?
4. **Add documentation**: Are complex settings explained?
5. **Check for unused options**: Remove dead configuration

---

## File-by-File Audit

### 1. `next.config.ts`

**Purpose**: Next.js framework configuration

**Review checklist**:
- [ ] All config options still needed?
- [ ] Image domains properly configured?
- [ ] Redirects/rewrites necessary?
- [ ] Environment variables exposed correctly?
- [ ] Webpack customizations justified?
- [ ] Comments explain non-obvious settings?

**Common issues to check**:
- Unused experimental features
- Deprecated options
- Overly complex webpack config

**Action**: Review and document

### 2. `tsconfig.json`

**Purpose**: TypeScript compiler configuration

**Review checklist**:
- [ ] Strict mode enabled? (should be true)
- [ ] Path aliases configured correctly?
- [ ] Include/exclude patterns appropriate?
- [ ] Target/module settings correct for Next.js?
- [ ] Unnecessary lib entries?

**Action**: Ensure strict mode, clean up

### 3. `tailwind.config.ts`

**Purpose**: Tailwind CSS customization

**Review checklist**:
- [ ] Content paths cover all component locations?
- [ ] Theme extensions necessary?
- [ ] Plugin list minimal?
- [ ] Custom utilities documented?
- [ ] Unused theme values?

**Action**: Review theme extensions, document custom values

### 4. `postcss.config.mjs`

**Purpose**: PostCSS plugin configuration

**Review checklist**:
- [ ] Only necessary plugins included?
- [ ] Plugin order correct?
- [ ] Any plugin-specific config needed?

**Expected**: Usually just Tailwind + autoprefixer

**Action**: Verify minimal necessary config

### 5. `eslint.config.mjs`

**Purpose**: Code linting rules

**Review checklist**:
- [ ] Rules align with project standards?
- [ ] TypeScript rules enabled?
- [ ] React/Next.js rules included?
- [ ] Accessibility rules enabled?
- [ ] Any overly strict rules causing friction?
- [ ] Ignore patterns appropriate?

**Action**: Review for balance between strictness and productivity

### 6. `playwright.config.ts`

**Purpose**: E2E test configuration

**Review checklist**:
- [ ] Browsers needed (chromium, firefox, webkit)?
- [ ] Base URL correct?
- [ ] Timeouts reasonable?
- [ ] Screenshot/video settings appropriate?
- [ ] Retry logic sensible?

**Action**: Verify test infrastructure settings

### 7. `next-sitemap.config.js`

**Purpose**: Sitemap generation for SEO

**Review checklist**:
- [ ] Site URL correct?
- [ ] Exclusion patterns appropriate?
- [ ] Changefreq values sensible?
- [ ] Priority values set correctly?

**Action**: Verify SEO settings align with content strategy

### 8. `vitest.config.ts`

**Purpose**: Unit test configuration

**Review checklist**:
- [ ] Test environment correct (jsdom)?
- [ ] Setup files configured?
- [ ] Coverage thresholds set?
- [ ] Path aliases match tsconfig?
- [ ] Globals enabled if needed?

**Action**: Ensure test infrastructure solid

### 9. `package.json`

**Purpose**: Project metadata and dependencies

**Review checklist**:
- [ ] All dependencies actually used?
- [ ] Scripts clear and documented?
- [ ] Versions up to date (but stable)?
- [ ] Dev dependencies in right section?
- [ ] Peer dependency warnings addressed?

**Action**: Review for unused packages, update docs

---

## Execution Steps

### Step 1: Document Current State
```bash
# List all config files
ls -la *.config.* *.json package.json

# Check file sizes
ls -lh *.config.* *.json

# Create documentation
```

### Step 2: Review Each File

For each file:
```bash
# 1. Read the file
cat [config-file]

# 2. Check for Next.js/TypeScript/Tailwind docs
# 3. Identify any unusual settings
# 4. Add comments if missing
# 5. Remove redundant options
```

### Step 3: Add Documentation Comments

Add comments to complex configurations:

**Example for next.config.ts**:
```typescript
// Image optimization domains
images: {
  domains: ['hudsondigitalsolutions.com'], // CDN domain
},

// Redirects for SEO (old URLs to new structure)
redirects: async () => [
  // ...
],
```

### Step 4: Create Config Documentation

**New file**: `.planning/CONFIGURATION.md`

Document:
- Purpose of each config file
- Key settings and why they're set
- How to modify common settings
- Dependencies between configs

### Step 5: Clean Up

Remove:
- Commented-out code
- Unused options
- Deprecated settings
- Redundant configurations

### Step 6: Verification
```bash
# Verify all still works
pnpm build
pnpm typecheck
pnpm lint
pnpm test:unit

# Verify no warnings about deprecated config
# Check build output for config warnings
```

---

## Expected Changes

### Minimal Code Changes Expected

Most changes will be:
- **Adding comments** to explain complex settings
- **Removing redundant** options
- **Updating deprecated** syntax (if any)

### Documentation Changes

- New file: `.planning/CONFIGURATION.md`
- Comments in config files
- README updates (if needed)

---

## Verification Checklist

- [ ] All 8+ config files reviewed
- [ ] Comments added to complex settings
- [ ] Redundant options removed
- [ ] Deprecated settings updated
- [ ] Configuration documentation created
- [ ] Build succeeds
- [ ] Linting passes
- [ ] Tests pass
- [ ] No config warnings in console

---

## Expected Impact

**Files modified**: 8-10 config files (mostly comments)
**New files**: 1 (CONFIGURATION.md)
**Lines changed**: ~50-100 (mostly documentation)

**Benefits**:
- ✅ Config files well-documented
- ✅ Redundancy removed
- ✅ Easier for new developers to understand
- ✅ Clear purpose for each setting
- ✅ Reduced complexity
- ✅ No deprecated patterns

---

## Commit Message

```
docs(phase-5): audit and document configuration files (Plan 3)

Review all configuration files for clarity and optimization:

Changes:
- Add comments explaining complex config settings
- Remove redundant/unused configuration options
- Update any deprecated syntax
- Create CONFIGURATION.md documenting all configs

Files reviewed:
- next.config.ts, tsconfig.json, tailwind.config.ts
- eslint.config.mjs, playwright.config.ts
- vitest.config.ts, next-sitemap.config.js
- package.json

All configs now well-documented and optimized.
```

---

## Risk Assessment

**Risk Level**: VERY LOW

**Risks**:
- Removing needed configuration option
  - **Mitigation**: Test after each change, comprehensive verification
- Adding incorrect comments
  - **Mitigation**: Cross-reference official docs
- Breaking build with config changes
  - **Mitigation**: Test build/lint/typecheck after each file

**Testing Strategy**:
1. Review one file at a time
2. Test after each significant change
3. Full test suite before commit
4. Verify no new warnings

---

**Plan 3 Status**: Ready for execution
**Next**: Execute this plan, then proceed to Plan 4 (Extract Route Constants)
