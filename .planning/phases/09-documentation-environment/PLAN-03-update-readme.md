# Plan 3: Update and Verify README.md

## Objective

Verify README.md accuracy after creating .env.example and ensure all setup instructions are current.

---

## Current README.md Analysis

**Setup Instructions** (lines 17-43):
1. Clone repository ✅
2. Install dependencies ✅
3. Setup environment variables - **NEEDS VERIFICATION** (references .env.example)
4. Run development server ✅

**Potential Issues**:
- Line 30: `cp .env.example .env.local` - **FIXED** after Plan 1
- Line 24: `npm install` - Should verify if `bun install` is preferred
- Line 39: `npm run dev` - Should verify if `bun run dev` is preferred
- Package manager: Uses npm in examples, but package.json has `"packageManager": "bun@1.3.4"`

---

## Verification Checklist

### Environment Setup Section
- [ ] Verify `.env.example` is referenced correctly
- [ ] Verify minimum required env vars are listed
- [ ] Update package manager commands if needed (npm vs bun)

### Commands Section
- [ ] Verify all npm/bun scripts are current
- [ ] Check test commands match package.json
- [ ] Verify build/deploy commands work

### Features Section
- [ ] Verify feature list is accurate (no removed features)
- [ ] Check if new features from cleanup phases should be mentioned

### Links Section
- [ ] Verify all external links still work
- [ ] Check repository links are correct

---

## Proposed Updates

### Update 1: Package Manager Consistency

**Current** (lines 24-25):
```markdown
2. **Install dependencies**
   ```bash
   npm install
   ```
```

**Proposed**:
```markdown
2. **Install dependencies**

   This project uses Bun as the package manager:
   ```bash
   bun install
   ```

   Or with npm:
   ```bash
   npm install
   ```
```

### Update 2: Development Server Command

**Current** (lines 38-42):
```markdown
4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.
```

**Proposed**:
```markdown
4. **Run the development server**

   With Bun (recommended):
   ```bash
   bun run dev
   ```

   Or with npm:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.
```

### Update 3: Environment Variables Section

**Current** (lines 28-36):
```markdown
3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your actual values. At minimum, you need:
   - `RESEND_API_KEY` - for contact form emails

   See `.env.example` for all available options.
```

**Verify this is accurate** ✅ (will be after Plan 1)

---

## Execution Steps

```bash
# 1. Read current README.md
cat README.md

# 2. Verify setup instructions work
# (After .env.example is created in Plan 1)

# 3. Update README.md with package manager clarifications
# (Use Edit tool to update specific sections)

# 4. Test that instructions work from scratch
# (Simulate new developer following README.md)

# 5. Verify all links work
# (Check external URLs)
```

---

## Verification

### Manual Testing
```bash
# Simulate new developer setup (after changes):

# 1. Install dependencies
bun install  # Should work

# 2. Copy .env.example
cp .env.example .env.local  # Should work (after Plan 1)

# 3. Fill in minimum env vars
# Edit .env.local with:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
# - CSRF_SECRET

# 4. Run dev server
bun run dev  # Should start successfully
```

---

## Changes to Make

**Option A: Minimal changes**
- Only update environment setup section to reference .env.example (already correct)
- No other changes needed

**Option B: Improve package manager clarity**
- Add note about Bun being the primary package manager
- Provide both Bun and npm examples for commands
- More helpful for developers unfamiliar with Bun

**Recommended**: Option B (improve clarity)

---

## Commit Message

```
docs(phase-9): clarify package manager in README.md (Plan 3)

Update README.md to clarify package manager usage:

Updated:
- README.md installation section
  * Added note that Bun is the primary package manager
  * Provided both Bun and npm command examples
  * Clarified development server startup commands

Verified:
- Environment setup instructions work with .env.example
- All referenced scripts exist in package.json
- Setup instructions tested and working

No breaking changes, purely documentation improvements.
```

---

## Notes

- README.md is mostly accurate, just needs package manager clarity
- Environment setup section will work correctly after Plan 1
- Consider adding troubleshooting section if common issues arise
- All external links should be verified
