import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { nodeEntranceVariants, subtleHover, pressEffect } from '../../../components/ui/motion';

type StartNodeData = { label?: string };

interface StartNodeProps {
  id: string;
  data?: StartNodeData;
}

export default function StartNode({ data, id }: StartNodeProps) {
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

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
      data-id="start"
      data-node-id={id}
      className={`
        relative rounded-3xl border-2 border-sage-whisper/30 px-8 py-6
        min-w-[180px] cursor-pointer transition-all duration-300 ease-out
        shadow-lg hover:shadow-xl backdrop-blur-sm
        ${isSelected
          ? 'border-sage-whisper shadow-[0_0_0_3px_rgba(0,223,162,0.3)] scale-105'
          : 'hover:border-sage-whisper/60 hover:scale-102'
        }
      `}
      style={{
        background: 'linear-gradient(135deg, #00DFA2 0%, #42E8C2 50%, #84F5E1 100%)'
      }}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={subtleHover}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Organic status indicator */}
      <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${getStatusColor()} ${status === 'running' ? 'animate-pulse' : ''}`} />

      <div className="text-center">
        <div className="text-white font-display text-title-3 mb-2 drop-shadow-sm">
          {data?.label ?? 'Start'}
        </div>
        <div className="text-white/80 text-body font-medium">
          Begin workflow
          {status !== 'idle' && (
            <span className="ml-2 inline-block text-white/60 text-caption">
              <span className="capitalize">{status}</span>
            </span>
          )}
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-white !border-2 !border-separator !w-3 !h-3 hover:!border-system-blue"
      />
    </motion.div>
  );
}
