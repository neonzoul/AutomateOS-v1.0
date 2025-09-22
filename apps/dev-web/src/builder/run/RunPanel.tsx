// ::Component:: RunPanel

'use client';

import React from 'react';
import { useRunState, useNodes, useEdges } from '../../core/state';
import { startRun, cancelRun } from './runActions';

// Apple-inspired SVG icons with clean, minimal design
const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'white' }}>
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'white' }}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const StopIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'white' }}>
    <path d="M6 6h12v12H6z"/>
  </svg>
);

// Sophisticated control icon for section header
const ControlIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75zm0 10.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75zM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10z" clipRule="evenodd" />
  </svg>
);

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
      className="p-8 space-y-6"
      style={{
        height: '100%'
      }}
      aria-label="Run Panel"
      data-testid="run-panel"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-coral-sunset/10 to-golden-hour/10 border border-coral-sunset/20">
            <ControlIcon className="w-5 h-5 text-coral-sunset" />
          </div>
          <h3 className="text-title-2 text-warm-gray-800 font-display">
            Run Control
          </h3>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            style={{
              padding: '16px 32px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canRun ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: runStatus === 'running'
                ? 'linear-gradient(135deg, #FFD93D 0%, #F4C430 100%)'
                : !canRun
                  ? '#D1D5DB'
                  : 'linear-gradient(135deg, #00DFA2 0%, #06D6A0 100%)',
              color: runStatus === 'running' || canRun ? 'white' : '#6B7280',
              boxShadow: canRun ? '0 4px 16px rgba(0, 223, 162, 0.2)' : 'none',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
            }}
            disabled={!canRun}
            onClick={handleRunClick}
            title={canRun ? 'Start workflow' : 'Add nodes to run'}
            data-testid="run-button"
            onMouseEnter={(e) => {
              if (canRun) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 223, 162, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (canRun) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 223, 162, 0.2)';
              }
            }}
          >
            {runStatus === 'running' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <span style={{ color: 'white' }}>Running...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span style={{ color: 'white' }}>Run Workflow</span>
              </>
            )}
          </button>

          {(runStatus === 'queued' || runStatus === 'running') && currentRunId && (
            <button
              type="button"
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-coral-sunset to-coral-sunset/90 text-white text-body font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
              onClick={handleCancelClick}
              title="Stop workflow"
              data-testid="cancel-button"
            >
              <div className="flex items-center gap-2">
                <StopIcon className="w-4 h-4" />
                <span>Stop</span>
              </div>
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
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-sage-whisper to-golden-hour rounded-full"></div>
            <h4 className="text-title-3 font-display text-warm-gray-800">
              Workflow Steps
            </h4>
          </div>
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
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        node.type === 'start'
                          ? 'bg-sage-whisper/20'
                          : 'bg-coral-sunset/20'
                      }`}>
                        {node.type === 'start' ? (
                          <svg className="w-3 h-3 text-sage-whisper" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1a.5.5 0 01.5.5v5.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L7.5 7.293V1.5A.5.5 0 018 1z"/>
                            <path d="M3 9.5a.5.5 0 01.5-.5h9a.5.5 0 010 1H3.5a.5.5 0 01-.5-.5zM2.5 12a.5.5 0 000 1h11a.5.5 0 000-1h-11z"/>
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-coral-sunset" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.1.125.484.287.884.727 1.77.86 1.058.860 1.058s1.17-.204 1.25-.316c.08-.164-.287-2.14-.42-2.217-.132-.096-.668-.767-.668-.767s.472-2.478-.287-2.478c-.28.305-.46.78-.72.78a.5.5 0 01-.5-.5c0-.28.22-.5.5-.5 1.72 0 3.5.98 3.5 2 0 .78-.478 1.5-1 2v3c.5.5 1 1 1 2 0 .78-.22 1.5-.5 2-.28.5-.72 1-1.5 1s-1.5-.5-2-1c-.39-.39-.78-.78-1.5-1-.72.22-1.5.78-2 1.5-.39.56-.78 1.11-1.5 1.5s-1.5.22-2-.28c-.39-.39-.78-.78-1-1.5-.22-.72-.22-1.5.28-2 .39-.39.78-.78 1.5-1 .72-.22 1.5-.22 2 .28z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-warm-gray-800 text-body font-medium">
                        {label}
                      </span>
                    </div>
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
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-gradient-to-b from-lavender-twilight to-coral-sunset rounded-full"></div>
            <h4 className="text-body font-medium text-warm-gray-800">Execution Logs</h4>
          </div>
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
