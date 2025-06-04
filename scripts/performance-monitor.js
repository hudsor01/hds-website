#!/usr/bin/env node

/**
 * Performance Monitor Script
 * 
 * Analyzes Next.js build performance and generates metrics
 * Used by GitHub Actions workflow for performance monitoring
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Performance metrics collection
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      buildTime: 0,
      bundleSize: 0,
      firstLoadJS: 0,
      pageCount: 0,
      chunkCount: 0,
      largestChunks: [],
      recommendations: [],
    };
    
    this.performance = {
      score: 0,
      grade: 'F',
    };
  }

  /**
   * Run performance analysis
   */
  async analyze() {
    console.log('🚀 Starting performance analysis...');
    
    try {
      // Measure build time
      await this.measureBuildTime();
      
      // Analyze bundle if .next exists
      if (await this.checkNextBuildExists()) {
        await this.analyzeBundleSize();
        await this.analyzeChunks();
      } else {
        console.log('⚠️ No .next build found, running build first...');
        await this.buildProject();
        await this.analyzeBundleSize();
        await this.analyzeChunks();
      }
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Calculate performance score
      this.calculatePerformanceScore();
      
      // Save metrics
      await this.saveMetrics();
      
      console.log(`✅ Performance analysis complete! Score: ${this.performance.score}/100 (${this.performance.grade})`);
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check if Next.js build exists
   */
  async checkNextBuildExists() {
    try {
      await fs.access(path.join(projectRoot, '.next'));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Build the project
   */
  async buildProject() {
    console.log('🔨 Building project...');
    const startTime = Date.now();
    
    try {
      execSync('npm run build', { 
        cwd: projectRoot, 
        stdio: 'pipe',
        encoding: 'utf8',
      });
      
      this.metrics.buildTime = Date.now() - startTime;
      console.log(`⏱️ Build completed in ${(this.metrics.buildTime / 1000).toFixed(2)}s`);
      
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  /**
   * Measure build time
   */
  async measureBuildTime() {
    console.log('⏱️ Measuring build time...');
    const startTime = Date.now();
    
    try {
      execSync('npm run build', { 
        cwd: projectRoot, 
        stdio: 'pipe',
        encoding: 'utf8',
      });
      
      this.metrics.buildTime = Date.now() - startTime;
      console.log(`Build time: ${(this.metrics.buildTime / 1000).toFixed(2)}s`);
      
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  /**
   * Analyze bundle size
   */
  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');
    
    try {
      const nextDir = path.join(projectRoot, '.next');
      const staticDir = path.join(nextDir, 'static');
      
      if (await fs.access(staticDir).then(() => true).catch(() => false)) {
        const bundleSize = await this.calculateDirectorySize(staticDir);
        this.metrics.bundleSize = bundleSize / 1024; // Convert to KB
        
        // Calculate first load JS
        const chunksDir = path.join(staticDir, 'chunks');
        if (await fs.access(chunksDir).then(() => true).catch(() => false)) {
          const firstLoadJS = await this.calculateFirstLoadJS(chunksDir);
          this.metrics.firstLoadJS = firstLoadJS / 1024; // Convert to KB
        }
        
        console.log(`Bundle size: ${this.metrics.bundleSize.toFixed(1)}KB`);
        console.log(`First load JS: ${this.metrics.firstLoadJS.toFixed(1)}KB`);
      }
      
    } catch (error) {
      console.warn(`⚠️ Bundle analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze chunks
   */
  async analyzeChunks() {
    console.log('🧩 Analyzing chunks...');
    
    try {
      const chunksDir = path.join(projectRoot, '.next', 'static', 'chunks');
      
      if (await fs.access(chunksDir).then(() => true).catch(() => false)) {
        const files = await fs.readdir(chunksDir);
        const chunks = [];
        
        for (const file of files) {
          if (file.endsWith('.js')) {
            const filePath = path.join(chunksDir, file);
            const stats = await fs.stat(filePath);
            chunks.push({
              name: file,
              size: stats.size / 1024, // Convert to KB
            });
          }
        }
        
        // Sort by size and get largest chunks
        chunks.sort((a, b) => b.size - a.size);
        this.metrics.largestChunks = chunks.slice(0, 10);
        this.metrics.chunkCount = chunks.length;
        
        console.log(`Found ${chunks.length} chunks`);
        
      }
      
    } catch (error) {
      console.warn(`⚠️ Chunk analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate directory size recursively
   */
  async calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += await this.calculateDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Failed to calculate size for ${dirPath}: ${error.message}`);
    }
    
    return totalSize;
  }

  /**
   * Calculate first load JS size
   */
  async calculateFirstLoadJS(chunksDir) {
    let firstLoadJS = 0;
    
    try {
      const files = await fs.readdir(chunksDir);
      
      for (const file of files) {
        // Include main chunks and framework chunks in first load
        if (file.includes('main-') || file.includes('framework-') || file.includes('webpack-')) {
          const filePath = path.join(chunksDir, file);
          const stats = await fs.stat(filePath);
          firstLoadJS += stats.size;
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Failed to calculate first load JS: ${error.message}`);
    }
    
    return firstLoadJS;
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Build time recommendations
    if (this.metrics.buildTime > 120000) { // 2 minutes
      recommendations.push({
        type: 'Build Performance',
        message: 'Build time is over 2 minutes',
        action: 'Consider optimizing dependencies and build configuration',
      });
    }
    
    // Bundle size recommendations
    if (this.metrics.bundleSize > 500) { // 500KB
      recommendations.push({
        type: 'Bundle Size',
        message: 'Bundle size is over 500KB',
        action: 'Consider code splitting and tree shaking',
      });
    }
    
    // First load JS recommendations
    if (this.metrics.firstLoadJS > 250) { // 250KB
      recommendations.push({
        type: 'First Load JS',
        message: 'First load JS is over 250KB',
        action: 'Consider lazy loading and dynamic imports',
      });
    }
    
    // Large chunks recommendations
    const largeChunks = this.metrics.largestChunks.filter(chunk => chunk.size > 100);
    if (largeChunks.length > 0) {
      recommendations.push({
        type: 'Large Chunks',
        message: `Found ${largeChunks.length} chunks over 100KB`,
        action: 'Consider splitting large chunks with dynamic imports',
      });
    }
    
    this.metrics.recommendations = recommendations;
    console.log(`Generated ${recommendations.length} recommendations`);
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for build time
    if (this.metrics.buildTime > 60000) score -= 10; // 1 minute
    if (this.metrics.buildTime > 120000) score -= 10; // 2 minutes
    
    // Deduct points for bundle size
    if (this.metrics.bundleSize > 300) score -= 10;
    if (this.metrics.bundleSize > 500) score -= 15;
    if (this.metrics.bundleSize > 1000) score -= 20;
    
    // Deduct points for first load JS
    if (this.metrics.firstLoadJS > 150) score -= 10;
    if (this.metrics.firstLoadJS > 250) score -= 15;
    if (this.metrics.firstLoadJS > 400) score -= 20;
    
    // Deduct points for large chunks
    const largeChunks = this.metrics.largestChunks.filter(chunk => chunk.size > 100);
    score -= largeChunks.length * 5;
    
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    this.performance.score = score;
    
    // Assign grade
    if (score >= 90) this.performance.grade = 'A';
    else if (score >= 80) this.performance.grade = 'B';
    else if (score >= 70) this.performance.grade = 'C';
    else if (score >= 60) this.performance.grade = 'D';
    else this.performance.grade = 'F';
  }

  /**
   * Save performance metrics to JSON files
   */
  async saveMetrics() {
    console.log('💾 Saving performance metrics...');
    
    const metricsData = {
      timestamp: new Date().toISOString(),
      performance: this.performance,
      metrics: this.metrics,
    };
    
    // Save current metrics
    await fs.writeFile(
      path.join(projectRoot, 'performance-metrics.json'),
      JSON.stringify(metricsData, null, 2),
    );
    
    // Append to history
    await this.appendToHistory(metricsData);
    
    console.log('✅ Metrics saved successfully');
  }

  /**
   * Append metrics to history file
   */
  async appendToHistory(metricsData) {
    const historyPath = path.join(projectRoot, 'performance-history.json');
    let history = [];
    
    try {
      const existingHistory = await fs.readFile(historyPath, 'utf8');
      history = JSON.parse(existingHistory);
    } catch {
      // File doesn't exist, start with empty array
    }
    
    history.push(metricsData);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🏃‍♂️ Performance Monitor v1.0');
  console.log('================================');
  
  const monitor = new PerformanceMonitor();
  await monitor.analyze();
  
  console.log('🎉 Performance monitoring complete!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Performance monitoring failed:', error);
    process.exit(1);
  });
}

export default PerformanceMonitor;