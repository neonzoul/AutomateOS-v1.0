import { test, expect } from '@playwright/test';

async function ensureStartAndHttp(page: any) {
  // Add Start if button enabled
  const startBtn = page.getByRole('button', { name: '+ Start' });
  if (await startBtn.isEnabled()) {
    await startBtn.click();
  }
  // Add HTTP node
  await page.getByRole('button', { name: '+ HTTP' }).click();
  // Connect via click (connectOnClick mode)
  const startNode = page.locator('[data-id="start"]');
  const httpNode = page.locator('[data-id="http"]');
  await startNode.click();
  await httpNode.click();
}

test.describe('Run workflow (Start -> HTTP)', () => {
  test('executes graph and shows succeeded status & logs', async ({ page }) => {
    await page.goto('/builder');
    await expect(page.getByTestId('canvas')).toBeVisible();
    await ensureStartAndHttp(page);

    // Fill minimal HTTP config if inspector form present (best-effort)
    // We try to open inspector by clicking http node
    const httpNode = page.locator('[data-id="http"]');
    await httpNode.click();
    // If a URL input exists, set to a fast public endpoint (httpbin.org)
    const urlInput = page.locator(
      'input[name="url"], input[placeholder="https://"]'
    );
    if (await urlInput.count()) {
      await urlInput.first().fill('https://httpbin.org/get');
    }

    // Start run
    const runButton = page.getByTestId('run-button');
    await expect(runButton).toBeEnabled();
    await runButton.click();

    // Status should move to running quickly
    const statusPill = page.locator(
      '[data-testid="run-panel"] div.inline-flex'
    );
    await expect(statusPill).toContainText(/(queued|running)/i);

    // Wait for succeeded (engine is synchronous in current prototype)
    await expect(statusPill).toHaveText(/succeeded/i, { timeout: 5000 });

    // Logs appear
    const logs = page.getByTestId('run-logs');
    if (await logs.count()) {
      const logText = await logs.innerText();
      expect(logText.length).toBeGreaterThan(0);
    }
  });
});
