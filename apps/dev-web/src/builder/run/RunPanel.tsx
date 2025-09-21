// ::Component:: RunPanel

'use client';

import React from 'react';
import { useRunState, useNodes, useEdges } from '../../core/state';
import { startRun, cancelRun } from './runActions';

/**
 * RunPanel: render run controls and status
 * Sprint 2: wired to startRun() + /v1/runs polling with status updates
 */
export function RunPanel() {
  const { runStatus, currentRunId, logs, nodeRunStatuses, stepDurations } = useRunState();
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

  // Step status helpers
  const getStepStatusColor = (status: string) => {
    switch (status) {
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

  const formatDuration = (durationMs: number) => {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  const handleCancelClick = async () => {
    if (currentRunId && (runStatus === 'queued' || runStatus === 'running')) {
      await cancelRun(currentRunId);
    }
  };

  return (
    <aside
      className="p-4 space-y-3"
      aria-label="Run Panel"
      data-testid="run-panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Run</h3>

        <div className="flex gap-2">
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

          {(runStatus === 'queued' || runStatus === 'running') && currentRunId && (
            <button
              type="button"
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              onClick={handleCancelClick}
              title="Cancel run"
              data-testid="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status pill */}
      <div
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
      >
        {getStatusText()}
      </div>

      {/* Steps section */}
      {nodes.length > 0 && runStatus !== 'idle' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Steps</h4>
          <div className="space-y-1" data-testid="run-steps">
            {nodes.map((node) => {
              const status = nodeRunStatuses[node.id] || 'idle';
              const duration = stepDurations[node.id];
              const label = node.data?.label || node.type;

              return (
                <div key={node.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{label}</span>
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${getStepStatusColor(status)}`}
                    >
                      {status}
                    </span>
                  </div>
                  {duration !== undefined && (
                    <span className="text-xs text-gray-500">
                      {formatDuration(duration)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
