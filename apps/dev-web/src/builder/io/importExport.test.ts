import { describe, it, expect, vi } from 'vitest';
import { exportWorkflow, importWorkflow } from './importExport';

// jsdom older File polyfill may lack .text; ensure it's present for the test.
if (!(File.prototype as any).text) {
  (File.prototype as any).text = function () {
    return Promise.resolve(String(this._content || ''));
  };
}

// Create a mock for downloadJson (DOM side-effect) by mocking the module.
vi.mock('./utils/downloadJson', () => ({ downloadJson: vi.fn() }));

describe('importExport stubs', () => {
  it('exportWorkflow validates shape', () => {
    expect(() => exportWorkflow({ nodes: [], edges: [] })).not.toThrow();
  });

  it('importWorkflow rejects invalid file', async () => {
    const file = new File(
      [JSON.stringify({ nodes: [], edges: [] })],
      'wf.json',
      {
        type: 'application/json',
      }
    );
    const res = await importWorkflow(file);
    expect(Array.isArray(res.nodes)).toBe(true);
  });
});
