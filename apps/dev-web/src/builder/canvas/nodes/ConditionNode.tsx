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
        scale: 1.05,
        filter: 'brightness(1.05)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '140px',
        height: '180px',
        background: 'linear-gradient(135deg, rgba(243, 229, 245, 0.95) 0%, rgba(225, 190, 231, 0.98) 100%)',
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        border: isSelected
          ? `3px solid #E63946`
          : `2px solid rgba(156, 39, 176, 0.4)`,
        boxShadow: `
          0px 8px 32px rgba(156, 39, 176, 0.25),
          inset 0px 1px 0px rgba(255, 255, 255, 0.5),
          inset 0px -1px 0px rgba(156, 39, 176, 0.2)
        `,
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(45deg)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Glass shine overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(156, 39, 176, 0.1) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Glossy highlight */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-20%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
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
        {/* Status indicator dot - with glass effect */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: getStatusColor(),
            boxShadow: `
              0 2px 8px ${getStatusColor()}60,
              inset 0 1px 2px rgba(255, 255, 255, 0.5)
            `,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        />

        {/* Decision text with text shadow for depth */}
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 700,
          fontSize: '15px',
          color: '#4A148C',
          textAlign: 'center',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(74, 20, 140, 0.2)',
        }}>
          {data?.label ?? 'If/Else'}
        </div>

        {/* Question mark icon with glass effect */}
        {!condition && !field && (
          <div style={{
            fontSize: '28px',
            color: '#9C27B0',
            marginTop: '4px',
            opacity: 0.7,
            fontWeight: 400,
            textShadow: '0 1px 3px rgba(255, 255, 255, 0.5)',
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
        right: '-48px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '12px',
        fontWeight: 700,
        color: '#00D98E',
        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
        background: 'rgba(0, 217, 142, 0.15)',
        padding: '3px 8px',
        borderRadius: '6px',
        border: '1px solid rgba(0, 217, 142, 0.3)',
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
        bottom: '-30px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        fontWeight: 700,
        color: '#9E9E9E',
        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
        background: 'rgba(158, 158, 158, 0.15)',
        padding: '3px 8px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        border: '1px solid rgba(158, 158, 158, 0.3)',
      }}>
        False
      </div>
    </motion.div>
  );
}
