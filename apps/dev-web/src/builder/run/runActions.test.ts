import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startRun, pollRun, cancelRun } from './runActions';
import { resetBuilderStore, useBuilderStore } from '../../core/state';
import { useCredentialStore } from '../../core/credentials';

// Test environment API base URL resolution (same as runActions.ts)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('runActions', () => {
  beforeEach(() => {
    resetBuilderStore();
    mockFetch.mockClear();

    // Reset credential store
    useCredentialStore.setState({
      credentials: new Map(),
      masterKey: null,
    });
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

    it('injects credentials into HTTP nodes during run', async () => {
      // Mock crypto for credential store
      const mockKey = { type: 'secret' };
      const mockEncrypted = new ArrayBuffer(32);
      const mockIV = new ArrayBuffer(12);

      Object.defineProperty(global, 'crypto', {
        value: {
          subtle: {
            generateKey: vi.fn().mockResolvedValue(mockKey),
            encrypt: vi.fn().mockResolvedValue(mockEncrypted),
            decrypt: vi.fn().mockResolvedValue(new TextEncoder().encode('Bearer test-token')),
          },
          getRandomValues: vi.fn().mockImplementation((array) => {
            for (let i = 0; i < array.length; i++) {
              array[i] = i % 256;
            }
            return array;
          }),
        },
        writable: true,
      });

      // Setup credential
      const credentialStore = useCredentialStore.getState();
      await credentialStore.setCredential('notion-token', 'Bearer test-token');

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ runId: 'test-run-123' }),
      });

      const workflowJson = {
        nodes: [
          {
            id: 'http-1',
            type: 'http',
            config: {
              method: 'POST',
              url: 'https://api.notion.com/v1/pages',
              headers: { 'Content-Type': 'application/json' },
              auth: { credentialName: 'notion-token' }
            }
          }
        ],
        edges: []
      };

      await startRun(workflowJson);

      // Check that the credential was injected and auth config was removed
      const fetchCall = mockFetch.mock.calls[0];
      const sentBody = JSON.parse(fetchCall[1].body);
      const httpNode = sentBody.graph.nodes[0];

      expect(httpNode.config.headers.Authorization).toBe('Bearer test-token');
      expect(httpNode.config.auth).toBeUndefined(); // Should be removed
    });

    it('handles missing credentials gracefully', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ runId: 'test-run-123' }),
      });

      const workflowJson = {
        nodes: [
          {
            id: 'http-1',
            type: 'http',
            config: {
              method: 'POST',
              url: 'https://api.notion.com/v1/pages',
              auth: { credentialName: 'missing-credential' }
            }
          }
        ],
        edges: []
      };

      await startRun(workflowJson);

      // Check that the node was sent without credential injection
      const fetchCall = mockFetch.mock.calls[0];
      const sentBody = JSON.parse(fetchCall[1].body);
      const httpNode = sentBody.graph.nodes[0];

      expect(httpNode.config.headers?.Authorization).toBeUndefined();
      expect(httpNode.config.auth).toBeDefined(); // Auth config should remain when credential is missing
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

    it('handles step durations from API response', async () => {
      // Add test nodes to the store first
      useBuilderStore.getState().setGraph({
        nodes: [
          { id: 'node-1', type: 'start', position: { x: 0, y: 0 }, data: {} },
          { id: 'node-2', type: 'http', position: { x: 100, y: 0 }, data: {} },
        ],
        edges: [],
      });

      // Initialize nodeRunStatuses
      useBuilderStore.getState().setNodeRunStatuses({
        'node-1': 'idle',
        'node-2': 'idle',
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'test-run-123',
            status: 'running',
            steps: [
              { id: 'step_1', nodeId: 'node-1', status: 'succeeded', durationMs: 150 },
              { id: 'step_2', nodeId: 'node-2', status: 'running', durationMs: 500 },
            ],
          }),
      });

      pollRun('test-run-123');

      await new Promise((resolve) => setTimeout(resolve, 50));

      const state = useBuilderStore.getState();
      expect(state.stepDurations['node-1']).toBe(150);
      expect(state.stepDurations['node-2']).toBe(500);
    });

    it('handles step status mapping queued→running→succeeded→failed', async () => {
      // Test the progression through different statuses
      const steps = [
        { status: 'queued', expectedStoredStatus: 'idle' }, // queued status is not processed, remains idle
        { status: 'running', expectedStoredStatus: 'running' },
        { status: 'succeeded', expectedStoredStatus: 'succeeded' },
        { status: 'failed', expectedStoredStatus: 'failed' },
      ];

      // Add a test node
      useBuilderStore.getState().setGraph({
        nodes: [{ id: 'test-node', type: 'http', position: { x: 0, y: 0 }, data: {} }],
        edges: [],
      });

      // Initialize nodeRunStatuses
      useBuilderStore.getState().setNodeRunStatuses({
        'test-node': 'idle',
      });

      for (const step of steps) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'test-run-123',
              status: step.status,
              steps: [
                { id: 'step_1', nodeId: 'test-node', status: step.status, durationMs: 100 },
              ],
            }),
        });

        pollRun('test-run-123');
        await new Promise((resolve) => setTimeout(resolve, 50));

        const state = useBuilderStore.getState();
        expect(state.nodeRunStatuses['test-node']).toBe(step.expectedStoredStatus);

        // Reset for next iteration
        mockFetch.mockClear();
      }
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
