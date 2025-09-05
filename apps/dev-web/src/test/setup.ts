import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock React Flow dependencies that don't work well in test environment
vi.mock('@xyflow/react', () => ({
  applyNodeChanges: vi.fn((changes: any, nodes: any) => nodes),
  applyEdgeChanges: vi.fn((changes: any, edges: any) => edges),
  addEdge: vi.fn((connection: any, edges: any) => [
    ...edges,
    { id: 'test-edge', ...connection },
  ]),
}));

// Global test utilities
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock nanoid for predictable test IDs
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123'),
}));
