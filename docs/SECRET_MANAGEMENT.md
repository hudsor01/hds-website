# Secret Management Guide

This guide explains how to manage environment variables and secrets securely in the Hudson Digital Solutions website project.

## Overview

We use `dotenv-cli` to manage environment variables across different environments (development, test, production) without exposing sensitive keys in the codebase or during builds.

## Quick Start

### 1. Initial Setup

```bash
# Create your local environment file from the template
npm run env:setup

# This creates .env.local from .env.example
# Edit .env.local with your actual values
```

### 2. Validate Your Configuration

```bash
# Check that all required environment variables are set correctly
npm run env:validate
```

## Environment Files

### File Structure

```
.env.example      # Template with all variables (committed to repo)
.env.local        # Development environment (ignored by git)
.env.test         # Test environment for E2E tests (ignored by git)
.env.production   # Production template (reference only, ignored by git)
```

### Environment Hierarchy

1. **`.env.example`** - Template file with placeholder values
2. **`.env.local`** - Your local development configuration
3. **`.env.test`** - Test configuration for E2E tests
4. **`.env.production`** - Production configuration (set in deployment platform)

## Required Variables

### Email Service (Required)
- `RESEND_API_KEY` - Your Resend API key for sending emails

### Analytics (Recommended)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog instance URL

### Security (Auto-generated if not provided)
- `CSRF_SECRET` - CSRF protection secret (min 32 chars)
- `CRON_SECRET` - Cron job authentication secret (min 32 chars)

## Development Workflow

### Running Development Server

```bash
# Automatically loads .env.local
npm run dev

# With HTTPS
npm run dev:https
```

### Building Locally

```bash
# Build with local environment
npm run build:local

# Build with production environment template
npm run build
```

### Running Tests

```bash
# Automatically loads .env.test
npm run test:e2e

# Run all tests with proper environment
npm run test:all
```

## Security Best Practices

### 1. Never Commit Secrets

- ✅ Commit `.env.example` with placeholder values
- ❌ Never commit `.env.local`, `.env.test`, or actual secrets
- ✅ Use `.gitignore` to exclude environment files

### 2. Use Strong Secrets

Generate secure random secrets:

```bash
# Generate CSRF secret
openssl rand -base64 32

# Generate CRON secret
openssl rand -base64 32
```

### 3. Validate Before Deployment

Always validate your environment:

```bash
npm run env:validate
```

### 4. Different Secrets Per Environment

- Use different API keys for development/staging/production
- Never use production keys in development
- Use test-specific keys for E2E tests

## Production Deployment

### Vercel Configuration

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable from `.env.production` template
4. Use actual production values, not placeholders

### Required Production Variables

```env
RESEND_API_KEY=re_production_key_here
NEXT_PUBLIC_POSTHOG_KEY=phc_production_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
CSRF_SECRET=[generate with: openssl rand -base64 32]
CRON_SECRET=[generate with: openssl rand -base64 32]
```

## Testing Configuration

### E2E Test Environment

The `.env.test` file is specifically for E2E tests:

```env
# Use test API keys to avoid sending real emails
RESEND_API_KEY=re_test_key_here
TEST_MODE=true

# More permissive rate limiting for tests
RATE_LIMIT_WINDOW_MS=1000
RATE_LIMIT_MAX_REQUESTS=100
```

### Running Tests with Secrets

```bash
# Tests automatically use .env.test
npm run test:e2e

# Or manually specify
dotenv -e .env.test -- playwright test
```

## Troubleshooting

### Missing Environment Variables

If you see errors about missing variables:

1. Run `npm run env:validate` to identify missing variables
2. Check `.env.example` for the complete list
3. Ensure `.env.local` exists and contains required values

### Invalid Variable Format

Common issues:

- `RESEND_API_KEY` must start with `re_`
- `NEXT_PUBLIC_POSTHOG_KEY` must start with `phc_`
- URLs must be valid (include `https://`)
- Secrets must be at least 32 characters

### Build Failures

If builds fail due to environment variables:

```bash
# Validate your configuration
npm run env:validate

# Build with local environment to test
npm run build:local
```

## CI/CD Integration

### GitHub Actions

Set secrets in GitHub repository settings:

1. Go to Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`

### Using in Workflows

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
    NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}
    NEXT_PUBLIC_POSTHOG_HOST: ${{ secrets.NEXT_PUBLIC_POSTHOG_HOST }}
```

## Available Scripts

| Script | Description | Environment |
|--------|-------------|-------------|
| `npm run dev` | Start development server | `.env.local` |
| `npm run build` | Production build | `.env.production` |
| `npm run build:local` | Local build | `.env.local` |
| `npm run test:e2e` | Run E2E tests | `.env.test` |
| `npm run env:validate` | Validate environment | Current env |
| `npm run env:setup` | Create .env.local from template | - |

## Environment Variable Reference

See `.env.example` for the complete list of supported environment variables and their descriptions.

## Security Checklist

- [ ] Created `.env.local` from `.env.example`
- [ ] Set all required variables
- [ ] Generated strong secrets (32+ characters)
- [ ] Validated configuration with `npm run env:validate`
- [ ] Never committed actual secrets to git
- [ ] Using different keys for dev/test/production
- [ ] Set production variables in deployment platform
- [ ] Configured CI/CD secrets in GitHub