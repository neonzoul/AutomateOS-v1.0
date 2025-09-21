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
        relative cursor-pointer transition-all duration-500 ease-out
        ${isSelected
          ? 'scale-105'
          : 'hover:scale-102'
        }
      `}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, #FFFBF7 0%, #FFF8F0 100%)'
          : 'linear-gradient(135deg, #FFF8F0 0%, #FFFBF7 100%)',
        borderRadius: '28px',
        padding: '28px 36px',
        minWidth: '220px',
        border: isSelected
          ? '2px solid #E84B4B'
          : '1px solid rgba(232, 75, 75, 0.15)',
        boxShadow: isSelected
          ? '0 16px 48px rgba(232, 75, 75, 0.15), 0 4px 16px rgba(232, 75, 75, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
          : '0 8px 32px rgba(232, 75, 75, 0.08), 0 2px 8px rgba(232, 75, 75, 0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
      }}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={{
        boxShadow: '0 16px 48px rgba(255,107,107,0.35), 0 6px 16px rgba(255,107,107,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Her-style coral accent circle */}
      <div
        className={`absolute top-5 left-5 w-5 h-5 rounded-full flex items-center justify-center ${status === 'running' ? 'animate-pulse' : ''}`}
        style={{
          background: status === 'running' ? '#FFD93D' :
                     status === 'succeeded' ? '#00DFA2' :
                     status === 'failed' ? '#E84B4B' : '#E84B4B',
          boxShadow: '0 3px 12px rgba(232, 75, 75, 0.25), inset 0 1px 0 rgba(255,255,255,0.4)'
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full opacity-90" />
      </div>

      <div className="text-center">
        <div
          className="mb-3"
          style={{
            color: '#2D1B1B',
            fontSize: '24px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            letterSpacing: '-0.3px'
          }}
        >
          ✨ {data?.label ?? 'Start'}
        </div>
        <div
          style={{
            color: 'rgba(45, 27, 27, 0.75)',
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '-0.1px'
          }}
        >
          Begin your creative journey
          {status !== 'idle' && (
            <div
              className="mt-3 px-3 py-1 rounded-full inline-block"
              style={{
                backgroundColor: 'rgba(232, 75, 75, 0.1)',
                color: '#E84B4B',
                fontSize: '13px',
                fontWeight: '500',
                textTransform: 'capitalize',
                border: '1px solid rgba(232, 75, 75, 0.2)'
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Output handle - Her style coral accent */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#E84B4B',
          border: '2px solid rgba(232, 75, 75, 0.8)',
          width: '16px',
          height: '16px',
          boxShadow: '0 4px 16px rgba(232, 75, 75, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
        }}
        className="hover:!scale-110"
      />
    </motion.div>
  );
}
