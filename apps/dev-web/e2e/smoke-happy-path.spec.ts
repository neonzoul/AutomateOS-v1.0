import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Test: Happy Path Workflow Execution
 *
 * Goal: Prove "creator can run a simple workflow"
 * - Add Start + HTTP nodes and connect them
 * - Configure HTTP node with a valid URL
 * - Run workflow and poll until succeeded
 * - Screenshot node badges showing execution status
 *
 * This test runs against both live and mocked environments:
 * - Local dev: Points to real services (API gateway + engine)
 * - CI: Points to mock gateway for reliable testing
 */

async function addStartAndHttpNodes(page: any) {
  // Check if Start node already exists first
  const startNodeLocator = page.locator('[data-id="start"]');

  if (!(await startNodeLocator.isVisible())) {
    // Add Start node if not present
    const startBtn = page.getByRole('button', { name: '+ Start' });
    await expect(startBtn).toBeVisible({ timeout: 10000 });

    if (await startBtn.isEnabled()) {
      await startBtn.click();
    }
  }

  // Always wait for Start node to be visible
  await expect(startNodeLocator).toBeVisible({ timeout: 10000 });

  // Add HTTP node
  const httpBtn = page.getByRole('button', { name: '+ HTTP' });
  await expect(httpBtn).toBeVisible({ timeout: 10000 });
  await httpBtn.click();
  await expect(page.locator('[data-id="http"]')).toBeVisible({
    timeout: 10000,
  });
}

async function connectNodes(page: any) {
  // Connect nodes using click-connect mode (connectOnClick=true)
  const startNode = page.locator('[data-id="start"]');
  const httpNode = page.locator('[data-id="http"]');

  // Click start node first (source)
  await startNode.click();
  // Then click HTTP node (target) to create edge
  await httpNode.click();

  // Verify edge was created by checking for React Flow edge elements
  await expect(page.locator('.react-flow__edge')).toBeVisible();
}

async function configureHttpNode(
  page: any,
  url: string = 'https://httpbin.org/get'
) {
  // Select HTTP node to open inspector
  const httpNode = page.locator('[data-id="http"]');
  await httpNode.click();

  // Wait for inspector to show HTTP configuration
  await expect(page.getByText('Method')).toBeVisible();
  await expect(page.getByText('URL')).toBeVisible();

  // Fill in the URL field
  const urlInput = page.locator('input[placeholder="https://api.example.com"]');
  await urlInput.fill(url);

  // Verify URL was set (form auto-saves via watch effect)
  await expect(urlInput).toHaveValue(url);

  // Verify the node displays the URL
  const nodeUrlDisplay = httpNode.locator('div').filter({ hasText: url });
  await expect(nodeUrlDisplay).toBeVisible();
}

async function executeWorkflow(page: any) {
  // Click the run button
  const runButton = page.getByTestId('run-button');
  await expect(runButton).toBeEnabled();
  await runButton.click();

  // Status should change from idle to queued/running quickly
  const statusPill = page.locator('[data-testid="run-panel"] div.inline-flex');
  await expect(statusPill).toContainText(/(queued|running)/i, {
    timeout: 2000,
  });

  // Poll until workflow succeeds (give it time for network requests)
  await expect(statusPill).toHaveText(/succeeded/i, { timeout: 15000 });

  return statusPill;
}

async function verifyNodeBadges(page: any) {
  // Check that nodes show execution status badges
  const startNode = page.locator('[data-id="start"]');
  const httpNode = page.locator('[data-id="http"]');

  // Start node should show succeeded status
  await expect(startNode.locator('text=succeeded')).toBeVisible();

  // HTTP node should show succeeded status
  await expect(httpNode.locator('text=succeeded')).toBeVisible();
}

async function captureNodeScreenshots(page: any, testInfo: any) {
  // Take screenshot of the entire canvas showing node badges
  const canvas = page.locator('[data-testid="canvas"]');
  await canvas.screenshot({
    path: `${testInfo.outputPath('workflow-execution-success.png')}`,
  });

  // Take focused screenshots of individual nodes
  const startNode = page.locator('[data-id="start"]');
  await startNode.screenshot({
    path: `${testInfo.outputPath('start-node-succeeded.png')}`,
  });

  const httpNode = page.locator('[data-id="http"]');
  await httpNode.screenshot({
    path: `${testInfo.outputPath('http-node-succeeded.png')}`,
  });
}

test.describe('E2E Smoke: Happy Path Workflow Execution', () => {
  test('creator can run a simple Start → HTTP workflow successfully', async ({
    page,
  }, testInfo) => {
    // Navigate to builder
    await page.goto('/builder');

    // Wait for canvas to be visible and interactive
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 15000 });

    // Wait for the page to be fully loaded and interactive
    await page.waitForLoadState('networkidle');

    // Additional wait for React components to mount and render
    await page.waitForTimeout(2000);

    // Step 1: Add Start + HTTP nodes
    await addStartAndHttpNodes(page);

    // Step 2: Connect the nodes with an edge
    await connectNodes(page);

    // Step 3: Configure HTTP node with valid URL
    await configureHttpNode(page, 'https://httpbin.org/get');

    // Step 4: Execute workflow and wait for success
    const statusPill = await executeWorkflow(page);

    // Step 5: Verify node badges show succeeded status
    await verifyNodeBadges(page);

    // Step 6: Capture screenshots for verification
    await captureNodeScreenshots(page, testInfo);

    // Verify logs appeared
    const logs = page.getByTestId('run-logs');
    if ((await logs.count()) > 0) {
      const logText = await logs.innerText();
      expect(logText.length).toBeGreaterThan(0);
      // Should contain run ID and success indicators
      expect(logText).toMatch(/run.+created|http.+200|succeeded/i);
    }

    // Final verification: workflow is in succeeded state
    await expect(statusPill).toHaveText(/succeeded/i);
  });

  test('handles network errors gracefully', async ({ page }, testInfo) => {
    // Navigate to builder
    await page.goto('/builder');

    // Wait for canvas to be visible and interactive
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 15000 });

    // Wait for the page to be fully loaded and interactive
    await page.waitForLoadState('networkidle');

    // Additional wait for React components to mount and render
    await page.waitForTimeout(2000);

    // Add and connect nodes
    await addStartAndHttpNodes(page);
    await connectNodes(page);

    // Configure with an invalid URL to test error handling
    await configureHttpNode(
      page,
      'https://this-domain-does-not-exist-test-12345.invalid'
    );

    // Execute workflow
    const runButton = page.getByTestId('run-button');
    await runButton.click();

    // Should eventually fail
    const statusPill = page.locator(
      '[data-testid="run-panel"] div.inline-flex'
    );
    await expect(statusPill).toContainText(/(failed|error)/i, {
      timeout: 15000,
    });

    // Take screenshot of failed state
    await page.screenshot({
      path: `${testInfo.outputPath('workflow-execution-failed.png')}`,
      fullPage: true,
    });

    // Verify error logs are shown
    const logs = page.getByTestId('run-logs');
    if ((await logs.count()) > 0) {
      const logText = await logs.innerText();
      expect(logText).toMatch(/error|failed/i);
    }
  });
});

test.describe('E2E Smoke: Mocked Environment (CI-safe)', () => {
  test.skip(({ browserName }) => {
    // Only run mocked tests in CI or when explicitly requested
    return !process.env.CI && !process.env.USE_MOCK_GATEWAY;
  });

  test('runs workflow against mock gateway', async ({ page }, testInfo) => {
    // Override API base URL to point to mock gateway
    await page.addInitScript(() => {
      window.localStorage.setItem('mockApiMode', 'true');
      // Override the API base URL for testing
      (window as any).__NEXT_DATA__ = {
        ...((window as any).__NEXT_DATA__ || {}),
        env: {
          NEXT_PUBLIC_API_BASE: 'http://localhost:3001', // Mock gateway
        },
      };
    });

    // Mock successful workflow execution response
    await page.route('**/v1/runs', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({ runId: 'mock-run-12345' }),
        });
      }
    });

    // Mock run status polling
    await page.route('**/v1/runs/mock-run-12345', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-run-12345',
          status: 'succeeded',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          steps: [
            {
              id: 'step-1',
              nodeId: 'start',
              status: 'succeeded',
              durationMs: 5,
            },
            {
              id: 'step-2',
              nodeId: 'http',
              status: 'succeeded',
              durationMs: 250,
            },
          ],
          logs: [
            {
              ts: new Date().toISOString(),
              level: 'info',
              msg: 'Mock: Workflow started',
            },
            {
              ts: new Date().toISOString(),
              level: 'info',
              msg: 'Mock: HTTP request successful (200)',
            },
            {
              ts: new Date().toISOString(),
              level: 'info',
              msg: 'Mock: Workflow completed successfully',
            },
          ],
        }),
      });
    });

    // Run the same workflow test against mocked backend
    await page.goto('/builder');

    // Wait for canvas to be visible and interactive
    await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 15000 });

    // Wait for the page to be fully loaded and interactive
    await page.waitForLoadState('networkidle');

    // Additional wait for React components to mount and render
    await page.waitForTimeout(2000);

    await addStartAndHttpNodes(page);
    await connectNodes(page);
    await configureHttpNode(page, 'https://api.example.com/test');

    const statusPill = await executeWorkflow(page);
    await verifyNodeBadges(page);
    await captureNodeScreenshots(page, testInfo);

    // Verify mocked logs
    const logs = page.getByTestId('run-logs');
    if ((await logs.count()) > 0) {
      const logText = await logs.innerText();
      expect(logText).toContain('Mock: Workflow completed successfully');
    }

    await expect(statusPill).toHaveText(/succeeded/i);
  });
});
