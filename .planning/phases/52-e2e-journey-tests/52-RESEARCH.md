# Phase 52: E2E Journey Test Completion - Research

**Researched:** 2026-02-24
**Domain:** Playwright E2E tests, existing test infrastructure, blog DB state
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Run against localhost dev server (not a deployed URL)
- Real Neon DB — no mocking. Phase goal requires confirming the actual blog pipeline works.
- playwright.config.ts already has webServer config — researcher to report what's there (see Standard Stack below)
- No CI integration this phase — tests run locally via `pnpm test:e2e`
- Contact form: full journey (navigate → fill all required fields → submit → assert success state)
- Contact form: also test required field validation (empty submit → assert error messages appear)
- Contact form email: **rhudson42@yahoo.com** — real Resend email will be sent during test runs
- Blog: assert at least 1 post card is visible on /blog (not empty state)
- Blog slug journey: click post card → assert post detail page loads, title visible, body content renders (no 404/error)
- Blog: fail if all visible posts look like placeholders — test must detect and reject placeholder-only content
- Newsletter: full journey (enter email → submit → assert success/confirmation message)
- Newsletter: verify signup recorded — query DB via existing or minimal API route

### Claude's Discretion
- Exact Playwright selector strategy (data-testid vs role vs text)
- Whether to add a cleanup step after newsletter test (delete test subscriber row)
- File organization within e2e/ (one file per journey or combined)
- Specific assertion text for success messages (researcher will find actual UI copy)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REQ-v3-06 | E2E test suite for critical user journeys: contact form, tool generators, blog, navigation | Contact form journey tests in e2e/contact-form.spec.ts need journey upgrade; blog and newsletter specs need new files; actual UI copy confirmed |
| REQ-v3-01 | Automated blog content pipeline delivering real posts visible at /blog and /blog/[slug] | DB queried — 8 published posts exist (3 placeholder + 5 auto-generated); placeholder slugs confirmed; journey test can validate real posts appear |
</phase_requirements>

---

## Summary

Phase 52 adds journey-level E2E coverage for three user flows: contact form submission, blog listing with real-post confirmation, and newsletter signup with DB verification. The Playwright infrastructure is already fully operational — config, helpers, and test logger are in place. The phase is primarily a test authoring task, not an infrastructure task.

The key discovery is that **most of the test files already exist** in the e2e/ directory. `contact-form.spec.ts` and `newsletter-signup.spec.ts` are already present and contain substantive tests. However, these existing tests have issues that make them unsuitable as "journey tests" without modification: the contact form submission test uses a generic `john.doe@example.com` address (not the locked real email), the newsletter test uses throwaway addresses and does not verify DB insertion, and there is no blog journey spec at all.

The blog DB state is confirmed via Neon query: 8 published posts total — 3 Phase-42 placeholder posts (seeded manually) and 5 auto-generated posts from the n8n pipeline. Placeholder detection is straightforward because the 3 placeholder slugs are known exactly. The test must assert that at least one post visible on /blog is NOT one of the 3 placeholder slugs.

**Primary recommendation:** Audit the existing contact-form.spec.ts and newsletter-signup.spec.ts files for what can be reused, then write a new blog.spec.ts. The planner should treat this as: (1) update contact-form submission test to use real email, (2) add newsletter DB verification step, (3) create blog journey spec.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| @playwright/test | 1.58.2 | E2E test framework | Already in package.json |
| bun | 1.3.8 | Runtime / dev server | `bun run dev -- -p 3001` is webServer command |

### Existing Infrastructure

**playwright.config.ts** (confirmed by reading the file):
```typescript
// baseURL: 'http://localhost:3001'
// webServer: { command: 'bun run dev -- -p 3001', url: 'http://localhost:3001', reuseExistingServer: !process.env.CI }
// workers: 1 (serial execution for isolation)
// retries: 1 (local), 2 (CI)
// actionTimeout: 10000ms, navigationTimeout: 30000ms
// projects: chromium + webkit
```

**Test commands:**
- `pnpm test:e2e` — all browsers
- `pnpm test:e2e:fast` — chromium only, 1 worker (preferred for local dev)

**Existing E2E utilities:**
- `e2e/test-helpers.ts` — `navigateAndWait(page, url)` helper
- `e2e/test-logger.ts` — `createTestLogger(title)` with `.step()`, `.complete()`, `.warn()` methods

---

## Architecture Patterns

### Existing File Organization

```
e2e/
├── contact-form.spec.ts          # EXISTS — needs journey upgrade
├── newsletter-signup.spec.ts     # EXISTS — needs DB verification step
├── tools.spec.ts                 # EXISTS — smoke level, phase 49 work
├── locations.spec.ts             # EXISTS — smoke level, phase 49 work
├── user-flows-validation.spec.ts # EXISTS — general user flows
├── user-flows-secondary.spec.ts  # EXISTS — secondary flows
├── visual-regression.spec.ts     # EXISTS — visual regression
├── api/                          # EXISTS — API-level tests
│   ├── contact-form-submission.spec.ts
│   ├── newsletter-signup.spec.ts (not the same as top-level)
│   └── ...
├── test-helpers.ts               # Shared navigation helper
└── test-logger.ts                # Structured step logging
```

**New file needed:** `e2e/blog.spec.ts` — blog listing + slug journey

### Pattern 1: Journey Test Structure (from existing contact-form.spec.ts)

```typescript
// Source: e2e/contact-form.spec.ts (existing)
import { test, expect, type TestInfo } from '@playwright/test'
import { createTestLogger } from './test-logger'

test.describe('Contact Form Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
    await page.locator('form').waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should submit successfully with real email', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)
    // fill fields → submit → assert FormSuccessMessage
  })
})
```

### Pattern 2: Form Field Selectors (confirmed from ContactForm.tsx)

The ContactForm uses TanStack Form with shadcn/ui field components. Input IDs are:
- `#firstName`, `#lastName`, `#email`, `#phone`, `#company`, `#message`
- Select triggers use `[role="combobox"]` — click trigger then `[role="option"]` items
- Submit button: `button[type="submit"]` with label "Submit" (loadingLabel: "Submitting...")

**Success state (confirmed from ContactForm.tsx + FormSuccessMessage.tsx):**
- On success, the `<form>` is replaced by `FormSuccessMessage`
- Title renders: **"Thank you"** (h2 element)
- Message renders: **"Form submitted successfully, we will get back to you soon"**
- Reset button label: **"Send another message"**
- The `<form>` element disappears on success — it is NOT replaced inside the form

**Selector for success assertion:**
```typescript
// Wait for FormSuccessMessage — form is replaced, not updated
await expect(page.locator('h2', { hasText: 'Thank you' })).toBeVisible({ timeout: 15000 })
await expect(page.locator('text=Form submitted successfully, we will get back to you soon')).toBeVisible()
```

**Validation error check (from existing spec):**
```typescript
// Submit empty form — form stays visible, no "Thank you"
await page.locator('button[type="submit"]').click()
await expect(page.locator('form')).toBeVisible()
const successVisible = await page.locator('h2', { hasText: 'Thank you' }).isVisible().catch(() => false)
expect(successVisible).toBe(false)
```

### Pattern 3: Newsletter Selector Strategy (confirmed from NewsletterSignup.tsx)

The `NewsletterSignup` component on the homepage renders:
- Email input: `input[type="email"]` with `id="newsletter-email"` and `aria-label="Email address"`
- Submit button: `button[type="submit"]` with text "Subscribe" / "Subscribing..." / "Subscribed" (with Check icon)
- Success message: `"Thank you! Check your email to confirm your subscription."` (aria-live="polite")
- Error message: mutation error rendered in `role="alert"`

The newsletter component is in `src/app/page.tsx` (homepage). It is the only page with `NewsletterSignup` (confirmed by grep — only 2 files import it: the component itself and `src/app/page.tsx`).

**Precise selectors:**
```typescript
const emailInput = page.locator('#newsletter-email')
const subscribeButton = page.locator('button[type="submit"]', { hasText: /subscribe/i })
// Success:
await expect(page.locator('text=Thank you! Check your email to confirm your subscription.')).toBeVisible()
// OR: button text becomes "Subscribed"
```

### Pattern 4: Blog Card Selectors (confirmed from BlogPostCard.tsx + blog/page.tsx)

The blog listing at `/blog` renders:
- Each post as `<article>` containing `<Link href="/blog/{slug}">` wrapping a Card
- Post card h3 contains the post title
- Featured section: `<h2>Featured Articles</h2>` (only if featured posts exist)
- All articles section: `<h2>All Articles</h2>`
- Empty state: `<p>No articles found. Check back soon for new content!</p>` (inside Card)

**Selector for post cards:**
```typescript
// All blog post cards are article elements with links to /blog/*
const postLinks = page.locator('article a[href^="/blog/"]')
await expect(postLinks.first()).toBeVisible()
const count = await postLinks.count()
expect(count).toBeGreaterThanOrEqual(1)
```

**Clicking through to slug page:**
```typescript
// Get href of first post card, navigate via click
const firstCard = page.locator('article a[href^="/blog/"]').first()
const href = await firstCard.getAttribute('href')
await firstCard.click()
// Assert on slug page: h1 visible, no 404
await page.waitForLoadState('networkidle')
await expect(page.locator('h1')).toBeVisible()
await expect(page.locator('body')).not.toContainText(/not found/i)
// Body content: BlogPostContent renders HTML in prose wrapper
await expect(page.locator('article')).toBeVisible()
```

### Pattern 5: Newsletter DB Verification

The newsletter API route is `/api/newsletter/subscribe` (POST). The `newsletterSubscribers` table is in Neon. There is **no existing GET endpoint** for querying subscriber status from the browser.

**Options for DB verification:**
1. Check via `/api/health` — exists but returns generic health info, not subscriber data
2. Add a minimal query endpoint (creates new route, not YAGNI-aligned)
3. Use the Neon MCP `run_sql` within the test setup/teardown (not possible from Playwright)
4. Accept the newsletter API 200 response as DB confirmation — the API does `db.insert` and returns success only if insert succeeded; no separate verification step needed

**Recommendation:** Trust the API response. The subscribe API (confirmed from route.ts) does a real DB insert and returns `successResponse` only on successful DB write. A 200 response from `/api/newsletter/subscribe` IS the DB confirmation. The E2E test should intercept/monitor the API response status to confirm 200, not query the DB separately.

If the user still wants DB verification, the cleanest approach is to use Playwright's `page.waitForResponse()` to confirm the POST to `/api/newsletter/subscribe` returned 200:
```typescript
const [response] = await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/newsletter/subscribe') && resp.status() === 200),
  subscribeButton.click()
])
expect(response.status()).toBe(200)
```

### Pattern 6: Cleanup After Newsletter Test

The newsletter API uses upsert (`onConflictDoUpdate`) on the email field. Re-running with the same email will reactivate the subscriber — no duplicate rows. This means:
- Cleanup is **optional** — re-runs are idempotent
- If cleanup is desired, it requires either a DELETE API endpoint (doesn't exist) or Neon MCP (not callable from Playwright)
- Recommendation: No cleanup step. Upsert behavior means the test can run repeatedly with the same email safely.

---

## Critical Finding: DB State for Placeholder Detection

**Query result from Neon (confirmed 2026-02-24):**

All 8 published posts with their slugs:

| Slug | Title | Origin |
|------|-------|--------|
| `small-business-website-cost-2025` | "Small Business Website Cost in 2025: What to Expect" | Phase 42 placeholder |
| `how-to-increase-website-conversion-rates-2025-guide` | "How to Increase Website Conversion Rates: 2025 Guide" | Phase 42 placeholder |
| `beyond-just-works-why-businesses-need-websites-that-dominate` | "Beyond \"Just Works\": Why Businesses Need Websites That Dominate" | Phase 42 placeholder |
| `how-ai-automation-can-save-your-business-20-hours-per-week` | "How AI Automation Can Save Your Business 20+ Hours Per Week" | n8n auto-generated |
| `the-complete-guide-to-building-a-modern-business-website-in-2025` | "The Complete Guide to Building a Modern Business Website in 2025" | n8n auto-generated |
| `why-your-business-needs-a-custom-crm-integration` | "Why Your Business Needs a Custom CRM Integration" | n8n auto-generated |
| `5-signs-your-website-is-costing-you-customers` | "5 Signs Your Website is Costing You Customers" | n8n auto-generated |
| `kubernetes-for-small-business-is-it-worth-it` | "Kubernetes for Small Business: Is It Worth It?" | n8n auto-generated |

**Phase 42 placeholder slugs (confirmed from Phase 42 SUMMARY.md + DB query):**
```typescript
const PLACEHOLDER_SLUGS = [
  'small-business-website-cost-2025',
  'how-to-increase-website-conversion-rates-2025-guide',
  'beyond-just-works-why-businesses-need-websites-that-dominate',
]
```

**Test assertion for "real post" detection:**
```typescript
// Get all post card links
const postLinks = page.locator('article a[href^="/blog/"]')
const hrefs = await postLinks.evaluateAll(els => els.map(el => el.getAttribute('href') ?? ''))
const slugs = hrefs.map(href => href.replace('/blog/', ''))

// At least one non-placeholder slug must be present
const realPostCount = slugs.filter(slug => !PLACEHOLDER_SLUGS.includes(slug)).length
expect(realPostCount).toBeGreaterThanOrEqual(1)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DB verification | Custom subscriber query endpoint | `page.waitForResponse()` monitoring API response | API already returns 200 only on successful insert |
| Browser/API communication | Custom fetch interceptor | Playwright `page.route()` + `page.waitForResponse()` | Built into Playwright |
| Waiting for async React state | `page.waitForTimeout()` | `page.waitForResponse()`, element locator `.waitFor()` | Timeout-based waits are flaky |

**Key insight:** The existing tests use `page.waitForTimeout(3000)` liberally. This is the primary source of flakiness. Journey tests should use event-driven waits instead.

---

## Common Pitfalls

### Pitfall 1: Contact Form Sends Real Emails
**What goes wrong:** Every test run with `rhudson42@yahoo.com` sends a real Resend email to the user.
**Why it happens:** The contact form API (`/api/contact`) calls Resend when `isResendConfigured()` returns true.
**How to avoid:** This is a locked decision — user accepts it. Document it clearly in the test file. Limit happy-path tests to one run, not multiple. Consider using `page.route()` to intercept the API call if real email sending becomes disruptive, but the user has accepted it.
**Warning signs:** Inbox flooding if tests are run in a loop.

### Pitfall 2: Contact Form Already Has Tests — Don't Duplicate
**What goes wrong:** Writing an entirely new contact-form submission test that duplicates the existing one.
**Why it happens:** The researcher found `e2e/contact-form.spec.ts` already has a `should successfully submit form with valid data` test — but it uses `john.doe@example.com` (fake email) and has a soft assertion (`await expect(page.locator('body')).toBeVisible()`).
**How to avoid:** The existing spec should be updated in-place: change the email to `rhudson42@yahoo.com` and strengthen the success assertion to check for the actual `"Thank you"` h2 text.

### Pitfall 3: Newsletter Form Selects Wrong Email Input
**What goes wrong:** `page.locator('input[type="email"]').first()` may match the wrong field if other email inputs exist on the page.
**Why it happens:** The homepage may have multiple email-capable inputs.
**How to avoid:** Use the explicit `#newsletter-email` ID (confirmed from NewsletterSignup.tsx).

### Pitfall 4: Blog Post Cards Use Client Component
**What goes wrong:** Blog post cards may not render immediately after `networkidle` if JavaScript hydration lags.
**Why it happens:** `BlogPostCard` is a `'use client'` component. The blog page itself is a Server Component that renders cards, so initial HTML contains the article elements — hydration only affects interactivity.
**How to avoid:** The cards are in the initial server-rendered HTML. `waitForLoadState('networkidle')` is sufficient. No special waits needed.

### Pitfall 5: Contact Form Success Replaces the Form Element
**What goes wrong:** Test waits for success text inside the `<form>` — but the form is completely replaced by `FormSuccessMessage` on success.
**Why it happens:** `ContactForm` renders either `<FormSuccessMessage>` OR the `<form>`, not both. When `showSuccess === true`, the form is gone.
**How to avoid:** Assert that `<h2>Thank you</h2>` is visible rather than asserting on text inside the form. Also assert `form` is no longer visible. Do NOT use `page.locator('form text=...')`.

### Pitfall 6: Select Dropdowns Use Radix UI
**What goes wrong:** `page.fill('#service', 'web-development')` fails silently — Radix Select is not a native `<select>`.
**Why it happens:** The form uses `field.SelectField` which renders a Radix UI Select with `role="combobox"`.
**How to avoid:** Click the combobox trigger by ID, then click the option by `[role="option"]` text. Pattern confirmed from existing contact-form.spec.ts.

---

## Code Examples

### Contact Form Happy Path (journey-level)
```typescript
// Source: synthesized from ContactForm.tsx + existing contact-form.spec.ts
test('should submit contact form and display success message', async ({ page }, testInfo: TestInfo) => {
  const logger = createTestLogger(testInfo.title)

  await page.goto('/contact')
  await page.locator('form').waitFor({ state: 'visible', timeout: 15000 })

  // Fill required text fields
  await page.fill('#firstName', 'Richard')
  await page.fill('#lastName', 'Hudson')
  await page.fill('#email', 'rhudson42@yahoo.com')
  await page.fill('#message', 'This is an automated E2E test submission. Please disregard.')
  logger.step('Filled required fields')

  // Submit (dropdowns have defaults — no need to select unless required)
  await page.locator('button[type="submit"]').click()
  logger.step('Submitted form')

  // FormSuccessMessage replaces the form
  await expect(page.locator('h2', { hasText: 'Thank you' })).toBeVisible({ timeout: 15000 })
  await expect(page.locator('text=Form submitted successfully, we will get back to you soon')).toBeVisible()
  logger.complete('Success message visible')
})
```

### Blog Listing + Slug Journey
```typescript
// Source: synthesized from blog/page.tsx + BlogPostCard.tsx + DB query results
const PLACEHOLDER_SLUGS = [
  'small-business-website-cost-2025',
  'how-to-increase-website-conversion-rates-2025-guide',
  'beyond-just-works-why-businesses-need-websites-that-dominate',
]

test('should show real (non-placeholder) posts on /blog', async ({ page }) => {
  await page.goto('/blog')
  await page.waitForLoadState('networkidle')

  const postLinks = page.locator('article a[href^="/blog/"]')
  await expect(postLinks.first()).toBeVisible()

  const hrefs = await postLinks.evaluateAll(els =>
    els.map(el => el.getAttribute('href') ?? '')
  )
  const slugs = hrefs.map(href => href.replace('/blog/', ''))
  const realCount = slugs.filter(s => !PLACEHOLDER_SLUGS.includes(s)).length
  expect(realCount).toBeGreaterThanOrEqual(1)
})

test('should navigate to a blog post slug and render content', async ({ page }) => {
  await page.goto('/blog')
  await page.waitForLoadState('networkidle')

  const firstCard = page.locator('article a[href^="/blog/"]').first()
  await firstCard.click()
  await page.waitForLoadState('networkidle')

  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('article')).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/not found/i)
})
```

### Newsletter Happy Path + API Confirmation
```typescript
// Source: synthesized from NewsletterSignup.tsx + subscribe/route.ts
test('should subscribe and confirm success message', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('#newsletter-email')
  await emailInput.scrollIntoViewIfNeeded()

  const [response] = await Promise.all([
    page.waitForResponse(resp =>
      resp.url().includes('/api/newsletter/subscribe') && resp.request().method() === 'POST'
    ),
    (async () => {
      await emailInput.fill('rhudson42@yahoo.com')
      await page.locator('button[type="submit"]').filter({ hasText: /subscribe/i }).click()
    })()
  ])

  // API must return 200 (means DB insert succeeded)
  expect(response.status()).toBe(200)

  // UI success message
  await expect(
    page.locator('text=Thank you! Check your email to confirm your subscription.')
  ).toBeVisible({ timeout: 10000 })
})
```

---

## Existing Test Files — Status Assessment

| File | Status | Phase 52 Action |
|------|--------|-----------------|
| `e2e/contact-form.spec.ts` | Has 9 tests — submit test uses fake email, soft assertion | Update submit test: use `rhudson42@yahoo.com`, assert `h2[text=Thank you]` |
| `e2e/newsletter-signup.spec.ts` | Has tests — uses throwaway emails, no DB verification | Add one new journey test with real email + `page.waitForResponse()` for API 200 |
| `e2e/blog.spec.ts` | Does NOT exist | Create new file with listing + slug tests |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 |
| Config file | `playwright.config.ts` (root) |
| Quick run command | `pnpm test:e2e:fast` (chromium only) |
| Full suite command | `pnpm test:e2e` |
| Estimated runtime | ~60-90 seconds (network-dependent due to real email + DB) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-v3-06 | Contact form fills, submits, shows "Thank you" | E2E journey | `pnpm test:e2e:fast --grep "Contact Form"` | Update existing |
| REQ-v3-06 | Contact form shows errors on empty submit | E2E journey | `pnpm test:e2e:fast --grep "Contact Form"` | Exists already |
| REQ-v3-06 | Newsletter submits, success message visible, API 200 | E2E journey | `pnpm test:e2e:fast --grep "Newsletter"` | Add to existing |
| REQ-v3-01 | /blog shows at least 1 real (non-placeholder) post | E2E journey | `pnpm test:e2e:fast --grep "Blog"` | Wave 0 gap |
| REQ-v3-01 | /blog/[slug] renders post title + content, no 404 | E2E journey | `pnpm test:e2e:fast --grep "Blog"` | Wave 0 gap |

### Wave 0 Gaps (must be created before implementation)
- [ ] `e2e/blog.spec.ts` — covers REQ-v3-01 blog listing + slug journey

*(All other gaps are updates to existing files, not new files)*

---

## Open Questions

1. **Does the contact form submit in test env without Resend configured?**
   - What we know: `contact/route.ts` has an `else` branch when `!isResendConfigured()` that returns `"Form submitted successfully (test mode - email service not configured)"` — a different success string
   - What's unclear: Is `RESEND_API_KEY` set in the dev `.env.local`? If yes, real emails send. If no, the test mode response appears.
   - Recommendation: Confirm by checking `.env.local` during execution. The success assertion should handle both cases OR use a regex: `await expect(page.locator('h2', { hasText: 'Thank you' })).toBeVisible()` — FormSuccessMessage shows "Thank you" regardless of which API response came back (the success state is triggered by `mutation.onSuccess` not the response message string).
   - **Resolution:** ContactForm.tsx sets `showSuccess = true` on `onSubmit` resolution (after `mutation.mutateAsync` succeeds), which renders `FormSuccessMessage` with hardcoded title "Thank you". This is independent of the API response message. The h2 "Thank you" assertion is reliable.

2. **Newsletter: will rhudson42@yahoo.com already be subscribed?**
   - What we know: API returns 400 "Email already subscribed" if the email is active in DB; `onConflictDoUpdate` would handle re-subscription for inactive ones
   - What's unclear: Current subscriber status of rhudson42@yahoo.com in Neon
   - Recommendation: The test should handle both 200 (new subscription) and 400 (already subscribed) as valid outcomes for the DB-confirmation assertion. Or: accept that re-running the test may get 400 from the API, and assert UI handles this gracefully. The newsletter success state in the UI only triggers on `mutation.isSuccess` — a 400 response makes `mutation.isError` true.
   - **Practical fix:** Use a unique email per test run (e.g., `rhudson42+e2e-{timestamp}@yahoo.com`) if the locked decision allows. If the locked decision strictly requires `rhudson42@yahoo.com`, the test must handle the "already subscribed" case as an acceptable alternative outcome.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `page.waitForTimeout(3000)` | `page.waitForResponse()` + `.waitFor()` locators | Eliminates flakiness from arbitrary delays |
| Generic email assertions (`text=/Thank you/i`) | Exact text from component source | Eliminates false positives from unrelated text |
| Soft assertions (`expect(body).toBeVisible()`) | Hard assertions on specific success elements | Tests actually verify behavior |

---

## Sources

### Primary (HIGH confidence)
- Direct file reads: `e2e/contact-form.spec.ts`, `e2e/newsletter-signup.spec.ts`, `e2e/tools.spec.ts`, `e2e/locations.spec.ts`
- Direct file reads: `playwright.config.ts`, `e2e/test-helpers.ts`, `e2e/test-logger.ts`
- Direct file reads: `src/components/forms/ContactForm.tsx`, `src/components/forms/NewsletterSignup.tsx`, `src/components/forms/FormSuccessMessage.tsx`
- Direct file reads: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/components/blog/BlogPostCard.tsx`
- Direct file reads: `src/app/api/contact/route.ts`, `src/app/api/newsletter/subscribe/route.ts`
- Direct file reads: `src/lib/schemas/emails.ts`, `src/lib/blog.ts`
- Neon MCP `run_sql` query against project `soft-bush-38066584`: confirmed 8 published blog posts, 3 placeholder slugs
- Phase summary reads: `42-01-SUMMARY.md`, `46-01-SUMMARY.md`, `49-01-SUMMARY.md`
- Planning docs: `CONTEXT.md`, `REQUIREMENTS.md`, `STATE.md`

### Secondary (MEDIUM confidence)
- `.planning/config.json` — `nyquist_validation` not present; standard validation architecture section included based on existing Playwright setup

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all infrastructure confirmed by direct file reads
- Architecture patterns: HIGH — all selectors confirmed from component source code
- DB state: HIGH — confirmed via live Neon MCP query
- Pitfalls: HIGH — identified directly from reading existing test file patterns and component implementations

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable infrastructure; blog DB state may change as n8n pipeline generates more posts — but placeholder slug list is fixed)
