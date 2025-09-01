"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  useEdgesState,
  useNodesState,
  Edge,
  Node,
  DefaultEdgeOptions,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function Home() {
  const initialNodes = useMemo<Node[]>(
    () => [
      {
        id: 'hello',
        position: { x: 200, y: 40 },
        data: { label: 'Hello, React Flow!' },
        style: { padding: 12, fontSize: 16, border: '1px solid #888', borderRadius: 8, background: '#fff' },
        type: 'input',
      },
      {
        id: 'task',
        position: { x: 450, y: 160 },
        data: { label: 'Task' },
        style: { padding: 10, border: '1px solid #888', borderRadius: 8, background: '#fff' },
      },
      {
        id: 'result',
        position: { x: 700, y: 280 },
        data: { label: 'Result' },
        style: { padding: 10, border: '1px solid #888', borderRadius: 8, background: '#fff' },
        type: 'output',
      },
    ],
    []
  );

  const initialEdges = useMemo<Edge[]>(
    () => [
      { id: 'hello-task', source: 'hello', target: 'task' },
      { id: 'task-result', source: 'task', target: 'result' },
    ],
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Connection) => setEdges((eds: Edge[]) => addEdge(connection, eds)), [setEdges]);

  const defaultEdgeOptions = useMemo<DefaultEdgeOptions>(() => ({ animated: true }), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
      <header style={{
        padding: '10px 16px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(90deg, #111827, #1f2937)',
        color: 'white',
        fontWeight: 600
      }}>
        Creator Studio — Hello, React Flow
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
