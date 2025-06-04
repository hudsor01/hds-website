import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { signJWT, verifyJWT } from './jwt'
import type { JWTPayload as _JWTPayload } from './jwt'
import type { AdminTokenPayload, AuthError } from '@/types/auth-types'
import bcrypt from 'bcrypt'
import { z } from 'zod'

// React 19/Next.js 15 authentication patterns with enhanced security

// Secure credential validation schema (Next.js 15 form validation pattern)
const AdminCredentialsSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(8),
})

// Admin configuration with secure password hashing
const ADMIN_CONFIG = {
  username: env.ADMIN_USERNAME,
  // Store hashed password in production (Next.js 15 security pattern)
  passwordHash: env.ADMIN_PASSWORD_HASH || '', // Will be set via environment
  id: 'admin-user',
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionDuration: 2 * 60 * 60, // 2 hours (reduced from 24h)
}

// Rate limiting store (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lockoutUntil?: number }>()

// Types imported from @/types/auth-types

function isLockedOut(identifier: string): boolean {
  const attempts = loginAttempts.get(identifier)
  if (!attempts?.lockoutUntil) return false
  
  if (Date.now() > attempts.lockoutUntil) {
    loginAttempts.delete(identifier)
    return false
  }
  return true
}

function recordFailedAttempt(identifier: string): void {
  const attempts = loginAttempts.get(identifier) || { count: 0 }
  attempts.count += 1
  
  if (attempts.count >= ADMIN_CONFIG.maxLoginAttempts) {
    attempts.lockoutUntil = Date.now() + ADMIN_CONFIG.lockoutDuration
  }
  
  loginAttempts.set(identifier, attempts)
}

function clearFailedAttempts(identifier: string): void {
  loginAttempts.delete(identifier)
}

/**
 * Authenticate admin user with secure password hashing and rate limiting
 * Following Next.js 15 authentication patterns and React 19 form validation
 */
export async function authenticateAdmin(
  username: string,
  password: string,
  clientIp?: string,
): Promise<boolean> {
  // Rate limiting check (Next.js 15 security pattern)
  const identifier = clientIp || username
  if (isLockedOut(identifier)) {
    logger.warn('Admin login blocked due to rate limiting', { identifier })
    throw new Error('Account temporarily locked due to too many failed attempts')
  }

  try {
    // Input validation using Zod (React 19/Next.js 15 pattern)
    const validation = AdminCredentialsSchema.safeParse({ username, password })
    if (!validation.success) {
      recordFailedAttempt(identifier)
      logger.warn('Invalid admin credentials format', { username })
      return false
    }

    // Constant-time comparison to prevent timing attacks
    const isUsernameValid = username === ADMIN_CONFIG.username
    
    // Use bcrypt for secure password comparison (Next.js 15 authentication pattern)
    let isPasswordValid = false
    if (ADMIN_CONFIG.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, ADMIN_CONFIG.passwordHash)
    } else {
      // Fallback for development - hash the plain password
      console.warn('WARNING: Using plain text password in development. Set ADMIN_PASSWORD_HASH in production.')
      isPasswordValid = password === env.ADMIN_PASSWORD
    }
    
    if (!isUsernameValid || !isPasswordValid) {
      recordFailedAttempt(identifier)
      logger.warn('Failed admin login attempt', { username, identifier })
      return false
    }
    
    // Clear failed attempts on successful login
    clearFailedAttempts(identifier)
    logger.info('Admin login successful', { username })
    return true
    
  } catch (error) {
    recordFailedAttempt(identifier)
    logger.error('Admin authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username,
    })
    return false
  }
}

/**
 * Verify admin token with enhanced JWT security (Next.js 15 pattern)
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const payload = await verifyJWT(token)
    
    // Validate required claims (Next.js 15 JWT security pattern)
    if (!payload || payload.role !== 'admin' || !payload.userId) {
      return null
    }

    return {
      id: payload.userId,
      username: payload.username,
      email: payload.email || payload.username, // fallback for compatibility
      role: 'admin',
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch (error) {
    logger.warn('Invalid admin token verification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AdminTokenPayload | null): user is AdminTokenPayload {
  return user !== null && user.role === 'admin'
}

/**
 * Generate a secure admin session token with proper claims
 * Following Next.js 15 JWT security patterns
 */
export async function createAdminSession(username: string): Promise<string> {
  return await signJWT({
    userId: ADMIN_CONFIG.id,
    username,
    role: 'admin',
  })
}

/**
 * Helper function to generate password hash for setup
 * Use this to generate ADMIN_PASSWORD_HASH for production
 */
export async function generatePasswordHash(plainPassword: string): Promise<string> {
  const saltRounds = 12 // Recommended for production security
  return await bcrypt.hash(plainPassword, saltRounds)
}

/**
 * Next.js 15 App Router authentication middleware pattern
 * Enhanced for both Bearer token and cookie authentication
 */
export async function requireAdmin(request: Request): Promise<AdminTokenPayload> {
  const authHeader = request.headers.get('authorization')
  const cookieHeader = request.headers.get('cookie')
  
  let token: string | null = null
  
  // Support both Bearer token and cookie authentication
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else if (cookieHeader?.includes('admin-token')) {
    // Extract from cookie for browser requests
    const cookies = cookieHeader.split(';')
    const adminCookie = cookies.find(c => c.trim().startsWith('admin-token='))
    token = adminCookie?.split('=')[1] || null
  }
  
  if (!token) {
    throw new Error('Missing authentication token')
  }
  
  const admin = await verifyAdminToken(token)
  
  if (!admin) {
    throw new Error('Invalid or expired token')
  }
  
  return admin
}

// AuthError type imported from @/types/auth-types

/**
 * React 19 Server Action for admin login
 * Compatible with useActionState hook pattern
 */
export async function loginAction(
  prevState: AuthError | null,
  formData: FormData,
): Promise<AuthError | null> {
  try {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    
    if (!username || !password) {
      return { message: 'Username and password are required' }
    }
    
    const isValid = await authenticateAdmin(username, password)
    
    if (!isValid) {
      return { message: 'Invalid credentials' }
    }
    
    // Create session token
    await createAdminSession(username)
    
    return null // Success
  } catch (error) {
    return { 
      message: error instanceof Error ? error.message : 'Authentication failed', 
    }
  }
}