import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Rent-a-Car — Find Your Perfect Ride/);
  });

  test('displays hero heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('Find your perfect ride');
  });

  test('CTA button navigates to /search', async ({ page }) => {
    // The "Search available cars" button lives in the blue CTA banner section
    const ctaButton = page.getByRole('link', { name: /Search available cars/i });
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await expect(page).toHaveURL(/\/search/);
  });

  test('search widget submit navigates to /search', async ({ page }) => {
    // Fill in location and submit the hero search form
    await page.fill('#location', 'Manila');
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(/\/search\?.*location=Manila/);
  });

  test('featured vehicles section is visible', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Featured vehicles/i });
    await expect(heading).toBeVisible();
  });

  test('"View all" button navigates to /search', async ({ page }) => {
    const viewAll = page.getByRole('link', { name: /View all/i });
    await expect(viewAll).toBeVisible();
    await viewAll.click();
    await expect(page).toHaveURL(/\/search/);
  });
});
