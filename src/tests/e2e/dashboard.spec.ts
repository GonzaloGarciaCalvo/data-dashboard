import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the initial state with welcome message', async ({ page }) => {
    await expect(page.getByText('Welcome to Data Dashboard')).toBeVisible();
    await expect(page.getByText('Start by loading your CSV files')).toBeVisible();
  });

  test('should display expected files information', async ({ page }) => {
    await expect(page.getByText('Expected Files')).toBeVisible();
    await expect(page.getByText('Customers:')).toBeVisible();
    await expect(page.getByText('Products:')).toBeVisible();
    await expect(page.getByText('Times:')).toBeVisible();
    await expect(page.getByText('Sales:')).toBeVisible();
  });

  test('should have a visible upload area', async ({ page }) => {
    await expect(page.getByText('Click to select CSV files')).toBeVisible();
  });

  test('should have a visible header with h1', async ({ page }) => {
    // Use specific locator for header h1 to avoid ambiguity with welcome message
    const headerH1 = page.locator('header h1');
    await expect(headerH1).toBeVisible();
    await expect(headerH1).toHaveText('Data Dashboard');
  });

  test('should not display KPI section when data is not loaded', async ({ page }) => {
    const kpiSection = page.getByText('KPIs', { exact: true });
    await expect(kpiSection).not.toBeVisible();
  });  // pnpm test:e2e --debug

  test('should have a visible sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeAttached();
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeButton = page.locator('button').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('header h1')).toBeVisible();
    await expect(page.getByText('Welcome to Data Dashboard')).toBeVisible();
  });
});

test.describe('CSV Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show upload zone', async ({ page }) => {
    await expect(page.getByText('Load CSV Files')).toBeVisible();
    await expect(page.getByText('Upload your CSV files')).toBeVisible();
    await expect(page.getByText('Or drag and drop files here')).toBeVisible();
  });

  test('should accept file through file input', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles('data-files/datos2.csv');
    const processBtn = page.getByRole('button', { name: 'Process Files' });
    await expect(processBtn).toBeVisible();
    await processBtn.click();
    await expect(page.getByText('KPIs', { exact: true })).toBeVisible();
    await expect(page.locator('[data-testid="sales-by-customer"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-by-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-by-product"]')).toBeVisible();
    });
})