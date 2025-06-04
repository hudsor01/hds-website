/**
 * Authentication & Authorization Types
 * 
 * Type definitions for user authentication, sessions, and access control.
 */

import { Environment } from './enum-types'

// ============= User & Authentication =============

/**
 * User account information
 */
export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  isEmailVerified: boolean
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: UserMetadata
}

/**
 * User role definition
 */
export interface UserRole {
  id: string
  name: string
  description?: string
  level: number // Higher numbers = more permissions
  permissions: Permission[]
  isSystemRole: boolean
}

/**
 * Permission definition
 */
export interface Permission {
  id: string
  name: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  conditions?: PermissionCondition[]
}

/**
 * Permission condition for role-based access control
 */
export interface PermissionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains'
  value: Record<string, unknown>
}

/**
 * User metadata for additional information
 */
export interface UserMetadata {
  company?: string
  jobTitle?: string
  phone?: string
  timezone?: string
  language?: string
  preferences?: UserPreferences
  profile?: {
    bio?: string
    website?: string
    linkedin?: string
    twitter?: string
  }
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    marketing: boolean
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    allowAnalytics: boolean
  }
  communication: {
    newsletter: boolean
    productUpdates: boolean
    securityAlerts: boolean
  }
}

// ============= Session Management =============

/**
 * User session information
 */
export interface Session {
  id: string
  userId: string
  token: string
  refreshToken?: string
  expiresAt: Date
  createdAt: Date
  lastAccessedAt: Date
  ipAddress?: string
  userAgent?: string
  isActive: boolean
  metadata?: SessionMetadata
}

/**
 * Session metadata for security tracking
 */
export interface SessionMetadata {
  loginMethod: 'password' | 'oauth' | 'magic-link' | 'sso'
  deviceId?: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
  riskScore?: number
  isAuthenticated: boolean
  isTwoFactorVerified?: boolean
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  sub: string // User ID
  email: string
  role: string
  permissions?: string[]
  sessionId: string
  iss: string // Issuer
  aud: string // Audience
  exp: number // Expiration time
  iat: number // Issued at
  nbf?: number // Not before
  jti?: string // JWT ID
}

/**
 * JWT token pair
 */
export interface TokenPair {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  scope?: string[]
}

// ============= Authentication Requests =============

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
  twoFactorCode?: string
  captchaToken?: string
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  company?: string
  agreeToTerms: boolean
  marketingConsent?: boolean
  referralCode?: string
}

/**
 * Password reset request
 */
export interface PasswordResetData {
  email: string
  resetToken?: string
  newPassword?: string
  confirmPassword?: string
}

/**
 * Email verification data
 */
export interface EmailVerificationData {
  email: string
  verificationToken: string
}

/**
 * Two-factor authentication setup
 */
export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

/**
 * Two-factor authentication verification
 */
export interface TwoFactorVerification {
  code: string
  type: 'totp' | 'sms' | 'backup'
}

// ============= OAuth & SSO =============

/**
 * OAuth provider configuration
 */
export interface OAuthProvider {
  id: string
  name: string
  clientId: string
  clientSecret: string
  authorizeUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string[]
  redirectUri: string
  isEnabled: boolean
}

/**
 * OAuth authentication state
 */
export interface OAuthState {
  provider: string
  redirectUrl?: string
  state: string
  codeVerifier?: string // For PKCE
  nonce?: string
  createdAt: Date
}

/**
 * OAuth user profile from provider
 */
export interface OAuthProfile {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  provider: string
  raw: Record<string, unknown>
}

/**
 * SSO configuration
 */
export interface SSOConfig {
  id: string
  name: string
  type: 'saml' | 'oidc'
  isEnabled: boolean
  domains: string[]
  configuration: Record<string, unknown>
  metadata?: Record<string, unknown>
}

// ============= Security & Audit =============

/**
 * Security event for audit logging
 */
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  details: Record<string, unknown>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  status: 'success' | 'failure' | 'suspicious'
}

/**
 * Types of security events
 */
export type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verification'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'account_locked'
  | 'account_unlocked'
  | 'permission_denied'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_modification'

/**
 * Account lockout information
 */
export interface AccountLockout {
  userId: string
  reason: 'failed_attempts' | 'suspicious_activity' | 'admin_action' | 'security_violation'
  lockedAt: Date
  unlockAt?: Date
  attemptCount: number
  lastAttemptAt: Date
  isLocked: boolean
}

/**
 * Rate limiting information for authentication
 */
export interface AuthRateLimit {
  identifier: string // IP address or user ID
  attempts: number
  windowStart: Date
  nextAllowedAt?: Date
  isBlocked: boolean
}

// ============= Admin & Management =============

/**
 * Admin authentication token payload (used in JWT claims)
 */
export interface AdminTokenPayload {
  id: string
  username: string
  email: string
  role: 'admin'
  iat?: number
  exp?: number
}

/**
 * Admin user with elevated permissions (full admin profile)
 */
export interface AdminUser extends User {
  adminLevel: 'super' | 'admin' | 'moderator'
  canManageUsers: boolean
  canManageRoles: boolean
  canViewAuditLog: boolean
  canManageSystem: boolean
  lastAdminAction?: Date
}

/**
 * Authentication result type
 */
export type AuthenticationResult = AdminTokenPayload | null

/**
 * Login attempt tracking
 */
export interface LoginAttempt {
  count: number
  lockoutUntil?: number
}

/**
 * React 19 useActionState compatible error type
 */
export interface AuthError {
  message: string
  field?: string
}

/**
 * User management operations
 */
export interface UserManagementAction {
  type: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'reset_password' | 'change_role'
  targetUserId: string
  performedBy: string
  reason?: string
  timestamp: Date
  changes?: Record<string, { from: Record<string, unknown>; to: Record<string, unknown> }>
}

/**
 * System authentication configuration
 */
export interface AuthConfig {
  environment: Environment
  jwtSecret: string
  tokenExpiration: {
    access: number // seconds
    refresh: number // seconds
  }
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
    preventReuse: number
  }
  accountLockout: {
    maxAttempts: number
    lockoutDuration: number // minutes
    resetOnSuccess: boolean
  }
  rateLimiting: {
    maxAttempts: number
    windowSize: number // minutes
    blockDuration: number // minutes
  }
  twoFactor: {
    enabled: boolean
    required: boolean
    issuer: string
  }
  oauth: {
    enabled: boolean
    providers: OAuthProvider[]
  }
  features: {
    registration: boolean
    emailVerification: boolean
    passwordReset: boolean
    rememberMe: boolean
    sessionManagement: boolean
  }
}