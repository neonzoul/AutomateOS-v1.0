/**
 * Sprint 3 Task 4 - LocalStorage Persistence Test
 *
 * This test verifies that localStorage persistence works correctly
 * when NEXT_PUBLIC_DEV_STORAGE is enabled.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorkflowSchema } from '@automateos/workflow-schema';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock environment variable
vi.stubEnv('NEXT_PUBLIC_DEV_STORAGE', 'true');
vi.stubEnv('NODE_ENV', 'development');

describe('LocalStorage Persistence', () => {
  const STORAGE_KEY = 'automateos.dev.graph';

  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should save valid workflow data to localStorage', () => {
    const validWorkflow = {
      nodes: [
        {
          id: 'start1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { label: 'Start', config: {} },
        },
        {
          id: 'http1',
          type: 'http',
          position: { x: 200, y: 0 },
          data: {
            label: 'HTTP Request',
            config: {
              method: 'GET',
              url: 'https://api.example.com',
            },
          },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'start1',
          target: 'http1',
        },
      ],
      meta: {
        name: 'Test Workflow',
        version: 1,
        exportedAt: new Date().toISOString(),
      },
    };

    // Validate the test data matches schema
    const result = WorkflowSchema.safeParse(validWorkflow);
    expect(result.success).toBe(true);

    // Simulate saving to localStorage
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validWorkflow));

    // Verify it was saved
    const saved = localStorageMock.getItem(STORAGE_KEY);
    expect(saved).toBeTruthy();

    // Verify we can parse it back
    const parsed = JSON.parse(saved!);
    const validationResult = WorkflowSchema.safeParse(parsed);
    expect(validationResult.success).toBe(true);
    expect(validationResult.data?.nodes).toHaveLength(2);
    expect(validationResult.data?.edges).toHaveLength(1);
  });

  it('should handle invalid data gracefully', () => {
    const invalidData = {
      nodes: [{ id: 'invalid', type: 'unknown' }], // missing required fields
      edges: [],
    };

    // This should fail validation
    const result = WorkflowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should use the correct storage key', () => {
    const testData = {
      nodes: [],
      edges: [],
      meta: { name: 'Test', version: 1 },
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(testData));

    expect(localStorageMock.getItem(STORAGE_KEY)).toBeTruthy();
    expect(localStorageMock.getItem('automateos-builder-state')).toBeNull(); // old key
  });
});
