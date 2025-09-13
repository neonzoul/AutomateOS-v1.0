import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { RunPanel } from './RunPanel';
import { resetBuilderStore, useBuilderStore } from '../../core/state';

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
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/v1/runs', {
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
    it('shows queued status with blue styling', () => {
      useBuilderStore.getState().setRunStatus('queued', 'test-run-123');
      render(<RunPanel />);

      const statusPill = screen.getByText('Queued (test-run-123)');
      expect(statusPill).toHaveClass('text-yellow-600', 'bg-yellow-50');
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
});
