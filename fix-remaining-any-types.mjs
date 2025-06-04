import fs from 'fs';
import path from 'path';

// Map of specific any type fixes based on context analysis
const anyTypeFixes = {
  './components/booking/cal-booking-widget.tsx': [
    { line: 36, context: 'eventType', replacement: 'CalEventType' },
    { line: 90, context: 'config', replacement: 'CalConfig' }
  ],
  './components/streaming/client-data-stream.tsx': [
    { line: 12, context: 'data parameter', replacement: 'Record<string, unknown>' },
    { line: 66, context: 'response data', replacement: 'Record<string, unknown>' }
  ],
  './components/ui/external-video.tsx': [
    { line: 366, context: 'video event', replacement: 'Event' }
  ],
  './components/ui/video-player.tsx': [
    { line: 14, context: 'video element', replacement: 'HTMLVideoElement | null' },
    { line: 43, context: 'event handler', replacement: 'Event' },
    { line: 45, context: 'performance data', replacement: 'Record<string, unknown>' }
  ],
  './lib/actions/email-actions.ts': [
    { line: 10, context: 'form data', replacement: 'FormData' }
  ],
  './lib/auth/auth-enhanced.ts': [
    { line: 131, context: 'user data', replacement: 'Record<string, unknown>' }
  ],
  './lib/cookies/consent-manager.ts': [
    { line: 386, context: 'listener callback', replacement: '(...args: unknown[]) => void' },
    { line: 388, context: 'listener callback', replacement: '(...args: unknown[]) => void' }
  ],
  './lib/email/sequences/types.ts': [
    { line: 32, context: 'template context', replacement: 'Record<string, unknown>' }
  ],
  './lib/email/types.ts': [
    { line: 16, context: 'template data', replacement: 'Record<string, unknown>' },
    { line: 18, context: 'email metadata', replacement: 'Record<string, unknown>' }
  ],
  './lib/error/error-handling.ts': [
    { line: 129, context: 'error context', replacement: 'ErrorContext' }
  ],
  './lib/error-tracking.ts': [
    { line: 192, context: 'error data', replacement: 'ErrorContext' },
    { line: 214, context: 'error data', replacement: 'ErrorContext' },
    { line: 227, context: 'error data', replacement: 'ErrorContext' },
    { line: 310, context: 'monitoring data', replacement: 'Record<string, unknown>' }
  ],
  './lib/integrations/cal-webhook.ts': [
    { line: 249, context: 'webhook payload', replacement: 'Record<string, unknown>' }
  ],
  './lib/monitoring/app-monitoring.ts': [
    { line: 50, context: 'monitoring data', replacement: 'Record<string, unknown>' }
  ],
  './lib/redis/production-rate-limiter.ts': [
    { line: 289, context: 'redis data', replacement: 'Record<string, unknown>' }
  ],
  './lib/redis/trpc-middleware.ts': [
    { line: 211, context: 'middleware context', replacement: 'Record<string, unknown>' }
  ]
};

console.log('🔧 Fixing remaining any types with specific type replacements...');

let totalFixed = 0;

for (const [filePath, fixes] of Object.entries(anyTypeFixes)) {
  try {
    // Remove the ./ prefix to get actual file path
    const actualPath = filePath.replace('./', '');
    
    if (!fs.existsSync(actualPath)) {
      console.log(`⚠️  File not found: ${actualPath}`);
      continue;
    }

    console.log(`\n📝 Processing ${actualPath}...`);
    
    let content = fs.readFileSync(actualPath, 'utf8');
    const lines = content.split('\n');
    
    // Sort fixes by line number in descending order to avoid line number shifts
    const sortedFixes = fixes.sort((a, b) => b.line - a.line);
    
    for (const fix of sortedFixes) {
      const lineIndex = fix.line - 1; // Convert to 0-based index
      
      if (lineIndex < lines.length) {
        const originalLine = lines[lineIndex];
        
        // Different patterns to match 'any' usage
        const patterns = [
          { regex: /:\s*any\b/, replacement: `: ${fix.replacement}` },
          { regex: /\<any\>/, replacement: `<${fix.replacement}>` },
          { regex: /\bas\s+any\b/, replacement: `as ${fix.replacement}` },
          { regex: /Record<string,\s*any>/, replacement: 'Record<string, unknown>' },
          { regex: /Record<string,any>/, replacement: 'Record<string, unknown>' },
          { regex: /\[\s*key:\s*string\s*\]:\s*any/, replacement: `[key: string]: ${fix.replacement}` }
        ];
        
        let updatedLine = originalLine;
        for (const pattern of patterns) {
          if (pattern.regex.test(updatedLine)) {
            updatedLine = updatedLine.replace(pattern.regex, pattern.replacement);
            break;
          }
        }
        
        if (updatedLine !== originalLine) {
          lines[lineIndex] = updatedLine;
          console.log(`  ✅ Line ${fix.line}: ${fix.context}`);
          console.log(`     Before: ${originalLine.trim()}`);
          console.log(`     After:  ${updatedLine.trim()}`);
          totalFixed++;
        } else {
          console.log(`  ⚠️  Line ${fix.line}: No 'any' pattern matched for ${fix.context}`);
          console.log(`     Content: ${originalLine.trim()}`);
        }
      } else {
        console.log(`  ❌ Line ${fix.line} not found in file`);
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(actualPath, lines.join('\n'));
    console.log(`  💾 Updated ${actualPath} with ${fixes.length} fixes`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 Fixed ${totalFixed} any type issues across ${Object.keys(anyTypeFixes).length} files!`);

// Add necessary imports to files that need them
const importFixes = {
  './components/booking/cal-booking-widget.tsx': [
    "import type { CalEventType, CalConfig } from '@/types/booking-types'"
  ],
  './lib/error/error-handling.ts': [
    "import type { ErrorContext } from '@/types/analytics-types'"
  ],
  './lib/error-tracking.ts': [
    "import type { ErrorContext } from '@/types/analytics-types'"
  ]
};

console.log('\n📦 Adding necessary imports...');

for (const [filePath, imports] of Object.entries(importFixes)) {
  try {
    const actualPath = filePath.replace('./', '');
    
    if (!fs.existsSync(actualPath)) {
      console.log(`⚠️  File not found: ${actualPath}`);
      continue;
    }

    let content = fs.readFileSync(actualPath, 'utf8');
    
    // Check if imports already exist
    for (const importStatement of imports) {
      if (!content.includes(importStatement)) {
        // Find the last import statement and add after it
        const lines = content.split('\n');
        let lastImportIndex = -1;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        if (lastImportIndex !== -1) {
          lines.splice(lastImportIndex + 1, 0, importStatement);
          content = lines.join('\n');
          fs.writeFileSync(actualPath, content);
          console.log(`  ✅ Added import to ${actualPath}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error adding imports to ${filePath}:`, error.message);
  }
}

console.log('\n✨ All any type fixes completed!');