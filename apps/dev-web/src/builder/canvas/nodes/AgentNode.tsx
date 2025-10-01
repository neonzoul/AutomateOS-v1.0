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
          minWidth: '420px',
          height: '140px',
          position: 'relative',
          cursor: 'pointer',
          background: `
            linear-gradient(135deg,
              rgba(255, 158, 64, 0.95) 0%,
              rgba(255, 102, 196, 0.95) 25%,
              rgba(168, 85, 247, 0.95) 50%,
              rgba(99, 102, 241, 0.95) 75%,
              rgba(59, 130, 246, 0.95) 100%)
          `,
          borderRadius: '70px',
          border: isSelected ? '4px solid #E63946' : '3px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 12px 48px rgba(168, 85, 247, 0.4),
            0 0 80px rgba(255, 102, 196, 0.3),
            inset 0 3px 0 rgba(255, 255, 255, 0.5),
            inset 0 -4px 15px rgba(0, 0, 0, 0.2)
          `,
          display: 'flex',
          alignItems: 'center',
          padding: '0 36px',
          gap: '24px',
        }}
      >
        {/* Status dot */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: getStatusColor(),
            boxShadow: `
              0 0 12px ${getStatusColor()},
              0 0 18px ${getStatusColor()}80,
              inset 0 1px 3px rgba(255, 255, 255, 0.5)
            `,
            border: '2px solid rgba(255, 255, 255, 0.6)',
          }}
        />

        {/* Robot Icon */}
        <div style={{ flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="10" width="12" height="10" rx="2" fill="white" />
            <rect x="6" y="6" width="12" height="4" rx="1" fill="white" />
            <circle cx="10" cy="14" r="1.5" fill="#6366f1" />
            <circle cx="14" cy="14" r="1.5" fill="#6366f1" />
            <rect x="9" y="17" width="6" height="1" rx="0.5" fill="#6366f1" />
            <rect x="11" y="4" width="2" height="2" rx="1" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
            fontWeight: 700,
            fontSize: '32px',
            color: '#FFFFFF',
            textShadow: '0 3px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
            flex: 1,
            letterSpacing: '0.5px',
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
          whileHover={{ scale: 1.1, boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)' }}
          whileTap={{ scale: 0.9 }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            backdropFilter: 'blur(8px)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="#FFFFFF"
              strokeWidth="2.5"
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
              marginTop: '48px',
              display: 'flex',
              gap: '32px',
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
            top: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '480px',
            height: '48px',
            pointerEvents: 'none',
          }}
          viewBox="0 0 480 48"
        >
          {/* Line to Chat Model */}
          <path
            d="M 240 0 L 105 48"
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="3"
            fill="none"
          />
          {/* Line to Memory */}
          <path
            d="M 240 0 L 240 48"
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="3"
            fill="none"
          />
          {/* Line to Tool */}
          <path
            d="M 240 0 L 375 48"
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="3"
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
        width: '90px',
        background: '#FFFFFF',
        border: '2px solid rgba(52, 152, 219, 0.2)',
        borderRadius: '12px',
        padding: '12px 8px',
        boxShadow: `
          0 4px 12px rgba(41, 128, 185, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <div style={{ width: '28px', height: '28px' }}>{icon}</div>

      {/* Label */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#2980b9',
          textAlign: 'center',
        }}
      >
        {label}
      </div>

      {/* Sublabel */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 400,
          color: '#7f8c8d',
          textAlign: 'center',
        }}
      >
        {sublabel}
      </div>

      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.15, boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)' }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute',
          bottom: '-10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#3498db',
          border: '2px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          color: '#FFFFFF',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(52, 152, 219, 0.4)',
        }}
      >
        +
      </motion.button>

      {/* Connection Point (Circle) */}
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          width: '12px',
          height: '12px',
          background: '#3498db',
          borderRadius: '50%',
          border: '2px solid #FFFFFF',
          boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)',
        }}
      />
    </motion.div>
  );
}

// Icon Components
function ChatModelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#3498db" strokeWidth="2" fill="none" />
      <path d="M8 10h8M8 14h6" stroke="#3498db" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="7" width="14" height="10" rx="2" stroke="#3498db" strokeWidth="2" fill="none" />
      <line x1="9" y1="11" x2="15" y2="11" stroke="#3498db" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="14" x2="15" y2="14" stroke="#3498db" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10L14 14M14 10L10 14" stroke="#3498db" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" stroke="#3498db" strokeWidth="2" fill="none" />
    </svg>
  );
}
