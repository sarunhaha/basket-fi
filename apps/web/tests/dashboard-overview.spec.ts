import { test, expect } from '@playwright/test';

test.describe('Dashboard Overview Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-access-token');
    });

    // Mock user data
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

    // Mock dashboard data
    await page.route('**/api/v1/baskets**', async (route) => {
      const url = new URL(route.request().url());
      const limit = url.searchParams.get('limit');
      
      if (limit === '100') {
        // Stats query
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'basket-1',
                name: 'DeFi Blue Chips',
                totalValue: '10000.00',
                isActive: true,
                isPublic: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'basket-2',
                name: 'Stablecoin Strategy',
                totalValue: '5000.00',
                isActive: true,
                isPublic: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: { hasNext: false, nextCursor: null, total: 2 },
          }),
        });
      } else {
        // Recent baskets query
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 'basket-1',
                name: 'DeFi Blue Chips',
                description: 'A diversified portfolio of established DeFi tokens',
                totalValue: '10000.00',
                isActive: true,
                isPublic: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: { hasNext: false, nextCursor: null, total: 1 },
          }),
        });
      }
    });

    // Mock transactions data
    await page.route('**/api/v1/transactions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'tx-1',
              type: 'DEPOSIT',
              status: 'CONFIRMED',
              amount: '1000.00',
              tokenAddress: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
              transactionHash: '0x123...abc',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'tx-2',
              type: 'SWAP',
              status: 'PENDING',
              amount: '500.00',
              tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              transactionHash: null,
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { hasNext: false, nextCursor: null, total: 2 },
        }),
      });
    });

    // Mock alerts data
    await page.route('**/api/v1/alerts**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'alert-1',
              type: 'PRICE',
              condition: 'ABOVE',
              value: '2000.00',
              isActive: true,
              isTriggered: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: 'alert-2',
              type: 'REBALANCE_NEEDED',
              condition: 'CHANGE_UP',
              value: '5.00',
              isActive: true,
              isTriggered: true,
              lastTriggered: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { hasNext: false, nextCursor: null, total: 2 },
        }),
      });
    });
  });

  test('should display dashboard correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Check page title and header
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/overview of your defi portfolios/i)).toBeVisible();

    // Check navigation sidebar
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /baskets/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /transactions/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /alerts/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();

    // Check user info in header
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('0x742d...e8e8')).toBeVisible();
  });

  test('should display stats cards correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for stats to load
    await expect(page.getByText('Total Portfolio Value')).toBeVisible();

    // Check stats values
    await expect(page.getByText('$15,000.00')).toBeVisible(); // Total value
    await expect(page.getByText('2')).toBeVisible(); // Active baskets count
    
    // Check performance indicator
    const performanceElement = page.locator('[class*="text-green-600"], [class*="text-red-600"]').first();
    await expect(performanceElement).toBeVisible();

    // Check other stats
    await expect(page.getByText('Active Baskets')).toBeVisible();
    await expect(page.getByText('Recent Transactions')).toBeVisible();
    await expect(page.getByText('Active Alerts')).toBeVisible();
  });

  test('should display recent baskets section', async ({ page }) => {
    await page.goto('/dashboard');

    // Check section title
    await expect(page.getByText('Recent Baskets')).toBeVisible();
    await expect(page.getByRole('link', { name: /view all/i })).toBeVisible();

    // Check basket item
    await expect(page.getByText('DeFi Blue Chips')).toBeVisible();
    await expect(page.getByText('$10,000.00')).toBeVisible();
    await expect(page.getByText('Public')).toBeVisible();

    // Check performance indicator
    const performanceElement = page.locator('[class*="text-green-600"], [class*="text-red-600"]').first();
    await expect(performanceElement).toBeVisible();

    // Test navigation to basket detail
    await page.getByText('DeFi Blue Chips').click();
    await expect(page).toHaveURL('/baskets/basket-1');
  });

  test('should display recent transactions section', async ({ page }) => {
    await page.goto('/dashboard');

    // Check section title
    await expect(page.getByText('Recent Transactions')).toBeVisible();

    // Check transaction items
    await expect(page.getByText('DEPOSIT')).toBeVisible();
    await expect(page.getByText('SWAP')).toBeVisible();
    await expect(page.getByText('CONFIRMED')).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible();

    // Check amounts
    await expect(page.getByText('$1,000.00')).toBeVisible();
    await expect(page.getByText('$500.00')).toBeVisible();
  });

  test('should display active alerts section', async ({ page }) => {
    await page.goto('/dashboard');

    // Check section title
    await expect(page.getByText('Active Alerts')).toBeVisible();

    // Check alert items
    await expect(page.getByText('PRICE')).toBeVisible();
    await expect(page.getByText('REBALANCE_NEEDED')).toBeVisible();

    // Check triggered status
    const triggeredAlert = page.getByText('triggered');
    await expect(triggeredAlert).toBeVisible();
  });

  test('should handle empty states', async ({ page }) => {
    // Mock empty responses
    await page.route('**/api/v1/baskets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: { hasNext: false, nextCursor: null, total: 0 },
        }),
      });
    });

    await page.route('**/api/v1/transactions**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: { hasNext: false, nextCursor: null, total: 0 },
        }),
      });
    });

    await page.route('**/api/v1/alerts**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: { hasNext: false, nextCursor: null, total: 0 },
        }),
      });
    });

    await page.goto('/dashboard');

    // Check empty state for baskets
    await expect(page.getByText(/no baskets yet/i)).toBeVisible();
    await expect(page.getByText(/create your first defi portfolio/i)).toBeVisible();
    
    // Check create basket button
    const createButton = page.getByRole('link', { name: /create basket/i });
    await expect(createButton).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to baskets
    await page.getByRole('link', { name: /baskets/i }).first().click();
    await expect(page).toHaveURL('/baskets');
    await expect(page.getByRole('heading', { name: /my baskets/i })).toBeVisible();

    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click();
    await expect(page).toHaveURL('/dashboard');

    // Navigate to transactions
    await page.getByRole('link', { name: /transactions/i }).click();
    await expect(page).toHaveURL('/transactions');

    // Navigate to alerts
    await page.getByRole('link', { name: /alerts/i }).click();
    await expect(page).toHaveURL('/alerts');

    // Navigate to settings
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('should handle theme switching', async ({ page }) => {
    await page.goto('/dashboard');

    // Open theme menu
    const themeButton = page.getByRole('button', { name: /toggle theme/i });
    await themeButton.click();

    // Switch to dark theme
    await page.getByRole('menuitem', { name: /dark/i }).click();

    // Check dark theme is applied
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Switch to light theme
    await themeButton.click();
    await page.getByRole('menuitem', { name: /light/i }).click();

    // Check light theme is applied
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // Check mobile menu button is visible
    const mobileMenuButton = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(mobileMenuButton).toBeVisible();

    // Check sidebar is hidden on mobile
    const sidebar = page.getByRole('navigation');
    await expect(sidebar).not.toBeVisible();

    // Open mobile menu
    await mobileMenuButton.click();
    await expect(sidebar).toBeVisible();

    // Check navigation links work in mobile menu
    await page.getByRole('link', { name: /baskets/i }).click();
    await expect(page).toHaveURL('/baskets');

    // Check mobile menu closes after navigation
    await expect(sidebar).not.toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/dashboard');

    // Check skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check ARIA landmarks
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    const navigation = page.getByRole('navigation');
    await expect(navigation).toBeVisible();

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should focus on first navigation link
    const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();
    await expect(dashboardLink).toBeFocused();

    // Check focus indicators are visible
    await expect(dashboardLink).toHaveClass(/focus-visible/);
  });

  test('should handle loading states', async ({ page }) => {
    // Delay API responses to test loading states
    await page.route('**/api/v1/baskets**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: { hasNext: false, nextCursor: null, total: 0 },
        }),
      });
    });

    await page.goto('/dashboard');

    // Check loading skeletons are displayed
    const skeletons = page.locator('.skeleton');
    await expect(skeletons.first()).toBeVisible();

    // Wait for loading to complete
    await expect(page.getByText(/no baskets yet/i)).toBeVisible();
    await expect(skeletons.first()).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/baskets**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        }),
      });
    });

    await page.goto('/dashboard');

    // Should show error state
    await expect(page.getByText(/failed to load/i)).toBeVisible();
    
    // Should not crash the application
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});