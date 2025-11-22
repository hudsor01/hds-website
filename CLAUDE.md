# CLAUDE.md

Guidance for Claude Code when working with this Next.js 15 production application.

## MANDATORY RULES

### NO EMOJIS
- Never use emojis unless user explicitly requests them
- Use Heroicons/Lucide React for UI icons instead

### CORE PRINCIPLES
- **SIMPLICITY**: Use native features first. No unnecessary abstractions.
- **TYPE SAFETY**: TypeScript strict mode. NO `any` types. Use Zod for runtime validation.
- **SERVER-FIRST**: Default to Server Components. Client components ONLY for hooks/events/browser APIs.
- **PERFORMANCE**: Images as WebP, monitor bundle size, lazy load heavy components.

## NEXT.JS 15 PATTERNS

### File Structure
```
app/
├── layout.tsx              # Root layout (server component)
├── page.tsx                # Routes (server by default)
├── (tools)/                # Route groups (URL: /paystub not /tools/paystub)
├── actions/contact.ts      # Server Actions
└── api/contact/route.ts    # API routes
```

### Server Components (Default)
```typescript
// NO 'use client' needed - async/await supported
export default async function Page() {
  const data = await fetchData()  // Direct server-side data fetch
  return <div>{data}</div>
}
```

### Client Components (Explicit)
```typescript
// ONLY add 'use client' for: hooks, event handlers, browser APIs
'use client'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Server Actions
```typescript
// app/actions/contact.ts
'use server'

export async function submitForm(
  _prevState: State | null,
  formData: FormData
): Promise<State> {
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { error: result.error.message }

  await sendEmail(result.data)
  return { success: true }
}

// Use with useActionState in client component
'use client'
const [state, formAction] = useActionState(submitForm, null)
<form action={formAction}>...</form>
```

### Metadata (Required for all pages)
```typescript
export const metadata: Metadata = {
  title: "Page Title",
  description: "120-160 character SEO description",
  openGraph: { title, description, url, images },
  twitter: { card: "summary_large_image" }
}

// Structured data in <script> tag, NOT metadata.other
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

## REACT PATTERNS

### Hooks Usage
```typescript
// Local state
const [isOpen, setIsOpen] = useState(false)

// Forms with Server Actions
const [state, formAction] = useActionState(submitForm, null)

// Submit button pending state
const { pending } = useFormStatus()

// Refs for non-reactive values
const rafId = useRef<number | null>(null)

// Stable callbacks
const handleClick = useCallback(() => {}, [deps])

// Effects ALWAYS cleanup
useEffect(() => {
  const timer = setTimeout(fn, delay)
  return () => clearTimeout(timer)  // Required
}, [deps])
```

### Context Pattern
```typescript
const Context = createContext<API | undefined>(undefined)

export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial)
  return <Context.Provider value={{ state }}>{children}</Context.Provider>
}

export function useContext() {
  const context = useContext(Context)
  if (!context) throw new Error('Must be used within Provider')
  return context
}
```

## TYPESCRIPT STANDARDS

### Configuration (DO NOT CHANGE)
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true
}
```

### Type vs Interface
```typescript
// INTERFACE for component props and objects
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

// TYPE for unions, Zod inference
type Status = 'idle' | 'loading' | 'success' | 'error'
type FormData = z.infer<typeof formSchema>
```

### Zod Validation
```typescript
// lib/schemas/contact.ts
import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().min(1).max(50),
  email: z.string().email(),
  message: z.string().min(10)
})

export type ContactData = z.infer<typeof contactSchema>

// Use in Server Actions
const result = contactSchema.safeParse(data)
if (!result.success) return { error: result.error.issues[0].message }
```

### Error Handling
```typescript
// utils/errors.ts - use this helper
export function castError(error: unknown): Error {
  if (error instanceof Error) return error
  return new Error(String(error))
}

// Usage
try {
  await operation()
} catch (error) {
  logger.error('Failed', castError(error))
  return { error: 'Operation failed' }
}
```

## STYLING GUIDELINES

### Tailwind-First
```typescript
// Direct utilities
<div className="flex items-center gap-4 px-6 py-4 rounded-lg bg-cyan-400/10">

// Semantic CSS for repeated patterns
// globals.css
.glass-card {
  @apply bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl;
}

// Custom spacing utilities
.mb-heading { margin-bottom: 1.5rem; }
.section-spacing { padding-block: 5rem; }
```

### Design Tokens (DO NOT modify)
```css
@theme inline {
  --color-brand-cyan: oklch(0.773 0.171 187.163);
  --spacing-section: 5rem;
  --text-hero: var(--text-6xl);
}
```

## COMPONENT PATTERNS

### Organization
```
components/
├── layout/          # NavbarLight, Footer
├── forms/           # FormField, FormHeader
├── ui/              # Button, Input (base)
├── [feature]/       # Feature-specific
└── Toast.tsx        # Shared components
```

### Structure
```typescript
// 1. Imports
import type { Metadata } from 'next'
import { useState } from 'react'

// 2. Types
interface Props {
  title: string
}

// 3. Constants
const MAX_ITEMS = 10

// 4. Component
export default function Component({ title }: Props) {
  return <div>{title}</div>
}
```

### Naming
```typescript
// Components: PascalCase
ContactForm.tsx

// Utils: kebab-case
seo-utils.ts

// Constants: UPPER_SNAKE_CASE
const TOAST_DURATION_DEFAULT = 5000

// Functions: camelCase
function calculateTotal() {}
```

## VALIDATION & FORMS

### Schemas Location
```
lib/schemas/
├── common.ts       # Reusable (email, phone)
├── contact.ts      # Form schemas
```

### Form Pattern
```typescript
// Server Action
'use server'
export async function submit(
  _: State | null,
  formData: FormData
): Promise<State> {
  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { error: result.error.issues[0].message }

  await processData(result.data)
  return { success: true }
}

// Client Component
'use client'
export default function Form() {
  const [state, formAction] = useActionState(submit, null)

  return (
    <form action={formAction}>
      <input type="text" name="field" required />
      {state?.error && <p className="text-red-400">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
```

## TESTING

### Unit Tests (Vitest)
```typescript
// tests/unit/validation.test.ts
import { describe, it, expect } from 'vitest'
import { schema } from '@/lib/schemas/contact'

describe('Validation', () => {
  it('validates data', () => {
    const result = schema.safeParse({ email: 'test@example.com' })
    expect(result.success).toBe(true)
  })
})
```

### E2E Tests (Playwright)
```typescript
// e2e/contact.spec.ts
import { test, expect } from '@playwright/test'

test('submits form', async ({ page }) => {
  await page.goto('/contact')
  await page.fill('[name="email"]', 'test@example.com')
  await page.click('[type="submit"]')
  await expect(page.locator('text=Success')).toBeVisible()
})
```

### Commands
```bash
npm run test:unit           # Unit tests
npm run test:e2e:fast       # E2E (chromium only)
npm run test:all            # All checks
```

## PERFORMANCE

### Images
```typescript
// ALWAYS use Next.js Image
import Image from 'next/image'

<Image
  src="/logo.webp"
  alt="Description"
  width={200}
  height={50}
  priority  // Above-fold images
/>
```

### Code Splitting
```typescript
// Heavy components
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <p>Loading...</p>,
  ssr: false  // Client-only if needed
})
```

### Bundle Analysis
```bash
ANALYZE=true npm run build  # Check before large changes
# Keep first load JS under 180kB per page
```

## LOGGING & ANALYTICS

### Logger (NOT console.log)
```typescript
// ALWAYS use logger
import { logger } from '@/lib/logger'

logger.info('Event', { userId, action })
logger.error('Failed', error)
logger.debug('Debug')  // Dev only

// NEVER use console.log/warn/error
```

## ACCESSIBILITY

### Semantic HTML
```typescript
<main id="main-content">
  <nav aria-label="Main navigation">
  <section aria-labelledby="heading">
    <h2 id="heading">Title</h2>
```

### ARIA
```typescript
// Labels for interactive elements
<button aria-label="Close">
  <XIcon aria-hidden="true" />
</button>

// Live regions
<div role="alert" aria-live="assertive">
  Error message
</div>
```

## PRE-COMMIT CHECKLIST

- [ ] Pattern already exists? (Search first)
- [ ] Simplest solution?
- [ ] Native platform feature available?
- [ ] TypeScript strict passes?
- [ ] No console.log?
- [ ] Error handling with try/catch?
- [ ] useEffect cleanup?
- [ ] ARIA labels?
- [ ] Next.js Image for images?
- [ ] Meta description 120-160 chars?

## CRITICAL RULES

### NEVER
- ❌ Use `any` type
- ❌ Use console.log (use logger)
- ❌ Skip TypeScript types
- ❌ Inline styles (use Tailwind)
- ❌ Add 'use client' without reason
- ❌ Forget useEffect cleanup
- ❌ Skip error handling
- ❌ Use `<div>` for buttons
- ❌ Forget alt text
- ❌ Hard-code values

### ALWAYS
- ✅ Search first for existing patterns
- ✅ Validate at boundaries with Zod
- ✅ Type everything
- ✅ Semantic HTML + ARIA
- ✅ Clean up timers/listeners
- ✅ Handle errors gracefully
- ✅ Test keyboard navigation
- ✅ Check bundle size
- ✅ Use logger not console
- ✅ Constants for magic numbers

## INTEGRATIONS

### Email (Resend)
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'hello@hudsondigitalsolutions.com',
  to: [email],
  subject: subject,
  html: html
})
```

### Database (Supabase)
```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('table')
  .insert(record)

if (error) {
  logger.error('DB error', error)
  return { error: 'Failed' }
}
```

## FILE LOCATIONS

```
src/
├── app/              # Pages & API routes
├── components/       # React components
├── lib/              # Core utilities
│   ├── schemas/      # Zod schemas
│   ├── analytics.ts
│   ├── logger.ts
│   └── seo-utils.ts
├── types/            # TypeScript defs
├── hooks/            # Custom hooks
└── utils/            # Helpers

tests/                # Unit tests
e2e/                  # E2E tests
public/               # Static assets
```

## DEVELOPMENT

### Commands
```bash
npm run dev              # Dev server
npm run build           # Production build
npm run lint            # ESLint
npm run typecheck       # TypeScript
npm run test:all        # All checks
```

### Git Commits
```bash
# Before commit
npm run lint && npm run typecheck

# Message format
git commit -m "feat: Add feature

- Detailed change 1
- Detailed change 2"
```

---

**Core Values**: Simplicity, type safety, performance. When in doubt, choose the simplest solution. Delete code instead of adding when possible.
