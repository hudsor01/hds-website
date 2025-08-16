# E2E Tests

Comprehensive end-to-end tests for the Hudson Digital Solutions website using Playwright.

## Test Coverage

### 1. Contact Form - Happy Path (`contact-form.spec.ts`)
- ✅ Successful form submission with valid data
- ✅ High-value lead detection and scoring
- ✅ Form state persistence (if implemented)
- ✅ PostHog analytics tracking
- ✅ Accessibility compliance
- ✅ Network error handling
- ✅ Mobile responsiveness

### 2. Form Validation (`contact-form-validation.spec.ts`)
- ✅ Required field validation
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ Message minimum length
- ✅ XSS attack prevention
- ✅ SQL injection prevention
- ✅ Special character handling
- ✅ Long input handling

### 3. Security & Rate Limiting (`contact-form-security.spec.ts`)
- ✅ CSRF token validation
- ✅ Rate limiting enforcement (5 requests/minute)
- ✅ Security headers verification
- ✅ CORS configuration
- ✅ Path traversal prevention
- ✅ Command injection prevention
- ✅ NoSQL injection prevention
- ✅ Error message sanitization

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# Run only Chrome tests
npm run test:e2e:chrome

# View test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run only contact form tests
npx playwright test contact-form

# Run only validation tests
npx playwright test contact-form-validation

# Run only security tests
npx playwright test contact-form-security

# Run a specific test
npx playwright test -g "should successfully submit contact form"
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Daily at 2 AM UTC (scheduled)

### GitHub Actions Workflow

The workflow performs:
1. Linting and type checking
2. Application build
3. E2E tests on multiple browsers
4. Mobile device testing
5. Bundle size analysis
6. Test artifact upload

## Test Data

Test data is centralized in `helpers/test-data.ts`:
- Valid contact information
- High-value lead data
- Invalid/malicious inputs
- Expected responses
- DOM selectors
- Wait times

## Network Interception

The `NetworkInterceptor` class (`helpers/network-interceptor.ts`) provides:
- API call monitoring
- PostHog event tracking
- Email verification
- Security header checks
- Rate limit testing

## Environment Variables

Required for tests:
```env
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Debugging Failed Tests

1. **View test report**: `npm run test:e2e:report`
2. **Check screenshots**: Available in `test-results/` on failure
3. **Watch videos**: Recorded on failure, uploaded to GitHub Actions
4. **Debug mode**: `npm run test:e2e:debug` for step-by-step execution
5. **Network logs**: Use `interceptor.debugPrint()` in tests

## Performance Benchmarks

Expected test execution times:
- Happy path: ~10-15 seconds
- Validation suite: ~20-30 seconds
- Security suite: ~15-20 seconds
- Full suite: ~60-90 seconds

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test';
import { testData, selectors } from './helpers/test-data';

test.describe('New Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/page');
    // Your test logic
    expect(something).toBe(expected);
  });
});
```

## Best Practices

1. **Use centralized selectors**: Define in `test-data.ts`
2. **Avoid hard waits**: Use `waitForSelector` or `waitForResponse`
3. **Clean up after tests**: Tests should be independent
4. **Test both success and failure**: Cover edge cases
5. **Mock external services**: For predictable results
6. **Use meaningful assertions**: Be specific about expectations

## Troubleshooting

### Tests failing locally but not in CI
- Check environment variables
- Ensure clean database state
- Verify network conditions

### Flaky tests
- Add proper waits for async operations
- Check for race conditions
- Increase timeout values if needed

### Performance issues
- Run tests in parallel when possible
- Use headed mode only for debugging
- Optimize selectors for faster queries