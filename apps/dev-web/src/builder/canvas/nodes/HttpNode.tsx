// [Component]

import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { motionVariants } from '../../../components/ui/motion';

type HttpNodeData = {
  label?: string;
  config?: { method?: string; url?: string };
};
interface HttpNodeProps {
  id: string;
  data?: HttpNodeData;
}
export default function HttpNode({ data, id }: HttpNodeProps) {
  const method = data?.config?.method ?? 'GET';
  const url = data?.config?.url ?? '';
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);
  const isRunning = status === 'running';

  // Get method color for visual variety
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'from-blue-500 to-blue-600';
      case 'POST': return 'from-coral-500 to-coral-600';
      case 'PUT': return 'from-orange-500 to-orange-600';
      case 'DELETE': return 'from-red-500 to-red-600';
      default: return 'from-coral-500 to-coral-600';
    }
  };

  return (
    <motion.div
      data-id="http"
      data-node-id={id}
      className={`rounded-2xl border-2 bg-gradient-to-br ${getMethodColor(method)} px-4 py-3 shadow-soft min-w-[200px] cursor-pointer relative overflow-hidden`}
      variants={motionVariants.nodeEnter}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderColor: isSelected ? '#e84b4b' : 'transparent',
        boxShadow: isSelected
          ? '0 0 20px rgba(232, 75, 75, 0.4)'
          : isRunning
            ? '0 0 15px rgba(232, 75, 75, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Breathing animation overlay for running state */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/20"
          animate={{
            opacity: [0, 0.4, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative z-10">
        <div className="text-white font-semibold flex items-center gap-3 mb-2">
          <motion.span
            className="inline-flex items-center justify-center text-xs font-bold px-2 py-1 rounded-full bg-white/20 border border-white/30 text-white min-w-[45px]"
            whileHover={{ scale: 1.05 }}
          >
            {method}
          </motion.span>
          <span className="text-base">🔗 {data?.label ?? 'Connect to Service'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="text-xs text-white/80 truncate max-w-[160px] bg-white/10 px-2 py-1 rounded-lg"
            title={url}
          >
            {url || 'Enter service URL...'}
          </div>

          {status && status !== 'idle' && (
            <motion.span
              className="text-[10px] px-2 py-1 rounded-full bg-white/20 border border-white/30 text-white uppercase tracking-wide font-medium ml-2"
              animate={isRunning ? {
                scale: [1, 1.02, 1],
                opacity: [0.8, 1, 0.8],
                transition: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }
              } : {}}
            >
              {status === 'running' ? '⚡ Calling' :
               status === 'succeeded' ? '✅ Done' :
               status === 'failed' ? '❌ Error' : status}
            </motion.span>
          )}
        </div>
      </div>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-white !border-2 !border-gray-300 !w-4 !h-4 !shadow-md"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !border-2 !border-gray-300 !w-4 !h-4 !shadow-md"
      />
    </motion.div>
  );
}
