/**
 * Session Revocation Mechanism
 * 
 * MEDIUM PRIORITY #8: Implement session revocation mechanism
 * 
 * This module provides comprehensive session management with revocation capabilities:
 * - Session blacklisting
 * - Force logout functionality
 * - Session invalidation on password change
 * - Device/browser tracking
 * - Active session management
 * - Session expiry handling
 */

import { Redis } from '@upstash/redis'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import { getSession as _getSession, deleteSession as _deleteSession, type SessionPayload } from '@/lib/auth/auth-enhanced'
import { decrypt } from '@/lib/auth/jwt'
import { RevocationReason } from '@/types/enum-types'

// Redis client for session management
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Session storage configuration
const SESSION_CONFIG = {
  blacklistPrefix: 'session:blacklist:',
  activeSessionPrefix: 'session:active:',
  deviceSessionPrefix: 'session:device:',
  sessionTTL: 7 * 24 * 60 * 60, // 7 days in seconds
  maxDevicesPerUser: 5,
} as const

/**
 * Active session information
 */
export interface ActiveSession {
  sessionId: string
  userId: string
  username: string
  device: DeviceInfo
  createdAt: Date
  lastActiveAt: Date
  ipAddress: string
  expiresAt: Date
}

/**
 * Device information for session tracking
 */
export interface DeviceInfo {
  userAgent: string
  browser: string
  os: string
  device: string
  fingerprint?: string
}



/**
 * Parse user agent to extract device information
 */
function parseUserAgent(userAgent: string): DeviceInfo {
  // Simple parsing - in production, use a library like ua-parser-js
  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[1] || 'Unknown'
  const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/)?.[1] || 'Unknown'
  const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  
  return {
    userAgent,
    browser,
    os,
    device,
  }
}

/**
 * Generate session ID from JWT token
 */
async function getSessionId(token: string): Promise<string | null> {
  try {
    const payload = await decrypt(token)
    if (!payload) return null
    
    // Use a combination of userId and timestamp for session ID
    const sessionId = `${payload.userId}-${payload.iat || Date.now()}`
    return sessionId
  } catch (error) {
    logger.error('Failed to extract session ID', { error })
    return null
  }
}

/**
 * Check if a session is blacklisted
 */
export async function isSessionBlacklisted(sessionId: string): Promise<boolean> {
  try {
    const blacklistKey = `${SESSION_CONFIG.blacklistPrefix}${sessionId}`
    const isBlacklisted = await redis.exists(blacklistKey)
    return isBlacklisted === 1
  } catch (error) {
    logger.error('Failed to check session blacklist', { error, sessionId })
    // Fail open to avoid blocking legitimate users
    return false
  }
}

/**
 * Revoke a session
 */
export async function revokeSession(
  sessionId: string,
  reason: RevocationReason,
  revokedBy?: string,
): Promise<void> {
  try {
    const blacklistKey = `${SESSION_CONFIG.blacklistPrefix}${sessionId}`
    const revocationData = {
      sessionId,
      reason,
      revokedBy: revokedBy || 'system',
      revokedAt: new Date().toISOString(),
    }
    
    // Add to blacklist with TTL
    await redis.setex(
      blacklistKey,
      SESSION_CONFIG.sessionTTL,
      JSON.stringify(revocationData),
    )
    
    // Remove from active sessions
    const activeKey = `${SESSION_CONFIG.activeSessionPrefix}${sessionId}`
    await redis.del(activeKey)
    
    logger.info('Session revoked', {
      sessionId,
      reason,
      revokedBy: revocationData.revokedBy,
    })
  } catch (error) {
    logger.error('Failed to revoke session', { error, sessionId, reason })
    throw new Error('Failed to revoke session')
  }
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(
  userId: string,
  reason: RevocationReason,
  excludeCurrentSession?: string,
): Promise<number> {
  try {
    // Get all active sessions for user
    const pattern = `${SESSION_CONFIG.activeSessionPrefix}*`
    const keys = await redis.keys(pattern)
    
    let revokedCount = 0
    
    for (const key of keys) {
      const sessionData = await redis.get(key)
      if (!sessionData) continue
      
      const session = JSON.parse(sessionData as string) as ActiveSession
      
      if (session.userId === userId) {
        const sessionId = key.replace(SESSION_CONFIG.activeSessionPrefix, '')
        
        // Skip current session if requested
        if (excludeCurrentSession && sessionId === excludeCurrentSession) {
          continue
        }
        
        await revokeSession(sessionId, reason, userId)
        revokedCount++
      }
    }
    
    logger.info('Revoked all user sessions', {
      userId,
      revokedCount,
      reason,
    })
    
    return revokedCount
  } catch (error) {
    logger.error('Failed to revoke all user sessions', { error, userId })
    throw new Error('Failed to revoke user sessions')
  }
}

/**
 * Register an active session
 */
export async function registerActiveSession(
  sessionPayload: SessionPayload,
  request: Request,
): Promise<void> {
  try {
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'Unknown'
    
    const sessionId = `${sessionPayload.userId}-${Date.now()}`
    const deviceInfo = parseUserAgent(userAgent)
    
    const activeSession: ActiveSession = {
      sessionId,
      userId: sessionPayload.userId,
      username: sessionPayload.username,
      device: deviceInfo,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      ipAddress,
      expiresAt: sessionPayload.expiresAt,
    }
    
    // Store active session
    const activeKey = `${SESSION_CONFIG.activeSessionPrefix}${sessionId}`
    await redis.setex(
      activeKey,
      SESSION_CONFIG.sessionTTL,
      JSON.stringify(activeSession),
    )
    
    // Check device limit
    await enforceDeviceLimit(sessionPayload.userId)
    
    logger.info('Active session registered', {
      sessionId,
      userId: sessionPayload.userId,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
    })
  } catch (error) {
    logger.error('Failed to register active session', { error })
    // Don't throw - session registration failure shouldn't block login
  }
}

/**
 * Enforce device limit per user
 */
async function enforceDeviceLimit(userId: string): Promise<void> {
  try {
    // Get all active sessions for user
    const pattern = `${SESSION_CONFIG.activeSessionPrefix}*`
    const keys = await redis.keys(pattern)
    
    const userSessions: ActiveSession[] = []
    
    for (const key of keys) {
      const sessionData = await redis.get(key)
      if (!sessionData) continue
      
      const session = JSON.parse(sessionData as string) as ActiveSession
      if (session.userId === userId) {
        userSessions.push(session)
      }
    }
    
    // Sort by creation date (oldest first)
    userSessions.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    
    // Revoke oldest sessions if limit exceeded
    if (userSessions.length > SESSION_CONFIG.maxDevicesPerUser) {
      const sessionsToRevoke = userSessions.slice(
        0, 
        userSessions.length - SESSION_CONFIG.maxDevicesPerUser,
      )
      
      for (const session of sessionsToRevoke) {
        await revokeSession(
          session.sessionId,
          RevocationReason.MAX_DEVICES_EXCEEDED,
          'system',
        )
      }
      
      logger.warn('Device limit exceeded, revoked oldest sessions', {
        userId,
        revokedCount: sessionsToRevoke.length,
      })
    }
  } catch (error) {
    logger.error('Failed to enforce device limit', { error, userId })
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(userId: string): Promise<ActiveSession[]> {
  try {
    const pattern = `${SESSION_CONFIG.activeSessionPrefix}*`
    const keys = await redis.keys(pattern)
    
    const userSessions: ActiveSession[] = []
    
    for (const key of keys) {
      const sessionData = await redis.get(key)
      if (!sessionData) continue
      
      const session = JSON.parse(sessionData as string) as ActiveSession
      if (session.userId === userId) {
        userSessions.push(session)
      }
    }
    
    // Sort by last active date (most recent first)
    userSessions.sort((a, b) => 
      new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    )
    
    return userSessions
  } catch (error) {
    logger.error('Failed to get user active sessions', { error, userId })
    return []
  }
}

/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    const activeKey = `${SESSION_CONFIG.activeSessionPrefix}${sessionId}`
    const sessionData = await redis.get(activeKey)
    
    if (!sessionData) return
    
    const session = JSON.parse(sessionData as string) as ActiveSession
    session.lastActiveAt = new Date()
    
    await redis.setex(
      activeKey,
      SESSION_CONFIG.sessionTTL,
      JSON.stringify(session),
    )
  } catch (error) {
    logger.error('Failed to update session activity', { error, sessionId })
  }
}

/**
 * Middleware to check session validity
 */
export async function validateSession(_request: Request): Promise<{
  valid: boolean
  sessionId?: string
  reason?: string
}> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    
    if (!token) {
      return { valid: false, reason: 'No session token' }
    }
    
    // Get session ID from token
    const sessionId = await getSessionId(token)
    if (!sessionId) {
      return { valid: false, reason: 'Invalid session token' }
    }
    
    // Check if session is blacklisted
    const isBlacklisted = await isSessionBlacklisted(sessionId)
    if (isBlacklisted) {
      return { valid: false, sessionId, reason: 'Session revoked' }
    }
    
    // Update session activity
    await updateSessionActivity(sessionId)
    
    return { valid: true, sessionId }
  } catch (error) {
    logger.error('Session validation error', { error })
    return { valid: false, reason: 'Validation error' }
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const pattern = `${SESSION_CONFIG.activeSessionPrefix}*`
    const keys = await redis.keys(pattern)
    
    let cleanedCount = 0
    const now = new Date()
    
    for (const key of keys) {
      const sessionData = await redis.get(key)
      if (!sessionData) continue
      
      const session = JSON.parse(sessionData as string) as ActiveSession
      
      if (new Date(session.expiresAt) < now) {
        const sessionId = key.replace(SESSION_CONFIG.activeSessionPrefix, '')
        await revokeSession(sessionId, RevocationReason.SESSION_EXPIRED, 'system')
        cleanedCount++
      }
    }
    
    logger.info('Cleaned up expired sessions', { cleanedCount })
    return cleanedCount
  } catch (error) {
    logger.error('Failed to cleanup expired sessions', { error })
    return 0
  }
}

/**
 * Session management actions for admin dashboard
 */
export const sessionManagement = {
  /**
   * Force logout a specific user
   */
  forceLogoutUser: async (userId: string, adminId: string) => {
    const revokedCount = await revokeAllUserSessions(
      userId,
      RevocationReason.ADMIN_FORCE_LOGOUT,
    )
    
    logger.warn('Admin forced user logout', {
      userId,
      adminId,
      revokedCount,
    })
    
    return revokedCount
  },
  
  /**
   * Revoke a specific session
   */
  revokeSpecificSession: async (sessionId: string, adminId: string) => {
    await revokeSession(
      sessionId,
      RevocationReason.ADMIN_FORCE_LOGOUT,
      adminId,
    )
  },
  
  /**
   * Get session statistics
   */
  getSessionStats: async () => {
    const pattern = `${SESSION_CONFIG.activeSessionPrefix}*`
    const keys = await redis.keys(pattern)
    
    const stats = {
      totalActiveSessions: keys.length,
      byDevice: { mobile: 0, desktop: 0 },
      byBrowser: {} as Record<string, number>,
      byOS: {} as Record<string, number>,
    }
    
    for (const key of keys) {
      const sessionData = await redis.get(key)
      if (!sessionData) continue
      
      const session = JSON.parse(sessionData as string) as ActiveSession
      
      // Device stats
      if (session.device.device === 'Mobile') {
        stats.byDevice.mobile++
      } else {
        stats.byDevice.desktop++
      }
      
      // Browser stats
      stats.byBrowser[session.device.browser] = 
        (stats.byBrowser[session.device.browser] || 0) + 1
      
      // OS stats
      stats.byOS[session.device.os] = 
        (stats.byOS[session.device.os] || 0) + 1
    }
    
    return stats
  },
}

/**
 * Hooks for password change events
 */
export async function onPasswordChanged(userId: string): Promise<void> {
  await revokeAllUserSessions(userId, RevocationReason.PASSWORD_CHANGED)
}

/**
 * Hooks for suspicious activity
 */
export async function onSuspiciousActivity(
  sessionId: string,
  reason: string,
): Promise<void> {
  await revokeSession(sessionId, RevocationReason.SUSPICIOUS_ACTIVITY, 'security-system')
  
  logger.warn('Suspicious activity detected', {
    sessionId,
    reason,
  })
}
