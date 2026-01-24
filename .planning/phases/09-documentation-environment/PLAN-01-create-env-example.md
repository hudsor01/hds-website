# Plan 1: Create .env.example

## Objective

Create comprehensive .env.example file to guide new developers in setting up their local environment.

---

## Current Situation

**Problem**:
- README.md instructs: `cp .env.example .env.local`
- .env.example file does NOT exist
- New developers have no guidance on required environment variables
- Risk of committing secrets if using .env.local as template

**Environment Schema** (from src/env.ts):
- 15 server-side variables
- 3 client-side variables (NEXT_PUBLIC_*)
- Mix of required and optional variables
- CSRF_SECRET required in production

---

## Solution

Create `.env.example` file with:
1. **All environment variables** from src/env.ts
2. **Clear comments** indicating required vs optional
3. **Example placeholder values** (not real secrets)
4. **Grouped by category** for organization
5. **Instructions** on where to obtain API keys

---

## File Content

### .env.example

```bash
# ========================================
# Environment Configuration Template
# ========================================
# Copy this file to .env.local and fill in your actual values
# cp .env.example .env.local
#
# NEVER commit .env.local - it contains secrets!
# ========================================

# ========================================
# Required for Core Functionality
# ========================================

# Database - Supabase
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here

# Security - CSRF Protection
# Generate with: openssl rand -base64 32
# REQUIRED in production, optional in development
CSRF_SECRET=generate_a_random_32_character_secret_here

# ========================================
# Optional - Email & Notifications
# ========================================

# Email Service - Resend
# Get API key from: https://resend.com/api-keys
# Required if using contact form
RESEND_API_KEY=re_your_api_key_here

# Discord Webhooks - Notifications
# Optional: For admin notifications via Discord
# Get from: Discord Server Settings > Integrations > Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url

# ========================================
# Optional - Database Admin
# ========================================

# Supabase Service Role Key
# WARNING: This has admin access - keep secret!
# Get from: https://supabase.com/dashboard/project/_/settings/api
# Only needed for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ========================================
# Optional - Webhooks & Integrations
# ========================================

# Supabase Webhook Secret
# Used to validate webhooks from Supabase
# Generate a random string
SUPABASE_WEBHOOK_SECRET=your_webhook_secret_here

# Cron Job Secret
# Used to protect cron job endpoints
# Generate a random string
CRON_SECRET=your_cron_secret_here

# ========================================
# Optional - Rate Limiting (Production)
# ========================================

# Vercel KV - Distributed Rate Limiting
# Get from: Vercel Dashboard > Storage > KV
# Only needed for production rate limiting across edge functions
KV_REST_API_URL=https://your-kv-instance.kv.vercel-storage.com
KV_REST_API_TOKEN=your_kv_token_here

# ========================================
# Optional - SEO & Analytics
# ========================================

# Google Site Verification
# Get from: https://search.google.com/search-console
GOOGLE_SITE_VERIFICATION=your_google_verification_code

# ========================================
# Optional - Admin & Authentication
# ========================================

# Admin API Token
# Generate a random string (minimum 16 characters)
# Used to protect admin API endpoints
ADMIN_API_TOKEN=your_admin_api_token_here

# JWT Secret
# Generate a random string (minimum 16 characters)
# Used for JWT token signing
JWT_SECRET=your_jwt_secret_here

# ========================================
# Optional - Base URLs
# ========================================

# Base URLs (auto-detected if not set)
# Development: http://localhost:3000
# Production: https://your-domain.com
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ========================================
# System Variables (Auto-detected)
# ========================================

# Node Environment
# Automatically set by your environment
# Options: development, test, production
NODE_ENV=development

# ========================================
# Setup Instructions
# ========================================
#
# 1. Copy this file:
#    cp .env.example .env.local
#
# 2. Fill in REQUIRED variables (minimum):
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
#    - CSRF_SECRET (in production)
#
# 3. Add OPTIONAL variables as needed:
#    - RESEND_API_KEY (for contact form)
#    - KV_REST_API_URL + KV_REST_API_TOKEN (for production rate limiting)
#    - Others based on features you're using
#
# 4. Generate secrets:
#    openssl rand -base64 32  # For CSRF_SECRET, JWT_SECRET, etc.
#
# 5. NEVER commit .env.local to git!
#
# ========================================
```

---

## Execution Steps

```bash
# 1. Create .env.example file with content above
cat > .env.example << 'EOF'
[content from above]
EOF

# 2. Verify file was created
ls -la .env.example

# 3. Test that copying works as documented
cp .env.example .env.test
rm .env.test

# 4. Verify README.md setup instructions will work
# (already references: cp .env.example .env.local)
```

---

## Verification Checklist

- [ ] .env.example file exists
- [ ] All 18 environment variables from src/env.ts are documented
- [ ] Comments explain required vs optional
- [ ] Example values are placeholders (not real secrets)
- [ ] Variables grouped by category
- [ ] Setup instructions included
- [ ] Links to obtain API keys provided
- [ ] README.md `cp .env.example .env.local` command will work

---

## Commit Message

```
docs(phase-9): create comprehensive .env.example file (Plan 1)

Create missing .env.example template for new developer onboarding.

Created:
- .env.example with all 18 environment variables from src/env.ts

Features:
- Clear comments indicating required vs optional variables
- Grouped by category (Database, Email, Security, etc.)
- Example placeholder values (no real secrets)
- Instructions on where to obtain API keys
- Setup instructions for new developers
- Security warnings for sensitive keys

Impact:
- New developers can now set up the project following README.md
- Reduced risk of committing secrets
- Clear guidance on which env vars are needed
- Better developer onboarding experience

Fixes README.md instruction: `cp .env.example .env.local` now works.
```

---

## Notes

- Use placeholder values only (e.g., "your_api_key_here")
- Never include real secrets or API keys
- Group related variables together for clarity
- Include links to documentation/dashboards where applicable
- Make it clear which variables are required vs optional
