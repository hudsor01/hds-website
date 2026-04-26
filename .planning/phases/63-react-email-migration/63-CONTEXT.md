# Phase 63: React Email v6 Migration - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning. Depends on phase 61 (BRAND export). Independent of phase 62.

<domain>
## Phase Boundary

Migrate every transactional email from raw HTML string concatenation to React Email v6 JSX components. Upgrade the installed dependency from the legacy `@react-email/render@2.0.4` (currently installed but unused) to the new unified `react-email@latest` package released 2026-04-17.

Each email component imports `BRAND` from `src/lib/_generated/brand.ts` for color values — phase 61's codegen pipeline is the consumer contract. After this phase, raw `<style>` strings and inline-hex email HTML are gone from `src/`.

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- **Package upgrade**: `bun remove @react-email/render` (the unused 2.0.4 install) and `bun add react-email@latest`. The optional `@react-email/ui` package (preview server) is added ONLY if we want the dev preview workflow; default decision: skip for now (we send via Resend, no preview server needed; can add later).
- **Imports**: every email file uses `import { ... } from 'react-email'` — no `@react-email/components`, no `@react-email/render`, no `@react-email/preview-server`.
- **Email components live at `src/emails/`** — keeps the `src/` convention. The default React Email dev server expects `emails/` at root; we override via config or `--dir` flag IF we add the dev server later. For now, the components are just imported by the route handlers / actions / scheduled-emails.ts.
- **Color sourcing**: every component imports `BRAND` from `@/lib/_generated/brand` and uses `BRAND.primary` / `BRAND.accent` / etc. in inline `style` props. The React Email Tailwind component is OPTIONAL — if used, its config mirrors the brand tokens. Recommend NOT using `<Tailwind>` for v4.1 — keeps dependency surface minimal and avoids a second source of truth for colors.
- **Resend send pattern**: replace `resend.emails.send({ html: '<raw HTML>' })` with `resend.emails.send({ react: <EmailComponent props /> })`. Resend's SDK calls react-email's render internally. Verify the SDK supports the `react` field — current installed version is `resend@6.12.2`, which does.
- **Shared components**: extract a small set of shared building blocks at `src/emails/_components/` (e.g., `BrandLayout`, `BrandHeading`, `BrandButton`, `BrandFooter`) so each template stays focused on content. NOT a deep abstraction — only what's repeated 3+ times.
- **Plan ordering**: 3 plans. Plan 01 = dependency swap + folder scaffold + ONE proof-of-concept email (newsletter welcome). Plan 02 = the 4 simple admin notifications. Plan 03 = the 3 complex emails (TTL calc result, calculator results, scheduled drip).

### Claude's Discretion

- Whether to add the dev preview server (`bun add @react-email/ui` + run `react-email dev`) — recommend deferring to a follow-up if the migration goes smoothly
- Whether to use `<Tailwind>` component for any specific email — only if it materially reduces inline-style duplication AND does NOT introduce a parallel color source
- Email component naming — recommend kebab-case files with PascalCase exports (`newsletter-welcome.tsx` exports `NewsletterWelcome`)
- Whether to keep escapeHtml() helper for user-supplied content — Yes; React Email JSX auto-escapes child text, but interpolated style props or html-allowed sections still need vetting

### Out of Scope

- Adding the React Email open-source editor (`@react-email/editor`) — separate concern
- Touching Resend SDK version or send retry logic
- Visual redesign of email content (this phase preserves the existing copy + layout, only changes the rendering technology)
- Migrating off Resend or adding additional email providers
- Creating new email templates that don't exist today

</decisions>

<specifics>
## Surfaces in Scope

### Dependency changes
- REMOVE: `@react-email/render` 2.0.4 (currently installed but ZERO imports — confirmed via grep)
- ADD: `react-email` (latest at execution time)
- OPTIONAL ADD: `@react-email/ui` (preview server) — defer

### Existing email senders (raw HTML strings to migrate)

| Send site | Current shape | Complexity | Plan |
|---|---|---|---|
| `src/app/api/newsletter/subscribe/route.ts` line 87 | Welcome email with unsubscribe link | Simple | 63-01 (POC) |
| `src/lib/contact-service.ts` line 219 | Contact form admin notification | Simple | 63-02 |
| `src/app/api/testimonials/submit/route.ts` line 95 | Testimonial admin notification | Simple | 63-02 |
| `src/app/api/calculators/submit/route.ts` line 201 | Calculator admin notification | Simple | 63-02 |
| `src/app/api/newsletter/subscribe/route.ts` line 117 | Newsletter admin notification | Simple | 63-02 |
| `src/app/api/calculators/submit/route.ts` lines 310-348 | Calculator submission RESULTS email (gradient header, value boxes, CTA) | Complex | 63-03 |
| `src/app/actions/ttl-calculator.ts` lines 306-407 | TTL calculator RESULT email (gradient header, table layout, multi-section) | Complex | 63-03 |
| `src/lib/scheduled-emails.ts` lines 255, 281, 282, 288 | Scheduled drip campaign (dynamic content blocks, conditional sections) | Complex | 63-03 |

### New files
- `src/emails/_components/brand-layout.tsx` — shared `<Html><Head><Body>` wrapper
- `src/emails/_components/brand-heading.tsx` — h1/h2/h3 styled with BRAND
- `src/emails/_components/brand-button.tsx` — CTA button styled with BRAND
- `src/emails/_components/brand-footer.tsx` — common footer (unsubscribe, address, contact email)
- `src/emails/newsletter-welcome.tsx`
- `src/emails/contact-admin-notification.tsx`
- `src/emails/testimonial-admin-notification.tsx`
- `src/emails/calculator-admin-notification.tsx`
- `src/emails/newsletter-admin-notification.tsx`
- `src/emails/calculator-results.tsx`
- `src/emails/ttl-calculator-results.tsx`
- `src/emails/scheduled-drip.tsx`

### Migrated send sites
Each site replaces its raw HTML construction with an import + JSX render:
```typescript
// Before:
await resend.emails.send({ from, to, subject, html: '<h1 style="color: #0891b2">...' })

// After:
import { NewsletterWelcome } from '@/emails/newsletter-welcome'
await resend.emails.send({ from, to, subject, react: <NewsletterWelcome email={email} /> })
```

</specifics>

<verification>
## Phase-Level Verification

After all plans complete:
- `grep -rn "@react-email/render\|@react-email/components" src/ package.json` returns ZERO matches (old packages gone)
- `grep -rn "from 'react-email'" src/emails/` shows the new imports
- `grep -rnE "#0891b2|#06b6d4|#0e7490" src/app/api/ src/app/actions/ src/lib/scheduled-emails.ts src/lib/contact-service.ts` returns ZERO matches (raw HTML cyan eliminated)
- `grep -rn "html: '" src/app/api/ src/app/actions/ src/lib/scheduled-emails.ts src/lib/contact-service.ts` returns ZERO matches (no raw HTML in send calls; all use `react:` prop)
- `bun run typecheck && bun run lint && bun run test:unit && bun run build` all pass
- One real email per send site triggered against a dev mailbox; visual confirmation that brand color is slate blue and layout is intact in Apple Mail OR Gmail web
- `package.json`: `react-email` in dependencies, `@react-email/render` removed
</verification>
