import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { nodeEntranceVariants, subtleHover, pressEffect } from '../../../components/ui/motion';

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

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-white bg-lavender-twilight';
      case 'POST': return 'text-white bg-coral-sunset';
      case 'PUT': return 'text-white bg-golden-hour';
      case 'DELETE': return 'text-white bg-coral-sunset';
      default: return 'text-white bg-lavender-twilight';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-golden-hour';
      case 'succeeded': return 'bg-sage-whisper';
      case 'failed': return 'bg-coral-sunset';
      default: return 'bg-warm-gray-300';
    }
  };

  return (
    <motion.div
      data-id="http"
      data-node-id={id}
      className={`
        relative bg-flow-coral rounded-3xl border-2 border-coral-sunset/30 px-8 py-6
        min-w-[240px] cursor-pointer transition-all duration-300 ease-out
        shadow-lg hover:shadow-xl backdrop-blur-sm
        ${isSelected
          ? 'border-coral-sunset shadow-[0_0_0_3px_rgba(255,107,107,0.3)] scale-105'
          : 'hover:border-coral-sunset/60 hover:scale-102'
        }
      `}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={subtleHover}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Organic status indicator */}
      <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${getStatusColor()} ${status === 'running' ? 'animate-pulse' : ''}`} />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`
            inline-flex items-center justify-center text-caption font-medium
            px-3 py-1.5 rounded-full min-w-[60px] text-white drop-shadow-sm
            ${getMethodColor(method).split(' ')[1]}
          `}>
            {method}
          </span>
          <div className="text-white font-display text-title-3 drop-shadow-sm">
            {data?.label ?? 'API Request'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-white/80 text-body">
            {url ? (
              <span className="font-mono text-caption truncate block" title={url}>
                {url}
              </span>
            ) : (
              <span className="italic">Configure request URL</span>
            )}
          </div>

          {status !== 'idle' && (
            <div className="flex items-center gap-2 text-caption">
              <span className="text-white/60">
                <span className="capitalize">{status}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-white !border-2 !border-separator !w-3 !h-3 hover:!border-coral-sunset"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !border-2 !border-separator !w-3 !h-3 hover:!border-coral-sunset"
      />
    </motion.div>
  );
}
