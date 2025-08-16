# GitHub Actions Secrets Setup Guide

This guide walks you through setting up secrets for GitHub Actions to enable automated testing and deployment for the Hudson Digital Solutions website.

## Prerequisites

- GitHub repository access with admin permissions
- Production API keys and secrets ready
- Understanding of which secrets are needed for CI/CD

## Step-by-Step Setup

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, find **Secrets and variables**
4. Click on **Actions**

### 2. Add Required Secrets

Click **New repository secret** for each of the following:

#### Essential Secrets (Required)

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `RESEND_API_KEY` | Resend API key for email testing | `re_test_xxxxxx...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | `phc_xxxxxx...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance URL | `https://app.posthog.com` |

#### Additional Secrets (Optional)

| Secret Name | Description | When Needed |
|------------|-------------|-------------|
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | If using n8n integration |
| `N8N_API_KEY` | n8n API authentication | If using n8n integration |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console | For SEO verification |
| `CSRF_SECRET` | CSRF protection secret | For enhanced security |
| `CRON_SECRET` | Cron job authentication | If using scheduled jobs |

### 3. Setting Up Each Secret

For each secret:

1. Click **New repository secret**
2. Enter the **Name** exactly as shown above
3. Enter the **Value** (your actual API key/secret)
4. Click **Add secret**

### 4. Environment-Specific Secrets

Consider using environments for different deployment stages:

#### Development/Staging Secrets
```
RESEND_API_KEY_DEV
NEXT_PUBLIC_POSTHOG_KEY_DEV
```

#### Production Secrets
```
RESEND_API_KEY_PROD
NEXT_PUBLIC_POSTHOG_KEY_PROD
```

## Verifying Your Setup

### 1. Check Workflow File

Ensure your `.github/workflows/e2e-tests.yml` references the secrets:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
    NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}
    NEXT_PUBLIC_POSTHOG_HOST: ${{ secrets.NEXT_PUBLIC_POSTHOG_HOST }}
```

### 2. Trigger a Test Run

1. Make a small change to any file
2. Commit and push to trigger the workflow
3. Check the Actions tab for results

### 3. Debug Failed Runs

If tests fail due to missing secrets:

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Check the logs for "secret not found" errors
4. Verify secret names match exactly (case-sensitive)

## Security Best Practices

### DO ✅

- Use strong, unique secrets for production
- Rotate secrets regularly (every 90 days)
- Use different secrets for dev/staging/production
- Limit secret access to required workflows only
- Audit secret usage regularly

### DON'T ❌

- Share secrets in issues, PRs, or comments
- Use production secrets in development
- Commit secrets to the repository
- Use weak or default passwords
- Grant unnecessary permissions

## Generating Secure Secrets

### For Random Secrets (CSRF, CRON)

```bash
# Generate a 32-character secret
openssl rand -base64 32

# Generate a 64-character secret
openssl rand -base64 48
```

### For API Keys

Always use the official provider's dashboard:
- **Resend**: https://resend.com/api-keys
- **PostHog**: https://app.posthog.com/project/settings
- **n8n**: Your n8n instance settings

## Using Secrets in Different Workflows

### For Testing Workflows

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          TEST_MODE: true
        run: npm run test:e2e
```

### For Deployment Workflows

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY_PROD }}
          NODE_ENV: production
        run: npm run build
```

### For Scheduled Workflows

```yaml
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  scheduled-task:
    runs-on: ubuntu-latest
    steps:
      - name: Run scheduled task
        env:
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
        run: npm run scheduled-task
```

## Environments and Protection Rules

### Setting Up Environments

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it (e.g., "production", "staging")
4. Add environment-specific secrets
5. Configure protection rules:
   - Required reviewers
   - Deployment branches
   - Wait timer

### Using Environment Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Specifies which environment
    steps:
      - name: Deploy
        env:
          # Automatically uses production environment secrets
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
```

## Troubleshooting

### Secret Not Found

```
Error: Input required and not supplied: RESEND_API_KEY
```

**Solution**: Verify the secret name matches exactly (case-sensitive)

### Permission Denied

```
Error: Resource not accessible by integration
```

**Solution**: Check repository settings → Actions → General → Workflow permissions

### Secret Value Issues

```
Error: Invalid API key format
```

**Solution**: 
1. Verify the secret value doesn't have extra spaces
2. Check if quotes are needed (usually not)
3. Ensure the full key is copied

## Monitoring Secret Usage

### View Secret Usage

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click on a secret name
3. View "Last updated" timestamp

### Audit Logs (Organization accounts)

1. Go to Organization settings
2. Click **Audit log**
3. Filter by `action:secret`

## Quick Reference

### Essential GitHub Secrets Checklist

- [ ] `RESEND_API_KEY` - Email service
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` - Analytics host
- [ ] Verify workflow file references
- [ ] Test with a workflow run
- [ ] Document secret rotation schedule

### Secret Naming Convention

```
<SERVICE>_<TYPE>_<ENVIRONMENT>

Examples:
RESEND_API_KEY_PROD
POSTHOG_KEY_DEV
N8N_WEBHOOK_URL_STAGING
```

## Next Steps

1. Set up the required secrets following this guide
2. Run `npm run test:all` locally to verify your setup
3. Push changes to trigger GitHub Actions
4. Monitor the Actions tab for successful runs
5. Set up secret rotation reminders (every 90 days)