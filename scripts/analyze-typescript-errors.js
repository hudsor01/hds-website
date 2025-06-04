#!/usr/bin/env node

/**
 * TypeScript Error Analyzer
 * 
 * This script analyzes TypeScript errors and groups them by common patterns
 * to make them easier to fix systematically.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output file paths
const ANALYSIS_OUTPUT_PATH = path.join(__dirname, '../TYPESCRIPT_ERROR_ANALYSIS.md');

console.log('🔍 Analyzing TypeScript errors to find patterns...');

try {
  // Run TypeScript with noEmit and capture the output
  const output = execSync('npx tsc --noEmit', { 
    encoding: 'utf8',
    cwd: path.resolve(__dirname, '..') 
  });

  // Process will reach here only if there are no errors, which is unlikely
  console.log('✅ No TypeScript errors found!');
  fs.writeFileSync(ANALYSIS_OUTPUT_PATH, '# TypeScript Analysis\n\nNo errors found. The codebase is TypeScript-clean!');
  process.exit(0);
} catch (error) {
  if (!error.stdout) {
    console.error('❌ Failed to run TypeScript:', error);
    process.exit(1);
  }

  // Parse the TypeScript errors
  const errorOutput = error.stdout;
  const errorLines = errorOutput.split('\n').filter(line => line.includes('error TS'));
  
  console.log(`📊 Found ${errorLines.length} TypeScript errors`);

  // Count error codes
  const errorCounts = {};
  errorLines.forEach(line => {
    const match = line.match(/error TS(\d+):/);
    if (match) {
      const errorCode = match[1];
      errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
    }
  });

  // Sort by frequency
  const sortedErrorCodes = Object.entries(errorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, count }));
  
  // Categorize errors
  const loggerErrors = errorLines.filter(line => 
    (line.includes('Record<string, unknown>') && line.includes('string')) ||
    (line.includes('Argument of type') && line.includes('is not assignable to parameter of type'))
  );

  const missingPropertyErrors = errorLines.filter(line => 
    line.includes('Property') && line.includes('does not exist on type')
  );

  const typeErrors = errorLines.filter(line => 
    line.includes('Type') && line.includes('is not assignable to type')
  );

  const implicitAnyErrors = errorLines.filter(line => 
    line.includes('implicitly has an') && line.includes('type')
  );

  const nameErrors = errorLines.filter(line => 
    line.includes('Cannot find name')
  );

  // Group errors by file
  const fileErrors = {};
  errorLines.forEach(line => {
    const fileMatch = line.match(/^(.+?)\(\d+,\d+\):/);
    if (fileMatch) {
      const filePath = fileMatch[1];
      fileErrors[filePath] = (fileErrors[filePath] || 0) + 1;
    }
  });

  // Sort files by error count
  const sortedFileErrors = Object.entries(fileErrors)
    .sort((a, b) => b[1] - a[1])
    .map(([file, count]) => ({ file, count }))
    .slice(0, 20); // Top 20 files with errors
  
  // Create Markdown report
  let report = `# TypeScript Error Analysis\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total errors**: ${errorLines.length}\n`;
  report += `- **Error categories**: ${Object.keys(errorCounts).length} unique error codes\n\n`;

  report += `## Error Categories by Frequency\n\n`;
  report += `| Error Code | Count | Description |\n`;
  report += `|------------|-------|-------------|\n`;
  
  // Add descriptions for common error codes
  const errorDescriptions = {
    '2339': 'Property does not exist on type',
    '2769': 'No overload matches this call',
    '2345': 'Argument type is not assignable to parameter type',
    '2322': 'Type is not assignable to type',
    '2860': 'Left-hand side of instanceof must be assignable to right-hand side',
    '7006': 'Parameter implicitly has an any type',
    '2551': 'Property does not exist on type (did you mean...)',
    '2554': 'Expected N arguments, but got M',
    '2741': 'Property is missing in type but required in type',
    '2532': 'Object is possibly undefined',
    '2307': 'Cannot find module',
    '2552': 'Cannot find name (did you mean...)',
  };
  
  sortedErrorCodes.forEach(({ code, count }) => {
    const description = errorDescriptions[code] || 'Unknown error';
    report += `| TS${code} | ${count} | ${description} |\n`;
  });

  report += `\n## Common Error Patterns\n\n`;
  
  report += `### Logger Errors (${loggerErrors.length})\n\n`;
  report += `These errors are related to logger calls with incorrect types, like passing strings to functions expecting Record<string, unknown>.\n\n`;
  report += `**Example:**\n\`\`\`\n${loggerErrors.slice(0, 5).join('\n')}\n\`\`\`\n\n`;
  
  report += `### Missing Property Errors (${missingPropertyErrors.length})\n\n`;
  report += `These errors occur when trying to access properties that don't exist on the type.\n\n`;
  report += `**Example:**\n\`\`\`\n${missingPropertyErrors.slice(0, 5).join('\n')}\n\`\`\`\n\n`;
  
  report += `### Type Assignment Errors (${typeErrors.length})\n\n`;
  report += `These errors happen when one type is not compatible with another.\n\n`;
  report += `**Example:**\n\`\`\`\n${typeErrors.slice(0, 5).join('\n')}\n\`\`\`\n\n`;
  
  report += `### Implicit Any Errors (${implicitAnyErrors.length})\n\n`;
  report += `These errors occur when TypeScript infers 'any' type for a variable without an explicit type annotation.\n\n`;
  report += `**Example:**\n\`\`\`\n${implicitAnyErrors.slice(0, 5).join('\n')}\n\`\`\`\n\n`;
  
  report += `### Name Not Found Errors (${nameErrors.length})\n\n`;
  report += `These errors happen when referencing variables or types that don't exist.\n\n`;
  report += `**Example:**\n\`\`\`\n${nameErrors.slice(0, 5).join('\n')}\n\`\`\`\n\n`;
  
  report += `## Files with Most Errors\n\n`;
  report += `| File | Error Count |\n`;
  report += `|------|------------|\n`;
  sortedFileErrors.forEach(({ file, count }) => {
    report += `| ${file} | ${count} |\n`;
  });

  report += `\n## Fix Recommendations\n\n`;
  report += `1. **Fix Logger System**: Update the logger to accept various types of inputs or fix all logger calls to match expected types.\n\n`;
  report += `2. **Fix tRPC Configuration**: Address the tRPC transformer configuration issues in \`lib/trpc/provider.tsx\`.\n\n`;
  report += `3. **Update API Type Definitions**: Add missing properties to type definitions for API responses.\n\n`;
  report += `4. **Add Type Annotations**: Add explicit type annotations to parameters in event handlers and callbacks.\n\n`;
  report += `5. **Fix Typos**: Fix variable name typos like \`updateStatusmutation\` to \`updateStatusMutation\`.\n\n`;
  
  report += `## Fix Strategy\n\n`;
  report += `1. **Fix Core Infrastructure First**: Start with fixing the logger implementation and tRPC provider configuration.\n\n`;
  report += `2. **Fix High-Impact Files**: Focus on files with the most errors, as fixing these will have the biggest impact.\n\n`;
  report += `3. **Use TypeScript Directives**: For files that are challenging to fix immediately, use \`// @ts-ignore\` or \`// @ts-expect-error\` as temporary workarounds.\n\n`;
  report += `4. **Create Type Utilities**: Develop helper types and utility functions to make it easier to work with complex types.\n\n`;
  report += `5. **Incremental Approach**: Don't try to fix everything at once. Use the relaxed TypeScript configuration for development while gradually fixing errors.\n`;

  // Write the report to file
  fs.writeFileSync(ANALYSIS_OUTPUT_PATH, report);
  
  console.log(`✅ Analysis complete! Report saved to: ${ANALYSIS_OUTPUT_PATH}`);
  console.log(`📋 Key findings:`);
  console.log(`- Top error codes: ${sortedErrorCodes.slice(0, 3).map(e => `TS${e.code} (${e.count})`).join(', ')}`);
  console.log(`- Most problematic files: ${sortedFileErrors.slice(0, 3).map(e => `${e.file} (${e.count})`).join(', ')}`);
  console.log(`- Main categories: Logger errors (${loggerErrors.length}), Missing properties (${missingPropertyErrors.length}), Type errors (${typeErrors.length})`);
  
} catch (error) {
  console.error('❌ Error analyzing TypeScript issues:', error);
  process.exit(1);
}