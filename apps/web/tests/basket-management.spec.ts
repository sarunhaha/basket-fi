import { test, expect } from '@playwright/test';

test.describe('Basket Management Flow', () => {
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

    // Mock baskets data
    await page.route('**/api/v1/baskets**', async (route) => {
      if (route.request().method() === 'GET') {
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
                isPublic: true,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'basket-2',
                name: 'Stablecoin Strategy',
                description: 'Conservative portfolio focused on stablecoins',
                totalValue: '5000.00',
                isPublic: false,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: {
              hasNext: false,
              nextCursor: null,
              total: 2,
            },
          }),
        });
      }
    });

    // Mock basket detail
    await page.route('**/api/v1/baskets/basket-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'basket-1',
          name: 'DeFi Blue Chips',
          description: 'A diversified portfolio of established DeFi tokens',
          totalValue: '10000.00',
          isPublic: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          allocations: [
            {
              id: 'alloc-1',
              basketId: 'basket-1',
              tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              targetPercentage: '40.00',
              currentPercentage: '38.50',
              amount: '4000.00',
              basketAsset: {
                id: 'asset-1',
                tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                symbol: 'WETH',
                name: 'Wrapped Ether',
                decimals: 18,
                logoUri: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png',
              },
            },
            {
              id: 'alloc-2',
              basketId: 'basket-1',
              tokenAddress: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
              targetPercentage: '30.00',
              currentPercentage: '31.50',
              amount: '3000.00',
              basketAsset: {
                id: 'asset-2',
                tokenAddress: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
                symbol: 'USDC',
                name: 'USD Coin',
                decimals: 6,
                logoUri: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
              },
            },
          ],
        }),
      });
    });
  });

  test('should display baskets list correctly', async ({ page }) => {
    await page.goto('/baskets');

    // Check page title and header
    await expect(page.getByRole('heading', { name: /my baskets/i })).toBeVisible();
    await expect(page.getByText(/manage your defi token portfolios/i)).toBeVisible();

    // Check create basket button
    const createButton = page.getByRole('link', { name: /create basket/i });
    await expect(createButton).toBeVisible();

    // Check search and filters
    await expect(page.getByPlaceholder(/search baskets/i)).toBeVisible();
    await expect(page.getByRole('combobox', { name: /most recent/i })).toBeVisible();

    // Check basket cards
    await expect(page.getByText('DeFi Blue Chips')).toBeVisible();
    await expect(page.getByText('Stablecoin Strategy')).toBeVisible();
    await expect(page.getByText('$10,000.00')).toBeVisible();
    await expect(page.getByText('$5,000.00')).toBeVisible();

    // Check public badge
    await expect(page.getByText('Public')).toBeVisible();
  });

  test('should navigate to basket detail', async ({ page }) => {
    await page.goto('/baskets');

    // Click on basket card
    await page.getByText('DeFi Blue Chips').click();

    // Should navigate to basket detail page
    await expect(page).toHaveURL('/baskets/basket-1');
    await expect(page.getByRole('heading', { name: /defi blue chips/i })).toBeVisible();

    // Check allocations are displayed
    await expect(page.getByText('WETH')).toBeVisible();
    await expect(page.getByText('USDC')).toBeVisible();
    await expect(page.getByText('40.00%')).toBeVisible();
    await expect(page.getByText('30.00%')).toBeVisible();
  });

  test('should create new basket successfully', async ({ page }) => {
    // Mock create basket API
    await page.route('**/api/v1/baskets', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'basket-new',
            name: requestBody.name,
            description: requestBody.description,
            totalValue: '0.00',
            isPublic: requestBody.isPublic,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }
    });

    await page.goto('/baskets/create');

    // Check page title
    await expect(page.getByRole('heading', { name: /create new basket/i })).toBeVisible();

    // Fill basic information
    await page.getByLabel(/basket name/i).fill('Test Portfolio');
    await page.getByLabel(/description/i).fill('A test portfolio for E2E testing');

    // Add token allocations
    await page.getByLabel(/token address/i).first().fill('0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D');
    await page.getByLabel(/percentage/i).first().fill('60');

    // Add second allocation
    await page.getByRole('button', { name: /add token/i }).click();
    await page.getByLabel(/token address/i).last().fill('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    await page.getByLabel(/percentage/i).last().fill('40');

    // Submit form
    await page.getByRole('button', { name: /create basket/i }).click();

    // Should show success message and redirect
    await expect(page.getByText(/basket created successfully/i)).toBeVisible();
    await expect(page).toHaveURL('/baskets/basket-new');
  });

  test('should validate basket creation form', async ({ page }) => {
    await page.goto('/baskets/create');

    // Try to submit empty form
    await page.getByRole('button', { name: /create basket/i }).click();

    // Should show validation errors
    await expect(page.getByText(/name is required/i)).toBeVisible();

    // Fill name but leave allocations empty
    await page.getByLabel(/basket name/i).fill('Test Portfolio');
    await page.getByRole('button', { name: /create basket/i }).click();

    // Should show allocation validation
    await expect(page.getByText(/token address is required/i)).toBeVisible();

    // Add allocation with invalid percentage
    await page.getByLabel(/token address/i).fill('0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D');
    await page.getByLabel(/percentage/i).fill('150');

    // Should show percentage validation
    await expect(page.getByText(/maximum 100%/i)).toBeVisible();

    // Fix percentage but make total not equal 100%
    await page.getByLabel(/percentage/i).fill('60');
    await page.getByRole('button', { name: /create basket/i }).click();

    // Should show total percentage warning
    await expect(page.getByText(/total allocation should equal 100%/i)).toBeVisible();
  });

  test('should handle basket creation errors', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/baskets', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'INVALID_TOKEN',
            message: 'Invalid token address provided',
          }),
        });
      }
    });

    await page.goto('/baskets/create');

    // Fill form with valid data
    await page.getByLabel(/basket name/i).fill('Test Portfolio');
    await page.getByLabel(/token address/i).fill('0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D');
    await page.getByLabel(/percentage/i).fill('100');

    // Submit form
    await page.getByRole('button', { name: /create basket/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid token address provided/i)).toBeVisible();
    
    // Should remain on create page
    await expect(page).toHaveURL('/baskets/create');
  });

  test('should search and filter baskets', async ({ page }) => {
    await page.goto('/baskets');

    // Test search functionality
    const searchInput = page.getByPlaceholder(/search baskets/i);
    await searchInput.fill('DeFi');

    // Should filter results (in real app, this would trigger API call)
    await expect(page.getByText('DeFi Blue Chips')).toBeVisible();

    // Clear search
    await searchInput.clear();

    // Test sort functionality
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /name a-z/i }).click();

    // Test filter functionality
    await page.getByRole('combobox').last().click();
    await page.getByRole('option', { name: /public only/i }).click();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/baskets');

    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip link
    
    // Should focus on create button
    const createButton = page.getByRole('link', { name: /create basket/i });
    await expect(createButton).toBeFocused();

    // Check ARIA labels
    const searchInput = page.getByPlaceholder(/search baskets/i);
    await expect(searchInput).toHaveAttribute('aria-label');

    // Check basket cards are focusable
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const basketCard = page.getByText('DeFi Blue Chips').locator('..');
    await expect(basketCard).toBeFocused();
  });

  test('should handle empty state', async ({ page }) => {
    // Mock empty baskets response
    await page.route('**/api/v1/baskets**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: {
            hasNext: false,
            nextCursor: null,
            total: 0,
          },
        }),
      });
    });

    await page.goto('/baskets');

    // Should show empty state
    await expect(page.getByText(/no baskets yet/i)).toBeVisible();
    await expect(page.getByText(/create your first defi portfolio/i)).toBeVisible();
    
    // Should show create button
    const createButton = page.getByRole('link', { name: /create your first basket/i });
    await expect(createButton).toBeVisible();
  });
});