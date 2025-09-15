import { test, expect } from '@playwright/test';
import * as fs from 'fs';

/**
 * E2E Test: Import/Export Round-Trip Verification
 *
 * This test implements Task 9 from Sprint 3 - validates that the import/export
 * functionality preserves workflow integrity through a complete round-trip:
 *
 * 1. Build a small graph (Start + HTTP nodes)
 * 2. Export to JSON file
 * 3. Reload page (simulate fresh session)
 * 4. Import the exported file
 * 5. Verify all node IDs, positions, and data are preserved
 *
 * The test uses Playwright's download interception to capture the exported file
 * and feed it back into the import mechanism, proving the JSON serialization
 * and validation pipeline works correctly.
 */

// Helper to drag the HTTP node (if palette exists) otherwise fall back to shortcut creation.
async function addHttpNode(page: any) {
  // Attempt clicking the "+ HTTP" button present in toolbar
  await page.getByText('+ HTTP').click();
}

async function addStartNode(page: any) {
  await page.getByText('+ Start').click();
}

test('import/export round-trip preserves node & edge identity', async ({
  page,
}) => {
  // Navigate directly to builder route where canvas is rendered
  await page.goto('/builder');

  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('canvas')).toBeVisible();

  // Wait for the toolbar to be visible and buttons to be loaded
  await page.waitForSelector('[data-testid="export-btn"]', { timeout: 10000 });

  // Build tiny graph: Start -> HTTP (if Start not present already)
  // Add Start (guard: may be disabled if already exists)
  const startBtn = page.getByText('+ Start');
  await startBtn.waitFor({ timeout: 10000 });

  if (await startBtn.isEnabled()) {
    await addStartNode(page);
  }
  await addHttpNode(page);

  // Wait for nodes to be added to the canvas
  await page.waitForSelector('.react-flow__node', { timeout: 5000 });

  // Connect nodes via drag if possible (simplified heuristic)
  // We rely on React Flow auto-creating edge on click-connect mode.
  // Click start then click http node to connect (connectOnClick=true)
  const startNode = page.locator('[data-id*="start"]').first();
  const httpNode = page.locator('[data-id*="http"]').first();
  // Fallback selectors: pick first two rf-node elements
  const hasStart = await startNode.count();
  const httpCount = await httpNode.count();
  const firstNode =
    hasStart > 0 ? startNode : page.locator('.react-flow__node').first();
  const secondNode =
    httpCount > 0 ? httpNode : page.locator('.react-flow__node').nth(1);

  // Ensure both nodes are visible before clicking
  await firstNode.waitFor({ timeout: 5000 });
  await secondNode.waitFor({ timeout: 5000 });

  // Try to connect by clicking first node, then second (connectOnClick mode)
  await firstNode.click();
  await page.waitForTimeout(500); // Small delay for connection mode
  await secondNode.click();
  await page.waitForTimeout(500); // Allow edge creation to process

  // Capture current graph via window store exposure (add a small bridge inline if not yet exposed)
  // We attempt to read nodes/edges from localStorage persistence as a proxy.
  const initialGraph = await page.evaluate(() => {
    const g = (window as any).__getBuilderSnapshot?.();
    if (!g) return null;
    return { nodes: g.nodes, edges: g.edges };
  });
  expect(initialGraph).not.toBeNull();
  expect(Array.isArray(initialGraph!.nodes)).toBe(true);
  expect(initialGraph!.nodes.length).toBeGreaterThan(0); // Ensure we have nodes

  console.log('[e2e] Initial graph state:', {
    nodeCount: initialGraph!.nodes.length,
    edgeCount: initialGraph!.edges.length,
  });

  // Export graph
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-btn').click(),
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();

  // Read exported JSON (Chromium/Webkit expose path; Firefox may return null)
  let exportedJson: any = null;
  if (path && fs.existsSync(path)) {
    try {
      const raw = fs.readFileSync(path, 'utf-8');
      exportedJson = JSON.parse(raw);
      // Basic structural assertions
      expect(Array.isArray(exportedJson.nodes)).toBe(true);
      expect(exportedJson.meta?.version).toBe(1);
      // Log for demonstration (will appear in Playwright stdout)
      // Only log subset to keep output concise.
      // eslint-disable-next-line no-console
      console.log('[e2e] Exported workflow summary:', {
        nodeCount: exportedJson.nodes.length,
        edgeCount: exportedJson.edges.length,
        meta: exportedJson.meta,
      });
    } catch (err) {
      throw new Error(
        'Failed to parse exported workflow JSON: ' + (err as Error).message
      );
    }
  } else {
    // Fallback for browsers that don't provide download path
    // We'll simulate the export by reading from the store again
    const currentGraph = await page.evaluate(() => {
      const g = (window as any).__getBuilderSnapshot?.();
      return g ? { nodes: g.nodes, edges: g.edges } : null;
    });
    expect(currentGraph).not.toBeNull();
    exportedJson = {
      nodes: currentGraph!.nodes,
      edges: currentGraph!.edges,
      meta: {
        name: 'Workflow',
        version: 1,
        exportedAt: new Date().toISOString(),
      },
      metadata: {},
    };
    console.log(
      '[e2e] Using fallback graph for browsers without download path'
    );
  }

  // Reload (simulates fresh session)
  await page.reload();
  await expect(page.getByTestId('canvas')).toBeVisible();

  // Wait for page to fully load after reload
  await page.waitForLoadState('networkidle');

  // Import exported file - note: input is hidden, so we don't wait for visibility
  const importInput = page.getByTestId('import-input');
  if (path && fs.existsSync(path)) {
    // Use the actual downloaded file if available
    await importInput.setInputFiles(path);
  } else {
    // Fallback: create a temporary file with the exported JSON
    const tempFilePath = './temp-export.json';
    fs.writeFileSync(tempFilePath, JSON.stringify(exportedJson, null, 2));
    try {
      await importInput.setInputFiles(tempFilePath);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  // Wait for import to complete - look for a success notification or state change
  await page.waitForTimeout(1000); // Allow time for import processing

  // After import, read graph again
  const importedGraph = await page.evaluate(() => {
    const g = (window as any).__getBuilderSnapshot?.();
    if (!g) return null;
    return { nodes: g.nodes, edges: g.edges };
  });
  expect(importedGraph).not.toBeNull();
  expect(importedGraph!.nodes.length).toBe(initialGraph!.nodes.length);

  console.log('[e2e] Imported graph state:', {
    nodeCount: importedGraph!.nodes.length,
    edgeCount: importedGraph!.edges.length,
  });

  // Node IDs equality (order-insensitive)
  const origNodeIds = [...initialGraph!.nodes.map((n: any) => n.id)].sort();
  const newNodeIds = [...importedGraph!.nodes.map((n: any) => n.id)].sort();
  expect(newNodeIds).toEqual(origNodeIds);

  // Position & data equality (by id)
  const posMap: Record<string, any> = {};
  for (const n of initialGraph!.nodes as any[]) posMap[n.id] = n;
  for (const n of importedGraph!.nodes as any[]) {
    const orig = posMap[n.id];
    expect(orig).toBeTruthy();
    expect(n.position).toEqual(orig.position);
    // Data object structural equality (shallow) if present
    if (orig.data || n.data) {
      expect(n.data).toEqual(orig.data);
    }
  }

  // Edge counts should match exactly
  expect(importedGraph!.edges.length).toBe(initialGraph!.edges.length);

  // If we have edges, verify their integrity too
  if (initialGraph!.edges.length > 0) {
    const origEdgeIds = [...initialGraph!.edges.map((e: any) => e.id)].sort();
    const newEdgeIds = [...importedGraph!.edges.map((e: any) => e.id)].sort();
    expect(newEdgeIds).toEqual(origEdgeIds);
  }

  // (Optional) Validate meta carried through export/import cycle if available
  if (exportedJson?.meta?.name) {
    // After import, meta should be preserved in downloaded file; we only asserted export side here.
    expect(typeof exportedJson.meta.name).toBe('string');
  }

  console.log('[e2e] ✅ Round-trip test completed successfully!');
});
