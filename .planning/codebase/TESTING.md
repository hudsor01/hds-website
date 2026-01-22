# Testing Infrastructure

**Analysis Date:** 2026-01-10

## Framework

**Unit Testing:**
- Framework: Bun built-in test runner (native, fast)
- Config: `bunfig.toml` (test environment configuration)
- Library: `@testing-library/react` 16.3.1 for component testing
- Environment: happy-dom (lightweight DOM implementation)
- Runner: `bun test` command
- Watch mode: `bun test --watch`

**E2E Testing:**
- Framework: Playwright 1.57.0
- Config: `playwright.config.ts`
- Browsers: Chromium, Firefox, WebKit (multi-browser testing)
- Headless: Configurable (default: true for CI)
- Screenshots: On failure
- Video: On failure (optional)
- Retries: 2 (configurable for flaky tests)

## Test Structure

**Unit Test Location:**
- Primary: `tests/unit/` (mirrors `src/` structure)
- Alternative: Co-located `*.test.ts` files (optional pattern)
- Example: `tests/unit/lib/schemas/contact.test.ts` for `src/lib/schemas/contact.ts`

**E2E Test Location:**
- Directory: `e2e/`
- Organization: By user flow or feature
- Example: `e2e/contact-form.spec.ts`, `e2e/paystub-generator.spec.ts`

**Test File Naming:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Pattern: `[feature-name].test.ts`

## Test Patterns

**Unit Test Structure:**
```typescript
import { describe, test, expect } from 'bun:test'
import { functionToTest } from '@/lib/module'

describe('functionToTest', () => {
  test('should handle valid input', () => {
    // Arrange
    const input = { /* ... */ }
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toEqual(expectedOutput)
  })
  
  test('should throw on invalid input', () => {
    expect(() => functionToTest(invalidInput)).toThrow()
  })
})
```

**Component Test Structure:**
```typescript
import { describe, test, expect } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { Component } from '@/components/Component'

describe('Component', () => {
  test('should render with props', () => {
    render(<Component prop="value" />)
    expect(screen.getByText('expected text')).toBeInTheDocument()
  })
  
  test('should handle user interaction', async () => {
    const { user } = render(<Component />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('result')).toBeInTheDocument()
  })
})
```

**E2E Test Structure:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Flow', () => {
  test('should complete user journey', async ({ page }) => {
    // Navigate
    await page.goto('/feature')
    
    // Interact
    await page.fill('[name="input"]', 'value')
    await page.click('button[type="submit"]')
    
    // Assert
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
```

## Test Categories

**Unit Tests:**
- **Validation Schemas** (`lib/schemas/`)
  - Test valid inputs pass
  - Test invalid inputs fail with correct errors
  - Test edge cases (empty, null, undefined)
  - Example: Email format, phone number format, required fields

- **Utilities** (`lib/`, `utils/`)
  - Pure function behavior
  - Error handling
  - Edge cases
  - Example: castError, formatDate, calculateTotal

- **Server Actions** (`app/actions/`)
  - Input validation
  - Success cases
  - Error cases
  - Mocked external dependencies (Drizzle/Neon, Resend)

**Integration Tests:**
- Not currently implemented
- Future: API route testing with database
- Pattern: Mock external services, real database calls

**E2E Tests:**
- **User Flows**
  - Contact form submission
  - Tool usage (paystub, invoice, timesheet)
  - Navigation flows
  - Authentication flows (future)

- **Critical Paths**
  - Form validation and submission
  - Success and error states
  - Progressive enhancement (works without JS)

## Coverage

**Current Coverage:**
- Validation schemas: High priority, should be tested
- Critical user flows: E2E tests for main features
- Server Actions: Should have unit tests
- Utilities: Test pure functions and complex logic

**Coverage Strategy:**
- Not aiming for 100% coverage
- Focus on business-critical code
- Test complex logic and edge cases
- Skip trivial getters/setters
- Test public APIs, not implementation details

**Coverage Gaps:**
- Component testing: Limited coverage
- API routes: No dedicated tests yet
- Integration tests: Not implemented
- Error boundary behavior: Not tested

## Running Tests

**Commands:**
- `pnpm test:unit` - Run unit tests with Bun
- `pnpm test:e2e` - Run E2E tests (all browsers)
- `pnpm test:e2e:fast` - Run E2E tests (Chromium only)
- `pnpm test:all` - Run all checks (lint, typecheck, tests)
- `pnpm test:unit:coverage` - Generate coverage report

**Watch Mode:**
- Unit: `bun test --watch` (not in package.json)
- E2E: Playwright UI mode `pnpm exec playwright test --ui`

**CI/CD:**
- GitHub Actions (assumed, not configured yet)
- Run on: Push to main, pull requests
- Steps: Lint → Typecheck → Unit tests → E2E tests
- Fail fast: Stop on first failure

## Mocking & Fixtures

**Mocking Strategy:**
- Mock external services (Drizzle/Neon, Resend)
- Mock browser APIs in unit tests
- Use Playwright's built-in network mocking for E2E
- Avoid mocking internal modules

**Test Data:**
- No dedicated fixtures directory yet
- Inline test data in test files
- Future: Create `tests/fixtures/` for shared data

**Environment:**
- Test env vars in `.env.test` (not created yet)
- Default to sensible test values
- Mock API calls to avoid real service usage

## Assertions

**Unit Tests (Bun):**
- `expect(value).toBe(expected)` - Strict equality
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toThrow()` - Function throws
- `expect(value).toBeTruthy()` - Truthy check
- Custom matchers from @testing-library/react

**E2E Tests (Playwright):**
- `await expect(locator).toBeVisible()` - Element visible
- `await expect(locator).toHaveText(text)` - Text content
- `await expect(page).toHaveURL(url)` - URL check
- `await expect(locator).toBeEnabled()` - Interactive state

## Best Practices

**Unit Tests:**
- Test behavior, not implementation
- One assertion per test (when possible)
- Descriptive test names ("should [expected behavior]")
- Arrange-Act-Assert pattern
- Mock external dependencies
- Clean up after each test (afterEach)

**E2E Tests:**
- Test critical user journeys
- Use data-testid sparingly (prefer accessible selectors)
- Wait for network idle before assertions
- Take screenshots on failure (configured)
- Retry flaky tests (configured: 2 retries)
- Run in parallel for speed (configured)

**General:**
- Keep tests focused and simple
- Avoid testing framework internals
- Don't test third-party libraries
- Test edge cases and error paths
- Maintain test independence (no shared state)
- Fast tests (< 1s for unit, < 10s for E2E)

## Test Tools

**Testing Library Utilities:**
- `render()` - Render React components
- `screen` - Query rendered output
- `fireEvent` - Trigger DOM events
- `waitFor()` - Async assertions
- `userEvent` - More realistic user interactions

**Playwright Utilities:**
- `page.goto()` - Navigate to URL
- `page.locator()` - Find elements
- `page.fill()` - Input text
- `page.click()` - Click elements
- `page.waitForSelector()` - Wait for element
- `page.screenshot()` - Capture screenshot

**Bun Test Utilities:**
- `describe()` - Group related tests
- `test()` - Define test case
- `expect()` - Assertions
- `beforeEach()` / `afterEach()` - Setup/teardown
- `vi.mock()` - Module mocking (Vitest-compatible API)

## Future Improvements

**Planned:**
- Increase component test coverage
- Add integration tests for API routes
- Create test fixtures directory
- Configure GitHub Actions CI
- Add visual regression testing (Playwright)
- Implement test database seeding

**Under Consideration:**
- Contract testing for external APIs
- Performance testing (Lighthouse CI)
- Accessibility testing automation
- Mutation testing for coverage quality

---

*Testing analysis: 2026-01-10*
*Update when test strategy evolves*
