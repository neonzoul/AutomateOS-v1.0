import { describe, it, expect } from 'vitest';
import {
  HttpConfigSchema,
  StartConfigSchema,
  WorkflowSchema,
} from '@automateos/workflow-schema';

describe('workflow-schema', () => {
  it('validates HTTP config correctly', () => {
    // Valid HTTP config
    const validConfig = {
      method: 'GET' as const,
      url: 'https://api.example.com',
      headers: { Authorization: 'Bearer token' },
      body: '{"test": true}',
    };

    const result = HttpConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validConfig);
    }
  });

  it('rejects invalid HTTP config', () => {
    // Invalid URL
    const invalidConfig = {
      method: 'GET' as const,
      url: 'not-a-url',
    };

    const result = HttpConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Please enter a valid URL'
      );
    }
  });

  it('validates Start config correctly', () => {
    const validConfig = {};
    const result = StartConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('validates minimal workflow correctly', () => {
    const workflow = {
      nodes: [
        {
          id: 'start-1',
          type: 'start' as const,
          position: { x: 0, y: 0 },
          data: { label: 'Start', config: {} },
        },
        {
          id: 'http-1',
          type: 'http' as const,
          position: { x: 200, y: 0 },
          data: {
            label: 'HTTP',
            config: { method: 'GET' as const, url: 'https://api.example.com' },
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start-1',
          target: 'http-1',
        },
      ],
    };

    const result = WorkflowSchema.safeParse(workflow);
    expect(result.success).toBe(true);
  });

  it('rejects non-enum method', () => {
    const invalidConfig = {
      method: 'INVALID' as any,
      url: 'https://api.example.com',
    };

    const result = HttpConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('accepts headers object', () => {
    const config = {
      method: 'POST' as const,
      url: 'https://api.example.com',
      headers: { 'x-custom': 'value', 'Content-Type': 'application/json' },
    };

    const result = HttpConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headers).toEqual({
        'x-custom': 'value',
        'Content-Type': 'application/json',
      });
    }
  });
});
