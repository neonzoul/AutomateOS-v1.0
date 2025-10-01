'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'incoming' | 'outgoing';
  text: string;
  timestamp?: string;
}

export default function Home() {
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'incoming',
      text: 'Hello. How can I help you?',
      timestamp: 'Today 10:25 AM',
    },
  ]);

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'outgoing',
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Mock response - always shows workflow automation result
    // Acknowledgment
    setTimeout(() => {
      const ackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'incoming',
        text: 'I can help you with that.',
      };
      setMessages((prev) => [...prev, ackMessage]);
    }, 600);

    // Processing
    setTimeout(() => {
      const processingMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'incoming',
        text: 'Creating task in Notion and sending notification to Slack...',
      };
      setMessages((prev) => [...prev, processingMessage]);
    }, 1400);

    // Success confirmation
    setTimeout(() => {
      const successMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'incoming',
        text: 'Done. I\'ve created a task "Review Q4 Budget" in your Notion database, assigned it to Sarah with a due date of October 15th, and sent her a notification via Slack.',
      };
      setMessages((prev) => [...prev, successMessage]);
    }, 2800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
        {/* Ribbon Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: '326px',
            height: '102px',
            marginBottom: '32px',
          }}
        >
          <img
            src="/assets/ribbon_logo.svg"
            alt="AutomateOS Ribbon Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
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
          Your Agent OS
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
        {/* Watermark Ribbon Logo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0.03,
            width: '800px',
            height: '250px',
          }}
        >
          <img
            src="/assets/ribbon_logo.svg"
            alt="Watermark"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
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
                padding: '8px',
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/ribbon_logo.svg"
                alt="Samantha"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    duration: 0.3,
                  }}
                  style={{
                    alignSelf: message.type === 'incoming' ? 'flex-start' : 'flex-end',
                    maxWidth: '70%',
                    transformOrigin: message.type === 'incoming' ? 'left bottom' : 'right bottom',
                  }}
                >
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background: message.type === 'incoming' ? '#E9E9EB' : '#007AFF',
                      borderRadius: '18px',
                      padding: '12px 16px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      color: message.type === 'incoming' ? '#1D1D1F' : '#FFFFFF',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.text}
                  </motion.div>
                  {message.timestamp && (
                    <span
                      style={{
                        display: 'block',
                        marginTop: '4px',
                        fontSize: '12px',
                        color: '#86868B',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}
                    >
                      {message.timestamp}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
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
              onClick={handleSendMessage}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: inputValue.trim() ? '#007AFF' : '#D1D1D6',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                fontSize: '20px',
                color: '#FFFFFF',
                transition: 'background 0.2s ease',
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
