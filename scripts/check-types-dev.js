#!/usr/bin/env node

/**
 * Run TypeScript type checking with relaxed rules for development
 * This allows working with the codebase while fixing type issues incrementally
 */

import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Running TypeScript with development configuration...')

try {
  // Check if the development config exists
  const devConfigPath = path.resolve(__dirname, '../tsconfig.dev.json')
  if (!fs.existsSync(devConfigPath)) {
    console.error('❌ tsconfig.dev.json not found. Make sure it exists at the root of your project.')
    process.exit(1)
  }

  // Run TypeScript with the dev config
  execSync('npx tsc --project tsconfig.dev.json --noEmit', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'), 
  })
  
  console.log('✅ Type checking completed successfully with development configuration.')
  console.log('')
  console.log('ℹ️  Note: This used relaxed type checking rules for development.')
  console.log('ℹ️  To see all type errors, run: npm run type-check')
} catch (error) {
  console.error('❌ Type checking failed even with relaxed rules.')
  console.error('')
  console.error('Try addressing the following issues first:')
  console.error('1. Fix tRPC transformer configuration issues')
  console.error('2. Address missing properties in API responses')
  console.error('3. Fix functions with implicit any parameters')
  process.exit(1)
}