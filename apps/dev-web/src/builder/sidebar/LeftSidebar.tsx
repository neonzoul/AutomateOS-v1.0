'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TemplateCardProps {
  title: string;
  description: string;
}

function TemplateCard({ title, description }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      style={{
        width: '310px',
        height: '122px',
        background: '#FFFFFF',
        borderRadius: '10px',
        padding: '14px 16px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Title and Description */}
      <div style={{ marginBottom: '8px' }}>
        <h3 style={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: '17px',
          color: '#1D3557',
          marginBottom: '6px'
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '8px',
          lineHeight: '10px',
          color: '#1D3557',
          opacity: 0.6,
          margin: 0,
          maxWidth: '125px'
        }}>
          {description}
        </p>
      </div>

      {/* Preview Area - Coral background with mini workflow */}
      <div style={{
        position: 'absolute',
        width: '149px',
        height: '94px',
        right: '14px',
        top: '14px',
        background: '#E63946',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Mini workflow preview - simplified mini nodes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px'
        }}>
          {/* Chat node */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '2.5px',
            padding: '4px 6px',
            border: '0.125px solid #1D3557',
            boxShadow: '0.625px 0.625px 1.25px -0.5px rgba(23, 25, 26, 0.1)',
            fontSize: '9px',
            fontWeight: 600,
            color: '#0D0D0D',
            minWidth: '32px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            💬
          </div>

          {/* Arrow */}
          <div style={{
            width: '8px',
            height: '1px',
            background: 'rgba(255, 255, 255, 0.8)'
          }} />

          {/* Agent node */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            border: '0.125px solid #1D3557',
            boxShadow: '0.625px 0.625px 1.25px -0.5px rgba(23, 25, 26, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px'
          }}>
            🤖
          </div>

          {/* Arrow */}
          <div style={{
            width: '8px',
            height: '1px',
            background: 'rgba(255, 255, 255, 0.8)'
          }} />

          {/* Send to Slack node */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '2.5px',
            padding: '4px 6px',
            border: '0.125px solid #1D3557',
            boxShadow: '0.625px 0.625px 1.25px -0.5px rgba(23, 25, 26, 0.1)',
            fontSize: '9px',
            fontWeight: 600,
            color: '#0D0D0D',
            minWidth: '32px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📤
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface AgentCardProps {
  title: string;
}

function AgentCard({ title }: AgentCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      style={{
        width: '150px',
        height: '149px',
        background: '#FFFFFF',
        borderRadius: '10px',
        padding: '14px 10px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Title */}
      <h3 style={{
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '17px',
        color: '#1D3557',
        marginBottom: '14px'
      }}>
        {title}
      </h3>

      {/* Workflow Preview - Coral background with vertical steps */}
      <div style={{
        width: '130px',
        height: '94px',
        background: '#E63946',
        borderRadius: '10px',
        padding: '15px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        {/* Step 1: Record audio */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '8px',
            fontWeight: 600,
            color: '#0D0D0D',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontSize: '10px' }}>🎙️</span>
            <span>Record audio</span>
          </div>
          {/* Connector line */}
          <div style={{
            width: '1px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.6)'
          }} />
        </div>

        {/* Step 2: Transcribe audio */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '8px',
            fontWeight: 600,
            color: '#0D0D0D',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontSize: '10px' }}>🎵</span>
            <span>Transcribe audio</span>
          </div>
          {/* Connector line */}
          <div style={{
            width: '1px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.6)'
          }} />
        </div>

        {/* Step 3: Summarize text */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          padding: '4px 10px',
          fontSize: '8px',
          fontWeight: 600,
          color: '#0D0D0D',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '10px' }}>📝</span>
          <span>Summarize text</span>
        </div>
      </div>
    </motion.div>
  );
}

export function LeftSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        width: '350px',
        height: '100%',
        background: '#1D1C1D',
        boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.15)',
        padding: '20px',
        color: 'white',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* Sample Template Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ marginBottom: '30px' }}
      >
        <h2 style={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '28px',
          lineHeight: '34px',
          color: '#FFFFFF',
          marginBottom: '20px'
        }}>
          Sample Template
        </h2>

        <TemplateCard
          title="AI Workflow Demo"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        style={{
          width: '330px',
          height: '1px',
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '10px',
          marginLeft: '-10px',
          marginBottom: '30px',
          transformOrigin: 'left'
        }}
      />

      {/* Agents Store Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <h2 style={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: 600,
          fontSize: '28px',
          lineHeight: '34px',
          color: '#FFFFFF',
          marginBottom: '20px'
        }}>
          Agents Store
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          <AgentCard title="Flow1" />
          <AgentCard title="Flow2" />
        </div>
      </motion.div>
    </motion.div>
  );
}
