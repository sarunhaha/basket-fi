import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // You can perform global cleanup tasks here, such as:
  // - Cleaning up test database
  // - Stopping mock servers
  // - Removing test files

  console.log('✅ Global teardown completed');
}

export default globalTeardown;