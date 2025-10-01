import React, { useState } from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentNodeData {
  label?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  isCollapsed?: boolean;
  config?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    memory?: {
      type?: 'buffer' | 'summary' | 'vector';
      config?: Record<string, unknown>;
    };
    tools?: Array<{
      name: string;
      type: string;
      config?: Record<string, unknown>;
    }>;
  };
}

interface AgentNodeProps {
  id: string;
  data?: AgentNodeData;
}

export default function AgentNode({ data, id }: AgentNodeProps) {
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);
  const updateNodeConfig = useBuilderStore((s) => s.updateNodeConfig);
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');

  // Local collapsed state (sync with data.isCollapsed)
  const [isCollapsed, setIsCollapsed] = useState(data?.isCollapsed ?? false);

  const getStatusColor = () => {
    switch (status) {
      case 'running': return '#FFD93D';
      case 'succeeded': return '#00DFA2';
      case 'failed': return '#E84B4B';
      default: return '#9E9E9E';
    }
  };

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    // Persist to state
    updateNodeConfig(id, { isCollapsed: newCollapsed });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Main Agent Capsule */}
      <motion.div
        data-id="agent-node"
        data-node-id={id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          scale: 1.02,
          filter: 'brightness(1.05)',
          transition: { duration: 0.2 }
        }}
        style={{
          minWidth: '220px',
          height: '70px',
          position: 'relative',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 245, 0.98) 100%)',
          borderRadius: '35px',
          border: isSelected ? '3px solid #E63946' : '2px solid rgba(29, 53, 87, 0.15)',
          boxShadow: `
            0 8px 24px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -2px 6px rgba(0, 0, 0, 0.05)
          `,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
        }}
      >
        {/* Status dot */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
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

        {/* Robot Icon */}
        <div style={{ flexShrink: 0 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="10" width="12" height="10" rx="2" fill="#1D3557" />
            <rect x="6" y="6" width="12" height="4" rx="1" fill="#1D3557" />
            <circle cx="10" cy="14" r="1.5" fill="white" />
            <circle cx="14" cy="14" r="1.5" fill="white" />
            <rect x="9" y="17" width="6" height="1" rx="0.5" fill="white" />
            <rect x="11" y="4" width="2" height="2" rx="1" fill="#1D3557" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: '#0D0D0D',
            flex: 1,
          }}
        >
          {data?.label || 'AI Agent'}
        </div>

        {/* Toggle Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(158, 158, 158, 0.2)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="#1D3557"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

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

        {/* Output Handle - Right */}
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          style={{
            background: '#00D98E',
            border: '2px solid #FFFFFF',
            width: '12px',
            height: '12px',
            boxShadow: '0 2px 8px rgba(0, 217, 142, 0.5), 0 0 12px rgba(0, 217, 142, 0.4)',
            right: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      </motion.div>

      {/* Sub-nodes (Collapsed/Expanded) */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
            }}
          >
            {/* Chat Model Sub-node */}
            <SubNode
              icon={<ChatModelIcon />}
              label="Chat Model"
              sublabel={data?.config?.model || 'GPT-4'}
            />

            {/* Memory Sub-node */}
            <SubNode
              icon={<MemoryIcon />}
              label="Memory"
              sublabel={data?.config?.memory?.type || 'Buffer'}
            />

            {/* Tool Sub-node */}
            <SubNode
              icon={<ToolIcon />}
              label="Tool"
              sublabel={data?.config?.tools?.[0]?.name || 'None'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Lines (when expanded) */}
      {!isCollapsed && (
        <svg
          style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '24px',
            pointerEvents: 'none',
          }}
          viewBox="0 0 280 24"
        >
          {/* Line to Chat Model */}
          <path
            d="M 140 0 L 60 24"
            stroke="rgba(147, 51, 234, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          {/* Line to Memory */}
          <path
            d="M 140 0 L 140 24"
            stroke="rgba(147, 51, 234, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          {/* Line to Tool */}
          <path
            d="M 140 0 L 220 24"
            stroke="rgba(147, 51, 234, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>
      )}
    </div>
  );
}

// Sub-node Component
interface SubNodeProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}

function SubNode({ icon, label, sublabel }: SubNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '80px',
        background: '#FFFFFF',
        border: '1px solid rgba(29, 53, 87, 0.1)',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <div style={{ width: '24px', height: '24px' }}>{icon}</div>

      {/* Label */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: '#1D3557',
          textAlign: 'center',
        }}
      >
        {label}
      </div>

      {/* Sublabel */}
      <div
        style={{
          fontSize: '9px',
          fontWeight: 400,
          color: '#9E9E9E',
          textAlign: 'center',
        }}
      >
        {sublabel}
      </div>

      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          bottom: '-8px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: '#1D3557',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        +
      </motion.button>

      {/* Connection Point (Diamond) */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          width: '8px',
          height: '8px',
          background: 'rgba(147, 51, 234, 0.5)',
          transform: 'rotate(45deg)',
          border: '1px solid rgba(147, 51, 234, 0.8)',
        }}
      />
    </motion.div>
  );
}

// Icon Components
function ChatModelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#1D3557" strokeWidth="2" fill="none" />
      <path d="M8 10h8M8 14h6" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="7" width="14" height="10" rx="2" stroke="#1D3557" strokeWidth="2" fill="none" />
      <line x1="9" y1="11" x2="15" y2="11" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="14" x2="15" y2="14" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10L14 14M14 10L10 14" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" stroke="#1D3557" strokeWidth="2" fill="none" />
    </svg>
  );
}
