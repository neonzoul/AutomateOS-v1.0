import { describe, it, expect } from 'vitest';
import { NODE_SPECS } from './nodeSpecs';

describe('NODE_SPECS registry', () => {
  it('contains start and http', () => {
    expect(NODE_SPECS.start).toBeDefined();
    expect(NODE_SPECS.http).toBeDefined();
  });

  it('provides defaults for each node', () => {
    expect(NODE_SPECS.start.defaultData).toBeTruthy();
    expect(NODE_SPECS.http.defaultData).toBeTruthy();
  });
});
