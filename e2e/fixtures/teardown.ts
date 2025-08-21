import { test as teardown } from '@playwright/test';
import fs from 'fs';
import path from 'path';

teardown('cleanup test data', async ({ page }) => {
  // Clean up any test data that was created
  await page.goto('/');
  
  // Clear test environment flags
  await page.evaluate(() => {
    localStorage.removeItem('test-environment');
    localStorage.removeItem('disable-analytics-in-tests');
    sessionStorage.clear();
  });

  console.log('✅ Test environment cleaned up');
});

teardown('cleanup test files', async () => {
  // Clean up temporary test files
  const tempDirs = [
    path.join(__dirname, '../.auth'),
    path.join(__dirname, '../screenshots/temp'),
    path.join(__dirname, '../test-results/temp')
  ];

  for (const dir of tempDirs) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️  Cleaned up: ${dir}`);
      }
    } catch (error) {
      console.log(`⚠️  Failed to clean up ${dir}:`, error);
    }
  }
});

teardown('generate test summary', async () => {
  // Generate a summary of test results
  const resultsPath = path.join(__dirname, '../test-results');
  
  if (fs.existsSync(resultsPath)) {
    const files = fs.readdirSync(resultsPath);
    const screenshots = files.filter(f => f.endsWith('.png')).length;
    const traces = files.filter(f => f.endsWith('.zip')).length;
    const videos = files.filter(f => f.endsWith('.webm')).length;
    
    const summary = {
      timestamp: new Date().toISOString(),
      artifacts: {
        screenshots,
        traces,
        videos
      },
      totalFiles: files.length
    };
    
    fs.writeFileSync(
      path.join(resultsPath, 'test-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('📊 Test summary generated:', summary);
  }
});