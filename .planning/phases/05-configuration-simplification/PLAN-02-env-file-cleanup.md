# Plan 2: Environment File Cleanup

**Status**: Ready for execution
**Priority**: MEDIUM
**Estimated Impact**: 2 files consolidated, 1 new .env.example created

---

## Goal

Consolidate duplicate environment files and create proper `.env.example` template for new developers, improving development setup clarity and reducing confusion.

---

## Problem Identified

### Duplicate .env Files in Root

**Current state**:
- `.env.local` - 1056 bytes, modified Dec 20
- `.env.local.new` - 488 bytes, modified Dec 7

**Issues**:
1. Confusion about which file is active
2. Risk of using wrong environment variables
3. No template for new developers
4. Unclear which variables are required vs optional

**Impact**:
- Developer onboarding friction
- Potential for missing required variables
- Risk of committing secrets if .env.example doesn't exist

---

## Solution

### Step 1: Analyze Differences

Compare the two files to understand:
- Which variables are in both files
- Which are unique to each
- Which file has the most complete set
- Which values are actual secrets vs examples

### Step 2: Consolidate to Single `.env.local`

Merge all required variables into one authoritative `.env.local`:
- Keep all production-ready variables
- Ensure complete configuration
- Verify all required keys present

### Step 3: Create `.env.example`

Create template with:
- All required variable keys (no secrets)
- Example/placeholder values
- Comments explaining each variable
- Grouping by service (Supabase, Resend, etc.)

### Step 4: Update .gitignore

Ensure proper ignore patterns:
```gitignore
# Environment files
.env
.env.local
.env*.local
!.env.example
```

### Step 5: Document in README

Add environment setup section:
- How to copy .env.example to .env.local
- Where to get API keys
- Which variables are required for local development

---

## Execution Steps

### Step 1: Compare Files
```bash
# View both files to understand differences
cat .env.local
echo "---"
cat .env.local.new

# Or use diff
diff .env.local .env.local.new
```

### Step 2: Identify Required Variables

Expected variables based on codebase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- Any analytics keys (if used)

### Step 3: Create Consolidated `.env.local`

Structure:
```env
# ==============================================
# Hudson Digital Solutions - Local Environment
# ==============================================
# DO NOT COMMIT THIS FILE
# Use .env.example as template

# ------------------
# Application
# ------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------
# Supabase
# ------------------
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ------------------
# Email (Resend)
# ------------------
RESEND_API_KEY=your_resend_api_key_here

# ------------------
# Analytics (Optional)
# ------------------
# Add analytics keys if needed
```

### Step 4: Create `.env.example`
```bash
# Create example file with NO secrets
# Copy structure from .env.local but use placeholders
```

Example content:
```env
# ==============================================
# Hudson Digital Solutions - Environment Template
# ==============================================
# Copy this file to .env.local and fill in actual values
# Never commit .env.local - it contains secrets!

# ------------------
# Application
# ------------------
# Base URL for the application (use http://localhost:3000 for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------
# Supabase
# ------------------
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ------------------
# Email (Resend)
# ------------------
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# ------------------
# Optional Services
# ------------------
# Add any optional service keys below
```

### Step 5: Delete Duplicate
```bash
# Remove the duplicate file
rm .env.local.new

# Verify only .env.local remains (and .env.example)
ls -la .env*
```

### Step 6: Update Documentation

Add to README.md (or create SETUP.md):
```markdown
## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values in `.env.local`:
   - **Supabase**: Get from [Supabase Dashboard](https://supabase.com/dashboard)
   - **Resend**: Get from [Resend API Keys](https://resend.com/api-keys)

3. Required for local development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`

4. Optional variables:
   - `SUPABASE_SERVICE_ROLE_KEY` (only needed for admin operations)
```

### Step 7: Verification
```bash
# Verify .env.local not tracked by git
git status | grep .env.local  # Should NOT appear

# Verify .env.example IS tracked
git status | grep .env.example  # Should appear as new file

# Verify app starts with new .env.local
pnpm dev

# Test key functionality:
# - Database connection (testimonials page)
# - Email sending (contact form)
```

---

## Files Changed

### New Files
- `.env.example` - Environment template for developers

### Modified Files
- `.env.local` - Consolidated environment variables
- `.gitignore` - Verify proper ignore rules
- `README.md` or `SETUP.md` - Environment setup instructions

### Deleted Files
- `.env.local.new` - Duplicate environment file

---

## Verification Checklist

- [ ] Both .env files compared and understood
- [ ] Single .env.local with all required variables
- [ ] .env.example created with NO secrets
- [ ] .env.local.new deleted
- [ ] .gitignore properly ignores .env.local
- [ ] .gitignore allows .env.example to be tracked
- [ ] README/SETUP.md documents environment setup
- [ ] Application starts successfully
- [ ] Database connection works
- [ ] Email sending works
- [ ] No secrets in .env.example
- [ ] Comments explain each variable

---

## Expected Impact

**Files created**: 1 (.env.example)
**Files modified**: 2-3 (.env.local, .gitignore, README.md)
**Files deleted**: 1 (.env.local.new)

**Benefits**:
- ✅ Clear environment setup for new developers
- ✅ No confusion about which .env file to use
- ✅ Template prevents missing required variables
- ✅ Documentation guides proper setup
- ✅ Reduces onboarding friction
- ✅ Prevents accidental secret commits

---

## Commit Message

```
refactor(phase-5): consolidate environment files (Plan 2)

Cleanup and document environment variable setup:

Changes:
- Merge .env.local and .env.local.new into single .env.local
- Create .env.example template with placeholders
- Add environment setup documentation to README
- Remove duplicate .env.local.new file

All required variables now documented with examples.
Clear instructions for new developer setup.

Files changed: +1 .env.example, -1 .env.local.new
```

---

## Risk Assessment

**Risk Level**: LOW

**Risks**:
- Accidentally committing secrets in .env.example
  - **Mitigation**: Manual review before commit, only use placeholders
- Missing required variable in consolidation
  - **Mitigation**: Test app functionality after consolidation
- Breaking existing local setup
  - **Mitigation**: Backup .env.local before changes

**Testing Strategy**:
1. Backup current .env.local
2. Create new consolidated version
3. Test app startup
4. Test database operations
5. Test email sending
6. Verify no secrets in .env.example
7. Only commit after full verification

---

**Plan 2 Status**: Ready for execution
**Next**: Execute this plan, then proceed to Plan 3 (Config File Audit)
