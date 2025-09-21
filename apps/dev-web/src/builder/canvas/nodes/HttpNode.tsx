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
      case 'GET': return 'text-system-blue bg-system-blue';
      case 'POST': return 'text-system-green bg-system-green';
      case 'PUT': return 'text-system-orange bg-system-orange';
      case 'DELETE': return 'text-system-red bg-system-red';
      default: return 'text-system-blue bg-system-blue';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-system-blue';
      case 'succeeded': return 'bg-system-green';
      case 'failed': return 'bg-system-red';
      default: return 'bg-secondary';
    }
  };

  return (
    <motion.div
      data-id="http"
      data-node-id={id}
      className={`
        relative bg-white rounded-lg border border-separator px-6 py-4
        min-w-[240px] cursor-pointer transition-all duration-micro ease-apple
        focus-ring
        ${isSelected
          ? 'border-system-blue shadow-[0_0_0_2px_rgba(0,122,255,0.2)]'
          : 'hover:border-primary hover:shadow-sm'
        }
      `}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={subtleHover}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${getStatusColor()}`} />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`
            inline-flex items-center justify-center text-caption font-medium
            px-2 py-1 rounded-md min-w-[48px] text-white
            ${getMethodColor(method).split(' ')[1]}
          `}>
            {method}
          </span>
          <div className="text-primary font-semibold text-body">
            {data?.label ?? 'API Request'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-secondary text-caption">
            {url ? (
              <span className="font-mono text-xs truncate block" title={url}>
                {url}
              </span>
            ) : (
              <span className="italic">Configure request URL</span>
            )}
          </div>

          {status !== 'idle' && (
            <div className="flex items-center gap-2 text-caption">
              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="capitalize text-secondary">{status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-white !border-2 !border-separator !w-3 !h-3 hover:!border-system-blue"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !border-2 !border-separator !w-3 !h-3 hover:!border-system-blue"
      />
    </motion.div>
  );
}
