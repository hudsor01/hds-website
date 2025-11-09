# CI/CD Pipeline Guide

## Overview
This project uses a simple, maintainable CI/CD pipeline that runs automatically on GitHub. The goal is to catch issues early without getting in your way.

## Pre-Commit and Pre-Push Hooks
This project uses Husky to run checks before commits and pushes:

**Pre-Commit** (runs on `git commit`):
- ESLint (lint check only - no auto-fix)
- TypeScript type checking
- Unit tests

**Pre-Push** (runs on `git push`):
- Full test suite (`npm run test:all`)

**Important**: These hooks check your code but DO NOT modify it. If checks fail, you need to fix the issues manually before committing.

## What Runs Automatically

### On Every Push & Pull Request
The CI pipeline runs these checks:

1. **Code Quality & Type Checking**
   - ESLint for code quality
   - TypeScript type checking
   - Build verification

2. **Unit Tests**
   - Fast unit tests with Vitest

3. **E2E Tests (Fast)**
   - Chromium-only tests for speed
   - Critical user flows

4. **Security Audit**
   - npm audit for known vulnerabilities
   - Non-blocking (won't fail the build)

### Weekly Dependency Updates
- Dependabot checks for updates every Monday at 9 AM
- Groups dependencies intelligently:
  - Dev dependencies (minor/patch together)
  - Production dependencies (patch only)
- Limited to 5 open PRs at a time

## Local Development Workflow

### Before You Commit
Run this command to check everything locally:
```bash
npm run test:all
```

This runs:
- Linting
- Type checking
- Unit tests
- Fast E2E tests

### Available Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build

# Quality Checks
npm run lint             # Run ESLint
npm run typecheck        # Type checking only
npm run test:all         # All checks (recommended before push)

# Testing
npm run test:unit        # Unit tests
npm run test:unit:watch  # Unit tests in watch mode
npm run test:e2e:fast    # Fast E2E tests (chromium only)
npm run test:e2e         # Full E2E tests (all browsers)
npm run test:e2e:ui      # E2E tests with UI
```

## Coming Back After Time Away

When you return to the project after weeks or months:

1. **Update dependencies**
   ```bash
   npm install
   ```

2. **Check for breaking changes**
   ```bash
   npm run test:all
   ```

3. **Review Dependabot PRs**
   - Check open PRs from Dependabot
   - Merge safe updates (patch versions)
   - Test locally before merging major updates

4. **Start developing**
   ```bash
   npm run dev
   ```

## GitHub Branch Protection (Recommended Setup)

To enable branch protection on GitHub:

1. Go to: **Settings → Branches → Branch protection rules**
2. Add rule for `main` branch:
   - ✅ Require status checks to pass before merging
   - Select: `Code Quality & Type Checking`, `Unit Tests`, `E2E Tests (Fast)`
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history (optional, but nice)

This ensures:
- No broken code gets merged to main
- All tests pass before merging
- Code quality standards are maintained

## CI/CD Philosophy

This setup follows the principle: **Simple, Fast, Reliable**

- **Simple**: Minimal, focused pre-commit checks combined with comprehensive GitHub Actions
- **Fast**: Only essential tests run on every push
- **Reliable**: Catches real issues without false positives

## Troubleshooting

### CI Fails But Works Locally
1. Check Node version matches (20.x)
2. Ensure `.env.example` exists if needed
3. Review CI logs in GitHub Actions tab

### Tests Timeout in CI
- E2E tests have longer timeout in CI
- Check if test is flaky (re-run to verify)

### Dependabot PRs Keep Coming
- This is normal and healthy
- Review and merge regularly (weekly recommended)
- Batch similar updates together

## Maintenance

### Monthly Tasks
- Review and merge Dependabot PRs
- Check CI logs for any recurring issues
- Update Node version in CI if needed

### When Things Break
1. Don't panic
2. Check GitHub Actions tab for logs
3. Run `npm run test:all` locally to reproduce
4. Fix issues one at a time
5. Push and verify CI passes

## Need Help?
- Check CI logs: Repository → Actions tab
- Review test output: Look for specific failure
- Local testing: `npm run test:all`
