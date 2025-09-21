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
        relative cursor-pointer transition-all duration-500 ease-out
        ${isSelected
          ? 'scale-105'
          : 'hover:scale-102'
        }
      `}
      style={{
        background: 'linear-gradient(135deg, #A29BFE 0%, #B8B5FF 30%, #D1CEFF 100%)',
        borderRadius: '32px',
        padding: '24px 32px',
        minWidth: '260px',
        border: isSelected ? '3px solid rgba(255,255,255,0.6)' : '2px solid rgba(255,255,255,0.3)',
        boxShadow: isSelected
          ? '0 20px 60px rgba(162,155,254,0.4), 0 8px 24px rgba(162,155,254,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 12px 32px rgba(162,155,254,0.25), 0 4px 12px rgba(162,155,254,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
      }}
      variants={nodeEntranceVariants}
      initial="initial"
      animate="animate"
      whileHover={subtleHover}
      whileTap={pressEffect}
      tabIndex={0}
    >
      {/* Organic status indicator - Her style */}
      <div
        className={`absolute top-4 left-4 w-4 h-4 rounded-full ${status === 'running' ? 'animate-pulse' : ''}`}
        style={{
          background: status === 'running' ? '#FFD93D' :
                     status === 'succeeded' ? '#00DFA2' :
                     status === 'failed' ? '#FF6B6B' : 'rgba(255,255,255,0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
      />

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span
            style={{
              background: method === 'GET' ? '#00DFA2' :
                         method === 'POST' ? '#FF6B6B' :
                         method === 'PUT' ? '#FFD93D' :
                         method === 'DELETE' ? '#FF6B6B' : '#A29BFE',
              color: 'rgba(255,255,255,0.95)',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '20px',
              minWidth: '64px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              letterSpacing: '0.5px'
            }}
          >
            {method}
          </span>
          <div
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '22px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🌐 {data?.label ?? 'API Request'}
          </div>
        </div>

        <div className="space-y-3 mt-3">
          <div
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '15px',
              fontWeight: '500',
              lineHeight: '1.4'
            }}
          >
            {url ? (
              <span
                className="font-mono truncate block"
                title={url}
                style={{
                  fontSize: '13px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                {url}
              </span>
            ) : (
              <span
                className="italic"
                style={{
                  color: 'rgba(255,255,255,0.65)'
                }}
              >
                Configure request URL
              </span>
            )}
          </div>

          {status !== 'idle' && (
            <div
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '14px',
                textTransform: 'capitalize',
                marginTop: '8px'
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Input and output handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: '2px solid rgba(255,255,255,0.6)',
          width: '14px',
          height: '14px',
          boxShadow: '0 4px 12px rgba(162,155,254,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
          transition: 'all 0.3s ease'
        }}
        className="hover:!scale-110"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'rgba(255,255,255,0.9)',
          border: '2px solid rgba(255,255,255,0.6)',
          width: '14px',
          height: '14px',
          boxShadow: '0 4px 12px rgba(162,155,254,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
          transition: 'all 0.3s ease'
        }}
        className="hover:!scale-110"
      />
    </motion.div>
  );
}
