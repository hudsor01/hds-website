import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import type { TestMetrics as ImportedTestMetrics, TestResult as ImportedTestResult, PerformanceData, HistoricalComparison } from '@/types/test';

export interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  avgDuration: number;
  slowestTest: { name: string; duration: number } | null;
  fastestTest: { name: string; duration: number } | null;
}

export interface CategoryMetrics {
  [category: string]: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
    tests: Array<{ name: string; status: string; duration: number }>;
  };
}

export class EnhancedReporter implements Reporter {
  private outputDir: string;
  private results: TestResult[] = [];
  private startTime: number = 0;
  private config!: FullConfig;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || 'enhanced-report';
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.startTime = Date.now();
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    console.log(`🚀 Starting enhanced E2E test run with ${suite.allTests().length} tests`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push(result);
    
    // Log individual test results
    const status = this.getStatusIcon(result.status);
    const duration = result.duration;
    console.log(`${status} ${test.title} (${duration}ms)`);
    
    // Log performance warnings
    if (duration > 30000) {
      console.log(`⚠️  Slow test detected: ${test.title} took ${duration}ms`);
    }
    
    // Log flaky test detection
    if (result.retry > 0) {
      console.log(`🔄 Flaky test: ${test.title} required ${result.retry + 1} attempts`);
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    console.log(`\n📊 Test run completed in ${this.formatDuration(totalDuration)}`);
    
    // Generate comprehensive reports
    await this.generateMetricsReport(result, totalDuration);
    await this.generateCategoryReport();
    await this.generatePerformanceReport();
    await this.generateFlakinesReport();
    await this.generateTrendReport();
    await this.generateSummaryReport(result, totalDuration);
    
    console.log(`📋 Enhanced reports generated in ${this.outputDir}/`);
  }

  private async generateMetricsReport(result: FullResult, totalDuration: number): Promise<void> {
    const metrics = this.calculateMetrics(totalDuration);
    
    const reportPath = path.join(this.outputDir, 'metrics.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(metrics, null, 2));
    
    console.log(`📈 Metrics report: ${reportPath}`);
  }

  private async generateCategoryReport(): Promise<void> {
    const categories = this.analyzeCategoriesFromTags();
    
    const reportPath = path.join(this.outputDir, 'categories.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(categories, null, 2));
    
    // Generate category summary
    const summary = Object.entries(categories).map(([category, data]) => {
      const passRate = (data.passed / data.total * 100).toFixed(1);
      return `${category}: ${data.passed}/${data.total} (${passRate}% pass rate)`;
    }).join('\n');
    
    const summaryPath = path.join(this.outputDir, 'category-summary.txt');
    await fs.promises.writeFile(summaryPath, summary);
    
    console.log(`🏷️  Category report: ${reportPath}`);
  }

  private async generatePerformanceReport(): Promise<void> {
    const performanceData = this.analyzePerformance();
    
    const reportPath = path.join(this.outputDir, 'performance.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(performanceData, null, 2));
    
    // Generate performance alerts
    const alerts = this.generatePerformanceAlerts(performanceData);
    if (alerts.length > 0) {
      const alertsPath = path.join(this.outputDir, 'performance-alerts.txt');
      await fs.promises.writeFile(alertsPath, alerts.join('\n'));
      console.log(`⚠️  Performance alerts: ${alertsPath}`);
    }
    
    console.log(`⚡ Performance report: ${reportPath}`);
  }

  private async generateFlakinesReport(): Promise<void> {
    const flakyTests = this.identifyFlakyTests();
    
    if (flakyTests.length > 0) {
      const reportPath = path.join(this.outputDir, 'flaky-tests.json');
      await fs.promises.writeFile(reportPath, JSON.stringify(flakyTests, null, 2));
      
      const summary = flakyTests.map(test => 
        `${test.name}: ${test.attempts} attempts, ${test.successRate}% success rate`
      ).join('\n');
      
      const summaryPath = path.join(this.outputDir, 'flaky-summary.txt');
      await fs.promises.writeFile(summaryPath, summary);
      
      console.log(`🔄 Flaky tests report: ${reportPath}`);
    }
  }

  private async generateTrendReport(): Promise<void> {
    // Load historical data if available
    const historicalData = await this.loadHistoricalData();
    const currentMetrics = this.calculateMetrics(Date.now() - this.startTime);
    
    const trendData = {
      timestamp: new Date().toISOString(),
      metrics: currentMetrics,
      comparison: this.compareWithHistorical(currentMetrics, historicalData)
    };
    
    // Update historical data
    historicalData.push(trendData);
    
    // Keep only last 30 runs
    const recentData = historicalData.slice(-30);
    
    const trendPath = path.join(this.outputDir, 'trends.json');
    await fs.promises.writeFile(trendPath, JSON.stringify(recentData, null, 2));
    
    console.log(`📈 Trend analysis: ${trendPath}`);
  }

  private async generateSummaryReport(result: FullResult, totalDuration: number): Promise<void> {
    const metrics = this.calculateMetrics(totalDuration);
    const categories = this.analyzeCategoriesFromTags();
    const flakyTests = this.identifyFlakyTests();
    
    const summary = `
E2E Test Run Summary
==================
Date: ${new Date().toISOString()}
Duration: ${this.formatDuration(totalDuration)}
Status: ${result.status.toUpperCase()}

Test Results:
- Total: ${metrics.totalTests}
- Passed: ${metrics.passed} (${(metrics.passed / metrics.totalTests * 100).toFixed(1)}%)
- Failed: ${metrics.failed} (${(metrics.failed / metrics.totalTests * 100).toFixed(1)}%)
- Skipped: ${metrics.skipped}
- Flaky: ${metrics.flaky}

Performance:
- Average test duration: ${this.formatDuration(metrics.avgDuration)}
- Slowest test: ${metrics.slowestTest?.name || 'N/A'} (${this.formatDuration(metrics.slowestTest?.duration || 0)})
- Fastest test: ${metrics.fastestTest?.name || 'N/A'} (${this.formatDuration(metrics.fastestTest?.duration || 0)})

Category Breakdown:
${Object.entries(categories).map(([cat, data]) => 
  `- ${cat}: ${data.passed}/${data.total} (${(data.passed / data.total * 100).toFixed(1)}%)`
).join('\n')}

${flakyTests.length > 0 ? `
Flaky Tests Detected:
${flakyTests.map(test => `- ${test.name} (${test.attempts} attempts)`).join('\n')}
` : ''}

Environment:
- Workers: ${this.config.workers}
- Retries: ${this.config.retries}
- Projects: ${this.config.projects.map(p => p.name).join(', ')}

For detailed results, see: playwright-report/index.html
    `.trim();
    
    const summaryPath = path.join(this.outputDir, 'summary.txt');
    await fs.promises.writeFile(summaryPath, summary);
    
    console.log('\n' + summary);
    console.log(`\n📄 Summary report: ${summaryPath}`);
  }

  private calculateMetrics(totalDuration: number): TestMetrics {
    const durations = this.results.map(r => r.duration);
    
    return {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      flaky: this.results.filter(r => r.retry > 0).length,
      duration: totalDuration,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      slowestTest: this.findExtremeTest('max'),
      fastestTest: this.findExtremeTest('min')
    };
  }

  private analyzeCategoriesFromTags(): CategoryMetrics {
    const categories: CategoryMetrics = {};
    
    // Extract categories from test titles and annotations
    this.results.forEach(result => {
      const testTitle = result.test?.title || 'Unknown';
      const parentTitle = result.test?.parent?.title || '';
      
      // Extract tags from describe blocks and test names
      const tags = this.extractTags(parentTitle + ' ' + testTitle);
      
      tags.forEach(tag => {
        if (!categories[tag]) {
          categories[tag] = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0,
            tests: []
          };
        }
        
        categories[tag].total++;
        categories[tag].duration += result.duration;
        categories[tag].tests.push({
          name: testTitle,
          status: result.status,
          duration: result.duration
        });
        
        if (result.status === 'passed') {
          categories[tag].passed++;
        } else if (result.status === 'failed') {
          categories[tag].failed++;
        }
      });
    });
    
    return categories;
  }

  private analyzePerformance() {
    const performanceThresholds = {
      slow: 30000,    // 30 seconds
      medium: 10000,  // 10 seconds
      fast: 5000      // 5 seconds
    };
    
    const performance = {
      thresholds: performanceThresholds,
      distribution: {
        fast: 0,
        medium: 0,
        slow: 0,
        veryslow: 0
      },
      slowTests: [] as Array<{ name: string; duration: number }>,
      averageByCategory: {} as Record<string, number>
    };
    
    this.results.forEach(result => {
      const duration = result.duration;
      const testName = result.test?.title || 'Unknown';
      
      // Categorize by speed
      if (duration < performanceThresholds.fast) {
        performance.distribution.fast++;
      } else if (duration < performanceThresholds.medium) {
        performance.distribution.medium++;
      } else if (duration < performanceThresholds.slow) {
        performance.distribution.slow++;
      } else {
        performance.distribution.veryslow++;
        performance.slowTests.push({ name: testName, duration });
      }
    });
    
    return performance;
  }

  private generatePerformanceAlerts(performanceData: PerformanceData): string[] {
    const alerts: string[] = [];
    
    if (performanceData.distribution.veryslow > 0) {
      alerts.push(`⚠️  ${performanceData.distribution.veryslow} tests exceeded 30s threshold`);
    }
    
    if (performanceData.slowTests.length > 0) {
      alerts.push(`🐌 Slowest tests:`);
      performanceData.slowTests
        .sort((a: ImportedTestResult, b: ImportedTestResult) => b.duration - a.duration)
        .slice(0, 5)
        .forEach((test: ImportedTestResult) => {
          alerts.push(`   - ${test.name}: ${this.formatDuration(test.duration)}`);
        });
    }
    
    return alerts;
  }

  private identifyFlakyTests() {
    const flakyTests = this.results
      .filter(result => result.retry > 0)
      .map(result => ({
        name: result.test?.title || 'Unknown',
        attempts: result.retry + 1,
        successRate: ((result.status === 'passed' ? 1 : 0) / (result.retry + 1) * 100).toFixed(1),
        finalStatus: result.status,
        errors: result.errors.map(error => error.message)
      }));
    
    return flakyTests;
  }

  private async loadHistoricalData(): Promise<any[]> {
    const trendPath = path.join(this.outputDir, 'trends.json');
    try {
      const data = await fs.promises.readFile(trendPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private compareWithHistorical(current: TestMetrics, historical: ImportedTestMetrics[]): HistoricalComparison | null {
    if (historical.length === 0) return null;
    
    const previous = historical[historical.length - 1]?.metrics;
    if (!previous) return null;
    
    return {
      passRateChange: ((current.passed / current.totalTests) - (previous.passed / previous.totalTests)) * 100,
      durationChange: ((current.avgDuration - previous.avgDuration) / previous.avgDuration) * 100,
      flakyTestsChange: current.flaky - previous.flaky
    };
  }

  private findExtremeTest(type: 'min' | 'max'): { name: string; duration: number } | null {
    if (this.results.length === 0) return null;
    
    const sorted = this.results.sort((a, b) => 
      type === 'max' ? b.duration - a.duration : a.duration - b.duration
    );
    
    const extreme = sorted[0];
    return {
      name: extreme.test?.title || 'Unknown',
      duration: extreme.duration
    };
  }

  private extractTags(text: string): string[] {
    const tagRegex = /@(\w+)/g;
    const matches = text.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : ['untagged'];
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      case 'timedOut': return '⏰';
      default: return '❓';
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

// Export for use in playwright.config.ts
export default EnhancedReporter;