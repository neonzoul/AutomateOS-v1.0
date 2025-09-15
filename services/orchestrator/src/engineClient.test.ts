import { describe, it, expect } from 'vitest';
import { EngineClient } from '@automateos/sdk-engine/client';

function mockFetchSequence(responses: (() => any)[]) {
  let i = 0;
  return async () => {
    const fn = responses[i++] || responses[responses.length - 1];
    return fn();
  };
}

describe('EngineClient retry', () => {
  it('retries transient failures then succeeds', async () => {
    const client = new EngineClient(
      'http://engine',
      mockFetchSequence([
        () => Promise.reject(new Error('Network fail')), // attempt 1
        () => ({
          ok: false,
          status: 502,
          text: async () => 'Bad Gateway',
          json: async () => ({}),
        }), // attempt 2
        () => ({
          ok: true,
          status: 202,
          text: async () => '{"engineRunId": "eng_1"}',
          json: async () => ({ engineRunId: 'eng_1' }),
        }), // attempt 3
      ]) as any,
      { maxRetries: 3, baseDelayMs: 1 }
    );

    const res = await client.execute({ runId: 'r1', dag: { nodes: [] } });
    expect(res.engineRunId).toBe('eng_1');
  });
});
