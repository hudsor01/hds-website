#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface OptimizationOptions {
  quality: number;
  outputFormat: 'webp' | 'avif' | 'jpg' | 'png';
  outputDir?: string;
  preserveOriginal?: boolean;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  quality: 85,
  outputFormat: 'webp',
  preserveOriginal: true,
};

class ImageOptimizer {
  private supportedFormats = ['.jpg', '.jpeg', '.png', '.gif'];
  
  constructor(private options: OptimizationOptions = DEFAULT_OPTIONS) {}

  async findImages(directory: string): Promise<string[]> {
    const images: string[] = [];
    
    async function scan(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (this.supportedFormats.includes(ext)) {
            images.push(fullPath);
          }
        }
      }
    }
    
    await scan.call(this, directory);
    return images;
  }

  async getImageInfo(imagePath: string): Promise<{ width: number; height: number; size: number; format: string }> {
    try {
      const stats = await fs.stat(imagePath);
      
      // Get image dimensions using ImageMagick identify
      const { stdout } = await execAsync(`identify -format "%w %h %m" "${imagePath}"`);
      const [width, height, format] = stdout.trim().split(' ');
      
      return {
        width: parseInt(width),
        height: parseInt(height),
        size: stats.size,
        format: format.toLowerCase()
      };
    } catch (error) {
      console.error(`Failed to get info for ${imagePath}:`, error);
      throw error;
    }
  }

  async optimizeImage(inputPath: string, options?: Partial<OptimizationOptions>): Promise<string> {
    const opts = { ...this.options, ...options };
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    const outputDir = opts.outputDir || dir;
    const outputPath = path.join(outputDir, `${name}.${opts.outputFormat}`);

    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      let command = '';
      
      switch (opts.outputFormat) {
        case 'webp':
          command = `convert "${inputPath}" -quality ${opts.quality} -define webp:method=6 "${outputPath}"`;
          break;
        case 'avif':
          command = `convert "${inputPath}" -quality ${opts.quality} "${outputPath}"`;
          break;
        case 'jpg':
          command = `convert "${inputPath}" -quality ${opts.quality} -strip "${outputPath}"`;
          break;
        case 'png':
          command = `convert "${inputPath}" -quality ${opts.quality} -strip "${outputPath}"`;
          break;
      }

      console.log(`Optimizing ${inputPath} -> ${outputPath}`);
      await execAsync(command);
      
      // Verify the output file was created
      await fs.access(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error(`Failed to optimize ${inputPath}:`, error);
      throw error;
    }
  }

  async generateResponsiveImages(inputPath: string, sizes: number[] = [480, 768, 1024, 1920]): Promise<string[]> {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    const outputPaths: string[] = [];

    for (const size of sizes) {
      const outputPath = path.join(dir, `${name}-${size}w.webp`);
      
      try {
        console.log(`Generating ${size}w version: ${outputPath}`);
        await execAsync(`convert "${inputPath}" -resize ${size}x -quality 85 -define webp:method=6 "${outputPath}"`);
        outputPaths.push(outputPath);
      } catch (error) {
        console.error(`Failed to generate ${size}w version:`, error);
      }
    }

    return outputPaths;
  }

  async optimizeDirectory(directory: string, options?: Partial<OptimizationOptions>): Promise<void> {
    console.log(`🔍 Scanning ${directory} for images...`);
    
    const images = await this.findImages(directory);
    console.log(`📸 Found ${images.length} images to optimize`);

    if (images.length === 0) {
      console.log('No images found to optimize.');
      return;
    }

    let optimizedCount = 0;
    let totalSizeBefore = 0;
    let totalSizeAfter = 0;

    for (const imagePath of images) {
      try {
        const beforeInfo = await this.getImageInfo(imagePath);
        totalSizeBefore += beforeInfo.size;

        console.log(`\n📷 Processing: ${path.relative(process.cwd(), imagePath)}`);
        console.log(`   Original: ${beforeInfo.width}x${beforeInfo.height} ${beforeInfo.format} (${(beforeInfo.size / 1024).toFixed(1)}KB)`);

        // Optimize main image
        const outputPath = await this.optimizeImage(imagePath, options);
        
        // Generate responsive images for large images
        if (beforeInfo.width > 800) {
          await this.generateResponsiveImages(imagePath);
        }

        const afterInfo = await this.getImageInfo(outputPath);
        totalSizeAfter += afterInfo.size;

        const savings = ((beforeInfo.size - afterInfo.size) / beforeInfo.size * 100).toFixed(1);
        console.log(`   Optimized: ${afterInfo.width}x${afterInfo.height} ${afterInfo.format} (${(afterInfo.size / 1024).toFixed(1)}KB) - ${savings}% smaller`);

        optimizedCount++;
      } catch (error) {
        console.error(`❌ Failed to process ${imagePath}:`, error);
      }
    }

    const totalSavings = ((totalSizeBefore - totalSizeAfter) / totalSizeBefore * 100).toFixed(1);
    console.log(`\n✅ Optimization complete!`);
    console.log(`📊 Processed: ${optimizedCount}/${images.length} images`);
    console.log(`💾 Total savings: ${(totalSizeBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalSizeAfter / 1024 / 1024).toFixed(1)}MB (${totalSavings}% reduction)`);
  }
}

// CLI functionality
async function main() {
  const args = process.argv.slice(2);
  const inputDir = args[0] || 'public';
  
  // Check if ImageMagick is installed
  try {
    await execAsync('convert -version');
  } catch (error) {
    console.error('❌ ImageMagick is not installed. Please install it:');
    console.error('   macOS: brew install imagemagick');
    console.error('   Ubuntu: sudo apt-get install imagemagick');
    console.error('   Windows: Download from https://imagemagick.org/script/download.php');
    process.exit(1);
  }

  const optimizer = new ImageOptimizer({
    quality: 85,
    outputFormat: 'webp',
    preserveOriginal: true,
  });

  try {
    await optimizer.optimizeDirectory(inputDir);
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

// Export for use as module
export { ImageOptimizer, type OptimizationOptions };

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}