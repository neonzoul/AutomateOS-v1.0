import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { RunPanel } from './RunPanel';
import { resetBuilderStore, useBuilderStore } from '../../core/state';

// Test environment API base URL resolution (same as runActions.ts)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RunPanel', () => {
  beforeEach(() => {
    resetBuilderStore();
    mockFetch.mockClear();
  });

  it('renders disabled run button when no nodes are present', () => {
    render(<RunPanel />);

    expect(screen.getByLabelText(/Run Panel/i)).toBeInTheDocument();
    const btn = screen.getByTestId('run-button') as HTMLButtonElement;
    const status = screen.getByTestId('run-status');

    expect(btn).toBeInTheDocument();
    expect(btn.disabled).toBe(true);
    expect(status.textContent).toMatch(/No runs yet/i);
  });

  it('enables run button when nodes are present and run is idle', () => {
    // Add a test node
    useBuilderStore.getState().addNode({
      type: 'start',
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    });

    render(<RunPanel />);

    const btn = screen.getByTestId('run-button') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('shows status pill with current run status', () => {
    // Set run status to running
    useBuilderStore.getState().setRunStatus('running', 'test-run-123');

    render(<RunPanel />);

    // Look specifically for the status pill content
    expect(screen.getByText('Running (test-run-123)')).toBeInTheDocument();
  });
  it('displays logs when they exist', () => {
    // Add some logs
    useBuilderStore.getState().appendLog('Test log message 1');
    useBuilderStore.getState().appendLog('Test log message 2');

    render(<RunPanel />);

    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('Test log message 1')).toBeInTheDocument();
    expect(screen.getByText('Test log message 2')).toBeInTheDocument();
  });

  it('disables button during running state', () => {
    // Add a node and set running state
    useBuilderStore.getState().addNode({
      type: 'start',
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    });
    useBuilderStore.getState().setRunStatus('running');

    render(<RunPanel />);

    const btn = screen.getByTestId('run-button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Running...');
  });

  it('calls startRun when run button is clicked', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ runId: 'test-run-123', status: 'queued' }),
    });

    // Add a test node
    useBuilderStore.getState().addNode({
      type: 'start',
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
    });

    render(<RunPanel />);

    const btn = screen.getByTestId('run-button');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE}/v1/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': expect.stringMatching(/^ui_\d+_[a-z0-9]+$/),
        },
        body: expect.stringContaining('"graph"'),
      });
    });
  });

  describe('Status pill mapping', () => {
    it('shows queued status with gray styling', () => {
      useBuilderStore.getState().setRunStatus('queued', 'test-run-123');
      render(<RunPanel />);

      const statusPill = screen.getByText('Queued (test-run-123)');
      expect(statusPill).toHaveClass('text-gray-600', 'bg-gray-50');
    });

    it('shows running status with blue styling and pulse', () => {
      useBuilderStore.getState().setRunStatus('running', 'test-run-456');
      render(<RunPanel />);

      const statusPill = screen.getByText('Running (test-run-456)');
      expect(statusPill).toHaveClass('text-blue-600', 'bg-blue-50');
    });

    it('shows succeeded status with green styling', () => {
      useBuilderStore.getState().setRunStatus('succeeded', 'test-run-789');
      render(<RunPanel />);

      const statusPill = screen.getByText('Succeeded (test-run-789)');
      expect(statusPill).toHaveClass('text-green-600', 'bg-green-50');
    });

    it('shows failed status with red styling', () => {
      useBuilderStore.getState().setRunStatus('failed', 'test-run-999');
      render(<RunPanel />);

      const statusPill = screen.getByText('Failed (test-run-999)');
      expect(statusPill).toHaveClass('text-red-600', 'bg-red-50');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on run panel', () => {
      render(<RunPanel />);

      const panel = screen.getByLabelText('Run Panel');
      expect(panel).toBeInTheDocument();
    });

    it('has descriptive title on run button', () => {
      // When nodes are present
      useBuilderStore.getState().addNode({
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start' },
      });

      render(<RunPanel />);

      const btn = screen.getByTestId('run-button');
      expect(btn).toHaveAttribute('title', 'Start workflow run');
    });

    it('has descriptive title when run button is disabled', () => {
      // No nodes, so button should be disabled
      render(<RunPanel />);

      const btn = screen.getByTestId('run-button') as HTMLButtonElement;
      expect(btn).toHaveAttribute('title', 'Cannot run workflow');
      expect(btn.disabled).toBe(true);
    });
  });

  describe('UX Edge Cases', () => {
    it('shows correct button text during different states', async () => {
      // Initially disabled with no nodes
      const { rerender } = render(<RunPanel />);
      let btn = screen.getByTestId('run-button') as HTMLButtonElement;
      expect(btn.textContent).toBe('Run');
      expect(btn.disabled).toBe(true);

      // Add nodes - button becomes enabled
      act(() => {
        useBuilderStore.getState().addNode({
          type: 'start',
          position: { x: 0, y: 0 },
          data: { label: 'Start' },
        });
      });
      rerender(<RunPanel />);

      expect(btn.textContent).toBe('Run');
      expect(btn.disabled).toBe(false);

      // Set to running state - button shows "Running..." and is disabled
      act(() => {
        useBuilderStore.getState().setRunStatus('running', 'test-run-123');
      });
      rerender(<RunPanel />);

      expect(btn.textContent).toBe('Running...');
      expect(btn.disabled).toBe(true);

      // Set to succeeded - button becomes enabled again
      act(() => {
        useBuilderStore.getState().setRunStatus('succeeded', 'test-run-123');
      });
      rerender(<RunPanel />);

      expect(btn.textContent).toBe('Run');
      expect(btn.disabled).toBe(false);
    });

    it('maintains proper button states during status transitions', async () => {
      // Add nodes first
      act(() => {
        useBuilderStore.getState().addNode({
          type: 'start',
          position: { x: 0, y: 0 },
          data: { label: 'Start' },
        });
      });

      const { rerender } = render(<RunPanel />);
      const btn = screen.getByTestId('run-button') as HTMLButtonElement;

      // Test each status transition
      const statusTests = [
        {
          status: 'queued' as const,
          expectedDisabled: true,
          expectedText: 'Run',
        }, // queued doesn't change button text
        {
          status: 'running' as const,
          expectedDisabled: true,
          expectedText: 'Running...',
        }, // only running changes button text
        {
          status: 'succeeded' as const,
          expectedDisabled: false,
          expectedText: 'Run',
        },
        {
          status: 'failed' as const,
          expectedDisabled: false,
          expectedText: 'Run',
        },
        {
          status: 'idle' as const,
          expectedDisabled: false,
          expectedText: 'Run',
        },
      ];

      for (const { status, expectedDisabled, expectedText } of statusTests) {
        act(() => {
          useBuilderStore.getState().setRunStatus(status, `test-${status}`);
        });
        rerender(<RunPanel />);

        expect(btn.disabled).toBe(expectedDisabled);
        expect(btn.textContent).toBe(expectedText);
      }
    });

    it('handles empty logs vs no logs states correctly', async () => {
      const { rerender } = render(<RunPanel />);

      // Initially no logs - should show "No runs yet"
      expect(screen.getByTestId('run-status')).toHaveTextContent('No runs yet');
      expect(screen.queryByText('Logs')).not.toBeInTheDocument();

      // Add logs - should show logs section
      act(() => {
        useBuilderStore.getState().appendLog('First log entry');
      });
      rerender(<RunPanel />);

      expect(screen.getByText('Logs')).toBeInTheDocument();
      expect(screen.getByText('First log entry')).toBeInTheDocument();
      expect(screen.queryByTestId('run-status')).not.toBeInTheDocument();

      // Clear logs by resetting store
      act(() => {
        resetBuilderStore();
      });
      rerender(<RunPanel />);

      expect(screen.getByTestId('run-status')).toHaveTextContent('No runs yet');
      expect(screen.queryByText('Logs')).not.toBeInTheDocument();
    });

    it('displays status text correctly with and without run IDs', async () => {
      const { rerender } = render(<RunPanel />);

      // Status without run ID
      act(() => {
        useBuilderStore.getState().setRunStatus('running');
      });
      rerender(<RunPanel />);

      expect(screen.getByText('Running')).toBeInTheDocument();

      // Status with run ID
      act(() => {
        useBuilderStore.getState().setRunStatus('running', 'run-456');
      });
      rerender(<RunPanel />);

      expect(screen.getByText('Running (run-456)')).toBeInTheDocument();

      // Back to idle
      act(() => {
        useBuilderStore.getState().setRunStatus('idle');
      });
      rerender(<RunPanel />);

      expect(screen.getByText('Add nodes to run workflow')).toBeInTheDocument();
    });
  });

  describe('Steps and Durations Display', () => {
    it('displays step list with statuses and durations when run is active', () => {
      // Add nodes to the store
      useBuilderStore.getState().addNode({
        id: 'node-1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start Node' },
      });
      useBuilderStore.getState().addNode({
        id: 'node-2',
        type: 'http',
        position: { x: 100, y: 0 },
        data: { label: 'HTTP Request' },
      });

      // Set run status to running with node statuses and durations
      useBuilderStore.getState().setRunStatus('running', 'test-run-123');
      useBuilderStore.getState().setNodeRunStatuses({
        'node-1': 'succeeded',
        'node-2': 'running',
      });
      useBuilderStore.getState().setStepDuration('node-1', 150);
      useBuilderStore.getState().setStepDuration('node-2', 2500);

      render(<RunPanel />);

      // Check that Steps section is displayed
      expect(screen.getByText('Steps')).toBeInTheDocument();
      const stepsContainer = screen.getByTestId('run-steps');
      expect(stepsContainer).toBeInTheDocument();

      // Check individual step displays
      expect(screen.getByText('Start Node')).toBeInTheDocument();
      expect(screen.getByText('HTTP Request')).toBeInTheDocument();

      // Check status pills
      expect(screen.getByText('succeeded')).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();

      // Check durations
      expect(screen.getByText('150ms')).toBeInTheDocument();
      expect(screen.getByText('2.5s')).toBeInTheDocument();
    });

    it('shows step status colors correctly', () => {
      // Add a node
      useBuilderStore.getState().addNode({
        id: 'test-node',
        type: 'http',
        position: { x: 0, y: 0 },
        data: { label: 'Test Node' },
      });

      useBuilderStore.getState().setRunStatus('running', 'test-run');
      useBuilderStore.getState().setNodeRunStatuses({
        'test-node': 'succeeded',
      });

      render(<RunPanel />);

      const statusPill = screen.getByText('succeeded');
      expect(statusPill).toHaveClass('text-green-600', 'bg-green-50');
    });

    it('handles missing step durations gracefully', () => {
      // Add node without duration
      useBuilderStore.getState().addNode({
        id: 'node-1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start Node' },
      });

      useBuilderStore.getState().setRunStatus('running', 'test-run');
      useBuilderStore.getState().setNodeRunStatuses({
        'node-1': 'running',
      });

      render(<RunPanel />);

      // Steps section should be shown since run is active
      expect(screen.getByText('Steps')).toBeInTheDocument();
      // Node should be displayed but without duration
      expect(screen.getByText('Start Node')).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
      // No duration text should be present
      expect(screen.queryByText(/\d+ms$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\d+\.\d+s$/)).not.toBeInTheDocument();
    });

    it('does not show steps section when run is idle', () => {
      // Add nodes but keep run idle
      useBuilderStore.getState().addNode({
        id: 'node-1',
        type: 'start',
        position: { x: 0, y: 0 },
        data: { label: 'Start Node' },
      });

      render(<RunPanel />);

      // Steps section should not be visible
      expect(screen.queryByText('Steps')).not.toBeInTheDocument();
      expect(screen.queryByTestId('run-steps')).not.toBeInTheDocument();
    });

    it('formats durations correctly', () => {
      useBuilderStore.getState().addNode({
        id: 'node-1',
        type: 'http',
        position: { x: 0, y: 0 },
        data: { label: 'HTTP Node' },
      });

      useBuilderStore.getState().setRunStatus('succeeded', 'test-run');
      useBuilderStore.getState().setNodeRunStatuses({
        'node-1': 'succeeded',
      });

      // Test different duration formats
      const { rerender } = render(<RunPanel />);

      // Test milliseconds (< 1000)
      act(() => {
        useBuilderStore.getState().setStepDuration('node-1', 500);
      });
      rerender(<RunPanel />);
      expect(screen.getByText('500ms')).toBeInTheDocument();

      // Test seconds (>= 1000)
      act(() => {
        useBuilderStore.getState().setStepDuration('node-1', 3500);
      });
      rerender(<RunPanel />);
      expect(screen.getByText('3.5s')).toBeInTheDocument();

      // Test whole seconds
      act(() => {
        useBuilderStore.getState().setStepDuration('node-1', 2000);
      });
      rerender(<RunPanel />);
      expect(screen.getByText('2.0s')).toBeInTheDocument();
    });

    it('uses node type as fallback when label is missing', () => {
      useBuilderStore.getState().addNode({
        id: 'node-1',
        type: 'http',
        position: { x: 0, y: 0 },
        data: {}, // No label
      });

      useBuilderStore.getState().setRunStatus('running', 'test-run');
      useBuilderStore.getState().setNodeRunStatuses({
        'node-1': 'running',
      });

      render(<RunPanel />);

      // Should display node type as fallback
      expect(screen.getByText('http')).toBeInTheDocument();
    });
  });
});
