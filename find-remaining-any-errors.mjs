import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log('🔍 Finding remaining @typescript-eslint/no-explicit-any errors...');
  
  // Run ESLint to find remaining any type errors
  const result = execSync('npm run lint 2>&1 | grep "@typescript-eslint/no-explicit-any" || true', {
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  console.log('Raw ESLint output:');
  console.log(result);
  
  if (!result.trim()) {
    console.log('✅ No remaining @typescript-eslint/no-explicit-any errors found!');
    process.exit(0);
  }
  
  // Parse the errors to extract file paths and line numbers
  const errors = result.split('\n')
    .filter(line => line.includes('@typescript-eslint/no-explicit-any'))
    .map(line => {
      const match = line.match(/^(.+?):(\d+):(\d+)/);
      if (match) {
        return {
          file: match[1].trim(),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          fullLine: line.trim()
        };
      }
      return null;
    })
    .filter(Boolean);
  
  console.log(`\n📊 Found ${errors.length} remaining any type errors:`);
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.file}:${error.line}:${error.column}`);
  });
  
  // Group by file for batch processing
  const fileGroups = errors.reduce((acc, error) => {
    if (!acc[error.file]) {
      acc[error.file] = [];
    }
    acc[error.file].push(error);
    return acc;
  }, {});
  
  console.log(`\n📁 Files to fix: ${Object.keys(fileGroups).length}`);
  Object.keys(fileGroups).forEach(file => {
    console.log(`  - ${file} (${fileGroups[file].length} errors)`);
  });
  
  // Save the results for the next script
  fs.writeFileSync('remaining-any-errors.json', JSON.stringify({
    errors,
    fileGroups,
    totalErrors: errors.length
  }, null, 2));
  
  console.log('\n💾 Results saved to remaining-any-errors.json');
  
} catch (error) {
  console.error('❌ Error finding any type errors:', error.message);
  process.exit(1);
}