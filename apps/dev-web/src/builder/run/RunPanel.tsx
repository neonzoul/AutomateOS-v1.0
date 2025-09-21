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
    runStatus !== 'running' &&
    runStatus !== 'queued';

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
        return 'text-secondary bg-off-white';
      case 'running':
        return 'text-system-blue bg-system-blue/10';
      case 'succeeded':
        return 'text-system-green bg-system-green/10';
      case 'failed':
        return 'text-system-red bg-system-red/10';
      default:
        return 'text-secondary bg-off-white';
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
        return 'text-system-blue bg-system-blue/10';
      case 'succeeded':
        return 'text-system-green bg-system-green/10';
      case 'failed':
        return 'text-system-red bg-system-red/10';
      default:
        return 'text-secondary bg-off-white';
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
        <h3 className="text-title-3 text-primary">
          Run Control
        </h3>

        <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded text-caption font-medium transition-all duration-micro ease-apple ${
              runStatus === 'running'
                ? 'bg-system-orange text-white'
                : !canRun
                  ? 'bg-separator text-secondary cursor-not-allowed'
                  : 'bg-system-green text-white hover:bg-system-green/90'
            }`}
            disabled={!canRun}
            onClick={handleRunClick}
            title={canRun ? 'Start workflow' : 'Add nodes to run'}
            data-testid="run-button"
          >
            {runStatus === 'running' ? 'Running...' : 'Run'}
          </button>

          {(runStatus === 'queued' || runStatus === 'running') && currentRunId && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-system-red text-white text-caption font-medium hover:bg-system-red/90 transition-all duration-micro ease-apple"
              onClick={handleCancelClick}
              title="Stop workflow"
              data-testid="cancel-button"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-caption font-medium ${getStatusColor()}`}>
        <div className={`w-2 h-2 rounded-full ${
          runStatus === 'running' ? 'bg-system-blue' :
          runStatus === 'succeeded' ? 'bg-system-green' :
          runStatus === 'failed' ? 'bg-system-red' :
          'bg-secondary'
        }`} />
        {getStatusText()}
      </div>

      {nodes.length > 0 && runStatus !== 'idle' && (
        <div className="space-y-3">
          <h4 className="text-body font-medium text-primary">
            Workflow Steps
          </h4>
          <div className="space-y-2" data-testid="run-steps">
            {nodes.map((node) => {
              const status = nodeRunStatuses[node.id] || 'idle';
              const duration = stepDurations[node.id];
              const label = node.data?.label || (node.type === 'start' ? 'Start' : 'HTTP Request');

              return (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-separator"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'running' ? 'bg-system-blue' :
                      status === 'succeeded' ? 'bg-system-green' :
                      status === 'failed' ? 'bg-system-red' :
                      'bg-separator'
                    }`} />
                    <span className="text-primary text-caption font-medium">
                      {label}
                    </span>
                    <span className={`inline-flex px-2 py-1 rounded text-caption font-medium ${getStepStatusColor(status)}`}>
                      {status === 'running' ? 'Running' :
                       status === 'succeeded' ? 'Completed' :
                       status === 'failed' ? 'Failed' :
                       status}
                    </span>
                  </div>
                  {duration !== undefined && (
                    <span className="text-caption text-secondary font-mono bg-off-white px-2 py-1 rounded">
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
          <h4 className="text-caption font-medium text-primary">Logs</h4>
          <div
            className="max-h-32 overflow-y-auto p-2 bg-off-white rounded border border-separator text-caption font-mono space-y-1"
            data-testid="run-logs"
          >
            {logs.map((log, index) => (
              <div key={index} className="text-secondary">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {runStatus === 'idle' && logs.length === 0 && (
        <div className="text-center py-8 space-y-3" data-testid="run-status">
          <div className="text-body font-medium text-primary">Ready to Run</div>
          <div className="text-caption text-secondary">
            Add workflow nodes and click Run to execute
          </div>
        </div>
      )}
    </aside>
  );
}
