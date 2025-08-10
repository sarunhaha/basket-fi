import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock MetaMask
    await page.addInitScript(() => {
      // Mock window.ethereum
      (window as any).ethereum = {
        request: async ({ method, params }: any) => {
          if (method === 'eth_requestAccounts') {
            return ['0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e8e8'];
          }
          if (method === 'personal_sign') {
            return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b';
          }
          return null;
        },
        on: () => {},
        removeListener: () => {},
        isMetaMask: true,
      };
    });

    // Mock API responses
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 'user-123',
            walletAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e8e8',
            displayName: 'Test User',
            role: 'USER',
            emailNotifications: false,
            pushNotifications: true,
            language: 'en',
            currency: 'USD',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    });
  });

  test('should display sign-in page correctly', async ({ page }) => {
    await page.goto('/sign-in');

    // Check page title and content
    await expect(page).toHaveTitle(/Sign in/);
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
    await expect(page.getByText(/connect your wallet to access/i)).toBeVisible();

    // Check wallet connect button
    const connectButton = page.getByRole('button', { name: /connect with metamask/i });
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toBeEnabled();

    // Check branding elements
    await expect(page.getByText('Welcome to Basket.fi')).toBeVisible();
    await expect(page.getByText('Diversified DeFi portfolios')).toBeVisible();
  });

  test('should successfully authenticate with wallet', async ({ page }) => {
    await page.goto('/sign-in');

    // Click connect wallet button
    const connectButton = page.getByRole('button', { name: /connect with metamask/i });
    await connectButton.click();

    // Should show loading state
    await expect(page.getByText(/connecting/i)).toBeVisible();

    // Should redirect to dashboard after successful authentication
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Should show user info in header
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('0x742d...e8e8')).toBeVisible();
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock failed authentication
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'INVALID_SIGNATURE',
          message: 'Invalid wallet signature',
        }),
      });
    });

    await page.goto('/sign-in');

    // Click connect wallet button
    const connectButton = page.getByRole('button', { name: /connect with metamask/i });
    await connectButton.click();

    // Should show error message
    await expect(page.getByText(/invalid wallet signature/i)).toBeVisible();
    
    // Should remain on sign-in page
    await expect(page).toHaveURL('/sign-in');
    
    // Button should be enabled again
    await expect(connectButton).toBeEnabled();
  });

  test('should redirect authenticated users from sign-in page', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
    });

    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-123',
          walletAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e8e8',
          displayName: 'Test User',
          role: 'USER',
          emailNotifications: false,
          pushNotifications: true,
          language: 'en',
          currency: 'USD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/sign-in');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle wallet not installed', async ({ page }) => {
    // Remove ethereum object
    await page.addInitScript(() => {
      delete (window as any).ethereum;
    });

    await page.goto('/sign-in');

    // Click connect wallet button
    const connectButton = page.getByRole('button', { name: /connect with metamask/i });
    await connectButton.click();

    // Should show MetaMask not installed error
    await expect(page.getByText(/metamask is not installed/i)).toBeVisible();
    
    // Should show download link
    await expect(page.getByRole('link', { name: /download metamask/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Start with authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
    });

    await page.route('**/api/v1/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-123',
          walletAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e8e8',
          displayName: 'Test User',
          role: 'USER',
          emailNotifications: false,
          pushNotifications: true,
          language: 'en',
          currency: 'USD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/dashboard');

    // Open user menu
    await page.getByRole('button', { name: /test user/i }).click();

    // Click sign out
    await page.getByRole('menuitem', { name: /sign out/i }).click();

    // Should redirect to sign-in page
    await expect(page).toHaveURL('/sign-in');
    
    // Should clear authentication state
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/sign-in');

    // Check for skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Check focus order
    await page.keyboard.press('Tab');
    const connectButton = page.getByRole('button', { name: /connect with metamask/i });
    await expect(connectButton).toBeFocused();

    // Check ARIA labels
    await expect(connectButton).toHaveAttribute('aria-label');
    
    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });
});