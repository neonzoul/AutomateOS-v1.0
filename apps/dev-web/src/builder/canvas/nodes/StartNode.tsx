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
      case 'running': return 'bg-system-blue';
      case 'succeeded': return 'bg-system-green';
      case 'failed': return 'bg-system-red';
      default: return 'bg-secondary';
    }
  };

  return (
    <motion.div
      data-id="start"
      data-node-id={id}
      className={`
        relative bg-white rounded-lg border border-separator px-6 py-4
        min-w-[160px] cursor-pointer transition-all duration-micro ease-apple
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

      <div className="text-center">
        <div className="text-primary font-semibold text-body mb-1">
          {data?.label ?? 'Start'}
        </div>
        <div className="text-secondary text-caption">
          Workflow trigger
          {status !== 'idle' && (
            <span className="ml-2 inline-block">
              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor()} mr-1`} />
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
