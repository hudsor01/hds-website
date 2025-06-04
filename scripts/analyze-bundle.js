#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * Analyzes Next.js bundle and generates detailed reports
 * Used by GitHub Actions workflow for bundle size monitoring
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Bundle analyzer
 */
class BundleAnalyzer {
  constructor() {
    this.analysis = {
      summary: {
        totalSize: 0,
        firstLoadJS: 0,
        totalChunks: 0,
        totalPages: 0
      },
      chunks: [],
      pages: [],
      assets: [],
      warnings: []
    };
  }

  /**
   * Analyze the Next.js bundle
   */
  async analyze() {
    console.log('📦 Starting bundle analysis...');
    
    try {
      // Check if .next directory exists
      const nextDir = path.join(projectRoot, '.next');
      if (!(await this.pathExists(nextDir))) {
        throw new Error('.next directory not found. Please run "npm run build" first.');
      }
      
      // Analyze static assets
      await this.analyzeStaticAssets();
      
      // Analyze pages
      await this.analyzePages();
      
      // Analyze chunks
      await this.analyzeChunks();
      
      // Calculate summary
      this.calculateSummary();
      
      // Generate warnings
      this.generateWarnings();
      
      // Save analysis
      await this.saveAnalysis();
      
      console.log('✅ Bundle analysis complete!');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check if path exists
   */
  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Analyze static assets
   */
  async analyzeStaticAssets() {
    console.log('🔍 Analyzing static assets...');
    
    const staticDir = path.join(projectRoot, '.next', 'static');
    if (await this.pathExists(staticDir)) {
      await this.analyzeDirectory(staticDir, 'static');
    }
  }

  /**
   * Analyze pages
   */
  async analyzePages() {
    console.log('📄 Analyzing pages...');
    
    const serverDir = path.join(projectRoot, '.next', 'server');
    const pagesDir = path.join(serverDir, 'pages');
    const appDir = path.join(serverDir, 'app');
    
    // Analyze pages directory (Pages Router)
    if (await this.pathExists(pagesDir)) {
      await this.analyzePagesDirectory(pagesDir);
    }
    
    // Analyze app directory (App Router)
    if (await this.pathExists(appDir)) {
      await this.analyzeAppDirectory(appDir);
    }
  }

  /**
   * Analyze chunks
   */
  async analyzeChunks() {
    console.log('🧩 Analyzing chunks...');
    
    const chunksDir = path.join(projectRoot, '.next', 'static', 'chunks');
    if (await this.pathExists(chunksDir)) {
      await this.analyzeChunksDirectory(chunksDir);
    }
  }

  /**
   * Analyze directory recursively
   */
  async analyzeDirectory(dirPath, category = 'unknown') {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          await this.analyzeDirectory(itemPath, category);
        } else {
          this.analysis.assets.push({
            name: item,
            path: path.relative(projectRoot, itemPath),
            size: stats.size,
            category,
            extension: path.extname(item)
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to analyze directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Analyze pages directory
   */
  async analyzePagesDirectory(pagesDir) {
    try {
      const items = await fs.readdir(pagesDir, { recursive: true });
      
      for (const item of items) {
        if (item.endsWith('.js') || item.endsWith('.html')) {
          const itemPath = path.join(pagesDir, item);
          const stats = await fs.stat(itemPath);
          
          this.analysis.pages.push({
            name: item,
            path: path.relative(projectRoot, itemPath),
            size: stats.size,
            type: 'pages-router'
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to analyze pages directory: ${error.message}`);
    }
  }

  /**
   * Analyze app directory
   */
  async analyzeAppDirectory(appDir) {
    try {
      const items = await fs.readdir(appDir, { recursive: true });
      
      for (const item of items) {
        if (item.endsWith('.js') || item.endsWith('.html')) {
          const itemPath = path.join(appDir, item);
          const stats = await fs.stat(itemPath);
          
          this.analysis.pages.push({
            name: item,
            path: path.relative(projectRoot, itemPath),
            size: stats.size,
            type: 'app-router'
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to analyze app directory: ${error.message}`);
    }
  }

  /**
   * Analyze chunks directory
   */
  async analyzeChunksDirectory(chunksDir) {
    try {
      const items = await fs.readdir(chunksDir);
      
      for (const item of items) {
        if (item.endsWith('.js')) {
          const itemPath = path.join(chunksDir, item);
          const stats = await fs.stat(itemPath);
          
          const chunk = {
            name: item,
            path: path.relative(projectRoot, itemPath),
            size: stats.size,
            type: this.getChunkType(item),
            isFirstLoad: this.isFirstLoadChunk(item)
          };
          
          this.analysis.chunks.push(chunk);
        }
      }
      
      // Sort chunks by size
      this.analysis.chunks.sort((a, b) => b.size - a.size);
      
    } catch (error) {
      console.warn(`⚠️ Failed to analyze chunks directory: ${error.message}`);
    }
  }

  /**
   * Determine chunk type
   */
  getChunkType(filename) {
    if (filename.includes('main-')) return 'main';
    if (filename.includes('framework-')) return 'framework';
    if (filename.includes('webpack-')) return 'webpack';
    if (filename.includes('polyfills-')) return 'polyfills';
    if (filename.includes('pages/')) return 'page';
    if (filename.includes('app/')) return 'app';
    return 'other';
  }

  /**
   * Check if chunk is first load
   */
  isFirstLoadChunk(filename) {
    return filename.includes('main-') || 
           filename.includes('framework-') || 
           filename.includes('webpack-') ||
           filename.includes('polyfills-');
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary() {
    console.log('📊 Calculating summary...');
    
    // Total size from all assets
    this.analysis.summary.totalSize = this.analysis.assets.reduce((total, asset) => {
      return total + asset.size;
    }, 0) / 1024; // Convert to KB
    
    // First load JS size
    this.analysis.summary.firstLoadJS = this.analysis.chunks
      .filter(chunk => chunk.isFirstLoad)
      .reduce((total, chunk) => total + chunk.size, 0) / 1024; // Convert to KB
    
    // Count chunks and pages
    this.analysis.summary.totalChunks = this.analysis.chunks.length;
    this.analysis.summary.totalPages = this.analysis.pages.length;
  }

  /**
   * Generate warnings for potential issues
   */
  generateWarnings() {
    console.log('⚠️ Checking for potential issues...');
    
    const warnings = [];
    
    // Large bundle warning
    if (this.analysis.summary.totalSize > 1000) { // 1MB
      warnings.push({
        type: 'bundle-size',
        message: `Large bundle size: ${this.analysis.summary.totalSize.toFixed(1)}KB`,
        severity: 'high'
      });
    }
    
    // Large first load JS warning
    if (this.analysis.summary.firstLoadJS > 300) { // 300KB
      warnings.push({
        type: 'first-load',
        message: `Large first load JS: ${this.analysis.summary.firstLoadJS.toFixed(1)}KB`,
        severity: 'medium'
      });
    }
    
    // Large individual chunks
    const largeChunks = this.analysis.chunks.filter(chunk => chunk.size > 200 * 1024); // 200KB
    if (largeChunks.length > 0) {
      warnings.push({
        type: 'large-chunks',
        message: `${largeChunks.length} chunks over 200KB`,
        severity: 'medium',
        chunks: largeChunks.map(chunk => ({
          name: chunk.name,
          size: (chunk.size / 1024).toFixed(1) + 'KB'
        }))
      });
    }
    
    // Many chunks warning
    if (this.analysis.summary.totalChunks > 50) {
      warnings.push({
        type: 'chunk-count',
        message: `Many chunks: ${this.analysis.summary.totalChunks}`,
        severity: 'low'
      });
    }
    
    this.analysis.warnings = warnings;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    console.log('\n📊 Bundle Analysis Summary');
    console.log('==========================');
    console.log(`Total Bundle Size: ${this.analysis.summary.totalSize.toFixed(1)}KB`);
    console.log(`First Load JS: ${this.analysis.summary.firstLoadJS.toFixed(1)}KB`);
    console.log(`Total Chunks: ${this.analysis.summary.totalChunks}`);
    console.log(`Total Pages: ${this.analysis.summary.totalPages}`);
    
    if (this.analysis.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.analysis.warnings.forEach(warning => {
        console.log(`  ${warning.severity.toUpperCase()}: ${warning.message}`);
      });
    } else {
      console.log('\n✅ No warnings detected');
    }
    
    console.log('\n🏆 Top 5 Largest Chunks:');
    this.analysis.chunks.slice(0, 5).forEach((chunk, i) => {
      console.log(`  ${i + 1}. ${chunk.name}: ${(chunk.size / 1024).toFixed(1)}KB`);
    });
  }

  /**
   * Save analysis to JSON file
   */
  async saveAnalysis() {
    console.log('💾 Saving bundle analysis...');
    
    const analysisData = {
      timestamp: new Date().toISOString(),
      ...this.analysis
    };
    
    await fs.writeFile(
      path.join(projectRoot, 'bundle-analysis.json'),
      JSON.stringify(analysisData, null, 2)
    );
    
    console.log('✅ Analysis saved to bundle-analysis.json');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Bundle Analyzer v1.0');
  console.log('========================');
  
  const analyzer = new BundleAnalyzer();
  await analyzer.analyze();
  
  console.log('🎉 Bundle analysis complete!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Bundle analysis failed:', error);
    process.exit(1);
  });
}

export default BundleAnalyzer;