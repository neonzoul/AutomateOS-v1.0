// Example usage of the enhanced AutomateOS Zustand store

import React from 'react';
import ReactFlow from '@xyflow/react';
import {
  useNodes,
  useEdges,
  useReactFlowHandlers,
  useSelectedNode,
  useGraphActions,
  useSelectionActions,
  useIsWorkflowValid,
  addStartNode,
} from '../core/state';

// Example Canvas component using the enhanced store
export function BuilderCanvas() {
  const nodes = useNodes();
  const edges = useEdges();
  const { onNodesChange, onEdgesChange, onConnect } = useReactFlowHandlers();
  const { setSelectedNode } = useSelectionActions();

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        onPaneClick={() => setSelectedNode(null)}
        fitView
      />
    </div>
  );
}

// Example Inspector component
export function Inspector() {
  const selectedNode = useSelectedNode();
  const { updateNodeConfig } = useSelectionActions();

  if (!selectedNode) {
    return <div className="p-4 text-gray-500">Select a node to edit</div>;
  }

  const handleConfigChange = (key: string, value: any) => {
    updateNodeConfig(selectedNode.id, { [key]: value });
  };

  return (
    <div className="p-4 border-l">
      <h3 className="font-semibold mb-2">Node Inspector</h3>
      <p className="text-sm text-gray-600 mb-4">
        Type: {selectedNode.type} | ID: {selectedNode.id}
      </p>

      <div className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium">Label:</span>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={(e) => handleConfigChange('label', e.target.value)}
            className="w-full mt-1 px-2 py-1 border rounded"
          />
        </label>

        {selectedNode.type === 'http' && (
          <label className="block">
            <span className="text-sm font-medium">URL:</span>
            <input
              type="url"
              value={(selectedNode.data.config?.url as string) || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded"
              placeholder="https://api.example.com"
            />
          </label>
        )}
      </div>
    </div>
  );
}

// Example Actions Panel
export function ActionsPanel() {
  const { addNode, clearWorkflow } = useGraphActions();
  const isValid = useIsWorkflowValid();

  const handleAddHttpNode = () => {
    addNode({
      type: 'http',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        label: 'HTTP Request',
        config: { url: '', method: 'GET' },
      },
    });
  };

  return (
    <div className="p-4 border-t">
      <h3 className="font-semibold mb-2">Actions</h3>

      <div className="space-y-2">
        <button
          onClick={addStartNode}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Start Node
        </button>

        <button
          onClick={handleAddHttpNode}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add HTTP Node
        </button>

        <button
          onClick={clearWorkflow}
          className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Workflow
        </button>
      </div>

      <div className="mt-4 text-sm">
        <span
          className={`px-2 py-1 rounded ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {isValid ? '✓ Valid Workflow' : '⚠ Invalid Workflow'}
        </span>
      </div>
    </div>
  );
}

// Example main builder layout
export function BuilderLayout() {
  return (
    <div className="h-screen flex">
      <div className="flex-1">
        <BuilderCanvas />
      </div>
      <div className="w-80 flex flex-col">
        <Inspector />
        <ActionsPanel />
      </div>
    </div>
  );
}
