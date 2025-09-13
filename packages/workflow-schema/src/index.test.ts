/**
 * Workflow Schema validation tests
 * Ensures our Zod schemas correctly validate workflow structures
 */

import { describe, it, expect } from 'vitest';
import {
  WorkflowSchema,
  StartNodeSchema,
  HttpNodeSchema,
  HttpConfigSchema,
  StartConfigSchema,
  EdgeSchema,
} from './index.js';

describe('Node Config Schemas', () => {
  describe('StartConfigSchema', () => {
    it('accepts empty object', () => {
      const result = StartConfigSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects non-empty objects', () => {
      const result = StartConfigSchema.safeParse({ extra: 'field' });
      expect(result.success).toBe(false);
    });
  });

  describe('HttpConfigSchema', () => {
    it('accepts valid HTTP config', () => {
      const config = {
        method: 'POST' as const,
        url: 'https://api.example.com/webhook',
        headers: { 'Content-Type': 'application/json' },
        body: '{"message": "test"}',
      };

      const result = HttpConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      expect(result.data?.method).toBe('POST');
    });

    it('defaults method to GET', () => {
      const config = {
        url: 'https://api.example.com/endpoint',
      };

      const result = HttpConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
      expect(result.data?.method).toBe('GET');
    });

    it('rejects invalid URLs', () => {
      const config = {
        method: 'POST' as const,
        url: 'not-a-valid-url',
      };

      const result = HttpConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('rejects invalid HTTP methods', () => {
      const config = {
        method: 'INVALID' as any,
        url: 'https://api.example.com',
      };

      const result = HttpConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });
});

describe('Node Schemas', () => {
  describe('StartNodeSchema', () => {
    it('validates valid start node', () => {
      const node = {
        id: 'start-1',
        type: 'start' as const,
        position: { x: 100, y: 100 },
        data: { config: {} },
      };

      const result = StartNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('rejects wrong type', () => {
      const node = {
        id: 'start-1',
        type: 'http' as const,
        position: { x: 100, y: 100 },
        data: { config: {} },
      };

      const result = StartNodeSchema.safeParse(node);
      expect(result.success).toBe(false);
    });
  });

  describe('HttpNodeSchema', () => {
    it('validates valid HTTP node', () => {
      const node = {
        id: 'http-1',
        type: 'http' as const,
        position: { x: 300, y: 100 },
        data: {
          config: {
            method: 'POST' as const,
            url: 'https://discord.com/api/webhooks/123/456',
            headers: { 'Content-Type': 'application/json' },
            body: '{"content": "Hello World"}',
          },
        },
      };

      const result = HttpNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });
});

describe('EdgeSchema', () => {
  it('validates valid edge', () => {
    const edge = {
      id: 'edge-1',
      source: 'start-1',
      target: 'http-1',
    };

    const result = EdgeSchema.safeParse(edge);
    expect(result.success).toBe(true);
  });

  it('requires id, source, and target', () => {
    const invalidEdges = [
      { id: 'edge-1', source: 'start-1' }, // missing target
      { id: 'edge-1', target: 'http-1' }, // missing source
      { source: 'start-1', target: 'http-1' }, // missing id
    ];

    invalidEdges.forEach((edge) => {
      const result = EdgeSchema.safeParse(edge);
      expect(result.success).toBe(false);
    });
  });
});

describe('WorkflowSchema', () => {
  it('validates complete workflow', () => {
    const workflow = {
      nodes: [
        {
          id: 'start-1',
          type: 'start' as const,
          position: { x: 100, y: 100 },
          data: { config: {} },
        },
        {
          id: 'http-1',
          type: 'http' as const,
          position: { x: 300, y: 100 },
          data: {
            config: {
              method: 'POST' as const,
              url: 'https://api.example.com/webhook',
              headers: { 'Content-Type': 'application/json' },
              body: '{"message": "test"}',
            },
          },
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'start-1',
          target: 'http-1',
        },
      ],
    };

    const result = WorkflowSchema.safeParse(workflow);
    expect(result.success).toBe(true);
  });

  it('validates workflow with metadata', () => {
    const workflow = {
      nodes: [
        {
          id: 'start-1',
          type: 'start' as const,
          position: { x: 100, y: 100 },
          data: { config: {} },
        },
      ],
      edges: [],
      meta: {
        name: 'Test Workflow',
        version: 1 as const,
      },
      metadata: {
        description: 'A test workflow',
        createdAt: '2025-09-13T10:30:00.000Z',
      },
    };

    const result = WorkflowSchema.safeParse(workflow);
    expect(result.success).toBe(true);
  });

  it('accepts workflow with no start nodes (schema validation only)', () => {
    // Note: Business logic validation (requiring start nodes) happens elsewhere
    const workflow = {
      nodes: [
        {
          id: 'http-1',
          type: 'http' as const,
          position: { x: 300, y: 100 },
          data: {
            config: {
              url: 'https://api.example.com',
            },
          },
        },
      ],
      edges: [],
    };

    const result = WorkflowSchema.safeParse(workflow);
    expect(result.success).toBe(true);
  });

  it('accepts multiple start nodes (schema validation only)', () => {
    // Note: Business logic validation (single start node) happens elsewhere
    const workflow = {
      nodes: [
        {
          id: 'start-1',
          type: 'start' as const,
          position: { x: 100, y: 100 },
          data: { config: {} },
        },
        {
          id: 'start-2',
          type: 'start' as const,
          position: { x: 100, y: 200 },
          data: { config: {} },
        },
      ],
      edges: [],
    };

    const result = WorkflowSchema.safeParse(workflow);
    expect(result.success).toBe(true);
  });

  it('accepts edges with non-existent node references (schema validation only)', () => {
    // Note: Business logic validation (edge connectivity) happens elsewhere
    const workflow = {
      nodes: [
        {
          id: 'start-1',
          type: 'start' as const,
          position: { x: 100, y: 100 },
          data: { config: {} },
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'start-1',
          target: 'non-existent-node',
        },
      ],
    };

    const result = WorkflowSchema.safeParse(workflow);
    expect(result.success).toBe(true);
  });
});
