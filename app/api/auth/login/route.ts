import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, createAdminSession } from '@/lib/auth/admin'
import { getAPISecurityHeaders } from '@/lib/security/csp'
import { z } from 'zod'
import { logger } from '@/lib/logger'

// React 19/Next.js 15 Server Action security patterns for authentication

// Secure login schema with comprehensive validation (Next.js 15 pattern)
const LoginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
})

/**
 * Admin login endpoint with enhanced security (Next.js 15 App Router pattern)
 * Compatible with React 19 useActionState hook
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Get client IP for rate limiting and logging (Next.js 15 middleware integration)
    const clientIP = request.headers.get('x-client-ip') || 
                     request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     'unknown'
    
    // Validate Content-Type (Next.js 15 security pattern)
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      logger.warn('Invalid content type for login attempt', { clientIP, contentType })
      return NextResponse.json(
        { error: 'Invalid content type' },
        { 
          status: 400,
          headers: getAPISecurityHeaders(),
        },
      )
    }
    
    // Parse and validate request body with error handling
    let body: unknown
    try {
      body = await request.json()
    } catch (_error) {
      logger.warn('Invalid JSON in login request', { clientIP })
      return NextResponse.json(
        { error: 'Invalid request body' },
        { 
          status: 400,
          headers: getAPISecurityHeaders(),
        },
      )
    }
    
    // Validate input using Zod (React 19/Next.js 15 validation pattern)
    const validation = LoginSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      logger.warn('Invalid login credentials format', { clientIP, errors })
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials format',
          details: errors, 
        },
        { 
          status: 400,
          headers: getAPISecurityHeaders(),
        },
      )
    }
    
    const { username, password } = validation.data
    
    // Authenticate user with rate limiting and secure password comparison
    const isAuthenticated = await authenticateAdmin(username, password, clientIP)
    
    if (!isAuthenticated) {
      // Don't reveal whether username or password was wrong (security best practice)
      logger.warn('Failed admin login attempt', { 
        username: username.substring(0, 3) + '***', // Partial username for logging
        clientIP,
        responseTime: Date.now() - startTime, 
      })
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { 
          status: 401,
          headers: getAPISecurityHeaders(),
        },
      )
    }
    
    // Create secure session token using enhanced JWT
    const token = await createAdminSession(username)
    
    // Log successful authentication
    logger.info('Admin login successful', { 
      username: username.substring(0, 3) + '***',
      clientIP,
      responseTime: Date.now() - startTime, 
    })
    
    // Return success with secure cookie options (Next.js 15 security pattern)
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Authentication successful', 
      },
      { 
        status: 200,
        headers: getAPISecurityHeaders(),
      },
    )
    
    // Set secure httpOnly cookie with enhanced security
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 2 * 60 * 60, // 2 hours (matches JWT expiration)
      path: '/',
      ...(isProduction && { 
        domain: new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname, 
      }),
    })
    
    return response
    
  } catch (error) {
    // Comprehensive error logging with security context
    logger.error('Admin login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: Date.now() - startTime,
      clientIP: request.headers.get('x-client-ip') || 'unknown',
    })
    
    // Generic error response to prevent information disclosure
    return NextResponse.json(
      { error: 'Authentication failed' },
      { 
        status: 500,
        headers: getAPISecurityHeaders(),
      },
    )
  }
}

/**
 * Admin logout endpoint (Next.js 15 App Router pattern)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIP = request.headers.get('x-client-ip') || 'unknown'
    
    logger.info('Admin logout', { clientIP })
    
    // Clear the authentication cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { 
        status: 200,
        headers: getAPISecurityHeaders(),
      },
    )
    
    // Clear the cookie by setting it to expire (Next.js 15 pattern)
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    })
    
    return response
    
  } catch (error) {
    logger.error('Admin logout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { 
        status: 500,
        headers: getAPISecurityHeaders(),
      },
    )
  }
}

// Disable other HTTP methods for security (Next.js 15 pattern)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST, DELETE',
        ...getAPISecurityHeaders(),
      },
    },
  )
}

export { GET as PUT, GET as PATCH, GET as HEAD, GET as OPTIONS }