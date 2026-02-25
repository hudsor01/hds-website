# Phase 52: E2E Journey Test Completion - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Upgrade the E2E test suite from smoke-level to journey-level coverage. Add three new test journeys: (1) contact form submission, (2) blog listing + slug rendering with real post confirmation, (3) newsletter signup with DB confirmation. This phase closes REQ-v3-06 and partially closes REQ-v3-01.

</domain>

<decisions>
## Implementation Decisions

### Test environment setup
- Run against localhost dev server (not a deployed URL)
- Real Neon DB — no mocking. Phase goal requires confirming the actual blog pipeline works.
- Researcher to check existing `playwright.config.ts` for webServer config and report what's already there
- No CI integration this phase — tests run locally via `pnpm test:e2e`

### Contact form journey
- Full journey: navigate to contact page → fill all required fields → submit → assert success state
- Also test required field validation: submit empty form, assert error messages appear
- Use real email **rhudson42@yahoo.com** — actual Resend email will be sent during test runs
- Happy path data: use realistic test data (name, message) with the real email address

### Blog content assertions
- Assert at least 1 post card is visible on /blog (not an empty state)
- Blog slug journey: click a post card → assert the post detail page loads without error, title is visible, and some body content renders (no 404 or error page)
- **Fail if all visible posts look like placeholders**: researcher must identify actual placeholder post titles/slugs from the Phase 42 SUMMARY.md and DB state so the test can detect and reject placeholder-only content
- "Real post" means: title does not match known Phase 42 placeholder patterns

### Newsletter signup
- Locate the newsletter form (researcher to find the current implementation — location and behavior unknown)
- Full journey: enter email → submit → assert success/confirmation message
- Also verify signup was recorded: query the DB via an existing or minimal API route to confirm the email row exists
- Use a real email address from the known list (rhudson42@yahoo.com or similar) — user accepts that real subscriber rows will be created each test run

### Claude's Discretion
- Exact Playwright selector strategy (data-testid vs role vs text)
- Whether to add a cleanup step after newsletter test (delete test subscriber row)
- File organization within e2e/ (one file per journey or combined)
- Specific assertion text for success messages (researcher will find actual UI copy)

</decisions>

<specifics>
## Specific Ideas

- Contact form test email: **rhudson42@yahoo.com** (locked decision — real emails will be sent)
- Blog placeholder detection: delegate to researcher to read Phase 42 SUMMARY.md for actual placeholder titles/slugs
- Newsletter DB verification: prefer querying an existing API route if one exists; create a minimal one only if needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 52-e2e-journey-tests*
*Context gathered: 2026-02-24*
