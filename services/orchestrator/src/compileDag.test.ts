import { describe, it, expect } from 'vitest';
import { compileDag } from './compileDag';

function wf(nodes: any[], edges: any[]) {
  return { nodes, edges } as any;
}

describe('compileDag', () => {
  it('orders nodes topologically', () => {
    const graph = wf(
      [
        { id: 'a', type: 'start', data: {} },
        { id: 'b', type: 'http', data: { config: { url: 'x' } } },
        { id: 'c', type: 'http', data: { config: { url: 'y' } } },
      ],
      [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' },
      ]
    );
    const dag = compileDag(graph);
    expect(dag.nodes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(dag.nodes.find((n) => n.id === 'c')?.deps).toEqual(['b']);
  });

  it('throws on cycle', () => {
    const graph = wf(
      [
        { id: 'a', type: 'start', data: {} },
        { id: 'b', type: 'http', data: { config: { url: 'x' } } },
      ],
      [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'a' },
      ]
    );
    expect(() => compileDag(graph)).toThrow(/Cycle/);
  });

  it('maps http config fields', () => {
    const graph = wf(
      [
        { id: 'a', type: 'start', data: {} },
        {
          id: 'h',
          type: 'http',
          data: {
            config: { url: 'https://api', method: 'POST', body: '{"a":1}' },
          },
        },
      ],
      [{ id: 'e1', source: 'a', target: 'h' }]
    );
    const dag = compileDag(graph);
    const httpNode = dag.nodes.find((n) => n.id === 'h');
    expect(httpNode?.config).toMatchObject({
      method: 'POST',
      url: 'https://api',
    });
  });

  it('fails on unsupported node type', () => {
    const graph = wf([{ id: 'x', type: 'weird', data: {} }], []);
    expect(() => compileDag(graph)).toThrow(/Unsupported/);
  });
});
