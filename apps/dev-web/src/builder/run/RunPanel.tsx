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
        return 'text-warm-gray-600 bg-lavender-twilight/10';
      case 'running':
        return 'text-white bg-golden-hour';
      case 'succeeded':
        return 'text-white bg-sage-whisper';
      case 'failed':
        return 'text-white bg-coral-sunset';
      default:
        return 'text-warm-gray-600 bg-warm-gray-100';
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
        return 'text-white bg-golden-hour';
      case 'succeeded':
        return 'text-white bg-sage-whisper';
      case 'failed':
        return 'text-white bg-coral-sunset';
      default:
        return 'text-warm-gray-600 bg-warm-gray-200';
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
      className="p-8 space-y-6 bg-warm-glow min-h-full"
      aria-label="Run Panel"
      data-testid="run-panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-title-2 text-warm-gray-800 font-display">
          ▶️ Run Control
        </h3>

        <div className="flex gap-3">
          <button
            type="button"
            className={`px-6 py-3 rounded-full text-body font-medium transition-all duration-300 ease-out drop-shadow-sm ${
              runStatus === 'running'
                ? 'bg-golden-hour text-white hover:bg-golden-hour/90 hover:scale-105'
                : !canRun
                  ? 'bg-warm-gray-300 text-warm-gray-500 cursor-not-allowed'
                  : 'bg-sage-whisper text-white hover:bg-sage-whisper/90 hover:scale-105 hover:shadow-lg'
            }`}
            disabled={!canRun}
            onClick={handleRunClick}
            title={canRun ? 'Start workflow' : 'Add nodes to run'}
            data-testid="run-button"
          >
            {runStatus === 'running' ? '⏸️ Running...' : '▶️ Run'}
          </button>

          {(runStatus === 'queued' || runStatus === 'running') && currentRunId && (
            <button
              type="button"
              className="px-6 py-3 rounded-full bg-coral-sunset text-white text-body font-medium hover:bg-coral-sunset/90 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out drop-shadow-sm"
              onClick={handleCancelClick}
              title="Stop workflow"
              data-testid="cancel-button"
            >
              ⏹️ Stop
            </button>
          )}
        </div>
      </div>

      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-body font-medium backdrop-blur-sm ${getStatusColor()}`}>
        <div className={`w-3 h-3 rounded-full ${
          runStatus === 'running' ? 'bg-white animate-pulse' :
          runStatus === 'succeeded' ? 'bg-white' :
          runStatus === 'failed' ? 'bg-white' :
          'bg-warm-gray-400'
        }`} />
        {getStatusText()}
      </div>

      {nodes.length > 0 && runStatus !== 'idle' && (
        <div className="space-y-6">
          <h4 className="text-title-3 font-display text-warm-gray-800">
            🎭 Workflow Steps
          </h4>
          <div className="space-y-4" data-testid="run-steps">
            {nodes.map((node) => {
              const status = nodeRunStatuses[node.id] || 'idle';
              const duration = stepDurations[node.id];
              const label = node.data?.label || (node.type === 'start' ? 'Start' : 'HTTP Request');

              return (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-6 bg-cream-warm/60 rounded-2xl border border-coral-sunset/20 backdrop-blur-sm shadow-raised"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'running' ? 'bg-golden-hour animate-pulse' :
                      status === 'succeeded' ? 'bg-sage-whisper' :
                      status === 'failed' ? 'bg-coral-sunset' :
                      'bg-warm-gray-300'
                    }`} />
                    <span className="text-warm-gray-800 text-body font-medium">
                      {node.type === 'start' ? '✨' : '🌐'} {label}
                    </span>
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-caption font-medium backdrop-blur-sm ${getStepStatusColor(status)}`}>
                      {status === 'running' ? 'Running' :
                       status === 'succeeded' ? 'Completed' :
                       status === 'failed' ? 'Failed' :
                       status}
                    </span>
                  </div>
                  {duration !== undefined && (
                    <span className="text-caption text-warm-gray-600 font-mono bg-warm-gray-100 px-3 py-1.5 rounded-full">
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
        <div className="space-y-4">
          <h4 className="text-body font-medium text-warm-gray-800">📜 Logs</h4>
          <div
            className="max-h-40 overflow-y-auto p-4 bg-warm-gray-50 rounded-2xl border border-warm-gray-200 text-body font-mono space-y-2 backdrop-blur-sm"
            data-testid="run-logs"
          >
            {logs.map((log, index) => (
              <div key={index} className="text-warm-gray-600">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {runStatus === 'idle' && logs.length === 0 && (
        <div className="text-center py-12 space-y-6" data-testid="run-status">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sage-whisper/20 flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
            <div className="w-8 h-8 rounded-full bg-sage-whisper/40"></div>
          </div>
          <div className="text-title-3 font-display text-warm-gray-800">Ready to Run</div>
          <div className="text-body text-warm-gray-600 leading-relaxed">
            Add workflow nodes and click Run to execute your creative automation
          </div>
        </div>
      )}
    </aside>
  );
}
