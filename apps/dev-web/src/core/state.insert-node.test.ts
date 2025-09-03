import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBuilderStore } from './state';

vi.mock('nanoid', () => ({ nanoid: vi.fn(() => 'fixed-id') }));

describe('Graph insert actions', () => {
  beforeEach(() => {
    useBuilderStore.setState({ nodes: [], edges: [], selectedNodeId: null });
  });

  it('adds an HTTP node and increments nodes length', () => {
    const { addNode } = useBuilderStore.getState();
    const before = useBuilderStore.getState().nodes.length;
    addNode({ type: 'http', position: { x: 0, y: 0 }, data: {} });
    const after = useBuilderStore.getState().nodes.length;
    expect(after).toBe(before + 1);
  });
});
