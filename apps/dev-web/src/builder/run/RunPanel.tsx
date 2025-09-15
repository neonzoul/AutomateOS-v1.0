// ::Component:: RunPanel

'use client';

import React from 'react';
import { useRunState, useNodes, useEdges } from '../../core/state';
import { startRun } from './runActions';

/**
 * RunPanel: render run controls and status
 * Sprint 2: wired to startRun() + /v1/runs polling with status updates
 */
export function RunPanel() {
  const { runStatus, currentRunId, logs } = useRunState();
  const nodes = useNodes();
  const edges = useEdges();

  // Check if workflow is valid and run can be started
  const canRun =
    nodes.length > 0 &&
    (runStatus === 'idle' ||
      runStatus === 'succeeded' ||
      runStatus === 'failed');

  const handleRunClick = async () => {
    if (!canRun) return;

    try {
      // Create workflow JSON from current graph state
      const workflowJson = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          config: node.data?.config || {},
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };

      await startRun(workflowJson);
    } catch (error) {
      console.error('Failed to start run:', error);
    }
  };

  // Status display helpers
  const getStatusColor = () => {
    switch (runStatus) {
      case 'queued':
        return 'text-gray-600 bg-gray-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'succeeded':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = () => {
    if (runStatus === 'idle') {
      return nodes.length === 0 ? 'Add nodes to run workflow' : 'Ready to run';
    }
    return `${runStatus.charAt(0).toUpperCase() + runStatus.slice(1)}${currentRunId ? ` (${currentRunId})` : ''}`;
  };

  return (
    <aside
      className="p-4 space-y-3"
      aria-label="Run Panel"
      data-testid="run-panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Run</h3>

        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          disabled={!canRun}
          onClick={handleRunClick}
          title={canRun ? 'Start workflow run' : 'Cannot run workflow'}
          data-testid="run-button"
        >
          {runStatus === 'running' ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* Status pill */}
      <div
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
      >
        {getStatusText()}
      </div>

      {/* Run logs */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Logs</h4>
          <div
            className="max-h-32 overflow-y-auto p-2 bg-gray-50 rounded border text-xs font-mono space-y-1"
            data-testid="run-logs"
          >
            {logs.map((log, index) => (
              <div key={index} className="text-gray-700">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {runStatus === 'idle' && logs.length === 0 && (
        <div className="text-sm text-gray-500" data-testid="run-status">
          No runs yet
        </div>
      )}
    </aside>
  );
}
