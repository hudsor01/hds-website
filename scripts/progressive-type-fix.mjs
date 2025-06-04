#!/usr/bin/env node

/**
 * Progressive TypeScript Error Fixing Script
 * 
 * This script helps you fix TypeScript errors progressively by:
 * 1. Running type checks with different strictness levels
 * 2. Categorizing errors by type
 * 3. Providing actionable fixes
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Different TypeScript configurations to test
const configs = [
  {
    name: 'Relaxed (Development)',
    file: 'tsconfig.dev.json',
    description: 'Most permissive - good for getting started',
  },
  {
    name: 'Intermediate',
    file: 'tsconfig.intermediate.json',
    description: 'Some strict checks enabled',
  },
  {
    name: 'Strict (Production)',
    file: 'tsconfig.json',
    description: 'Full strict mode - production ready',
  },
];

// Common TypeScript error patterns and their fixes
const errorPatterns = [
  {
    pattern: /TS2345/,
    type: 'Type Mismatch',
    description: 'Argument type does not match parameter type',
    fix: 'Check function parameter types and ensure arguments match',
  },
  {
    pattern: /TS2322/,
    type: 'Assignment Error',
    description: 'Type cannot be assigned to variable',
    fix: 'Verify variable types and cast if necessary',
  },
  {
    pattern: /TS7053/,
    type: 'Index Signature',
    description: 'Element has any type due to index signature',
    fix: 'Add proper typing to object or use type assertion',
  },
  {
    pattern: /TS2339/,
    type: 'Property Missing',
    description: 'Property does not exist on type',
    fix: 'Check if property exists or add to type definition',
  },
  {
    pattern: /TS2304/,
    type: 'Cannot Find Name',
    description: 'Cannot find name/identifier',
    fix: 'Import missing type or declare it',
  },
  {
    pattern: /TS2571/,
    type: 'Unknown Type',
    description: 'Object is of type unknown',
    fix: 'Add type assertion or proper type guard',
  },
  {
    pattern: /TS18048/,
    type: 'Possibly Undefined',
    description: 'Value is possibly undefined',
    fix: 'Add null/undefined check or use optional chaining',
  },
];

// Check if intermediate config exists, if not create it
function createIntermediateConfig() {
  const intermediateConfig = {
    extends: './tsconfig.json',
    compilerOptions: {
      // Relax some strict checks
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: false,
      strictPropertyInitialization: false,
      strictBindCallApply: true,
      
      // Relax additional checks
      noUnusedLocals: false,
      noUnusedParameters: false,
      noImplicitReturns: false,
      noUncheckedIndexedAccess: false,
      exactOptionalPropertyTypes: false,
      noPropertyAccessFromIndexSignature: false,
    },
  };
  
  fs.writeFileSync(
    'tsconfig.intermediate.json',
    JSON.stringify(intermediateConfig, null, 2)
  );
}

// Run type check with specific config
function runTypeCheck(configFile) {
  try {
    const output = execSync(`npx tsc --noEmit -p ${configFile} 2>&1`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

// Parse TypeScript errors
function parseErrors(output) {
  const lines = output.split('\n');
  const errors = [];
  let currentError = null;
  
  for (const line of lines) {
    const errorMatch = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (errorMatch) {
      if (currentError) {
        errors.push(currentError);
      }
      currentError = {
        file: errorMatch[1],
        line: parseInt(errorMatch[2]),
        column: parseInt(errorMatch[3]),
        code: errorMatch[4],
        message: errorMatch[5],
        context: [],
      };
    } else if (currentError && line.trim()) {
      currentError.context.push(line);
    }
  }
  
  if (currentError) {
    errors.push(currentError);
  }
  
  return errors;
}

// Categorize errors
function categorizeErrors(errors) {
  const categories = {
    imports: [],
    types: [],
    nullability: [],
    any: [],
    unused: [],
    other: [],
  };
  
  for (const error of errors) {
    if (error.code === 'TS2304' || error.code === 'TS2305') {
      categories.imports.push(error);
    } else if (error.code === 'TS7006' || error.message.includes('any')) {
      categories.any.push(error);
    } else if (
      error.code === 'TS2531' ||
      error.code === 'TS2532' ||
      error.code === 'TS18048' ||
      error.message.includes('possibly')
    ) {
      categories.nullability.push(error);
    } else if (error.code === 'TS6133' || error.code === 'TS6196') {
      categories.unused.push(error);
    } else if (
      error.code === 'TS2322' ||
      error.code === 'TS2345' ||
      error.code === 'TS2339'
    ) {
      categories.types.push(error);
    } else {
      categories.other.push(error);
    }
  }
  
  return categories;
}

// Get files with most errors
function getTopErrorFiles(errors, limit = 10) {
  const fileCounts = {};
  
  for (const error of errors) {
    fileCounts[error.file] = (fileCounts[error.file] || 0) + 1;
  }
  
  return Object.entries(fileCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([file, count]) => ({ file, count }));
}

// Generate fix suggestions
function generateFixSuggestions(categories) {
  const suggestions = [];
  
  if (categories.imports.length > 0) {
    suggestions.push({
      priority: 'High',
      category: 'Import Errors',
      count: categories.imports.length,
      suggestion: `
1. Run: npm install --save-dev @types/node @types/react @types/react-dom
2. Check import paths are correct
3. Ensure all dependencies have type definitions
4. Use 'import type' for type-only imports`,
    });
  }
  
  if (categories.any.length > 0) {
    suggestions.push({
      priority: 'High',
      category: 'Any Type Errors',
      count: categories.any.length,
      suggestion: `
1. Replace 'any' with specific types
2. Use 'unknown' instead of 'any' for truly unknown types
3. Create interfaces for complex objects
4. Use generic types where appropriate`,
    });
  }
  
  if (categories.nullability.length > 0) {
    suggestions.push({
      priority: 'Medium',
      category: 'Null/Undefined Errors',
      count: categories.nullability.length,
      suggestion: `
1. Use optional chaining: obj?.property
2. Add null checks: if (value !== null)
3. Use nullish coalescing: value ?? defaultValue
4. Update type definitions to include | null | undefined`,
    });
  }
  
  if (categories.types.length > 0) {
    suggestions.push({
      priority: 'Medium',
      category: 'Type Mismatch Errors',
      count: categories.types.length,
      suggestion: `
1. Check function signatures match usage
2. Use type assertions when safe: value as Type
3. Update interfaces to match actual usage
4. Consider using generics for flexible types`,
    });
  }
  
  return suggestions;
}

// Main execution
console.log(`${COLORS.cyan}🔍 TypeScript Progressive Error Analysis${COLORS.reset}\n`);

// Create intermediate config if needed
if (!fs.existsSync('tsconfig.intermediate.json')) {
  console.log('Creating intermediate TypeScript configuration...');
  createIntermediateConfig();
}

// Run checks for each configuration
const results = [];
for (const config of configs) {
  if (!fs.existsSync(config.file)) {
    console.log(`${COLORS.yellow}⚠️  Skipping ${config.name} - config file not found${COLORS.reset}`);
    continue;
  }
  
  console.log(`\n${COLORS.blue}Checking with ${config.name} configuration...${COLORS.reset}`);
  console.log(`${COLORS.cyan}${config.description}${COLORS.reset}`);
  
  const result = runTypeCheck(config.file);
  const errors = parseErrors(result.output);
  const categories = categorizeErrors(errors);
  
  results.push({
    config: config.name,
    totalErrors: errors.length,
    categories,
    errors,
  });
  
  if (result.success) {
    console.log(`${COLORS.green}✅ No errors found!${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}❌ Found ${errors.length} errors${COLORS.reset}`);
    
    // Show error breakdown
    console.log('\nError breakdown:');
    console.log(`  Import errors: ${categories.imports.length}`);
    console.log(`  Type errors: ${categories.types.length}`);
    console.log(`  Any type errors: ${categories.any.length}`);
    console.log(`  Null/undefined errors: ${categories.nullability.length}`);
    console.log(`  Unused code: ${categories.unused.length}`);
    console.log(`  Other errors: ${categories.other.length}`);
  }
}

// Show summary and recommendations
console.log(`\n${COLORS.magenta}📊 Summary and Recommendations${COLORS.reset}\n`);

// Find the most relaxed config that still has errors
const configWithErrors = results.find(r => r.totalErrors > 0);
if (configWithErrors) {
  console.log(`Start by fixing errors in ${COLORS.yellow}${configWithErrors.config}${COLORS.reset} configuration.\n`);
  
  // Show top files with errors
  const topFiles = getTopErrorFiles(configWithErrors.errors);
  console.log(`${COLORS.cyan}Files with most errors:${COLORS.reset}`);
  topFiles.forEach(({ file, count }) => {
    console.log(`  ${count} errors: ${file}`);
  });
  
  // Generate fix suggestions
  console.log(`\n${COLORS.cyan}Suggested fixes (in priority order):${COLORS.reset}`);
  const suggestions = generateFixSuggestions(configWithErrors.categories);
  suggestions.forEach(({ priority, category, count, suggestion }) => {
    const color = priority === 'High' ? COLORS.red : COLORS.yellow;
    console.log(`\n${color}[${priority}] ${category} (${count} errors)${COLORS.reset}`);
    console.log(suggestion);
  });
  
  // Write detailed error report
  const reportPath = 'typescript-errors-detailed.json';
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        topFiles,
        suggestions,
      },
      null,
      2
    )
  );
  
  console.log(`\n${COLORS.green}📄 Detailed error report saved to: ${reportPath}${COLORS.reset}`);
  
  // Suggest next steps
  console.log(`\n${COLORS.cyan}Next steps:${COLORS.reset}`);
  console.log('1. Fix high-priority errors first (imports and any types)');
  console.log('2. Run this script again to see progress');
  console.log('3. Gradually move to stricter configurations');
  console.log('4. Use tsconfig.dev.json while developing');
  console.log('5. Use tsconfig.json for production builds');
} else {
  console.log(`${COLORS.green}🎉 Congratulations! No TypeScript errors found in any configuration.${COLORS.reset}`);
  console.log('Your code is ready for production with strict type checking!');
}

// Show helpful commands
console.log(`\n${COLORS.cyan}Helpful commands:${COLORS.reset}`);
console.log('npm run type-check:dev    - Check with relaxed rules');
console.log('npm run type-check        - Check with strict rules');
console.log('npx tsc --noEmit --listFiles  - List all files being checked');
console.log('npx tsc --noEmit --pretty     - Show errors with colors');
