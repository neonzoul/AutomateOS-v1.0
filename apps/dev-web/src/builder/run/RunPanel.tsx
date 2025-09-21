// ::Component:: RunPanel

'use client';

import React from 'react';
import { useRunState, useNodes, useEdges } from '../../core/state';
import { startRun, cancelRun } from './runActions';
import { motion, AnimatePresence } from 'framer-motion';
import { motionVariants } from '../../components/ui/motion';

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
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          ⚡ Automation Control
        </h3>

        <div className="flex gap-3">
          <motion.button
            type="button"
            className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
              runStatus === 'running'
                ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-glow-soft'
                : !canRun
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-soft hover:shadow-medium'
            }`}
            disabled={!canRun}
            onClick={handleRunClick}
            title={canRun ? 'Start workflow automation' : 'Add workflow steps to run'}
            data-testid="run-button"
            whileHover={canRun ? { scale: 1.05 } : {}}
            whileTap={canRun ? { scale: 0.95 } : {}}
            animate={runStatus === 'running' ? {
              scale: [1, 1.02, 1],
              opacity: [0.8, 1, 0.8],
              transition: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }
            } : {}}
          >
            {runStatus === 'running' ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "easeInOut"
                  }}
                />
                Running Magic...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                ✨ Run Workflow
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {(runStatus === 'queued' || runStatus === 'running') && currentRunId && (
              <motion.button
                type="button"
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-soft"
                onClick={handleCancelClick}
                title="Stop workflow"
                data-testid="cancel-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🛑 Stop
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status indicator */}
      <motion.div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium shadow-soft ${getStatusColor()}`}
        animate={runStatus === 'running' ? {
          scale: [1, 1.02, 1],
          opacity: [0.8, 1, 0.8],
          transition: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }
        } : {}}
      >
        <div className={`w-2 h-2 rounded-full ${
          runStatus === 'running' ? 'bg-blue-500 animate-pulse' :
          runStatus === 'succeeded' ? 'bg-green-500' :
          runStatus === 'failed' ? 'bg-red-500' :
          'bg-gray-400'
        }`} />
        {getStatusText()}
      </motion.div>

      {/* Steps section */}
      {nodes.length > 0 && runStatus !== 'idle' && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            ⚡ Workflow Steps
          </h4>
          <div className="space-y-2" data-testid="run-steps">
            <AnimatePresence>
              {nodes.map((node, index) => {
                const status = nodeRunStatuses[node.id] || 'idle';
                const duration = stepDurations[node.id];
                const label = node.data?.label || (node.type === 'start' ? 'Trigger' : 'Connect Service');

                return (
                  <motion.div
                    key={node.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-soft"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'running' ? 'bg-blue-500 animate-pulse' :
                        status === 'succeeded' ? 'bg-green-500' :
                        status === 'failed' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`} />
                      <span className="text-gray-800 font-medium">
                        {node.type === 'start' ? '✨' : '🔗'} {label}
                      </span>
                      <motion.span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(status)}`}
                        animate={status === 'running' ? {
                          scale: [1, 1.02, 1],
                          opacity: [0.8, 1, 0.8],
                          transition: {
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut"
                          }
                        } : {}}
                      >
                        {status === 'running' ? '⚡ Running' :
                         status === 'succeeded' ? '✅ Done' :
                         status === 'failed' ? '❌ Failed' :
                         status}
                      </motion.span>
                    </div>
                    {duration !== undefined && (
                      <motion.span
                        className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {formatDuration(duration)}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
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
        <motion.div
          className="text-center py-8 space-y-3"
          data-testid="run-status"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl">🚀</div>
          <div className="text-gray-600 font-medium">Ready to automate!</div>
          <div className="text-sm text-gray-500">
            Add workflow steps and click Run to see the magic happen
          </div>
        </motion.div>
      )}
    </aside>
  );
}
