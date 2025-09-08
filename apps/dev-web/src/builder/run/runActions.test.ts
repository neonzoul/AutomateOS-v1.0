import { describe, it, expect } from 'vitest';
import { startRun, pollRun, cancelRun } from './runActions';

// Simple smoke tests to satisfy DoD (compile & basic behavior)
describe('runActions stubs', () => {
  it('startRun returns a runId', async () => {
    const { runId } = await startRun();
    expect(runId).toMatch(/stub-run-/);
  });
  it('pollRun resolves to succeeded (stub)', async () => {
    const status = await pollRun('any');
    expect(status).toBe('succeeded');
  });
  it('cancelRun resolves', async () => {
    await expect(cancelRun('any')).resolves.toBeUndefined();
  });
});
