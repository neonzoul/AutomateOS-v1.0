import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

type ConditionNodeData = {
  label?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  config?: { condition?: string; field?: string; operator?: string; value?: string };
};

interface ConditionNodeProps {
  id: string;
  data?: ConditionNodeData;
}

export default function ConditionNode({ data, id }: ConditionNodeProps) {
  const condition = data?.config?.condition ?? '';
  const field = data?.config?.field ?? '';
  const operator = data?.config?.operator ?? '==';
  const value = data?.config?.value ?? '';
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
      data-id="condition"
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
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(147, 51, 234, 0.92) 100%)',
        borderRadius: '12px',
        border: isSelected ? '3px solid #E63946' : '2px solid rgba(147, 51, 234, 0.6)',
        boxShadow: `
          0 8px 24px rgba(147, 51, 234, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -2px 8px rgba(0, 0, 0, 0.2)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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

      {/* Branch icon (SVG) */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      >
        <path
          d="M12 2v6M12 8l-5 6M12 8l5 6M7 14v6M17 14v6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="2" r="1.5" fill="white" />
        <circle cx="7" cy="20" r="1.5" fill="white" />
        <circle cx="17" cy="20" r="1.5" fill="white" />
      </svg>

      {/* Input Handle - Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.4), 0 0 12px rgba(232, 75, 75, 0.3)',
          left: '0px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Output Handle - True (Top) */}
      <Handle
        type="source"
        position={Position.Top}
        id="source-true"
        style={{
          background: '#00D98E',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(0, 217, 142, 0.5), 0 0 12px rgba(0, 217, 142, 0.4)',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Output Handle - False (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-false"
        style={{
          background: '#9E9E9E',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(158, 158, 158, 0.5), 0 0 12px rgba(158, 158, 158, 0.3)',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </motion.div>
  );
}
