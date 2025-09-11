import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore, resetBuilderStore } from './state';

// Helper to get snapshot
const snap = () => useBuilderStore.getState();

describe('Run slice (nodeRunStatuses)', () => {
  beforeEach(() => {
    resetBuilderStore();
  });

  it('initializes empty', () => {
    expect(snap().nodeRunStatuses).toEqual({});
    expect(snap().runStatus).toBe('idle');
  });

  it('can set initial node statuses map', () => {
    snap().setNodeRunStatuses({ a: 'running', b: 'idle' });
    expect(snap().nodeRunStatuses).toEqual({ a: 'running', b: 'idle' });
  });

  it('updates a single node status', () => {
    snap().setNodeRunStatuses({ a: 'running', b: 'idle' });
    snap().updateNodeRunStatus('b', 'succeeded');
    expect(snap().nodeRunStatuses).toEqual({ a: 'running', b: 'succeeded' });
  });

  it('resetRun clears statuses & logs & run metadata', () => {
    snap().setNodeRunStatuses({ a: 'succeeded' });
    snap().appendLog('hello');
    snap().setRunStatus('running', 'run_1');
    snap().resetRun();
    expect(snap().nodeRunStatuses).toEqual({});
    expect(snap().logs).toEqual([]);
    expect(snap().currentRunId).toBeNull();
    expect(snap().runStatus).toBe('idle');
  });

  it('setRunStatus updates runStatus and optionally runId', () => {
    snap().setRunStatus('queued', 'run_123');
    expect(snap().runStatus).toBe('queued');
    expect(snap().currentRunId).toBe('run_123');
    // update status without changing runId
    snap().setRunStatus('running');
    expect(snap().currentRunId).toBe('run_123');
    expect(snap().runStatus).toBe('running');
  });
});
