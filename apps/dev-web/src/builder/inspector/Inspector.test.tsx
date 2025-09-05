import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { Inspector } from './Inspector';
import { useBuilderStore } from '@/core/state';

describe('Inspector (shell)', () => {
  beforeEach(() => {
    useBuilderStore.setState({ nodes: [], edges: [], selectedNodeId: null });
  });

  it('shows placeholder when nothing selected', () => {
    render(<Inspector />);
    expect(
      screen.getByText(/Select a node to configure its properties/i)
    ).toBeInTheDocument();
  });

  it('shows http form when an HTTP node is selected', () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP', config: {} },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    expect(screen.getByText(/Method/i)).toBeInTheDocument();
    expect(screen.getByText(/URL/i)).toBeInTheDocument();
  });

  it('shows start message when a Start node is selected', () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 's1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: { label: 'Start' },
        } as any,
      ],
      edges: [],
      selectedNodeId: 's1',
    });

    render(<Inspector />);
    expect(
      screen.getByText(/No configurable fields for this node yet/i)
    ).toBeInTheDocument();
  });

  it('updates HTTP URL via input', () => {
    useBuilderStore.setState({
      nodes: [
        {
          id: 'h1',
          type: 'http',
          position: { x: 0, y: 0 },
          data: { label: 'HTTP', config: { method: 'GET', url: '' } },
        } as any,
      ],
      edges: [],
      selectedNodeId: 'h1',
    });

    render(<Inspector />);
    const input = screen.getByPlaceholderText(
      'https://api.example.com'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://x.test/api' } });

    const node = useBuilderStore.getState().nodes.find((n) => n.id === 'h1');
    expect((node?.data.config as any).url).toBe('https://x.test/api');
  });
});
