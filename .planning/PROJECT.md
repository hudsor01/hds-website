# Business Website Cleanup & Simplification

## What This Is

A Next.js 16 business website with tool generators (paystub, invoice, timesheet) and a contact form. This project is a comprehensive cleanup effort to remove all unnecessary code, dependencies, and integrations while preserving working functionality. The goal is a leaner, faster, more maintainable codebase without losing any features that actually work.

## Core Value

Working tools (paystub/invoice/timesheet generators) and contact form stay functional while everything else becomes dramatically simpler. If it's not essential to these features, it gets removed.

## Requirements

### Validated

- ✓ Contact form with email delivery (Resend integration) — existing
- ✓ Tool pages: paystub, invoice, timesheet generators — existing
- ✓ Next.js 16 App Router with React Server Components — existing
- ✓ TypeScript strict mode for type safety — existing
- ✓ Tailwind CSS utility-first styling — existing
- ✓ PDF generation capability (Puppeteer) — existing
- ✓ Server Actions for form processing — existing
- ✓ Vercel deployment configuration — existing

### Active

- [ ] Remove unused dependencies from package.json (audit all 130+ packages)
- [ ] Remove dead code (unused components, functions, exports, commented code)
- [ ] Remove or simplify over-engineered integrations (unused analytics features, unnecessary auth)
- [ ] Eliminate code duplication (DRY violations identified in concerns)
- [ ] Remove unused files and directories
- [ ] Simplify component structure (remove unnecessary abstractions)
- [ ] Optimize bundle size (tree-shake unused code, reduce first load JS)
- [ ] Streamline build process (faster development feedback loop)
- [ ] Clean up configuration files (remove unused config)
- [ ] Audit and remove unused Supabase integration (if auth not actually used)

### Out of Scope

- Changing core framework (Next.js 16, React 19) — constraint
- Removing TypeScript or relaxing strict mode — constraint
- Breaking existing tool page URLs (/paystub, /invoice, /timesheet) — constraint
- Removing deployment configuration (Vercel setup) — must preserve
- Adding new features or functionality — cleanup only, no new builds
- Rewriting working code that's already clean — don't fix what isn't broken
- Removing testing infrastructure without replacement — may simplify but not eliminate safety
- Architectural redesign — simplify existing patterns, don't reinvent

## Context

**Existing Codebase State:**
- Full-stack Next.js 16 application with 20+ TypeScript files
- 130+ npm dependencies (many potentially unused)
- Comprehensive UI component library (Radix UI, Lucide icons)
- Supabase integration set up but authentication may not be actively used
- Vercel Analytics and Speed Insights installed
- PDF generation via Puppeteer for tool outputs
- Testing infrastructure: Playwright E2E + Bun unit tests
- Codebase analysis completed (see `.planning/codebase/` for detailed findings)

**Technical Debt Identified:**
- God function anti-patterns in complex handlers
- Hardcoded configuration values scattered throughout
- Large globals.css file with all utilities
- Potential unused dependencies (130+ packages to audit)
- Code duplication in contact form logic
- Missing .env.example template
- Over-engineered integrations doing nothing (analytics features disabled)

**Current Working Features:**
- Contact form submits successfully, sends email via Resend
- Paystub generator creates PDFs with user input
- Invoice generator produces professional invoices
- Timesheet calculator computes hours and rates
- All tools accessible at clean URLs without authentication

## Constraints

- **Tech Stack**: Must stay on Next.js 16 + React 19 (no framework changes)
- **Type Safety**: TypeScript strict mode is non-negotiable (preserve all type safety)
- **URL Stability**: Tool pages must remain accessible at current paths (no breaking routes)
- **Deployment**: Vercel configuration and build setup must be preserved (no deployment changes)
- **Feature Parity**: All working features must continue working after cleanup (zero regression)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Forms: TanStack Query + TanStack Form** | Client-side validation (instant feedback), no server costs for validation, standardized pattern | ✅ Adopted 2026-01-09 |
| **Data Fetching: TanStack Query only** | Client-side caching reduces expensive server requests, consistent pattern across app | ✅ Adopted 2026-01-09 |
| **URL State: nuqs standardized** | Type-safe URL state, client-side syncing (no server round-trips), already in 7 tools | ✅ Adopted 2026-01-09 |
| **Cost Optimization: Client-side > Server** | Vercel charges for Server Component compute, client ops run free on user's browser | ✅ Principle established |
| Remove Server Actions | Server Actions replaced by TanStack Query mutations (cheaper, client-side) | ✅ contact.ts removed, ttl-calculator.ts migration pending |
| Aggressive dependency pruning | 130+ packages likely includes many unused libraries, focus on redundancy elimination | 🔄 In Progress (Plan 1: 7 removed) |
| Remove Supabase auth if unused | User didn't list auth as core feature to preserve | — Pending |
| Keep deployment config untouched | Only explicit constraint during cleanup discussion | ✅ Preserved |
| Simplify testing setup | User didn't preserve testing infrastructure in boundaries | — Pending |

---
*Last updated: 2026-01-09 after initialization*
