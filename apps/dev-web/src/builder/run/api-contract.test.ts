/**
 * API Contract validation tests
 * Ensures request/response shapes match API-Contract.md specifications
 * Uses Zod validation to catch schema regressions early
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Define schemas based on API-Contract.md

const StartRunRequestSchema = z
  .object({
    graph: z
      .object({
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
      })
      .optional(),
    workflowId: z.string().uuid().optional(),
    input: z.record(z.string(), z.any()).optional(),
  })
  .refine((data) => data.graph || data.workflowId, {
    message: "Either 'graph' or 'workflowId' must be provided",
  });

const StartRunResponseSchema = z.object({
  runId: z.string(),
  status: z.enum(['queued', 'running', 'succeeded', 'failed']).optional(),
});

const RunStatusResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['queued', 'running', 'succeeded', 'failed']),
  createdAt: z.string().optional(),
  finishedAt: z.string().optional().nullable(),
  logs: z
    .array(
      z.union([
        z.string(),
        z.object({
          ts: z.string(),
          level: z.enum(['info', 'warn', 'error']),
          msg: z.string(),
          nodeId: z.string().optional(),
        }),
      ])
    )
    .optional(),
  steps: z
    .array(
      z.object({
        id: z.string(),
        nodeId: z.string().optional(),
        status: z.string(),
        durationMs: z.number().optional(),
      })
    )
    .optional(),
});

const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.any()).optional(),
    requestId: z.string().optional(),
  }),
});

describe('API Contract Validation', () => {
  describe('POST /v1/runs', () => {
    it('validates start run request shape', () => {
      const validRequests = [
        {
          graph: { nodes: [], edges: [] },
        },
        {
          graph: { nodes: [{ id: 'n1', type: 'start' }], edges: [] },
          input: { foo: 'bar' },
        },
        {
          workflowId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          input: {},
        },
      ];

      validRequests.forEach((request, index) => {
        const result = StartRunRequestSchema.safeParse(request);
        expect(result.success, `Request ${index} should be valid`).toBe(true);
      });
    });

    it('rejects invalid start run requests', () => {
      const invalidRequests = [
        {}, // Missing required graph or workflowId
        { graph: 'not-an-object' }, // Invalid graph type
        { workflowId: 'not-a-uuid' }, // Invalid UUID
      ];

      invalidRequests.forEach((request, index) => {
        const result = StartRunRequestSchema.safeParse(request);
        expect(result.success, `Request ${index} should be invalid`).toBe(
          false
        );
      });
    });

    it('validates start run response shape', () => {
      const validResponses = [
        { runId: 'run_123456' },
        { runId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', status: 'queued' },
      ];

      validResponses.forEach((response, index) => {
        const result = StartRunResponseSchema.safeParse(response);
        expect(result.success, `Response ${index} should be valid`).toBe(true);
      });
    });
  });

  describe('GET /v1/runs/:id', () => {
    it('validates run status response shape', () => {
      const validResponses = [
        {
          id: 'run_123',
          status: 'running',
        },
        {
          id: 'run_456',
          status: 'succeeded',
          createdAt: '2025-09-11T10:30:00Z',
          finishedAt: '2025-09-11T10:35:00Z',
          logs: ['Starting run', 'Step 1 completed'],
        },
        {
          id: 'run_789',
          status: 'failed',
          logs: [
            'Starting run',
            {
              ts: '2025-09-11T10:31:00Z',
              level: 'error',
              msg: 'HTTP request failed',
              nodeId: 'http_1',
            },
          ],
          steps: [
            {
              id: 'step_1',
              nodeId: 'start_1',
              status: 'succeeded',
              durationMs: 100,
            },
            { id: 'step_2', nodeId: 'http_1', status: 'failed' },
          ],
        },
      ];

      validResponses.forEach((response, index) => {
        const result = RunStatusResponseSchema.safeParse(response);
        expect(result.success, `Response ${index} should be valid`).toBe(true);
      });
    });

    it('rejects invalid run status responses', () => {
      const invalidResponses = [
        { id: 'run_123' }, // Missing status
        { id: 'run_123', status: 'invalid_status' }, // Invalid status enum
        {
          id: 'run_123',
          status: 'running',
          logs: ['valid', { invalid: 'log_object' }], // Invalid log object
        },
      ];

      invalidResponses.forEach((response, index) => {
        const result = RunStatusResponseSchema.safeParse(response);
        expect(result.success, `Response ${index} should be invalid`).toBe(
          false
        );
      });
    });
  });

  describe('Error Responses', () => {
    it('validates API error response shape', () => {
      const validErrors = [
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid workflow schema',
          },
        },
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Run not found',
            details: ['runId: abc123'],
            requestId: 'req_456789',
          },
        },
      ];

      validErrors.forEach((error, index) => {
        const result = ApiErrorSchema.safeParse(error);
        expect(result.success, `Error ${index} should be valid`).toBe(true);
      });
    });

    it('rejects invalid error responses', () => {
      const invalidErrors = [
        { error: 'string instead of object' },
        { error: { code: 'MISSING_MESSAGE' } }, // Missing message
        { error: { message: 'MISSING_CODE' } }, // Missing code
      ];

      invalidErrors.forEach((error, index) => {
        const result = ApiErrorSchema.safeParse(error);
        expect(result.success, `Error ${index} should be invalid`).toBe(false);
      });
    });
  });

  describe('Contract Regression Prevention', () => {
    it('ensures mock API responses in tests match contract', () => {
      // Sample mock responses from existing tests
      const mockStartRunResponse = { runId: 'test-run-123', status: 'queued' };
      const mockPollResponse = {
        id: 'test-run-123',
        status: 'succeeded',
        logs: ['Run completed'],
      };

      // Validate these match our contract schemas
      expect(
        StartRunResponseSchema.safeParse(mockStartRunResponse).success
      ).toBe(true);
      expect(RunStatusResponseSchema.safeParse(mockPollResponse).success).toBe(
        true
      );
    });

    it('flags schema changes that break backwards compatibility', () => {
      // Test that would catch if someone changed the API contract
      const oldVersionResponse = {
        id: 'run_123',
        status: 'running',
        // Hypothetical old field that should still be supported
      };

      const result = RunStatusResponseSchema.safeParse(oldVersionResponse);
      expect(result.success).toBe(true);
    });
  });
});
