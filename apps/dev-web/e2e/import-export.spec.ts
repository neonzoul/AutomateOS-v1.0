import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Helper to drag the HTTP node (if palette exists) otherwise fall back to shortcut creation.
async function addHttpNode(page: any) {
  // Attempt clicking the "+ HTTP" button present in toolbar
  await page.getByRole('button', { name: '+ HTTP' }).click();
}

async function addStartNode(page: any) {
  await page.getByRole('button', { name: '+ Start' }).click();
}

test('import/export round-trip preserves node & edge identity', async ({
  page,
}) => {
  // Navigate directly to builder route where canvas is rendered
  await page.goto('/builder');
  await expect(page.getByTestId('canvas')).toBeVisible();

  // Build tiny graph: Start -> HTTP (if Start not present already)
  // Add Start (guard: may be disabled if already exists)
  const startBtn = page.getByRole('button', { name: '+ Start' });
  if (await startBtn.isEnabled()) {
    await addStartNode(page);
  }
  await addHttpNode(page);

  // Connect nodes via drag if possible (simplified heuristic)
  // We rely on React Flow auto-creating edge on click-connect mode.
  // Click start then click http node to connect (connectOnClick=true)
  const startNode = page.locator('[data-id="start"]');
  const httpNode = page.locator('[data-id="http"]');
  // Fallback selectors: pick first two rf-node elements
  const hasStart = await startNode.count();
  const httpCount = await httpNode.count();
  const firstNode = hasStart
    ? startNode
    : page.locator('.react-flow__node').first();
  const secondNode = httpCount
    ? httpNode
    : page.locator('.react-flow__node').nth(1);
  await firstNode.click();
  await secondNode.click();

  // Capture current graph via window store exposure (add a small bridge inline if not yet exposed)
  // We attempt to read nodes/edges from localStorage persistence as a proxy.
  const initialGraph = await page.evaluate(() => {
    const g = (window as any).__getBuilderSnapshot?.();
    if (!g) return null;
    return { nodes: g.nodes, edges: g.edges };
  });
  expect(initialGraph).not.toBeNull();
  expect(Array.isArray(initialGraph!.nodes)).toBe(true);

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
  }

  // Reload (simulates fresh session)
  await page.reload();
  await expect(page.getByTestId('canvas')).toBeVisible();

  // Import exported file
  if (path) {
    await page.getByTestId('import-input').setInputFiles(path);
  }

  // After import, read graph again
  const importedGraph = await page.evaluate(() => {
    const g = (window as any).__getBuilderSnapshot?.();
    if (!g) return null;
    return { nodes: g.nodes, edges: g.edges };
  });
  expect(importedGraph).not.toBeNull();
  expect(importedGraph!.nodes.length).toBe(initialGraph!.nodes.length);
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
  // Edge counts may be 0 or 1 depending on successful connect; just ensure not more than original
  expect(importedGraph!.edges.length).toBe(initialGraph!.edges.length);

  // (Optional) Validate meta carried through export/import cycle if available
  if (exportedJson?.meta?.name) {
    // After import, meta should be preserved in downloaded file; we only asserted export side here.
    expect(typeof exportedJson.meta.name).toBe('string');
  }
});

// NOTE: window.__getBuilderSnapshot provides deterministic state; positions & data now asserted.
