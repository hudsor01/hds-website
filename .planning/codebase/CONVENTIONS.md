# Coding Conventions

**Analysis Date:** 2026-01-10

## Code Style

**Formatting (Prettier):**
- Config: `.prettierrc.json`
- Indentation: Tabs (not spaces)
- Semicolons: No (omitted)
- Quotes: Single quotes for strings
- Trailing commas: ES5 (objects, arrays)
- Line width: 100 characters
- Arrow parens: Always (even single argument)
- Prose wrap: Always (markdown, etc.)

**Linting (ESLint):**
- Config: `eslint.config.mjs`
- Rules:
  - No `any` types (enforced)
  - Consistent type imports (`import type`)
  - Unused vars error (except `_` prefix)
  - React hooks rules enforced
  - No console.log (use logger instead)
- Run: `pnpm lint` or `bun lint`

**TypeScript:**
- Config: `tsconfig.json`
- Strict mode: Enabled (all strict checks on)
- Target: ESNext
- Module: ESNext
- No implicit any: Enforced
- Strict null checks: Enforced
- Path aliases: `@/*` → `src/*`

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (ContactForm.tsx)
- Utilities/functions: `kebab-case.ts` (seo-utils.ts)
- Types: `kebab-case.ts` or co-located with component
- Tests: `*.test.ts` or `*.spec.ts`
- Constants: Match parent module name or descriptive kebab-case

**Variables:**
- Regular variables: `camelCase` (userData, isLoading)
- Constants: `UPPER_SNAKE_CASE` (MAX_RETRIES, API_URL)
- Boolean variables: Prefix with `is`, `has`, `should` (isLoading, hasError)
- Private/internal: Prefix with `_` (optional, indicates unused)

**Functions:**
- Regular functions: `camelCase` (calculateTotal, formatDate)
- React components: `PascalCase` (ContactForm, SubmitButton)
- Server Actions: `camelCase` with action verb (submitContactForm)
- Event handlers: Prefix with `handle` (handleSubmit, handleClick)
- Boolean functions: Prefix with `is`, `has`, `can` (isValid, canEdit)

**Types/Interfaces:**
- Interfaces: `PascalCase` (User, ContactFormData)
- Type aliases: `PascalCase` (ActionState, EmailConfig)
- Generic types: Single uppercase letter or descriptive (T, TData, TResponse)
- Props types: Component name + `Props` (ContactFormProps)

**Components:**
- Main components: Descriptive noun (ContactForm, CTAButton)
- Layout components: Noun + "Layout" or descriptive (NavbarLight, Footer)
- Page components: Feature name + "Page" or just `page.tsx`
- Form components: Feature + "Form" (ContactForm, PaystubForm)

## Common Patterns

**Component Structure:**
```typescript
import type { ComponentProps } from './types'
import { useState } from 'react'
import { ExternalDependency } from 'package'
import { InternalUtil } from '@/lib/util'

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Constants (if any)
const DEFAULT_VALUE = 100

// Component
export function Component({ prop }: ComponentProps) {
  // State
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // ...
  }, [])
  
  // Handlers
  const handleEvent = () => {
    // ...
  }
  
  // Render
  return <div>...</div>
}

// Sub-components (if small and only used here)
function SubComponent() {
  return <div>...</div>
}
```

**Server Action Pattern:**
```typescript
'use server'

import { z } from 'zod'
import { schema } from '@/lib/schemas/schema'
import { logger } from '@/lib/logger'

export async function actionName(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Validate
    const result = schema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
      return { success: false, error: result.error.message }
    }
    
    // Process
    const data = result.data
    // ... business logic
    
    // Success
    return { success: true, message: 'Success message' }
  } catch (error) {
    logger.error('Action failed:', error)
    return { success: false, error: 'User-friendly error message' }
  }
}
```

**Validation Pattern:**
```typescript
import { z } from 'zod'

// Schema definition
export const schema = z.object({
  field: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  // ...
})

// Inferred type
export type SchemaType = z.infer<typeof schema>

// Usage
const result = schema.safeParse(data)
if (!result.success) {
  // Handle error
  return { error: result.error.message }
}
// Use validated data
const validData = result.data
```

**Error Handling Pattern:**
```typescript
import { castError } from '@/utils/errors'
import { logger } from '@/lib/logger'

try {
  // Operation that might fail
  await riskyOperation()
} catch (error) {
  // Cast to Error type
  const err = castError(error)
  
  // Log with context
  logger.error('Operation failed', { error: err, context: '...' })
  
  // Return user-friendly message
  return { error: 'Something went wrong. Please try again.' }
}
```

**Client Component Pattern:**
```typescript
'use client'

import { useActionState } from 'react'
import { serverAction } from '@/app/actions/action'

export function ClientComponent() {
  const [state, formAction] = useActionState(serverAction, initialState)
  
  return (
    <form action={formAction}>
      {/* Form fields */}
      {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
      {state.success && <SuccessMessage>{state.message}</SuccessMessage>}
    </form>
  )
}
```

## Documentation Style

**Code Comments:**
- Use JSDoc for public APIs and complex functions
- Single-line: `// Brief explanation`
- Multi-line: For complex logic requiring explanation
- Avoid: Obvious comments (`// Set x to 10`)
- Prefer: Why over what (`// Use cached value to avoid rate limit`)

**JSDoc Format:**
```typescript
/**
 * Brief description of function purpose
 * 
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 * @throws Error description if applicable
 */
export function functionName(param1: string, param2: number): ReturnType {
  // Implementation
}
```

**File Headers:**
- Not required for most files
- Optional for complex utilities or critical files
- Focus on "why this exists" not "what it does"

**Inline Comments:**
- Explain complex algorithms or business logic
- Document workarounds with reason
- Flag TODOs with context (TODO: reason and when to address)
- Mark intentional deviations from patterns

## Import Organization

**Order:**
1. Type imports (`import type`)
2. React and framework imports
3. Third-party packages (alphabetical)
4. Local utilities with `@/` alias
5. Relative imports (avoid when possible)
6. Style imports (CSS, SCSS)

**Example:**
```typescript
import type { Metadata } from 'next'
import type { User } from '@/types/user'

import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { logger } from '@/lib/logger'
import { schema } from '@/lib/schemas/schema'

import './styles.css'
```

**Grouping:**
- Blank line between import groups
- Sort alphabetically within groups
- Named imports on same line if short
- Destructure multiple from same module

## Variable Declaration

**Const by Default:**
- Use `const` for all variables that don't change
- Use `let` only when reassignment needed
- Never use `var` (ESLint enforces)

**Destructuring:**
- Object destructuring for multiple properties
- Array destructuring for tuples
- Parameter destructuring for props

**Type Annotations:**
- Explicit for function parameters
- Explicit for return types
- Let TypeScript infer for simple variables
- Explicit when type is complex or ambiguous

## Function Patterns

**Arrow Functions:**
- Preferred for callbacks, short functions
- Component functions can be arrow or regular
- Always use arrow for React components (consistency)

**Regular Functions:**
- Optional for named exports (export function)
- Hoisted, useful for utility libraries

**Async/Await:**
- Always use async/await over raw Promises
- Always handle errors with try/catch
- Never use `.then()/.catch()` chains

## Testing Conventions

**File Naming:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts` in `e2e/` directory
- Location: `tests/unit/` or co-located with source

**Test Structure:**
- Describe blocks for grouping related tests
- Test descriptions: "should [expected behavior]"
- Arrange-Act-Assert pattern
- One assertion per test (when possible)

**Mocking:**
- Mock external dependencies
- Avoid mocking internal modules
- Use Vitest's vi.mock() for modules
- Clean up mocks in afterEach

---

*Conventions analysis: 2026-01-10*
*Update when team agrees on new patterns*
