import React from 'react';
import { useBuilderStore } from '../../../core/state';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { nodeEntranceVariants, subtleHover, pressEffect } from '../../../components/ui/motion';

type HttpNodeData = {
  label?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  config?: { method?: string; url?: string };
};

interface HttpNodeProps {
  id: string;
  data?: HttpNodeData;
}

// Icon components - Use existing logos from AppNodeToolbar
const SlackIcon = () => (
  <svg width="40" height="40" viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
    <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
    <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z" fill="#36C5F0"/>
    <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="#2EB67D"/>
    <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E"/>
  </svg>
);

const NotionIcon = () => (
  <svg width="40" height="40" viewBox="0 0 59.9 62.6" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFFFFF" d="M3.8,2.7l34.6-2.6c4.2-0.4,5.3-0.1,8,1.8l11.1,7.8c1.8,1.3,2.4,1.7,2.4,3.2v42.7c0,2.7-1,4.3-4.4,4.5 l-40.2,2.4c-2.6,0.1-3.8-0.2-5.1-1.9L2.1,50.1c-1.5-2-2.1-3.4-2.1-5.1V7C0,4.8,1,2.9,3.8,2.7L3.8,2.7z M3.8,2.7"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M38.4,0.1L3.8,2.7C1,2.9,0,4.8,0,7v38c0,1.7,0.6,3.2,2.1,5.1l8.1,10.6c1.3,1.7,2.6,2.1,5.1,1.9l40.2-2.4 c3.4-0.2,4.4-1.8,4.4-4.5V12.9c0-1.4-0.5-1.8-2.2-3c-0.1-0.1-0.2-0.1-0.3-0.2L46.4,2C43.8,0,42.7-0.2,38.4,0.1L38.4,0.1z M16.2,12.2c-3.3,0.2-4,0.3-5.9-1.3L5.6,7.2C5.1,6.7,5.3,6.1,6.6,6l33.3-2.4c2.8-0.2,4.2,0.7,5.3,1.6l5.7,4.1 c0.3,0.1,0.9,0.8,0.1,0.8l-34.4,2.1L16.2,12.2z M12.4,55.3V19c0-1.6,0.5-2.3,1.9-2.4l39.5-2.3c1.3-0.1,1.9,0.7,1.9,2.3v36 c0,1.6-0.3,2.9-2.4,3l-37.8,2.2C13.4,58,12.4,57.2,12.4,55.3L12.4,55.3z M49.7,21c0.2,1.1,0,2.2-1.1,2.3l-1.8,0.4v26.8 c-1.6,0.9-3,1.3-4.2,1.3c-1.9,0-2.4-0.6-3.9-2.4L26.7,30.6v18.1l3.8,0.9c0,0,0,2.2-3,2.2l-8.4,0.5c-0.2-0.5,0-1.7,0.8-1.9l2.2-0.6 v-24l-3-0.3c-0.2-1.1,0.4-2.7,2.1-2.8l9-0.6l12.4,19V24.3l-3.2-0.4c-0.2-1.3,0.7-2.3,1.9-2.4L49.7,21z M49.7,21"/>
  </svg>
);

const HttpIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#FFFFFF"/>
  </svg>
);

export default function HttpNode({ data, id }: HttpNodeProps) {
  const method = data?.config?.method ?? 'GET';
  const url = data?.config?.url ?? '';
  const status = useBuilderStore((s) => s.nodeRunStatuses[id] ?? 'idle');
  const isSelected = useBuilderStore((s) => s.selectedNodeId === id);

  // Determine app type for theming
  const getAppType = (): 'slack' | 'notion' | 'http' => {
    // Check explicit icon property first
    if (data?.icon === 'slack') return 'slack';
    if (data?.icon === 'notion') return 'notion';
    if (data?.icon === 'http') return 'http';

    // Auto-detect from label or URL
    const label = (data?.label || '').toLowerCase();
    const urlLower = url.toLowerCase();

    if (label.includes('slack') || urlLower.includes('slack')) {
      return 'slack';
    }
    if (label.includes('notion') || urlLower.includes('notion')) {
      return 'notion';
    }

    return 'http';
  };

  const appType = getAppType();

  // Get theme colors based on app type
  const getTheme = () => {
    switch (appType) {
      case 'slack':
        return {
          background: '#FFF9E6', // Light yellow/cream for Slack
          border: '#E01E5A',
          iconBg: '#4A154B',
          tagColors: ['#E01E5A', '#36C5F0', '#2EB67D']
        };
      case 'notion':
        return {
          background: '#F7F6F3', // Light beige for Notion
          border: '#000000',
          iconBg: '#FFFFFF',
          tagColors: ['#000000', '#787774', '#9B9A97']
        };
      case 'http':
      default:
        return {
          background: '#FFFFFF', // White for default
          border: '#E8E8E8',
          iconBg: '#1D3557',
          tagColors: ['#7949FF', '#494FFF', '#FF494C']
        };
    }
  };

  const theme = getTheme();

  // Determine which icon to show
  const getIcon = () => {
    if (appType === 'slack') return <SlackIcon />;
    if (appType === 'notion') return <NotionIcon />;

    // If custom icon string (emoji), render as text
    if (data?.icon && appType === 'http') {
      return <span style={{ fontSize: '32px' }}>{data.icon}</span>;
    }

    return <HttpIcon />;
  };

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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -4,
        boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2 }
      }}
      style={{
        width: '380px',
        minHeight: '420px',
        background: theme.background,
        border: isSelected ? `2px solid #E63946` : `2px solid ${theme.border}`,
        borderRadius: '4px',
        padding: '24px',
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Status indicator dot */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: status === 'running' ? '#FFD93D' :
                     status === 'succeeded' ? '#00DFA2' :
                     status === 'failed' ? '#E84B4B' : '#E84B4B',
          boxShadow: `0 2px 8px ${status === 'running' ? 'rgba(255, 217, 61, 0.4)' : 'rgba(232, 75, 75, 0.4)'}`,
        }}
      />

      {/* Header with Icon and Title - Horizontal */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* App Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: theme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${appType === 'notion' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(29, 53, 87, 0.25)'}`,
          border: appType === 'notion' ? '1px solid #E8E8E8' : 'none',
        }}>
          {getIcon()}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          fontWeight: 600,
          fontSize: '30.8px',
          color: '#1a1a1a',
          flex: 1,
          lineHeight: '1.3',
          letterSpacing: '-0.02em'
        }}>
          {data?.label ?? 'HTTP Request'}
        </div>
      </div>

      {/* Description - Left aligned */}
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '22.4px',
        fontWeight: 400,
        lineHeight: '1.6',
        color: '#666666',
        marginBottom: 'auto',
        textAlign: 'left',
        flex: 1
      }}>
        {data?.description ?? 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.'}
      </div>

      {/* Tags - Bottom left */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: '20px'
      }}>
        {(data?.tags ?? ['Tag', 'Tag', 'Tag']).map((tag, index) => {
          return (
            <div
              key={index}
              style={{
                background: theme.tagColors[index % theme.tagColors.length],
                borderRadius: '6px',
                padding: '6px 14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                color: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {tag}
            </div>
          );
        })}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '14px',
          height: '14px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.3)',
          left: '-7px'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#E84B4B',
          border: '2px solid #FFFFFF',
          width: '14px',
          height: '14px',
          boxShadow: '0 2px 8px rgba(232, 75, 75, 0.3)',
          right: '-7px'
        }}
      />
    </motion.div>
  );
}
