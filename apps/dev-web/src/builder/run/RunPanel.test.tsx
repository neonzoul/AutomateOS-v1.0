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
        },
        body: expect.stringContaining('"graph"'),
      });
    });
  });
});
