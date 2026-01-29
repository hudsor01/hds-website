# Phase 25: Auth Integration Research

> Research completed: 2026-01-22

## Overview

This document summarizes research findings for implementing authentication in the business-website project using Neon Auth with Next.js. Neon Auth is built on Better Auth and provides a managed authentication service that stores users, sessions, and auth configuration directly in your Neon database.

---

## Table of Contents

1. [Neon Auth Architecture](#neon-auth-architecture)
2. [NeonAuthUIProvider Setup](#neonauthprovider-setup)
3. [Auth Client Configuration](#auth-client-configuration)
4. [Server-Side Session Validation](#server-side-session-validation)
5. [Access Token & JWT Patterns](#access-token--jwt-patterns)
6. [Middleware Configuration](#middleware-configuration)
7. [Protected Route Patterns](#protected-route-patterns)
8. [Better Auth Foundation](#better-auth-foundation)
9. [Stack Auth SDK Patterns (Legacy Reference)](#stack-auth-sdk-patterns-legacy-reference)
10. [Implementation Recommendations](#implementation-recommendations)

---

## Neon Auth Architecture

### Key Features
- **Branch-aware auth**: All authentication data lives directly in your Neon database, so when you branch, your entire auth state branches with it
- **Zero server management**: Users, sessions, organizations, configuration, and JWKS are stored in a dedicated `neon_auth` schema
- **SQL queryability**: Auth data is queryable via standard SQL
- **Built on Better Auth**: Version 1.4.6 as of documentation date

### Database Schema
Neon Auth uses a dedicated `neon_auth` schema containing:
- `neon_auth.user` - User records
- `neon_auth.session` - Session data
- `neon_auth.account` - OAuth tokens and credentials
- `neon_auth.verification` - Email verification tokens

### Environment Variables Required
```env
NEON_AUTH_BASE_URL="https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth"
DATABASE_URL="your_pooled_connection_string"
```

---

## NeonAuthUIProvider Setup

### Basic Layout Configuration

**File: `app/layout.tsx`**
```tsx
import { NeonAuthUIProvider, UserButton } from '@neondatabase/neon-js/auth/react/ui';
import { authClient } from '@/lib/auth/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/account/settings"
          emailOTP
          social={{ google: true, github: true }}
        >
          <header>
            <UserButton size="icon" />
          </header>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
```

### Provider Props
| Prop | Type | Description |
|------|------|-------------|
| `authClient` | AuthClient | Required. Client instance from createAuthClient() |
| `redirectTo` | string | Redirect destination after auth actions |
| `emailOTP` | boolean | Enable email OTP authentication |
| `social` | object | Enable social providers (google, github, vercel) |

### Required Styling
**File: `app/globals.css`**
```css
@import '@neondatabase/neon-js/ui/tailwind';
```

---

## Auth Client Configuration

### Client-Side Setup
**File: `lib/auth/client.ts`**
```tsx
'use client';
import { createAuthClient } from '@neondatabase/neon-js/auth/next';

export const authClient = createAuthClient();
```

### Client Usage in Components
```tsx
'use client';
import { authClient } from '@/lib/auth/client';

export function MyComponent() {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (!data?.session) return <div>Not authenticated</div>;

  return <div>Welcome {data.user.name}</div>;
}
```

### Server-Side Setup
**File: `lib/auth/server.ts`**
```tsx
import { createAuthServer } from '@neondatabase/neon-js/auth/next/server';

export const authServer = createAuthServer();
```

### Alternative: neonAuth() Helper
```tsx
import { neonAuth } from '@neondatabase/neon-js/auth/next/server';

// In Server Components or Server Actions
const { session, user } = await neonAuth();
```

---

## Server-Side Session Validation

### In Server Components
```tsx
import { neonAuth } from '@neondatabase/neon-js/auth/next/server';

export default async function ProtectedPage() {
  const { session, user } = await neonAuth();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return <h1>Welcome {user.name}</h1>;
}
```

### In Server Actions
```tsx
'use server';
import { neonAuth } from '@neondatabase/neon-js/auth/next/server';

async function getAuthUser() {
  const { user } = await neonAuth();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function protectedAction(formData: FormData) {
  const user = await getAuthUser();
  // Perform authenticated operation
}
```

### In API Routes
```tsx
import { neonAuth } from '@neondatabase/neon-js/auth/next/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { session, user } = await neonAuth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
```

---

## Access Token & JWT Patterns

### JWT Token Structure
Neon Auth JWTs contain:
```json
{
  "sub": "user_id_from_neon_auth.user.id",
  "email": "user@example.com",
  "role": "authenticated",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Automatic Token Handling
- The SDK automatically retrieves JWT and stores it in `session.access_token`
- Tokens are automatically included in `Authorization` header for Data API requests
- JWTs expire after approximately 15 minutes

### Session Cookie
- HTTP-only cookie: `__Secure-neonauth.session_token`
- Security flags: HTTPS only, HttpOnly, SameSite=None
- Contains opaque session token (not JWT)
- Managed entirely by SDK

### Database Queries with JWT
```tsx
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_AUTHENTICATED_URL!, {
  authToken: async () => {
    const { session } = await neonAuth();
    if (!session?.access_token) throw new Error('No token');
    return session.access_token;
  },
});

// RLS policies automatically enforce user access
const todos = await sql('SELECT * FROM todos');
```

---

## Middleware Configuration

### Basic Protection
**File: `proxy.ts` (at project root)**
```tsx
import { neonAuthMiddleware } from '@neondatabase/neon-js/auth/next/server';

export default neonAuthMiddleware({
  loginUrl: '/auth/sign-in',
});

export const config = {
  matcher: ['/account/:path*', '/dashboard/:path*'],
};
```

### Route Matchers
- Protect specific paths: `/account/:path*`
- Avoid protecting root URL to prevent blocking static assets
- Do not protect `/auth/*` routes

### Important Notes
- Middleware redirects unauthenticated users to sign-in page
- Since Next.js v15.2.3, middleware-only protection is secure
- For maximum security, also protect at component level

---

## Protected Route Patterns

### Dynamic Auth Routes
**File: `app/auth/[path]/page.tsx`**
```tsx
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';

export default async function AuthPage({
  params
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params;
  return <AuthView path={path} />;
}
```

### Account Management Routes
**File: `app/account/[path]/page.tsx`**
```tsx
import { AccountView } from '@neondatabase/neon-js/auth/react/ui';

export default async function AccountPage({
  params
}: {
  params: Promise<{ path: string }>
}) {
  const { path } = await params;
  return <AccountView path={path} />;
}
```

### API Auth Handler
**File: `app/api/auth/[...path]/route.ts`**
```tsx
import { authApiHandler } from '@neondatabase/neon-js/auth/next/server';

export const { GET, POST } = authApiHandler();
```

---

## Better Auth Foundation

Neon Auth is built on Better Auth. Understanding the underlying patterns is helpful:

### Server-Side Setup (Better Auth)
```tsx
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  plugins: [nextCookies()]
});
```

### Session Access (Better Auth)
```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function ServerComponent() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session ? <div>Welcome {session.user.name}</div> : null;
}
```

### Key Better Auth Concepts
- Uses nano-store for reactive state management
- Leverages better-fetch for HTTP requests
- `nextCookies` plugin handles Set-Cookie in server contexts
- All endpoints are invocable as functions

---

## Stack Auth SDK Patterns (Legacy Reference)

> Note: Stack Auth patterns are being replaced by Neon Auth. These are provided for reference if migrating from Stack Auth.

### StackServerApp Configuration
```tsx
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
  urls: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
  }
});
```

### Protected Route Pattern (Stack Auth)
```tsx
// Client Component
export default function ProtectedClient() {
  useUser({ or: 'redirect' });
  return <h1>Authenticated content</h1>;
}

// Server Component
export default async function ProtectedServer() {
  await stackServerApp.getUser({ or: 'redirect' });
  return <h1>Authenticated content</h1>;
}
```

### Stack Auth Middleware
```tsx
export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/handler/sign-in', request.url));
  }
  return NextResponse.next();
}
```

---

## Implementation Recommendations

### 1. File Structure
```
src/
├── lib/
│   └── auth/
│       ├── client.ts      # createAuthClient()
│       └── server.ts      # createAuthServer()
├── app/
│   ├── layout.tsx         # NeonAuthUIProvider
│   ├── auth/
│   │   └── [path]/
│   │       └── page.tsx   # AuthView
│   ├── account/
│   │   └── [path]/
│   │       └── page.tsx   # AccountView
│   └── api/
│       └── auth/
│           └── [...path]/
│               └── route.ts
└── proxy.ts               # neonAuthMiddleware
```

### 2. Security Best Practices
1. **Layer protection**: Use both middleware AND component-level checks
2. **Validate at data layer**: Check auth in Server Actions before database operations
3. **Use RLS**: Enable Row-Level Security with `auth.uid()` for database-level protection
4. **Verify sessions**: Call `neonAuth()` at the start of every Server Action

### 3. Migration from Supabase Auth
If migrating from Supabase Auth:
1. Replace `@supabase/ssr` with `@neondatabase/neon-js`
2. Replace `createServerClient` with `createAuthServer()`
3. Replace `createBrowserClient` with `createAuthClient()`
4. Update middleware to use `neonAuthMiddleware()`
5. Update session checks from `supabase.auth.getUser()` to `neonAuth()`

### 4. Environment Configuration
```env
# Required
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
DATABASE_URL=postgresql://...

# Optional for legacy Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

---

## Sources

- [Neon Auth Quick Start - Next.js](https://neon.com/docs/auth/quick-start/nextjs)
- [Getting started with Neon Auth and Next.js](https://neon.com/guides/neon-auth-nextjs)
- [Neon Auth Overview](https://neon.com/docs/auth/overview)
- [Neon Auth Authentication Flow](https://neon.com/docs/auth/authentication-flow)
- [Better Auth Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [Stack Auth SDK Overview](https://docs.stack-auth.com/docs/next/sdk)
- [Stack Auth Users & Protected Routes](https://docs.stack-auth.com/docs/getting-started/users)
- [Stack Auth Setup](https://docs.stack-auth.com/docs/next/getting-started/setup)
- [Neon Auth Next.js Template](https://github.com/neondatabase/neon-auth-nextjs-template)

---

## Key Takeaways

1. **Neon Auth simplifies auth**: All auth data lives in your Neon database with automatic branching support
2. **Use NeonAuthUIProvider**: Wrap your app for auth context and pre-built UI components
3. **Server-first validation**: Use `neonAuth()` helper in Server Components and Actions
4. **Middleware + Component protection**: Layer security for maximum protection
5. **JWT for database access**: Tokens enable RLS policies via `auth.uid()`
6. **Built on Better Auth**: Understanding the underlying patterns helps with customization
