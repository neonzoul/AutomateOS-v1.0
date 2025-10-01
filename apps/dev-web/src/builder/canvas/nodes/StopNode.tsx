import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

type StopNodeData = {
  label?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  config?: Record<string, unknown>;
};

interface StopNodeProps {
  id: string;
  data?: StopNodeData;
}

export default function StopNode({ data, id }: StopNodeProps) {
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  const getStatusColor = () => {
    switch (status) {
      case 'running': return '#FFD93D';
      case 'succeeded': return '#00DFA2';
      case 'failed': return '#E84B4B';
      default: return '#9E9E9E';
    }
  };

  return (
    <motion.div
      data-id="stop"
      data-node-id={id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.05,
        filter: 'brightness(1.08)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '80px',
        height: '80px',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Circular button with 3D effect */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(158, 158, 158, 0.9) 0%, rgba(117, 117, 117, 0.95) 100%)',
          border: isSelected ? '3px solid #E63946' : '2px solid rgba(158, 158, 158, 0.6)',
          boxShadow: `
            0 6px 20px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -3px 8px rgba(0, 0, 0, 0.3)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Status dot */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getStatusColor(),
            boxShadow: `
              0 0 8px ${getStatusColor()},
              0 0 12px ${getStatusColor()}80,
              inset 0 1px 2px rgba(255, 255, 255, 0.5)
            `,
            border: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        />

        {/* Stop line (horizontal bar) */}
        <div
          style={{
            width: '32px',
            height: '4px',
            background: '#FFFFFF',
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
          }}
        />
      </div>

      {/* Input Handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.4), 0 0 12px rgba(232, 75, 75, 0.3)',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </motion.div>
  );
}
