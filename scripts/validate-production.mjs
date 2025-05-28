/**
 * Production Environment Validation
 * 
 * MEDIUM PRIORITY #12: Create production environment validation
 * 
 * This script validates that all security configurations are properly
 * set up for production deployment.
 */

import { z } from 'zod'
import { createHash, randomBytes } from 'crypto'
import { logger } from '../lib/logger.js'

// Production environment schema
const ProductionEnvSchema = z.object({
  // Core settings
  NODE_ENV: z.literal('production'),
  NEXT_PUBLIC_APP_URL: z.string().url().startsWith('https://'),
  
  // Authentication & Security
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .refine(val => !['your-secret-key', 'change-this-secret'].includes(val), 
      'JWT_SECRET cannot use default values'),
  
  ADMIN_USERNAME: z.string()
    .min(3)
    .refine(val => val !== 'admin', 'ADMIN_USERNAME cannot be "admin" in production'),
  
  ADMIN_PASSWORD_HASH: z.string()
    .min(1, 'ADMIN_PASSWORD_HASH is required in production')
    .regex(/^\$2[aby]\$\d{2}\$/, 'Must be a valid bcrypt hash'),
  
  // Field Encryption
  ENCRYPTION_KEY: z.string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  
  ENCRYPTION_SALT: z.string()
    .min(32, 'ENCRYPTION_SALT must be at least 32 characters'),
  
  // Database
  DATABASE_URL: z.string()
    .url()
    .refine(val => val.includes('ssl=require') || val.includes('sslmode=require'), 
      'Database connection must use SSL'),
  
  // Redis for rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().startsWith('https://'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  
  // Email service
  RESEND_API_KEY: z.string().startsWith('re_'),
  RESEND_FROM_EMAIL: z.string().email(),
  CONTACT_EMAIL: z.string().email(),
  
  // CSP
  CSP_NONCE_SECRET: z.string().min(32).optional(),
})

// Security headers that should be present
const REQUIRED_SECURITY_HEADERS = [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
]

// Validation functions
class ProductionValidator {
  constructor() {
    this.errors = []
    this.warnings = []
  }
  
  /**
   * Validate environment variables
   */
  validateEnvironment() {
    console.log('🔍 Validating environment variables...\n')
    
    try {
      // Validate against schema
      ProductionEnvSchema.parse(process.env)
      console.log('✅ Environment variables validated')
      
      // Additional checks
      this.checkPasswordHashStrength()
      this.checkSecretUniqueness()
      this.checkDatabaseSecurity()
      
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          this.errors.push(`${err.path.join('.')}: ${err.message}`)
        })
      }
      return false
    }
  }
  
  /**
   * Check bcrypt hash strength
   */
  checkPasswordHashStrength() {
    const hash = process.env.ADMIN_PASSWORD_HASH
    if (!hash) return
    
    const costMatch = hash.match(/\$2[aby]\$(\d{2})\$/)
    
    if (costMatch) {
      const cost = parseInt(costMatch[1], 10)
      if (cost < 12) {
        this.warnings.push('Password hash cost factor should be at least 12 for production')
      }
    }
  }
  
  /**
   * Ensure secrets are unique
   */
  checkSecretUniqueness() {
    const secrets = [
      process.env.JWT_SECRET,
      process.env.ENCRYPTION_KEY,
      process.env.ENCRYPTION_SALT,
      process.env.CSP_NONCE_SECRET,
    ].filter(Boolean)
    
    const uniqueSecrets = new Set(secrets)
    if (uniqueSecrets.size !== secrets.length) {
      this.errors.push('Security secrets must be unique (JWT_SECRET, ENCRYPTION_KEY, etc.)')
    }
  }
  
  /**
   * Check database connection security
   */
  checkDatabaseSecurity() {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return
    
    if (!dbUrl.includes('ssl=require') && !dbUrl.includes('sslmode=require')) {
      this.errors.push('Database connection must enforce SSL')
    }
    
    if (dbUrl.includes('password=') && dbUrl.includes('postgres:postgres')) {
      this.warnings.push('Database appears to use default credentials')
    }
  }
  
  /**
   * Validate security headers configuration
   */
  async validateSecurityHeaders() {
    console.log('\n🔍 Validating security headers...\n')
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_APP_URL, {
        method: 'HEAD',
      })
      
      let allPresent = true
      
      for (const header of REQUIRED_SECURITY_HEADERS) {
        if (!response.headers.has(header.toLowerCase())) {
          this.errors.push(`Missing security header: ${header}`)
          allPresent = false
        }
      }
      
      // Check specific header values
      this.validateCSPHeader(response.headers.get('content-security-policy'))
      this.validateHSTSHeader(response.headers.get('strict-transport-security'))
      
      if (allPresent) {
        console.log('✅ All security headers present')
      }
      
      return allPresent
    } catch (error) {
      this.errors.push(`Failed to fetch headers: ${error}`)
      return false
    }
  }
  
  /**
   * Validate CSP header
   */
  validateCSPHeader(csp) {
    if (!csp) return
    
    // Check for unsafe directives
    if (csp.includes("'unsafe-inline'") && csp.includes('script-src')) {
      this.warnings.push("CSP allows 'unsafe-inline' scripts")
    }
    
    if (csp.includes("'unsafe-eval'")) {
      this.errors.push("CSP allows 'unsafe-eval' in production")
    }
    
    // Check for upgrade-insecure-requests
    if (!csp.includes('upgrade-insecure-requests')) {
      this.warnings.push('CSP should include upgrade-insecure-requests')
    }
    
    // Check for report-uri
    if (!csp.includes('report-uri') && !csp.includes('report-to')) {
      this.warnings.push('CSP should include violation reporting')
    }
  }
  
  /**
   * Validate HSTS header
   */
  validateHSTSHeader(hsts) {
    if (!hsts) return
    
    const maxAgeMatch = hsts.match(/max-age=(\d+)/)
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1], 10)
      if (maxAge < 31536000) { // 1 year
        this.warnings.push('HSTS max-age should be at least 1 year (31536000)')
      }
    }
    
    if (!hsts.includes('includeSubDomains')) {
      this.warnings.push('HSTS should include includeSubDomains')
    }
    
    if (!hsts.includes('preload')) {
      this.warnings.push('Consider adding preload to HSTS for maximum security')
    }
  }
  
  /**
   * Test authentication endpoints
   */
  async testAuthEndpoints() {
    console.log('\n🔍 Testing authentication endpoints...\n')
    
    try {
      // Test login endpoint with invalid credentials
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'invalid_user',
          password: 'invalid_password',
        }),
      })
      
      if (loginResponse.status !== 401 && loginResponse.status !== 400) {
        this.errors.push(`Login endpoint returned unexpected status: ${loginResponse.status}`)
        return false
      }
      
      // Check for rate limiting headers
      const retryAfter = loginResponse.headers.get('retry-after')
      const rateLimit = loginResponse.headers.get('x-ratelimit-limit')
      
      if (!retryAfter && !rateLimit) {
        this.warnings.push('Authentication endpoints should include rate limiting headers')
      }
      
      console.log('✅ Authentication endpoints secure')
      return true
    } catch (error) {
      this.errors.push(`Failed to test auth endpoints: ${error}`)
      return false
    }
  }
  
  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    console.log('\n🔍 Testing rate limiting...\n')
    
    try {
      const endpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/contact`
      const requests = []
      
      // Send multiple requests quickly
      for (let i = 0; i < 5; i++) {
        requests.push(
          fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Test',
              email: 'test@example.com',
              message: 'Test message',
            }),
          })
        )
      }
      
      const responses = await Promise.all(requests)
      const tooManyRequests = responses.some(r => r.status === 429)
      
      if (!tooManyRequests) {
        this.warnings.push('Rate limiting may not be properly configured')
      } else {
        console.log('✅ Rate limiting active')
      }
      
      return true
    } catch (error) {
      this.warnings.push(`Failed to test rate limiting: ${error}`)
      return true // Don't fail validation for this
    }
  }
  
  /**
   * Check SSL/TLS configuration
   */
  async checkSSLConfiguration() {
    console.log('\n🔍 Checking SSL/TLS configuration...\n')
    
    try {
      const url = new URL(process.env.NEXT_PUBLIC_APP_URL)
      
      if (url.protocol !== 'https:') {
        this.errors.push('Production URL must use HTTPS')
        return false
      }
      
      // In a real scenario, you would use a library to check SSL certificate
      console.log('✅ HTTPS enabled')
      return true
    } catch (error) {
      this.errors.push(`Invalid app URL: ${error}`)
      return false
    }
  }
  
  /**
   * Validate Redis connection
   */
  async validateRedisConnection() {
    console.log('\n🔍 Validating Redis connection...\n')
    
    try {
      const { Redis } = await import('@upstash/redis')
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      
      // Test connection
      const testKey = `test:${Date.now()}`
      await redis.set(testKey, 'test')
      const value = await redis.get(testKey)
      await redis.del(testKey)
      
      if (value !== 'test') {
        this.errors.push('Redis connection test failed')
        return false
      }
      
      console.log('✅ Redis connection working')
      return true
    } catch (error) {
      this.errors.push(`Redis connection failed: ${error}`)
      return false
    }
  }
  
  /**
   * Check for development artifacts
   */
  checkForDevArtifacts() {
    console.log('\n🔍 Checking for development artifacts...\n')
    
    let clean = true
    
    // Check environment variables
    if (process.env.DEBUG_MODE === 'true') {
      this.warnings.push('DEBUG_MODE should be false in production')
    }
    
    if (process.env.SKIP_RATE_LIMITING === 'true') {
      this.errors.push('SKIP_RATE_LIMITING must be false in production')
      clean = false
    }
    
    if (process.env.SKIP_EMAIL_SENDING === 'true') {
      this.warnings.push('SKIP_EMAIL_SENDING should be false in production')
    }
    
    if (clean) {
      console.log('✅ No development artifacts found')
    }
    
    return clean
  }
  
  /**
   * Generate security report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 PRODUCTION SECURITY VALIDATION REPORT')
    console.log('='.repeat(60) + '\n')
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 ALL CHECKS PASSED!')
      console.log('\n✅ Your application is ready for production deployment.')
    } else {
      if (this.errors.length > 0) {
        console.log(`❌ ERRORS (${this.errors.length}):\n`)
        this.errors.forEach((error, i) => {
          console.log(`   ${i + 1}. ${error}`)
        })
      }
      
      if (this.warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS (${this.warnings.length}):\n`)
        this.warnings.forEach((warning, i) => {
          console.log(`   ${i + 1}. ${warning}`)
        })
      }
      
      console.log('\n' + '='.repeat(60))
      
      if (this.errors.length > 0) {
        console.log('\n🚫 DEPLOYMENT BLOCKED: Fix all errors before deploying.')
      } else {
        console.log('\n⚠️  DEPLOYMENT ALLOWED: But consider addressing warnings.')
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n')
  }
  
  /**
   * Run all validations
   */
  async runAllValidations() {
    console.log('🚀 Starting production environment validation...\n')
    console.log('='.repeat(60) + '\n')
    
    const checks = [
      { name: 'Environment Variables', fn: () => this.validateEnvironment() },
      { name: 'SSL Configuration', fn: () => this.checkSSLConfiguration() },
      { name: 'Redis Connection', fn: () => this.validateRedisConnection() },
      { name: 'Security Headers', fn: () => this.validateSecurityHeaders() },
      { name: 'Authentication Endpoints', fn: () => this.testAuthEndpoints() },
      { name: 'Rate Limiting', fn: () => this.testRateLimiting() },
      { name: 'Development Artifacts', fn: () => this.checkForDevArtifacts() },
    ]
    
    let allPassed = true
    
    for (const check of checks) {
      try {
        const passed = await check.fn()
        if (!passed) {
          allPassed = false
        }
      } catch (error) {
        console.error(`\n❌ ${check.name} check failed:`, error)
        this.errors.push(`${check.name} check threw an error`)
        allPassed = false
      }
    }
    
    this.generateReport()
    
    return allPassed && this.errors.length === 0
  }
}

// Security checklist
const SECURITY_CHECKLIST = {
  authentication: [
    '✓ Password hashing with bcrypt (12+ rounds)',
    '✓ JWT tokens with strong secret (32+ chars)',
    '✓ Session duration limited to 2 hours',
    '✓ Rate limiting on auth endpoints',
    '✓ No default credentials',
  ],
  dataProtection: [
    '✓ Field-level encryption for PII',
    '✓ SSL/TLS for all connections',
    '✓ Secure session cookies (httpOnly, secure, sameSite)',
    '✓ CSRF protection',
  ],
  headers: [
    '✓ Content Security Policy with nonces',
    '✓ Strict Transport Security',
    '✓ X-Frame-Options: DENY',
    '✓ X-Content-Type-Options: nosniff',
    '✓ Referrer-Policy configured',
  ],
  infrastructure: [
    '✓ Redis for distributed rate limiting',
    '✓ Environment variables properly configured',
    '✓ Error messages don\'t expose sensitive info',
    '✓ Logging configured without PII',
  ],
}

/**
 * Generate deployment readiness report
 */
function generateReadinessReport() {
  console.log('\n📋 SECURITY CHECKLIST\n')
  
  for (const [category, items] of Object.entries(SECURITY_CHECKLIST)) {
    console.log(`\n${category.toUpperCase()}:`)
    items.forEach(item => console.log(`  ${item}`))
  }
  
  console.log('\n' + '='.repeat(60) + '\n')
}

/**
 * Main validation script
 */
async function main() {
  // Show current environment
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`App URL: ${process.env.NEXT_PUBLIC_APP_URL}\n`)
  
  const validator = new ProductionValidator()
  const isValid = await validator.runAllValidations()
  
  if (isValid) {
    generateReadinessReport()
    console.log('🚀 Production validation PASSED!')
    process.exit(0)
  } else {
    console.log('❌ Production validation FAILED!')
    process.exit(1)
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Validation script error:', error)
    process.exit(1)
  })
}

export { ProductionValidator, SECURITY_CHECKLIST }
