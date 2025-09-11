import { describe, it, expect, vi } from 'vitest';
import { startRun, getRun, __setEngineClientForTests } from './runService';
import type { Workflow } from '@automateos/workflow-schema';
import { EngineClient } from '@automateos/sdk-engine/client';

class MockEngine extends EngineClient {
  private call = 0;
  private engineRunId = 'eng_mock';
  private steps = [
    { id: 'start1', status: 'succeeded', durationMs: 5 },
    { id: 'http1', status: 'running' as const },
  ];
  constructor() {
    super('');
  }
  async execute(): Promise<{ engineRunId: string }> {
    return { engineRunId: this.engineRunId };
  }
  async getRun() {
    this.call++;
    if (this.call >= 2) {
      this.steps[1] = {
        id: 'http1',
        status: 'succeeded',
        durationMs: 10,
      } as any;
      return {
        id: this.engineRunId,
        status: 'succeeded',
        steps: this.steps,
        logs: [
          { ts: new Date().toISOString(), level: 'info', msg: 'HTTP 200' },
        ],
      } as any;
    }
    return {
      id: this.engineRunId,
      status: 'running',
      steps: this.steps,
      logs: [],
    } as any;
  }
}

describe('runService integration', () => {
  it('starts and polls run to completion', async () => {
    vi.useFakeTimers();
    const mock = new MockEngine();
    __setEngineClientForTests(mock as any);
    (process as any).env.POLL_INTERVAL_MS = '10';

    const graph: Workflow = {
      nodes: [
        {
          id: 'start1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { label: 'Start' },
        },
        {
          id: 'http1',
          type: 'http',
          position: { x: 10, y: 10 },
          data: {
            label: 'HTTP',
            config: { url: 'https://example.com', method: 'GET' },
          },
        },
      ],
      edges: [{ id: 'e1', source: 'start1', target: 'http1' }],
      meta: { name: 'Test', version: 1 },
      metadata: undefined,
    };
    await startRun('run_1', graph);
    // First poll scheduled
    await vi.advanceTimersByTimeAsync(12);
    // second poll (completion)
    await vi.advanceTimersByTimeAsync(12);

    const rec = getRun('run_1');
    expect(rec?.status).toBe('succeeded');
    expect(rec?.steps.find((s) => s.id === 'http1')?.status).toBe('succeeded');
    expect(rec?.logs.length).toBe(1);
    vi.useRealTimers();
  });
});
