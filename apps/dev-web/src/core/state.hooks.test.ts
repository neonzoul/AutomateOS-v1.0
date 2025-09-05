import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '../core/state';

// Simple test for the selector hooks
describe('BuilderStore Selectors', () => {
  beforeEach(() => {
    useBuilderStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
    });
  });

  it('should provide correct state through store', () => {
    const { result } = renderHook(() => useBuilderStore());

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.selectedNodeId).toBeNull();
  });

  it('should update state correctly through actions', () => {
    const { result } = renderHook(() => useBuilderStore());

    act(() => {
      result.current.addNode({
        id: 'test-node',
        type: 'start',
        position: { x: 100, y: 100 },
        data: { label: 'Test Node' },
      });
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toBe('test-node');

    act(() => {
      result.current.setSelectedNode('test-node');
    });

    expect(result.current.selectedNodeId).toBe('test-node');
  });
});
