'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const chatSectionRef = useRef<HTMLDivElement>(null);

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'auto', scrollBehavior: 'smooth' }}>
      {/* Hero Section */}
      <section
        style={{
          width: '100%',
          minHeight: '100vh',
          background: '#E63946',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 150px',
          position: 'relative',
        }}
      >
        {/* Ribbon Logo Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: '326px',
            height: '102px',
            marginBottom: '32px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Helvetica, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          🎀 AutomateOS
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontFamily: 'Helvetica, sans-serif',
            fontWeight: 700,
            fontSize: '130px',
            lineHeight: '149px',
            color: '#FFFFFF',
            marginBottom: '32px',
            maxWidth: '1000px',
          }}
        >
          AutomateOS Canvas Builder
        </motion.h1>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '32px',
          }}
        >
          {/* Builder Button */}
          <Link href="/builder" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '18px 50px',
                width: '257px',
                height: '74px',
                background: '#FAFAFA',
                borderRadius: '48px',
                border: 'none',
                cursor: 'pointer',
                filter: 'drop-shadow(0px 64px 96px rgba(0, 0, 0, 0.2))',
                transition: 'all 0.3s ease',
              }}
            >
              <span
                style={{
                  fontFamily: 'Helvetica, sans-serif',
                  fontWeight: 700,
                  fontSize: '32px',
                  color: '#E63946',
                }}
              >
                Builder
              </span>
            </motion.button>
          </Link>

          {/* Samantha Button */}
          <motion.button
            onClick={scrollToChat}
            whileHover={{ scale: 1.05, boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '18px 50px',
              width: '250px',
              height: '74px',
              background: '#FAFAFA',
              borderRadius: '48px',
              border: 'none',
              cursor: 'pointer',
              filter: 'drop-shadow(0px 64px 96px rgba(0, 0, 0, 0.2))',
              transition: 'all 0.3s ease',
            }}
          >
            <span
              style={{
                fontFamily: 'Helvetica, sans-serif',
                fontWeight: 700,
                fontSize: '32px',
                color: '#E63946',
              }}
            >
              Samantha
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* Samantha Chat Section */}
      <section
        ref={chatSectionRef}
        style={{
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F0F0F0 0%, #E8E8E8 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          position: 'relative',
        }}
      >
        {/* Watermark Ribbon */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '180px',
            fontWeight: 700,
            color: 'rgba(230, 57, 70, 0.05)',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'Helvetica, sans-serif',
          }}
        >
          🎀 Samantha
        </div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            maxWidth: '800px',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingBottom: '20px',
              borderBottom: '1px solid #E8E8E8',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🤖
            </div>
            <div>
              <h3
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#1D1D1F',
                  margin: 0,
                }}
              >
                Samantha
              </h3>
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  color: '#86868B',
                  margin: 0,
                }}
              >
                AI Assistant
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
            {/* Incoming Message */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                alignSelf: 'flex-start',
                maxWidth: '70%',
              }}
            >
              <div
                style={{
                  background: '#E9E9EB',
                  borderRadius: '18px',
                  padding: '12px 16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#1D1D1F',
                }}
              >
                Hi! I'm Samantha, your AI assistant. How can I help you automate your workflows today?
              </div>
              <span
                style={{
                  display: 'block',
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#86868B',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
              >
                Today 10:25 AM
              </span>
            </motion.div>

            {/* Outgoing Message (Example) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '70%',
              }}
            >
              <div
                style={{
                  background: '#007AFF',
                  borderRadius: '18px',
                  padding: '12px 16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#FFFFFF',
                }}
              >
                I need help creating a workflow that connects Notion and Slack
              </div>
            </motion.div>

            {/* Incoming Response */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              style={{
                alignSelf: 'flex-start',
                maxWidth: '70%',
              }}
            >
              <div
                style={{
                  background: '#E9E9EB',
                  borderRadius: '18px',
                  padding: '12px 16px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#1D1D1F',
                }}
              >
                I can help you with that! Let's create a workflow that automatically sends Slack notifications when you create a new Notion page. Would you like me to set that up in the Builder?
              </div>
            </motion.div>
          </div>

          {/* Input Box */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #E8E8E8',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Message Samantha..."
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '20px',
                border: '1px solid #D1D1D6',
                background: '#F2F2F7',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '16px',
                color: '#1D1D1F',
                outline: 'none',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#007AFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              ↑
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
