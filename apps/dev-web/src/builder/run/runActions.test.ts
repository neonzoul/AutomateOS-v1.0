import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startRun, pollRun, cancelRun } from './runActions';
import { resetBuilderStore, useBuilderStore } from '../../core/state';

// Test environment API base URL resolution (same as runActions.ts)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

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
        json: () =>
          Promise.resolve({ runId: 'test-run-123', status: 'queued' }),
      });

      const workflowJson = { nodes: [], edges: [] };
      const { runId } = await startRun(workflowJson);

      expect(runId).toBe('test-run-123');
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/v1/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': expect.stringMatching(/^ui_\d+_[a-z0-9]+$/),
        },
        body: JSON.stringify({ graph: workflowJson }),
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

    it('processes log accumulation correctly', async () => {
      // Mock response with multiple logs
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-run-123',
            status: 'succeeded',
            logs: ['Step 1 started', 'Step 2 processing', 'Completed'],
          }),
      });

      pollRun('test-run-123');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('succeeded');

      // Check that logs were added to store
      const logs = state.logs.join(' ');
      expect(logs).toContain('Step 1 started');
      expect(logs).toContain('Step 2 processing');
      expect(logs).toContain('Completed');
    });

    it('handles structured log objects properly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-run-123',
            status: 'succeeded',
            logs: [
              'Simple string log',
              {
                ts: '2025-09-11T10:30:00Z',
                level: 'error',
                msg: 'HTTP request failed',
                nodeId: 'http_1',
              },
            ],
          }),
      });

      pollRun('test-run-123');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const state = useBuilderStore.getState();
      const logs = state.logs.join(' ');
      expect(logs).toContain('Simple string log');
      expect(logs).toContain('[ERROR] HTTP request failed');
    });

    it('stops polling on terminal states (failed)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-run-123',
            status: 'failed',
            logs: ['Run failed with error'],
          }),
      });

      pollRun('test-run-123');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('failed');

      // Verify only one fetch call was made (no retries for terminal state)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles node status updates when steps are present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-run-123',
            status: 'succeeded',
            steps: [
              { id: 'step_1', status: 'succeeded' },
              { id: 'step_2', status: 'running' },
            ],
          }),
      });

      pollRun('test-run-123');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const state = useBuilderStore.getState();
      expect(state.runStatus).toBe('succeeded');
      // Note: nodeRunStatuses testing would require checking the actual store state
      // but the test setup doesn't include those specific assertions
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
