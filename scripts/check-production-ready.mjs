#!/usr/bin/env node

/**
 * Production Build Readiness Check
 * 
 * Comprehensive check for TypeScript, ESLint, and build readiness
 */

import { execSync } from 'child_process';
import fs from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${COLORS.cyan}🚀 Production Build Readiness Check${COLORS.reset}\n`);

let allChecksPassed = true;

// 1. TypeScript Check
console.log(`${COLORS.blue}1. Checking TypeScript errors...${COLORS.reset}`);
try {
  execSync('npm run type-check', { stdio: 'pipe' });
  console.log(`${COLORS.green}✅ No TypeScript errors${COLORS.reset}`);
} catch (error) {
  allChecksPassed = false;
  const output = error.stdout?.toString() || '';
  const errorCount = (output.match(/error TS/g) || []).length;
  console.log(`${COLORS.red}❌ Found ${errorCount} TypeScript errors${COLORS.reset}`);
  
  // Get error summary
  const errorTypes = {};
  const matches = output.matchAll(/error (TS\d+):/g);
  for (const match of matches) {
    errorTypes[match[1]] = (errorTypes[match[1]] || 0) + 1;
  }
  
  console.log('\nError types:');
  Object.entries(errorTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([code, count]) => {
      console.log(`  ${code}: ${count} errors`);
    });
}

// 2. ESLint Check
console.log(`\n${COLORS.blue}2. Checking ESLint errors...${COLORS.reset}`);
try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log(`${COLORS.green}✅ No ESLint errors${COLORS.reset}`);
} catch (error) {
  allChecksPassed = false;
  const output = error.stdout?.toString() || '';
  const errors = (output.match(/Error:/g) || []).length;
  const warnings = (output.match(/Warning:/g) || []).length;
  console.log(`${COLORS.red}❌ Found ${errors} errors, ${warnings} warnings${COLORS.reset}`);
}

// 3. Check for console.log statements
console.log(`\n${COLORS.blue}3. Checking for console.log statements...${COLORS.reset}`);
try {
  const result = execSync('grep -r "console.log" --include="*.ts" --include="*.tsx" app lib components | grep -v "// console.log" | wc -l', { stdio: 'pipe' });
  const count = parseInt(result.toString().trim());
  if (count > 0) {
    console.log(`${COLORS.yellow}⚠️  Found ${count} console.log statements${COLORS.reset}`);
  } else {
    console.log(`${COLORS.green}✅ No console.log statements${COLORS.reset}`);
  }
} catch (error) {
  console.log(`${COLORS.green}✅ No console.log statements${COLORS.reset}`);
}

// 4. Environment Variables Check
console.log(`\n${COLORS.blue}4. Checking environment variables...${COLORS.reset}`);
const requiredEnvVars = [
  'DATABASE_URL',
  'RESEND_API_KEY',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'NEXT_PUBLIC_APP_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  allChecksPassed = false;
  console.log(`${COLORS.red}❌ Missing environment variables: ${missingEnvVars.join(', ')}${COLORS.reset}`);
} else {
  console.log(`${COLORS.green}✅ All required environment variables present${COLORS.reset}`);
}

// 5. Check package.json for security audit
console.log(`\n${COLORS.blue}5. Running security audit...${COLORS.reset}`);
try {
  const auditResult = execSync('npm audit --production', { stdio: 'pipe' }).toString();
  if (auditResult.includes('found 0 vulnerabilities')) {
    console.log(`${COLORS.green}✅ No security vulnerabilities${COLORS.reset}`);
  } else {
    console.log(`${COLORS.yellow}⚠️  Security audit found issues${COLORS.reset}`);
  }
} catch (error) {
  console.log(`${COLORS.yellow}⚠️  Security audit found issues${COLORS.reset}`);
}

// 6. Try a production build
console.log(`\n${COLORS.blue}6. Testing production build...${COLORS.reset}`);
console.log('This may take a few minutes...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log(`${COLORS.green}✅ Production build successful${COLORS.reset}`);
} catch (error) {
  allChecksPassed = false;
  console.log(`${COLORS.red}❌ Production build failed${COLORS.reset}`);
  const output = error.stdout?.toString() || '';
  // Show first few lines of error
  const lines = output.split('\n').filter(line => line.includes('Error') || line.includes('error'));
  lines.slice(0, 5).forEach(line => console.log(`  ${line}`));
}

// Summary
console.log(`\n${COLORS.cyan}📊 Summary${COLORS.reset}`);
console.log('=' .repeat(50));

if (allChecksPassed) {
  console.log(`${COLORS.green}✅ ALL CHECKS PASSED - Ready for production!${COLORS.reset}`);
} else {
  console.log(`${COLORS.red}❌ Some checks failed - Not ready for production${COLORS.reset}`);
  
  console.log(`\n${COLORS.yellow}Quick fixes to try:${COLORS.reset}`);
  console.log('1. For TypeScript errors: Focus on the most common error types');
  console.log('2. For ESLint: npm run lint:fix');
  console.log('3. For missing env vars: Check .env.example');
  console.log('4. Exclude Supabase functions from TypeScript check if not using them');
}

// Generate detailed report
const report = {
  timestamp: new Date().toISOString(),
  checksRun: 6,
  passed: allChecksPassed,
  details: {
    typescript: 'See typescript_errors.txt',
    eslint: 'Run npm run lint for details',
    environment: missingEnvVars,
  }
};

fs.writeFileSync('production-readiness-report.json', JSON.stringify(report, null, 2));
console.log(`\n${COLORS.cyan}📄 Detailed report saved to: production-readiness-report.json${COLORS.reset}`);
