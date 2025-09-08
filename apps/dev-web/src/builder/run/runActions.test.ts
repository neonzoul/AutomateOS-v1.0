import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startRun, pollRun, cancelRun } from './runActions';
import { resetBuilderStore, useBuilderStore } from '../../core/state';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('runActions', () => {
  beforeEach(() => {
    resetBuilderStore();
    mockFetch.mockClear();
  });

  describe('startRun', () => {
    it('starts a run and returns runId', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'test-run-123', status: 'queued' }),
      });

      const workflowJson = { nodes: [], edges: [] };
      const { runId } = await startRun(workflowJson);

      expect(runId).toBe('test-run-123');
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowJson),
      });

      // Store state should be updated
      const state = useBuilderStore.getState();
      expect(state.currentRunId).toBe('test-run-123');
      expect(state.logs.length).toBeGreaterThan(0);
    });

    it('handles API errors gracefully', async () => {
      // Mock failed API response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const workflowJson = { nodes: [], edges: [] };

      await expect(startRun(workflowJson)).rejects.toThrow(
        'Failed to start run: 500 Internal Server Error'
      );

      // Check store state
      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('failed');
    });
  });

  describe('pollRun', () => {
    it('handles single poll response', async () => {
      // Mock successful poll response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-run-123',
            status: 'succeeded',
            logs: ['Run completed'],
          }),
      });

      // Start the polling function
      const pollPromise = pollRun('test-run-123');

      // Give a small delay for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check store state was updated
      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('succeeded');
    });

    it('handles polling errors', async () => {
      // Mock failed polling response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await pollRun('test-run-123');

      // Check store state
      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('failed');
    });
  });

  describe('cancelRun', () => {
    it('cancels a run and updates state', async () => {
      await cancelRun('test-run-123');

      // Check store state
      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('failed');
      expect(state.logs.some((log) => log.includes('cancelled'))).toBe(true);
    });
  });
});
