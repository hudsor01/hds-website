#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Files with any types that need fixing
const files = [
  './components/streaming/client-data-stream.tsx',
  './components/testimonials-carousel.tsx', 
  './lib/actions/email-actions.ts',
  './lib/animation-config.ts',
  './lib/api/error-handler.ts',
  './lib/auth/auth-enhanced.ts',
  './lib/cache/query-cache.ts',
  './lib/client-utils.ts',
  './lib/config/env-config.ts',
  './lib/design-system/tokens/animation-utils.ts',
  './lib/email/sequences/engine.ts',
  './lib/email/sequences/types.ts',
  './lib/email/types.ts',
  './lib/error-tracking.ts',
  './lib/error/error-handling.ts',
  './lib/gdpr/compliance.ts',
  './lib/integrations/cal-supabase-wrapper.ts',
  './lib/lazy-loading/lazy-config.tsx',
  './lib/monitoring/app-monitoring.ts',
  './lib/monitoring/edge-monitoring.ts',
  './lib/monitoring/email-monitoring.ts',
  './lib/redis/production-rate-limiter.ts',
  './lib/security/encryption/field-encryption.ts',
  './lib/security/sanitization.ts',
  './lib/security/spam-protection.ts',
  './lib/server-utils.ts',
  './lib/store/navigation-store.ts',
  './lib/store/ui-store.ts',
]

// Common replacements
const replacements = [
  // Generic object types
  { from: /Record<string, any>/g, to: 'Record<string, unknown>' },
  { from: /\{\s*\[key: string\]: any\s*\}/g, to: '{ [key: string]: unknown }' },
  
  // Function parameters
  { from: /\(([^)]*): any\)/g, to: '($1: unknown)' },
  { from: /\(([^)]*), ([^)]*): any\)/g, to: '($1, $2: unknown)' },
  
  // Generic constraints
  { from: /extends Record<string, any>/g, to: 'extends Record<string, unknown>' },
  { from: /extends ComponentType<any>/g, to: 'extends ComponentType<Record<string, unknown>>' },
  
  // React types
  { from: /React\.forwardRef<any,/g, to: 'React.forwardRef<HTMLElement,' },
  
  // Error/context types
  { from: /context\?: Record<string, any>/g, to: 'context?: ErrorContext' },
  { from: /metadata\?: Record<string, any>/g, to: 'metadata?: Record<string, unknown>' },
  { from: /properties\?: Record<string, any>/g, to: 'properties?: AnalyticsEvent' },
  { from: /data\?: Record<string, any>/g, to: 'data?: Record<string, unknown>' },
  
  // Common variable declarations
  { from: /: any\[\]/g, to: ': unknown[]' },
  { from: /: any =/g, to: ': unknown =' },
  { from: /: any;/g, to: ': unknown;' },
  { from: /: any\)/g, to: ': unknown)' },
  { from: /: any,/g, to: ': unknown,' },
]

files.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`)
      return
    }
    
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    
    replacements.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to)
        modified = true
      }
    })
    
    if (modified) {
      fs.writeFileSync(filePath, content)
      console.log(`Fixed any types in: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
  }
})

console.log('Batch any type fixes completed!')