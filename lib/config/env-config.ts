/**
 * Next.js 15 Environment Configuration Utilities
 * Advanced environment management with load order and runtime checks
 */

import { loadEnvConfig } from '@next/env'

// Environment file load order (as per Next.js documentation)
export const envLoadOrder = [
  'process.env',
  '.env.$(NODE_ENV).local',  // .env.development.local, .env.production.local
  '.env.local',              // (Not loaded when NODE_ENV is test)
  '.env.$(NODE_ENV)',        // .env.development, .env.production, .env.test
  '.env',
] as const

// Environment configuration for different deployment scenarios
export const envConfigs = {
  development: {
    files: ['.env.development.local', '.env.local', '.env.development', '.env'],
    features: {
      hotReload: true,
      debugMode: true,
      detailedErrors: true,
      sourceMap: true,
    },
  },
  
  production: {
    files: ['.env.production.local', '.env.local', '.env.production', '.env'],
    features: {
      hotReload: false,
      debugMode: false,
      detailedErrors: false,
      sourceMap: false,
    },
  },
  
  test: {
    files: ['.env.test.local', '.env.test', '.env'], // .env.local is NOT loaded in test
    features: {
      hotReload: false,
      debugMode: true,
      detailedErrors: true,
      sourceMap: true,
    },
  },
} as const

// Runtime environment detection
export const runtimeEnv = {
  /**
   * Detect if running in Next.js runtime
   */
  isNextJs: () => typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== undefined,
  
  /**
   * Detect if running in Edge Runtime
   */
  isEdgeRuntime: () => process.env.NEXT_RUNTIME === 'edge',
  
  /**
   * Detect if running in Node.js runtime
   */
  isNodeRuntime: () => process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === undefined,
  
  /**
   * Detect deployment platform
   */
  getDeploymentPlatform: () => {
    if (process.env.VERCEL) return 'vercel'
    if (process.env.NETLIFY) return 'netlify'
    if (process.env.RAILWAY_ENVIRONMENT) return 'railway'
    if (process.env.RENDER) return 'render'
    if (process.env.FLY_APP_NAME) return 'fly'
    if (process.env.DOCKER_CONTAINER) return 'docker'
    return 'unknown'
  },
}

// Environment variable reference utilities
export const envReference = {
  /**
   * Example of variable expansion (Next.js feature)
   * .env: TWITTER_USER=nextjs
   * .env: TWITTER_URL=https://x.com/$TWITTER_USER
   * Result: process.env.TWITTER_URL = 'https://x.com/nextjs'
   */
  expandVariables: (template: string, vars: Record<string, string>): string => template.replace(/\$([A-Z_][A-Z0-9_]*)/g, (match, varName) => vars[varName] || match),
  
  /**
   * Escape dollar signs in environment variables
   */
  escapeDollarSigns: (value: string): string => value.replace(/\$/g, '\\$'),
}

// Environment loading utilities
export const envLoader = {
  /**
   * Load environment variables for external tools (like ORMs)
   * Uses @next/env package for consistency with Next.js
   */
  loadForExternalTool: (projectDir?: string): void => {
    const dir = projectDir || process.cwd()
    loadEnvConfig(dir)
  },
  
  /**
   * Load environment variables for testing
   */
  loadForTesting: (): void => {
    const projectDir = process.cwd()
    
    // Manually set NODE_ENV to test if not set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'test'
    }
    
    loadEnvConfig(projectDir)
  },
}

// Environment validation for different contexts
export const envValidation = {
  /**
   * Validate browser environment variables (NEXT_PUBLIC_ only)
   */
  validateBrowserEnv: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Check for accidentally exposed server variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('API_KEY') || key.startsWith('SECRET') || key.includes('PASSWORD')) {
        if (!key.startsWith('NEXT_PUBLIC_')) {
          errors.push(`❌ Server variable '${key}' may be accidentally exposed to browser`)
        }
      }
    })
    
    return {
      valid: errors.length === 0,
      errors,
    }
  },
  
  /**
   * Validate build-time vs runtime variables
   */
  validateBuildTimeVars: (): { buildTime: string[]; runtime: string[] } => {
    const buildTime: string[] = []
    const runtime: string[] = []
    
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        buildTime.push(key)
      } else {
        runtime.push(key)
      }
    })
    
    return { buildTime, runtime }
  },
}

// Feature flag management
export const featureFlags = {
  /**
   * Create a feature flag checker
   */
  createChecker: (prefix = 'NEXT_PUBLIC_ENABLE_') => (feature: string): boolean => {
      const key = `${prefix}${feature.toUpperCase()}`
      const value = process.env[key]
      return value === 'true' || value === '1'
    },
  
  /**
   * Get all enabled features
   */
  getEnabledFeatures: (prefix = 'NEXT_PUBLIC_ENABLE_'): string[] => Object.keys(process.env)
      .filter(key => key.startsWith(prefix) && (process.env[key] === 'true' || process.env[key] === '1'))
      .map(key => key.replace(prefix, '').toLowerCase()),
}

// Environment debugging utilities
export const envDebug = {
  /**
   * Log environment configuration (development only)
   */
  logEnvConfig: (): void => {
    if (process.env.NODE_ENV !== 'development') return
    
    console.log('🔧 Environment Configuration Debug:')
    console.log(`  • NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`  • Runtime: ${runtimeEnv.isEdgeRuntime() ? 'Edge' : 'Node.js'}`)
    console.log(`  • Platform: ${runtimeEnv.getDeploymentPlatform()}`)
    
    const { buildTime, runtime } = envValidation.validateBuildTimeVars()
    console.log(`  • Build-time vars: ${buildTime.length}`)
    console.log(`  • Runtime vars: ${runtime.length}`)
    
    const browserCheck = envValidation.validateBrowserEnv()
    if (!browserCheck.valid) {
      console.warn('⚠️  Browser environment warnings:', browserCheck.errors)
    }
  },
  
  /**
   * Generate environment report
   */
  generateEnvReport: (): Record<string, unknown> => ({
      nodeEnv: process.env.NODE_ENV,
      runtime: runtimeEnv.isEdgeRuntime() ? 'edge' : 'nodejs',
      platform: runtimeEnv.getDeploymentPlatform(),
      loadOrder: envLoadOrder,
      enabledFeatures: featureFlags.getEnabledFeatures(),
      validation: envValidation.validateBrowserEnv(),
      varCounts: envValidation.validateBuildTimeVars(),
    }),
}

// Multi-environment deployment utilities
export const multiEnvUtils = {
  /**
   * Get environment-specific configuration
   */
  getEnvConfig: (env: 'development' | 'production' | 'test' = 'development') => envConfigs[env],
  
  /**
   * Create Docker environment mapping
   */
  createDockerEnvMapping: (): string[] => Object.keys(process.env)
      .filter(key => !key.startsWith('npm_') && !key.startsWith('TERM'))
      .map(key => `${key}=${process.env[key]}`),
  
  /**
   * Generate environment file content
   */
  generateEnvFile: (vars: Record<string, string>, comments?: Record<string, string>): string => Object.entries(vars)
      .map(([key, value]) => {
        const comment = comments?.[key] ? `# ${comments[key]}\n` : ''
        return `${comment}${key}=${value}`
      })
      .join('\n\n'),
}