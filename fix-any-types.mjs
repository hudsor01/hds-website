#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

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
  './lib/store/ui-store.ts'
];

// Comprehensive replacements with proper types
const replacements = [
  // Import statements needed - add at top of files that need them
  { context: 'needs-analytics', from: /^import/, to: 'import type { AnalyticsEvent, ErrorContext } from \'@/types/analytics-types\'\nimport type { EmailPayload, TemplateContext } from \'@/types/email-types\'\nimport type { FormSubmissionResult, FormErrors } from \'@/types/form-types\'\nimport type { ApiResponse, ApiError } from \'@/types/api-types\'\nimport' },
  
  // Error context types
  { from: /context\?: Record<string, any>/g, to: 'context?: ErrorContext' },
  { from: /errorContext\?: Record<string, any>/g, to: 'errorContext?: ErrorContext' },
  { from: /metadata\?: Record<string, any>/g, to: 'metadata?: ErrorContext' },
  
  // Analytics types
  { from: /properties\?: Record<string, any>/g, to: 'properties?: AnalyticsEvent' },
  { from: /eventData\?: Record<string, any>/g, to: 'eventData?: AnalyticsEvent' },
  { from: /analyticsData\?: Record<string, any>/g, to: 'analyticsData?: AnalyticsEvent' },
  { from: /data\?: Record<string, any>/g, to: 'data?: AnalyticsEvent' },
  
  // Email types  
  { from: /templateData\?: Record<string, any>/g, to: 'templateData?: TemplateContext' },
  { from: /emailData\?: Record<string, any>/g, to: 'emailData?: EmailPayload' },
  { from: /emailContext\?: Record<string, any>/g, to: 'emailContext?: TemplateContext' },
  
  // Form types
  { from: /formData\?: Record<string, any>/g, to: 'formData?: FormSubmissionResult' },
  { from: /errors\?: Record<string, any>/g, to: 'errors?: FormErrors<any>' },
  { from: /validationErrors\?: Record<string, any>/g, to: 'validationErrors?: FormErrors<any>' },
  
  // API types
  { from: /response\?: Record<string, any>/g, to: 'response?: ApiResponse' },
  { from: /apiResponse\?: Record<string, any>/g, to: 'apiResponse?: ApiResponse' },
  { from: /result\?: Record<string, any>/g, to: 'result?: ApiResponse' },
  { from: /error\?: Record<string, any>/g, to: 'error?: ApiError' },
  { from: /apiError\?: Record<string, any>/g, to: 'apiError?: ApiError' },
  
  // Generic object types - be more specific based on context
  { from: /Record<string, any>/g, to: 'Record<string, unknown>' },
  { from: /\{\s*\[key: string\]: any\s*\}/g, to: '{ [key: string]: unknown }' },
  
  // Function parameters
  { from: /\(([^)]*): any\)/g, to: '($1: unknown)' },
  { from: /\(([^)]*), ([^)]*): any\)/g, to: '($1, $2: unknown)' },
  
  // Generic constraints - be specific
  { from: /extends Record<string, any>/g, to: 'extends Record<string, unknown>' },
  { from: /extends ComponentType<any>/g, to: 'extends ComponentType<Record<string, unknown>>' },
  
  // React types - use proper React types
  { from: /React\.forwardRef<any,/g, to: 'React.forwardRef<HTMLElement,' },
  { from: /ComponentType<any>/g, to: 'ComponentType<Record<string, unknown>>' },
  { from: /ReactElement<any>/g, to: 'ReactElement' },
  { from: /ReactNode<any>/g, to: 'ReactNode' },
  
  // State and hook types
  { from: /useState<any>/g, to: 'useState<unknown>' },
  { from: /useEffect<any>/g, to: 'useEffect' },
  { from: /useMemo<any>/g, to: 'useMemo<unknown>' },
  { from: /useCallback<any>/g, to: 'useCallback' },
  
  // Event handlers
  { from: /handler\?: \(([^)]*): any\) => void/g, to: 'handler?: ($1: unknown) => void' },
  { from: /callback\?: \(([^)]*): any\) => void/g, to: 'callback?: ($1: unknown) => void' },
  { from: /onChange\?: \(([^)]*): any\) => void/g, to: 'onChange?: ($1: unknown) => void' },
  
  // Array types
  { from: /: any\[\]/g, to: ': unknown[]' },
  { from: /Array<any>/g, to: 'Array<unknown>' },
  
  // Common variable declarations  
  { from: /: any =/g, to: ': unknown =' },
  { from: /: any;/g, to: ': unknown;' },
  { from: /: any\)/g, to: ': unknown)' },
  { from: /: any,/g, to: ': unknown,' },
  { from: /: any\|/g, to: ': unknown |' },
  { from: /\| any/g, to: '| unknown' },
  
  // Promise and async types
  { from: /Promise<any>/g, to: 'Promise<unknown>' },
  { from: /async \(([^)]*): any\)/g, to: 'async ($1: unknown)' },
  
  // Zustand store types - be specific
  { from: /create<any>/g, to: 'create<Record<string, unknown>>' },
  { from: /StoreApi<any>/g, to: 'StoreApi<Record<string, unknown>>' },
  
  // Animation and motion types
  { from: /motionProps\?: any/g, to: 'motionProps?: Record<string, unknown>' },
  { from: /animationConfig\?: any/g, to: 'animationConfig?: Record<string, unknown>' },
  
  // Cache and Redis types
  { from: /cacheValue\?: any/g, to: 'cacheValue?: unknown' },
  { from: /redisData\?: any/g, to: 'redisData?: unknown' },
  
  // Configuration types
  { from: /config\?: any/g, to: 'config?: Record<string, unknown>' },
  { from: /options\?: any/g, to: 'options?: Record<string, unknown>' },
  { from: /settings\?: any/g, to: 'settings?: Record<string, unknown>' },
];

// Add imports where needed
function addImportsIfNeeded(content, filePath) {
  // Check if file needs analytics types
  const needsAnalytics = /AnalyticsEvent|ErrorContext/.test(content);
  const needsEmail = /EmailPayload|TemplateContext/.test(content);
  const needsForm = /FormSubmissionResult|FormErrors/.test(content);
  const needsApi = /ApiResponse|ApiError/.test(content);
  
  if (needsAnalytics || needsEmail || needsForm || needsApi) {
    const imports = [];
    if (needsAnalytics) imports.push('AnalyticsEvent, ErrorContext');
    if (needsEmail) imports.push('EmailPayload, TemplateContext');
    if (needsForm) imports.push('FormSubmissionResult, FormErrors');
    if (needsApi) imports.push('ApiResponse, ApiError');
    
    // Add import statements at the top after existing imports
    const importLines = [];
    if (needsAnalytics) importLines.push("import type { AnalyticsEvent, ErrorContext } from '@/types/analytics-types'");
    if (needsEmail) importLines.push("import type { EmailPayload, TemplateContext } from '@/types/email-types'");
    if (needsForm) importLines.push("import type { FormSubmissionResult, FormErrors } from '@/types/form-types'");
    if (needsApi) importLines.push("import type { ApiResponse, ApiError } from '@/types/api-types'");
    
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') && !lines[i].includes('from \'@/types/')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex > -1) {
      lines.splice(lastImportIndex + 1, 0, ...importLines);
      content = lines.join('\n');
    }
  }
  
  return content;
}

let totalFixed = 0;

files.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply replacements
    replacements.forEach(({ from, to, context }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    // Add imports if needed
    if (modified) {
      content = addImportsIfNeeded(content, filePath);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed any types in: ${filePath}`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Batch any type fixes completed! Fixed ${totalFixed} files.`);
console.log('🔍 Run "npm run lint" to verify all any types are resolved.');