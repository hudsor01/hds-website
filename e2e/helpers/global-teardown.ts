import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright global teardown...');

  try {
    // Clean up any test artifacts
    await cleanupTestData();
    
    // Log test completion stats
    await logTestStats();

    console.log('✅ Global teardown completed successfully!');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here as it might mask test failures
  }
}

async function cleanupTestData() {
  try {
    // Clean up any persistent test data
    // This could include database cleanup, file cleanup, etc.
    console.log('🧹 Cleaning up test data...');
    
    // For now, just log the cleanup
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.log('⚠️  Test data cleanup failed:', error);
  }
}

async function logTestStats() {
  try {
    console.log('📊 Test execution summary:');
    console.log(`- Test run completed at: ${new Date().toISOString()}`);
    console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- CI Mode: ${process.env.CI ? 'Yes' : 'No'}`);
    
    // Log memory usage
    const memUsage = process.memoryUsage();
    console.log(`- Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  } catch (error) {
    console.log('⚠️  Failed to log test stats:', error);
  }
}

export default globalTeardown;