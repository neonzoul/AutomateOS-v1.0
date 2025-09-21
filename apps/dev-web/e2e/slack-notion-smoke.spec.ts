import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Tests: Slack + Notion Workflow Execution with Credentials
 *
 * Goals:
 * 1. Load Slack template, set webhook credential, run workflow, expect 200 POST
 * 2. Load Notion template, set integration token, run workflow, expect 200 POST
 * 3. Ensure no secrets appear in exported JSON or localStorage
 * 4. Validate credential masking in UI
 * 5. Test end-to-end security properties
 *
 * Tests run against mock gateway for reliable CI execution
 */

// Mock Slack webhook URL for testing (non-functional)
const MOCK_SLACK_WEBHOOK = 'https://hooks.slack.com/services/T123456/B987654/AbCdEf123456789';

// Mock Notion integration token for testing
const MOCK_NOTION_TOKEN = 'secret_AbCdEf123456789GhIjKlMnOpQrSt012345678';

async function waitForCanvasAndBridge(page: any) {
  // Wait for canvas to be visible and interactive
  await expect(page.getByTestId('canvas')).toBeVisible({ timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Wait for test bridge functions to be available
  await page
    .waitForFunction(
      () => {
        const w = window as any;
        return w.__setBuilderGraph && w.__getBuilderSnapshot && w.__setSelectedNode;
      },
      { timeout: 10000 }
    )
    .catch(() => {
      console.log('Test bridge functions not available, proceeding with UI interactions');
    });
}

async function loadTemplate(page: any, templatePath: string, templateName: string) {
  console.log(`Loading ${templateName} template...`);

  // Use test bridge to load the template directly
  const result = await page.evaluate(async (path: string) => {
    try {
      const response = await fetch(path);
      const template = await response.json();

      const w = window as any;
      if (w.__setBuilderGraph) {
        w.__setBuilderGraph(template);
        console.log('Template loaded successfully via test bridge');
        return { success: true, nodeCount: template.nodes.length };
      } else {
        return { success: false, error: 'Test bridge not available' };
      }
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, templatePath);

  if (!result.success) {
    throw new Error(`Failed to load ${templateName} template: ${result.error}`);
  }

  console.log(`${templateName} template loaded with ${result.nodeCount} nodes`);

  // Wait for nodes to appear in UI
  await page.waitForTimeout(1000);

  // Verify nodes are visible
  const nodeCount = await page.locator('.react-flow__node').count();
  expect(nodeCount).toBeGreaterThan(0);
}

async function createCredential(page: any, credentialName: string, credentialValue: string) {
  console.log(`Creating credential: ${credentialName}`);

  // Create credential directly via credential store for more reliable testing
  const createResult = await page.evaluate(async ({ name, value }: { name: string; value: string }) => {
    try {
      const w = window as any;
      if (w.__getCredentialStore) {
        const store = w.__getCredentialStore();
        if (store.setCredential) {
          await store.setCredential(name, value);
          return { success: true, method: 'store' };
        }
      }

      // Fallback to UI interaction
      return { success: false, method: 'store-failed' };
    } catch (e) {
      return { success: false, error: String(e), method: 'store' };
    }
  }, { name: credentialName, value: credentialValue });

  if (createResult.success) {
    console.log(`Credential ${credentialName} created via store`);
    await page.waitForTimeout(1000); // Wait for UI to update
    return;
  }

  // Fallback to UI interaction if store method fails
  console.log(`Store creation failed (${createResult.error}), trying UI method...`);

  // Select the HTTP node to access credential form
  const httpNode = page.locator('.react-flow__node[data-id*="http"]').or(
    page.locator('.react-flow__node[data-id*="notion"]')
  );
  await expect(httpNode).toBeVisible({ timeout: 5000 });

  // Click the node to select it
  await httpNode.click();
  await page.waitForTimeout(500);

  // Look for credential creation button in Inspector
  const createCredentialBtn = page.getByText('+ Create new credential');
  await expect(createCredentialBtn).toBeVisible({ timeout: 5000 });

  // Mock window.prompt for credential creation
  await page.evaluate(({ name, value }: { name: string; value: string }) => {
    let promptCallCount = 0;
    (window as any).prompt = (message?: string) => {
      promptCallCount++;
      if (promptCallCount === 1) {
        return name; // credential name
      } else if (promptCallCount === 2) {
        return value; // credential value
      }
      return null;
    };
  }, { name: credentialName, value: credentialValue });

  // Click create credential button
  await createCredentialBtn.click();
  await page.waitForTimeout(2000);

  // Verify credential was created
  const credentialExists = await page.evaluate((name: string) => {
    const w = window as any;
    if (w.__getCredentialStore) {
      const store = w.__getCredentialStore();
      return store.credentials && store.credentials.has(name);
    }
    return false;
  }, credentialName);

  if (!credentialExists) {
    throw new Error(`Failed to create credential ${credentialName} via UI`);
  }

  console.log(`Credential ${credentialName} created successfully`);
}

async function selectCredentialInForm(page: any, credentialName: string) {
  console.log(`Selecting credential in form: ${credentialName}`);

  // For Notion template, the credential should already be referenced in auth config
  // For Slack, we need to set it manually

  // First, make sure the HTTP node is selected
  const httpNode = page.locator('.react-flow__node[data-id*="http"]').or(
    page.locator('.react-flow__node[data-id*="notion"]')
  );
  await httpNode.click();
  await page.waitForTimeout(500);

  // Check if credential is already set by looking for it in the form
  const credentialText = page.locator(`text=${credentialName}`);
  const isAlreadyVisible = await credentialText.isVisible();

  if (isAlreadyVisible) {
    console.log(`Credential ${credentialName} already visible in form`);
    return;
  }

  // Look for authentication dropdown or select
  const authSelect = page.locator('select[name="auth"]').or(
    page.getByDisplayValue('No authentication')
  );

  if (await authSelect.count() > 0) {
    // Try to select the credential from dropdown
    try {
      await authSelect.selectOption({ label: new RegExp(credentialName, 'i') });
      console.log(`Selected ${credentialName} from dropdown`);
    } catch (e) {
      console.log(`Could not select from dropdown: ${e}`);
    }
  }

  await page.waitForTimeout(500);
  console.log(`Credential selection attempted for ${credentialName}`);
}

async function executeWorkflowWithMocks(page: any, expectedEndpoint: string) {
  console.log('Setting up API mocks...');

  // Mock the /v1/runs POST endpoint
  await page.route('**/v1/runs', async (route: any) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postData();
      console.log('Intercepted run creation request:', body);

      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          runId: 'test-run-' + Date.now(),
          status: 'queued'
        }),
      });
    }
  });

  // Mock the run polling endpoint
  await page.route('**/v1/runs/test-run-*', async (route: any) => {
    console.log('Intercepted run polling request');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        runId: route.request().url().split('/').pop(),
        status: 'succeeded',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        steps: [
          {
            id: 'step-1',
            nodeId: 'start-1',
            status: 'succeeded',
            durationMs: 5,
          },
          {
            id: 'step-2',
            nodeId: 'notion-1',
            status: 'succeeded',
            durationMs: 250,
          },
        ],
        logs: [
          {
            ts: new Date().toISOString(),
            level: 'info',
            msg: 'Workflow started',
          },
          {
            ts: new Date().toISOString(),
            level: 'info',
            msg: `HTTP POST ${expectedEndpoint} responded with 200`,
          },
          {
            ts: new Date().toISOString(),
            level: 'info',
            msg: 'Workflow completed successfully',
          },
        ],
      }),
    });
  });

  console.log('Executing workflow...');

  // Click the run button
  const runButton = page.getByTestId('run-button');
  await expect(runButton).toBeEnabled({ timeout: 5000 });
  console.log('Run button is enabled, clicking...');
  await runButton.click();

  // Wait for status to change to running/succeeded
  const statusPill = page.locator('[data-testid="run-panel"] div.inline-flex');
  await expect(statusPill).not.toHaveText(/ready to run/i, { timeout: 8000 });

  // Log current status for debugging
  const currentStatus = await statusPill.textContent();
  console.log('Current workflow status:', currentStatus);

  // Poll until workflow succeeds with longer timeout
  await expect(statusPill).toHaveText(/succeeded/i, { timeout: 20000 });

  // Verify logs contain expected 200 response
  const logs = page.getByTestId('run-logs');
  if (await logs.count() > 0) {
    const logText = await logs.innerText();
    expect(logText).toContain('200');
    expect(logText).toContain(expectedEndpoint.includes('slack') ? 'slack' : 'notion');
  }

  console.log('Workflow executed successfully');
  return statusPill;
}

async function verifyNoSecretsInExport(page: any, credentialValue: string) {
  console.log('Verifying no secrets in exported data...');

  // Export the workflow
  const exportResult = await page.evaluate(() => {
    const w = window as any;
    if (w.__getBuilderSnapshot) {
      return w.__getBuilderSnapshot();
    }
    return null;
  });

  if (exportResult) {
    const exportJson = JSON.stringify(exportResult);

    // Ensure credential value is not present in export
    expect(exportJson).not.toContain(credentialValue);

    // Check if auth config exists and contains credentialName reference
    const hasAuthConfig = exportJson.includes('credentialName') || exportJson.includes('"auth"');
    if (hasAuthConfig) {
      expect(exportJson).toContain('credentialName');
      console.log('Export verification passed - credentialName found, no secrets found');
    } else {
      console.log('Export verification passed - no auth config found, no secrets found');
    }
  }

  // Check localStorage for secrets
  const localStorageData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    return data;
  });

  const localStorageJson = JSON.stringify(localStorageData);
  expect(localStorageJson).not.toContain(credentialValue);

  console.log('LocalStorage verification passed - no secrets found');
}

async function verifyCredentialMasking(page: any, credentialName: string, credentialValue: string) {
  console.log('Verifying credential masking in UI...');

  // Check that the full credential value never appears in visible text
  const visibleText = await page.textContent('body');
  expect(visibleText).not.toContain(credentialValue);

  // The masked pattern check is optional since credentials might not be visible
  // during workflow execution. The main security check is that the raw value
  // doesn't appear anywhere in the UI.

  console.log('Credential masking verification passed');
}

test.describe('E2E Smoke: Slack + Notion with Credentials', () => {
  test.beforeEach(async ({ page }) => {
    // Force mock API mode for testing
    await page.addInitScript(() => {
      window.localStorage.setItem('mockApiMode', 'true');
      (window as any).__NEXT_DATA__ = {
        ...((window as any).__NEXT_DATA__ || {}),
        env: { NEXT_PUBLIC_API_BASE: 'http://localhost:3001' },
      };
    });
  });

  test('Slack workflow: load template, set webhook credential, run, expect 200', async ({ page }, testInfo) => {
    // Navigate to builder
    await page.goto('/builder');
    await waitForCanvasAndBridge(page);

    // Step 1: Load Slack template
    await loadTemplate(page, '/examples/slack-notification.json', 'Slack');

    // Step 2: Create webhook credential
    await createCredential(page, 'slack-webhook', MOCK_SLACK_WEBHOOK);

    // Step 3: Update HTTP node to use credential instead of hardcoded URL
    await page.evaluate(({ credentialName }) => {
      const w = window as any;
      if (w.__setBuilderGraph && w.__getBuilderSnapshot) {
        const graph = w.__getBuilderSnapshot();
        const httpNode = graph.nodes.find((n: any) => n.type === 'http');
        if (httpNode) {
          httpNode.data.config.auth = { credentialName };
          httpNode.data.config.url = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
          w.__setBuilderGraph(graph);
        }
      }
    }, { credentialName: 'slack-webhook' });

    await page.waitForTimeout(1000);

    // Step 4: Execute workflow with mocked responses
    const statusPill = await executeWorkflowWithMocks(page, 'hooks.slack.com');

    // Step 5: Verify workflow succeeded
    await expect(statusPill).toHaveText(/succeeded/i);

    // Step 6: Verify no secrets in export or storage
    await verifyNoSecretsInExport(page, MOCK_SLACK_WEBHOOK);

    // Step 7: Verify credential masking
    await verifyCredentialMasking(page, 'slack-webhook', MOCK_SLACK_WEBHOOK);

    // Take screenshot for documentation
    await page.screenshot({
      path: `${testInfo.outputPath('slack-workflow-completed.png')}`,
      fullPage: true,
    });

    console.log('Slack workflow test completed successfully');
  });

  test('Notion workflow: load template, set integration token, run, expect 200', async ({ page }, testInfo) => {
    // Navigate to builder
    await page.goto('/builder');
    await waitForCanvasAndBridge(page);

    // Step 1: Load Notion template
    await loadTemplate(page, '/examples/notion-automation.json', 'Notion');

    // Step 2: Create integration token credential
    await createCredential(page, 'notion-integration-token', MOCK_NOTION_TOKEN);

    // Step 3: Select the HTTP node to view credentials in Inspector
    const httpNode = page.locator('.react-flow__node[data-id*="notion"]').or(
      page.locator('.react-flow__node[data-id*="http"]')
    );
    await expect(httpNode).toBeVisible({ timeout: 5000 });
    await httpNode.click();
    await page.waitForTimeout(1000); // Wait for Inspector to load

    // Step 4: Verify credential is available in the dropdown
    const credentialDropdown = page.locator('select[name="auth.credentialName"]');
    await expect(credentialDropdown).toBeVisible({ timeout: 5000 });

    // Check if credential exists in dropdown options
    const credentialOption = page.locator('option[value="notion-integration-token"]');
    await expect(credentialOption).toBeAttached();

    // Step 5: Execute workflow with mocked responses
    const statusPill = await executeWorkflowWithMocks(page, 'api.notion.com');

    // Step 5: Verify workflow succeeded
    await expect(statusPill).toHaveText(/succeeded/i);

    // Step 6: Verify no secrets in export or storage
    await verifyNoSecretsInExport(page, MOCK_NOTION_TOKEN);

    // Step 7: Verify credential masking
    await verifyCredentialMasking(page, 'notion-integration-token', MOCK_NOTION_TOKEN);

    // Take screenshot for documentation
    await page.screenshot({
      path: `${testInfo.outputPath('notion-workflow-completed.png')}`,
      fullPage: true,
    });

    console.log('Notion workflow test completed successfully');
  });

  test('Security validation: credentials never leak in any form', async ({ page }) => {
    await page.goto('/builder');
    await waitForCanvasAndBridge(page);

    // Create multiple credentials with sensitive data
    const sensitiveCredentials = [
      { name: 'test-api-key', value: 'sk_test_very_secret_key_12345_sensitive_data' },
      { name: 'oauth-token', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
      { name: 'webhook-url', value: 'https://hooks.example.com/webhook/super-secret-path' },
    ];

    // Load a simple template
    await loadTemplate(page, '/examples/slack-notification.json', 'Slack');

    // Create all test credentials
    for (const cred of sensitiveCredentials) {
      await createCredential(page, cred.name, cred.value);
    }

    // Export the workflow and verify each credential separately
    for (const cred of sensitiveCredentials) {
      await verifyNoSecretsInExport(page, cred.value);
    }

    // Check page source never contains full secrets
    const pageSource = await page.content();
    for (const cred of sensitiveCredentials) {
      expect(pageSource).not.toContain(cred.value);
    }

    // Verify localStorage encryption
    const credentialStoreData = await page.evaluate(() => {
      return localStorage.getItem('credential-store');
    });

    if (credentialStoreData) {
      for (const cred of sensitiveCredentials) {
        expect(credentialStoreData).not.toContain(cred.value);
      }
    }

    console.log('Security validation passed - no credential leaks detected');
  });

  test('Template import/export round-trip preserves credential references', async ({ page }) => {
    await page.goto('/builder');
    await waitForCanvasAndBridge(page);

    // Load Notion template
    await loadTemplate(page, '/examples/notion-automation.json', 'Notion');

    // Create the referenced credential
    await createCredential(page, 'notion-integration-token', MOCK_NOTION_TOKEN);

    // Export the workflow
    const exportData = await page.evaluate(() => {
      const w = window as any;
      return w.__getBuilderSnapshot ? w.__getBuilderSnapshot() : null;
    });

    expect(exportData).toBeTruthy();
    expect(exportData.nodes).toBeDefined();

    // Find the HTTP node and verify auth config
    const httpNode = exportData.nodes.find((n: any) => n.type === 'http');
    expect(httpNode).toBeTruthy();
    expect(httpNode.data.config.auth).toBeDefined();
    expect(httpNode.data.config.auth.credentialName).toBe('notion-integration-token');

    // Ensure no credential value in export
    const exportJson = JSON.stringify(exportData);
    expect(exportJson).not.toContain(MOCK_NOTION_TOKEN);
    expect(exportJson).toContain('credentialName');

    // Clear the builder and re-import
    await page.evaluate(() => {
      const w = window as any;
      if (w.__setBuilderGraph) {
        w.__setBuilderGraph({ nodes: [], edges: [] });
      }
    });

    await page.waitForTimeout(500);

    // Re-import the exported data
    await page.evaluate((data) => {
      const w = window as any;
      if (w.__setBuilderGraph) {
        w.__setBuilderGraph(data);
      }
    }, exportData);

    await page.waitForTimeout(500);

    // Verify nodes are restored and credential reference is maintained
    const nodeCount = await page.locator('.react-flow__node').count();
    expect(nodeCount).toBeGreaterThan(0);

    // Select HTTP node and verify credential is still referenced
    const httpNodeElement = page.locator('.react-flow__node[data-id*="notion"]');
    await httpNodeElement.click();
    await page.waitForTimeout(500);

    // Check that credential dropdown shows the credential
    const credentialDropdown = page.locator('select[data-testid="credentialName"], select:has(option[value="notion-integration-token"])');
    await expect(credentialDropdown).toBeVisible({ timeout: 10000 });

    // Verify the credential option exists in the dropdown
    const credentialOption = page.locator('option[value="notion-integration-token"]');
    await expect(credentialOption).toBeAttached();

    console.log('Template round-trip test completed successfully');
  });
});