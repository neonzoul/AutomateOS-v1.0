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
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function Home() {
  const initialNodes = useMemo<Node[]>(
    () => [
      { id: 'a', position: { x: 50, y: 80 }, data: { label: 'Trigger' }, type: 'input' },
      { id: 'b', position: { x: 300, y: 80 }, data: { label: 'Task' } },
      { id: 'c', position: { x: 550, y: 80 }, data: { label: 'Result' }, type: 'output' },
    ],
    []
  );

  const initialEdges = useMemo<Edge[]>(
    () => [
      { id: 'a-b', source: 'a', target: 'b' },
      { id: 'b-c', source: 'b', target: 'c' },
    ],
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds: Edge[]) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
