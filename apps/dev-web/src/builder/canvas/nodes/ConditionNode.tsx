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

  // Display condition string
  const displayCondition = condition || (field && operator && value ? `${field} ${operator} ${value}` : 'No condition set');

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
        scale: 1.08,
        boxShadow: '0px 8px 24px rgba(156, 39, 176, 0.3)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        border: isSelected ? `3px solid #E63946` : `3px solid #9C27B0`,
        boxShadow: '0px 4px 16px rgba(156, 39, 176, 0.2)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(45deg)',
      }}
    >
      {/* Inner content - counter-rotate to keep upright */}
      <div style={{
        transform: 'rotate(-45deg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}>
        {/* Status indicator dot */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getStatusColor(),
            boxShadow: `0 2px 6px ${getStatusColor()}40`,
          }}
        />

        {/* Decision text */}
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          color: '#4A148C',
          textAlign: 'center',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          {data?.label ?? 'Decision'}
        </div>

        {/* Question mark icon or condition hint */}
        {!condition && !field && (
          <div style={{
            fontSize: '24px',
            color: '#9C27B0',
            marginTop: '4px',
            opacity: 0.6,
          }}>
            ?
          </div>
        )}
      </div>

      {/* Input Handle - Top of Diamond */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.3)',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Output Handle - True (Right side, Green) */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-true"
        style={{
          background: '#00D98E',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(0, 217, 142, 0.4)',
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      {/* True Label */}
      <div style={{
        position: 'absolute',
        right: '-44px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#00D98E',
        textShadow: '0 1px 2px rgba(0,0,0,0.15)',
        background: 'rgba(0, 217, 142, 0.1)',
        padding: '2px 6px',
        borderRadius: '4px',
      }}>
        True
      </div>

      {/* Output Handle - False (Bottom side, Gray) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-false"
        style={{
          background: '#9E9E9E',
          border: '2px solid #FFFFFF',
          width: '12px',
          height: '12px',
          boxShadow: '0 2px 8px rgba(158, 158, 158, 0.4)',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* False Label */}
      <div style={{
        position: 'absolute',
        bottom: '-26px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#9E9E9E',
        textShadow: '0 1px 2px rgba(0,0,0,0.15)',
        background: 'rgba(158, 158, 158, 0.1)',
        padding: '2px 6px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}>
        False
      </div>
    </motion.div>
  );
}
