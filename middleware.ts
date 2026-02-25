import { NextResponse, type NextRequest } from 'next/server'
import { applySecurityHeaders } from '@/lib/security-headers'

export function middleware(request: NextRequest) {
  // 1. Generate a per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // 2. Pass nonce to layout via request header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // 3. Create response and apply security headers (including nonce in CSP)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  applySecurityHeaders(response, nonce)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
}
