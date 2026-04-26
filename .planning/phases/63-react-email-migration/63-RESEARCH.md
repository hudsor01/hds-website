# Phase 63: React Email v6 Migration - Research

**Researched:** 2026-04-26
**Domain:** React Email v6 (released 2026-04-17), Resend SDK integration
**Confidence:** HIGH (canonical sources cited by user)

<user_constraints>
## Locked Constraints (from CONTEXT.md)

- Upgrade to react-email v6 (unified package); remove unused @react-email/render 2.0.4
- Email components live at src/emails/
- Color sourcing via BRAND from @/lib/_generated/brand (phase 61 codegen)
- No <Tailwind> component (avoid second SoT)
- Resend send via `react:` prop (Resend renders internally)
</user_constraints>

<canonical_sources>
## Canonical References (provided by user)

- React Email 6.0 announcement: https://resend.com/blog/react-email-6
- Updating React Email guide: https://react.email/docs/getting-started/updating-react-email
- Automatic setup: https://react.email/docs/getting-started/automatic-setup
- React Email GitHub: https://github.com/resend/react-email
</canonical_sources>

<v6_api_surface>
## React Email v6 Public API (from canonical sources)

### Unified imports

```typescript
import {
  Body, Button, Container, Column, Font, Head, Heading, Hr, Html,
  Img, Link, Markdown, Preview, Row, Section, Tailwind, Text,
  render,  // returns Promise<string> (HTML)
  pretty   // formats rendered HTML
} from 'react-email'
```

### Render function

```typescript
import { render } from 'react-email'
import { NewsletterWelcome } from './emails/newsletter-welcome'

const html = await render(<NewsletterWelcome email="user@example.com" />)
// html is a complete HTML string, ready to send via any provider
```

### Resend integration (preferred — no manual render call)

```typescript
import { Resend } from 'resend'
import { NewsletterWelcome } from '@/emails/newsletter-welcome'

const resend = new Resend(env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@hudsondigitalsolutions.com',
  to: email,
  subject: 'Welcome',
  react: <NewsletterWelcome email={email} />  // Resend calls render() internally
})
```

The `react` field is available in Resend SDK v3+. The project has `resend@6.12.2` — supported.
</v6_api_surface>

<upgrade_sequence>
## Upgrade Sequence (canonical, from updating-react-email docs)

1. Remove old packages:
   ```bash
   bun remove @react-email/components @react-email/preview-server
   ```
   In THIS project, only `@react-email/render` is installed (not `@react-email/components`). The remove command becomes:
   ```bash
   bun remove @react-email/render
   ```

2. Install new packages:
   ```bash
   bun add react-email@latest
   ```
   Skip `@react-email/ui` for v4.1 (preview server not needed for production sending).

3. Update imports — N/A in this project because there are NO existing React Email imports to update. All emails are currently raw HTML strings. Each new component file is authored fresh against the new API.
</upgrade_sequence>

<email_component_pattern>
## Recommended Component Pattern (no Tailwind component)

```typescript
// src/emails/_components/brand-layout.tsx

import { Body, Container, Head, Html, Preview } from 'react-email'
import type { ReactNode } from 'react'
import { BRAND } from '@/lib/_generated/brand'

interface BrandLayoutProps {
  preview: string
  children: ReactNode
}

export function BrandLayout({ preview, children }: BrandLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Container style={{ maxWidth: '600px', padding: '24px', margin: '0 auto' }}>
          {children}
        </Container>
      </Body>
    </Html>
  )
}
```

```typescript
// src/emails/_components/brand-heading.tsx

import { Heading } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'

interface BrandHeadingProps {
  level?: 1 | 2 | 3
  children: string
}

export function BrandHeading({ level = 1, children }: BrandHeadingProps) {
  const fontSize = level === 1 ? '24px' : level === 2 ? '20px' : '16px'
  return (
    <Heading as={`h${level}` as 'h1' | 'h2' | 'h3'}
      style={{ color: BRAND.primary, fontSize, fontWeight: 600, marginBottom: '16px' }}>
      {children}
    </Heading>
  )
}
```

```typescript
// src/emails/_components/brand-button.tsx

import { Button } from 'react-email'
import { BRAND } from '@/lib/_generated/brand'

interface BrandButtonProps {
  href: string
  children: string
}

export function BrandButton({ href, children }: BrandButtonProps) {
  return (
    <Button href={href}
      style={{
        backgroundColor: BRAND.primary,
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '6px',
        fontWeight: 600,
        textDecoration: 'none'
      }}>
      {children}
    </Button>
  )
}
```

Concrete email example:

```typescript
// src/emails/newsletter-welcome.tsx

import { Section, Text } from 'react-email'
import { BrandLayout } from './_components/brand-layout'
import { BrandHeading } from './_components/brand-heading'
import { BRAND } from '@/lib/_generated/brand'

interface NewsletterWelcomeProps {
  email: string
}

export function NewsletterWelcome({ email }: NewsletterWelcomeProps) {
  return (
    <BrandLayout preview="Welcome to Hudson Digital Solutions">
      <BrandHeading level={1}>Welcome to Our Newsletter!</BrandHeading>
      <Text>Thanks for subscribing — you're in.</Text>
      <Section style={{ marginTop: '24px' }}>
        <Text style={{ fontSize: '12px', color: '#6b7280' }}>
          Don't want these? <a href={`https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(email)}`} style={{ color: BRAND.primary }}>Unsubscribe</a>
        </Text>
      </Section>
    </BrandLayout>
  )
}
```
</email_component_pattern>

<resend_send_pattern>
## Resend Integration

Send sites change from:
```typescript
await resend.emails.send({
  from: 'noreply@hudsondigitalsolutions.com',
  to: email,
  subject: 'Welcome',
  html: `<h1 style="color: #0891b2;">Welcome</h1>...`  // raw HTML
})
```

To:
```typescript
import { NewsletterWelcome } from '@/emails/newsletter-welcome'

await resend.emails.send({
  from: 'noreply@hudsondigitalsolutions.com',
  to: email,
  subject: 'Welcome',
  react: <NewsletterWelcome email={email} />  // Resend renders via react-email internally
})
```

Resend's `emails.send` accepts EITHER `html` OR `react` (mutually exclusive). When `react` is passed, Resend imports react-email's render function and converts to HTML before sending.

`text` field can be passed alongside `react` for clients that prefer plain text. React Email's `render(component, { plainText: true })` produces text output if needed for separate sites.
</resend_send_pattern>

<typescript_jsx_setup>
## JSX in TypeScript

The project's tsconfig already supports JSX (Next.js project). `src/emails/*.tsx` files compile without changes.

If any email file is imported by a Server Action or route handler that's NOT a `.tsx` file, the import works because the `.tsx` extension and JSX-returning function are still valid TypeScript. Next.js's bundler handles transpilation.

Type imports: `import type { ReactNode } from 'react'` for children props. The current `react@19.2.5` types are fully compatible with react-email v6 (built on React 18+).
</typescript_jsx_setup>

<risks>
## Risks & Open Questions

- **Resend `react` field behavior with attachments / replyTo / cc**: untested in this codebase. Verify each migrated send site's full options set is preserved when switching from `html:` to `react:`.
- **Markdown content**: scheduled-emails.ts may have user-authored markdown content (drip campaign body); React Email has a `<Markdown>` component for this — use it.
- **Email client preview text**: React Email's `<Preview>` component sets the inbox preview snippet. Each migrated email should have one.
- **Outlook desktop oklch question becomes moot**: we're using hex via BRAND, not oklch. No client-compat risk on color front.
- **Render at request time vs. build time**: react-email render is an async function — Resend calls it on every send. Performance is fine for transactional volume; if per-send latency matters, pre-render and cache (out of scope for v4.1).
- **No existing tests for email rendering**: phase 63 plans should add at least snapshot tests for one email component (verify the render output stays stable across react-email upgrades). Defer to a follow-up if scope balloons.
</risks>
