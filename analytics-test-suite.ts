#!/usr/bin/env npx tsx

/**
 * Comprehensive Analytics and Monitoring Test Suite
 * Tests all analytics integrations for Hudson Digital Solutions
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'INFO';
  message: string;
  details?: string;
}

class AnalyticsTestSuite {
  private results: TestResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private addResult(test: string, status: TestResult['status'], message: string, details?: string) {
    this.results.push({ test, status, message, details });
  }

  private fileExists(filePath: string): boolean {
    return fs.existsSync(path.join(this.projectRoot, filePath));
  }

  private readFile(filePath: string): string | null {
    try {
      return fs.readFileSync(path.join(this.projectRoot, filePath), 'utf-8');
    } catch {
      return null;
    }
  }

  // Test 1: Web Vitals API Endpoint
  async testWebVitalsAPI() {
    console.log('🧪 Testing Web Vitals API endpoint...');
    
    if (!this.fileExists('src/app/api/analytics/web-vitals/route.ts')) {
      this.addResult('Web Vitals API', 'FAIL', 'Web Vitals API route not found');
      return;
    }

    const routeContent = this.readFile('src/app/api/analytics/web-vitals/route.ts');
    if (!routeContent) {
      this.addResult('Web Vitals API', 'FAIL', 'Could not read Web Vitals API route');
      return;
    }

    // Check for required components
    const checks = [
      { name: 'POST handler', pattern: /export async function POST/ },
      { name: 'Metric validation', pattern: /if.*!metric\.name.*typeof metric\.value/ },
      { name: 'GA4 integration', pattern: /sendToGA4/ },
      { name: 'Error handling', pattern: /try.*catch/ },
      { name: 'Metric storage', pattern: /storeMetric/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(routeContent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Web Vitals API', 
      status, 
      `${passedChecks}/${checks.length} components implemented`,
      details.join('\n')
    );
  }

  // Test 2: Google Analytics 4 Configuration
  testGoogleAnalytics() {
    console.log('🧪 Testing Google Analytics 4 integration...');

    const analyticsContent = this.readFile('src/lib/analytics.ts');
    if (!analyticsContent) {
      this.addResult('Google Analytics 4', 'FAIL', 'Analytics library not found');
      return;
    }

    const checks = [
      { name: 'GA4 initialization', pattern: /initGA.*function/ },
      { name: 'Page view tracking', pattern: /trackPageView/ },
      { name: 'Event tracking', pattern: /trackEvent.*function/ },
      { name: 'Conversion tracking', pattern: /trackConversion/ },
      { name: 'Enhanced ecommerce', pattern: /generate_lead/ },
      { name: 'Privacy settings', pattern: /anonymize_ip.*true/ },
      { name: 'Web Vitals integration', pattern: /web_vital/ },
      { name: 'Error tracking', pattern: /trackError/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(analyticsContent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    // Check environment variables
    const envContent = this.readFile('.env.local');
    const hasGAId = envContent?.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID');
    const hasGASecret = envContent?.includes('GA4_API_SECRET');

    if (hasGAId) {
      details.push('✓ GA Measurement ID configured');
      passedChecks++;
    } else {
      details.push('✗ GA Measurement ID not configured');
    }

    if (hasGASecret) {
      details.push('✓ GA4 API Secret configured');
      passedChecks++;
    } else {
      details.push('✗ GA4 API Secret not configured');
    }

    const totalChecks = checks.length + 2;
    const status = passedChecks === totalChecks ? 'PASS' : 
                  passedChecks > totalChecks / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Google Analytics 4', 
      status, 
      `${passedChecks}/${totalChecks} components configured`,
      details.join('\n')
    );
  }

  // Test 3: PostHog Analytics Setup
  testPostHogAnalytics() {
    console.log('🧪 Testing PostHog analytics setup...');

    const posthogContent = this.readFile('src/lib/posthog.ts');
    if (!posthogContent) {
      this.addResult('PostHog Analytics', 'FAIL', 'PostHog library not found');
      return;
    }

    const checks = [
      { name: 'PostHog initialization', pattern: /initializePostHog/ },
      { name: 'Event tracking', pattern: /trackEvent.*function/ },
      { name: 'Form tracking', pattern: /trackFormSubmission/ },
      { name: 'Button tracking', pattern: /trackButtonClick/ },
      { name: 'Feature flags', pattern: /getFeatureFlag/ },
      { name: 'User identification', pattern: /identifyUser/ },
      { name: 'Privacy compliance', pattern: /optOut.*optIn/ },
      { name: 'Session recording', pattern: /session_recording/ },
      { name: 'Autocapture config', pattern: /autocapture/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(posthogContent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    // Check environment variables
    const envContent = this.readFile('.env.local');
    const hasPostHogKey = envContent?.includes('NEXT_PUBLIC_POSTHOG_KEY');
    const hasPostHogHost = envContent?.includes('NEXT_PUBLIC_POSTHOG_HOST');

    if (hasPostHogKey) {
      details.push('✓ PostHog API key configured');
      passedChecks++;
    } else {
      details.push('✗ PostHog API key not configured');
    }

    if (hasPostHogHost) {
      details.push('✓ PostHog host configured');
      passedChecks++;
    } else {
      details.push('✗ PostHog host not configured');
    }

    const totalChecks = checks.length + 2;
    const status = passedChecks === totalChecks ? 'PASS' : 
                  passedChecks > totalChecks / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'PostHog Analytics', 
      status, 
      `${passedChecks}/${totalChecks} components configured`,
      details.join('\n')
    );
  }

  // Test 4: Vercel Analytics Integration
  testVercelAnalytics() {
    console.log('🧪 Testing Vercel Analytics integration...');

    const packageContent = this.readFile('package.json');
    if (!packageContent) {
      this.addResult('Vercel Analytics', 'FAIL', 'Package.json not found');
      return;
    }

    const pkg = JSON.parse(packageContent);
    const hasVercelAnalytics = pkg.dependencies?.['@vercel/analytics'];
    const hasSpeedInsights = pkg.dependencies?.['@vercel/speed-insights'];

    const analyticsComponent = this.readFile('src/components/Analytics.tsx');
    
    const checks = [
      { name: 'Vercel Analytics package', condition: !!hasVercelAnalytics },
      { name: 'Speed Insights package', condition: !!hasSpeedInsights },
      { name: 'Analytics component', condition: !!analyticsComponent },
      { 
        name: 'Vercel Analytics import', 
        condition: analyticsComponent?.includes('@vercel/analytics/react') || false 
      },
      { 
        name: 'Speed Insights import', 
        condition: analyticsComponent?.includes('@vercel/speed-insights/next') || false 
      }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.condition) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Vercel Analytics', 
      status, 
      `${passedChecks}/${checks.length} components configured`,
      details.join('\n')
    );
  }

  // Test 5: Web Vitals Reporting and Tracking
  testWebVitalsReporting() {
    console.log('🧪 Testing Web Vitals reporting and tracking...');

    const webVitalsComponent = this.readFile('src/components/WebVitalsReporting.tsx');
    if (!webVitalsComponent) {
      this.addResult('Web Vitals Reporting', 'FAIL', 'WebVitalsReporting component not found');
      return;
    }

    const checks = [
      { name: 'useReportWebVitals hook', pattern: /useReportWebVitals/ },
      { name: 'Google Analytics integration', pattern: /window\.gtag/ },
      { name: 'PostHog integration', pattern: /posthogTrackEvent/ },
      { name: 'API endpoint integration', pattern: /\/api\/analytics\/web-vitals/ },
      { name: 'Beacon API usage', pattern: /sendBeacon/ },
      { name: 'Fetch fallback', pattern: /fetch.*fallback/i },
      { name: 'Metric value rounding', pattern: /Math\.round/ },
      { name: 'Error handling', pattern: /catch.*error/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(webVitalsComponent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Web Vitals Reporting', 
      status, 
      `${passedChecks}/${checks.length} features implemented`,
      details.join('\n')
    );
  }

  // Test 6: Performance Monitoring Setup
  testPerformanceMonitoring() {
    console.log('🧪 Testing performance monitoring setup...');

    const analyticsContent = this.readFile('src/lib/analytics.ts');
    if (!analyticsContent) {
      this.addResult('Performance Monitoring', 'FAIL', 'Analytics library not found');
      return;
    }

    const checks = [
      { name: 'Web Vitals tracking', pattern: /trackWebVitals/ },
      { name: 'LCP monitoring', pattern: /largest-contentful-paint/ },
      { name: 'FID monitoring', pattern: /first-input/ },
      { name: 'CLS monitoring', pattern: /layout-shift/ },
      { name: 'Page load timing', pattern: /page_load_time/ },
      { name: 'Performance Observer', pattern: /PerformanceObserver/ },
      { name: 'Metric rating system', pattern: /good.*needs_improvement.*poor/ },
      { name: 'Navigation timing', pattern: /PerformanceNavigationTiming/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(analyticsContent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Performance Monitoring', 
      status, 
      `${passedChecks}/${checks.length} monitoring features implemented`,
      details.join('\n')
    );
  }

  // Test 7: Error Tracking and Debugging
  testErrorTracking() {
    console.log('🧪 Testing error tracking and debugging capabilities...');

    const analyticsContent = this.readFile('src/lib/analytics.ts');
    if (!analyticsContent) {
      this.addResult('Error Tracking', 'FAIL', 'Analytics library not found');
      return;
    }

    const checks = [
      { name: 'Error tracking function', pattern: /trackError.*function/ },
      { name: 'Global error handler', pattern: /window\.addEventListener.*error/ },
      { name: 'Promise rejection handler', pattern: /unhandledrejection/ },
      { name: 'Error context support', pattern: /context.*string/ },
      { name: 'Stack trace capture', pattern: /error\.stack/ },
      { name: 'GA4 exception event', pattern: /exception.*description/ },
      { name: 'Page location in errors', pattern: /page_location.*window\.location/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(analyticsContent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    // Check for ErrorBoundary component
    const errorBoundary = this.fileExists('src/components/ErrorBoundary.tsx');
    if (errorBoundary) {
      details.push('✓ Error Boundary component');
      passedChecks++;
    } else {
      details.push('✗ Error Boundary component');
    }

    const totalChecks = checks.length + 1;
    const status = passedChecks === totalChecks ? 'PASS' : 
                  passedChecks > totalChecks / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Error Tracking', 
      status, 
      `${passedChecks}/${totalChecks} error tracking features implemented`,
      details.join('\n')
    );
  }

  // Test 8: Cookie Consent and Privacy Compliance
  testCookieConsent() {
    console.log('🧪 Testing cookie consent and privacy compliance...');

    const cookieComponent = this.readFile('src/components/CookieConsent.tsx');
    if (!cookieComponent) {
      this.addResult('Cookie Consent', 'FAIL', 'CookieConsent component not found');
      return;
    }

    const checks = [
      { name: 'Cookie preferences', pattern: /preferences.*analytics.*marketing/ },
      { name: 'Accept all functionality', pattern: /handleAcceptAll/ },
      { name: 'Reject all functionality', pattern: /handleRejectAll/ },
      { name: 'Custom preferences', pattern: /handleSavePreferences/ },
      { name: 'Local storage', pattern: /localStorage.*cookie-consent/ },
      { name: 'Privacy policy link', pattern: /privacy.*Policy/ },
      { name: 'Callback support', pattern: /onAccept.*onReject/ },
      { name: 'Consent categories', pattern: /necessary.*analytics.*marketing/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(cookieComponent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Cookie Consent', 
      status, 
      `${passedChecks}/${checks.length} privacy features implemented`,
      details.join('\n')
    );
  }

  // Test 9: Analytics Event Tracking Implementation
  testEventTracking() {
    console.log('🧪 Testing analytics event tracking implementation...');

    const analyticsContent = this.readFile('src/lib/analytics.ts');
    if (!analyticsContent) {
      this.addResult('Event Tracking', 'FAIL', 'Analytics library not found');
      return;
    }

    const checks = [
      { name: 'Multi-platform tracking', pattern: /Google Analytics.*PostHog.*Vercel Analytics/ },
      { name: 'Conversion tracking', pattern: /trackConversion/ },
      { name: 'Form interaction tracking', pattern: /trackFormInteraction/ },
      { name: 'Engagement tracking', pattern: /trackEngagement/ },
      { name: 'Scroll depth tracking', pattern: /trackScrollDepth/ },
      { name: 'Time on page tracking', pattern: /trackTimeOnPage/ },
      { name: 'External link tracking', pattern: /trackExternalClick/ },
      { name: 'Download tracking', pattern: /trackDownload/ },
      { name: 'Attribution tracking', pattern: /trackAttribution/ },
      { name: 'Business metrics', pattern: /trackBusinessMetric/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      if (check.pattern.test(analyticsContent)) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Event Tracking', 
      status, 
      `${passedChecks}/${checks.length} tracking features implemented`,
      details.join('\n')
    );
  }

  // Test 10: Analytics Dashboard Integration
  testDashboardIntegration() {
    console.log('🧪 Testing analytics dashboard integration...');

    const analyticsContent = this.readFile('src/lib/analytics.ts');
    const posthogContent = this.readFile('src/lib/posthog.ts');
    
    if (!analyticsContent || !posthogContent) {
      this.addResult('Dashboard Integration', 'FAIL', 'Required analytics libraries not found');
      return;
    }

    const checks = [
      { name: 'Lead value assignment', pattern: /getLeadValue/ },
      { name: 'Conversion funnel tracking', pattern: /trackConversionFunnel/ },
      { name: 'Attribution data storage', pattern: /localStorage.*attribution/ },
      { name: 'UTM parameter tracking', pattern: /utm_source.*utm_medium.*utm_campaign/ },
      { name: 'Enhanced ecommerce events', pattern: /generate_lead.*currency.*value/ },
      { name: 'Custom metrics integration', pattern: /custom_map.*metric_id/ },
      { name: 'Referrer tracking', pattern: /document\.referrer/ },
      { name: 'Session attribution', pattern: /attributed_session/ }
    ];

    let passedChecks = 0;
    const details: string[] = [];

    checks.forEach(check => {
      const found = check.pattern.test(analyticsContent) || check.pattern.test(posthogContent);
      if (found) {
        passedChecks++;
        details.push(`✓ ${check.name}`);
      } else {
        details.push(`✗ ${check.name}`);
      }
    });

    const status = passedChecks === checks.length ? 'PASS' : 
                  passedChecks > checks.length / 2 ? 'WARNING' : 'FAIL';
    
    this.addResult(
      'Dashboard Integration', 
      status, 
      `${passedChecks}/${checks.length} dashboard features implemented`,
      details.join('\n')
    );
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Analytics and Monitoring Test Report');
    console.log('==========================================\n');

    const statusCounts = {
      PASS: 0,
      FAIL: 0,
      WARNING: 0,
      INFO: 0
    };

    this.results.forEach(result => {
      statusCounts[result.status]++;
      
      const statusIcon = {
        PASS: '✅',
        FAIL: '❌',
        WARNING: '⚠️ ',
        INFO: 'ℹ️ '
      }[result.status];

      console.log(`${statusIcon} ${result.test}: ${result.message}`);
      if (result.details) {
        console.log(`   ${result.details.split('\n').join('\n   ')}`);
      }
      console.log('');
    });

    console.log('Summary:');
    console.log(`✅ Passed: ${statusCounts.PASS}`);
    console.log(`⚠️  Warnings: ${statusCounts.WARNING}`);
    console.log(`❌ Failed: ${statusCounts.FAIL}`);
    console.log(`ℹ️  Info: ${statusCounts.INFO}`);

    const totalTests = this.results.length;
    const passRate = Math.round((statusCounts.PASS / totalTests) * 100);
    console.log(`\n📈 Overall Pass Rate: ${passRate}% (${statusCounts.PASS}/${totalTests})`);

    return {
      results: this.results,
      summary: statusCounts,
      passRate
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Analytics and Monitoring Test Suite...\n');

    await this.testWebVitalsAPI();
    this.testGoogleAnalytics();
    this.testPostHogAnalytics();
    this.testVercelAnalytics();
    this.testWebVitalsReporting();
    this.testPerformanceMonitoring();
    this.testErrorTracking();
    this.testCookieConsent();
    this.testEventTracking();
    this.testDashboardIntegration();

    return this.generateReport();
  }
}

// Sample Web Vitals API test
async function testWebVitalsAPIEndpoint() {
  console.log('\n🧪 Testing Web Vitals API with sample data...');
  
  const sampleMetric = {
    id: 'test-id-123',
    name: 'LCP',
    value: 1250,
    rating: 'good' as const,
    delta: 50,
    entries: [],
    navigationType: 'navigate'
  };

  try {
    // Test in development environment
    const response = await fetch('http://localhost:3000/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': 'test-client'
      },
      body: JSON.stringify(sampleMetric)
    });

    if (response.ok) {
      console.log('✅ Web Vitals API test: SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${await response.text()}`);
    } else {
      console.log('❌ Web Vitals API test: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${await response.text()}`);
    }
  } catch (error) {
    console.log('⚠️  Web Vitals API test: Could not connect (server not running)');
    console.log(`   Error: ${error instanceof Error ? error.message : error}`);
  }
}

// Main execution
async function main() {
  const testSuite = new AnalyticsTestSuite();
  const report = await testSuite.runAllTests();
  
  // Test API endpoint if possible
  await testWebVitalsAPIEndpoint();
  
  console.log('\n🏁 Test suite completed!');
  
  if (report.passRate < 70) {
    console.log('⚠️  Warning: Some analytics integrations need attention');
    process.exit(1);
  } else if (report.passRate < 90) {
    console.log('⚠️  Good: Most analytics integrations are working, minor issues detected');
  } else {
    console.log('🎉 Excellent: Analytics and monitoring setup is comprehensive');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { AnalyticsTestSuite };