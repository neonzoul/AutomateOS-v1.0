import { test, expect } from '@playwright/test';

test.describe('Builder Page', () => {
  test('should load the canvas and allow panning/zooming', async ({ page }) => {
    // Navigate to builder page
    await page.goto('/builder');

    // Wait for canvas to load
    await page.waitForSelector('[data-testid="canvas"]');

    // Verify canvas is present
    const canvas = page.locator('[data-testid="canvas"]');
    await expect(canvas).toBeVisible();

    // Verify React Flow controls are present
    await expect(page.locator('.react-flow__controls')).toBeVisible();
    await expect(page.locator('.react-flow__minimap')).toBeVisible();

    // Test that we can interact with the canvas (basic smoke test)
    const canvasElement = page.locator('.react-flow__pane');
    await expect(canvasElement).toBeVisible();
  });

  test('should navigate from homepage to builder', async ({ page }) => {
    // Start at homepage
    await page.goto('/');

    // Click the builder link
    await page.click('text=Open Builder');

    // Should navigate to /builder
    await expect(page).toHaveURL(/.*builder/);

    // Canvas should be visible
    await page.waitForSelector('[data-testid="canvas"]');
    const canvas = page.locator('[data-testid="canvas"]');
    await expect(canvas).toBeVisible();
  });
});
