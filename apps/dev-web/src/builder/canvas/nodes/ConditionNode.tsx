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
        y: -4,
        boxShadow: '0px 12px 32px rgba(156, 39, 176, 0.25)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '320px',
        minHeight: '180px',
        background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        border: isSelected ? `3px solid #E63946` : `3px solid #9C27B0`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0px 6px 20px rgba(156, 39, 176, 0.15)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
      }}
    >
      {/* Status indicator dot */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: getStatusColor(),
          boxShadow: `0 2px 8px rgba(156, 39, 176, 0.4)`,
        }}
      />

      {/* Icon - Fork/Split symbol */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: '#9C27B0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v6M12 8l-5 6M12 8l5 6M7 14v6M17 14v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="2" r="2" fill="white"/>
          <circle cx="7" cy="20" r="2" fill="white"/>
          <circle cx="17" cy="20" r="2" fill="white"/>
        </svg>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 600,
        fontSize: '20px',
        color: '#4A148C',
        textAlign: 'center',
        marginBottom: '12px',
        letterSpacing: '-0.02em'
      }}>
        {data?.label ?? 'If/Else'}
      </div>

      {/* Condition Display */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '1.5',
        color: '#6A1B9A',
        textAlign: 'center',
        background: 'rgba(156, 39, 176, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        wordBreak: 'break-word'
      }}>
        {displayCondition}
      </div>

      {/* Input Handle - Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '14px',
          height: '14px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.3)',
          left: '-7px',
          top: '50%',
        }}
      />

      {/* Output Handle - True (Top Right, Green) */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-true"
        style={{
          background: '#00D98E',
          border: '2px solid #FFFFFF',
          width: '16px',
          height: '16px',
          boxShadow: '0 2px 8px rgba(0, 217, 142, 0.4)',
          right: '-8px',
          top: '35%',
        }}
      />

      {/* True Label */}
      <div style={{
        position: 'absolute',
        right: '-50px',
        top: 'calc(35% - 10px)',
        fontSize: '12px',
        fontWeight: 600,
        color: '#00D98E',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        True
      </div>

      {/* Output Handle - False (Bottom Right, Gray) */}
      <Handle
        type="source"
        position={Position.Right}
        id="source-false"
        style={{
          background: '#9E9E9E',
          border: '2px solid #FFFFFF',
          width: '16px',
          height: '16px',
          boxShadow: '0 2px 8px rgba(158, 158, 158, 0.4)',
          right: '-8px',
          top: '65%',
        }}
      />

      {/* False Label */}
      <div style={{
        position: 'absolute',
        right: '-54px',
        top: 'calc(65% - 10px)',
        fontSize: '12px',
        fontWeight: 600,
        color: '#9E9E9E',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        False
      </div>
    </motion.div>
  );
}
