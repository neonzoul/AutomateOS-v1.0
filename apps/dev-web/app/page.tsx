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
  const chatMessagesRef = useRef<HTMLDivElement>(null);
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

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
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
    setTimeout(scrollToBottom, 100);

    // Mock response - always shows workflow automation result
    // Acknowledgment
    setTimeout(() => {
      const ackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'incoming',
        text: 'I can help you with that.',
      };
      setMessages((prev) => [...prev, ackMessage]);
      setTimeout(scrollToBottom, 100);
    }, 600);

    // Processing
    setTimeout(() => {
      const processingMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'incoming',
        text: 'Creating task in Notion and sending notification to Slack...',
      };
      setMessages((prev) => [...prev, processingMessage]);
      setTimeout(scrollToBottom, 100);
    }, 1400);

    // Success confirmation
    setTimeout(() => {
      const successMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'incoming',
        text: 'Done. I\'ve created a task "Review Q4 Budget" in your Notion database, assigned it to Sarah with a due date of October 15th, and sent her a notification via Slack.',
      };
      setMessages((prev) => [...prev, successMessage]);
      setTimeout(scrollToBottom, 100);
    }, 2800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'auto',
        scrollBehavior: 'smooth',
      }}
    >
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
            marginBottom: '16px',
            maxWidth: '1000px',
          }}
        >
          AutomateOS
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontFamily: 'Helvetica, sans-serif',
            fontWeight: 400,
            fontSize: '36px',
            lineHeight: '1.4',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '32px',
          }}
        >
          Your Agent OS
        </motion.p>

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
              whileHover={{
                scale: 1.05,
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
              }}
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
            whileHover={{
              scale: 1.05,
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            }}
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
          background: '#1D1D1F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
        }}
      >
        {/* Chat Container - Centered Content */}
        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Minimal Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              paddingBottom: '20px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
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
            <h3
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontWeight: 500,
                fontSize: '18px',
                color: '#ECECF1',
                margin: 0,
              }}
            >
              Samantha
            </h3>
          </motion.div>

          {/* Chat Messages - Centered like GPT */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxHeight: '500px',
              overflowY: 'auto',
              paddingRight: '12px',
            }}
            className="chat-messages-container"
            ref={chatMessagesRef}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '520px',
                    alignSelf:
                      message.type === 'incoming' ? 'flex-start' : 'flex-end',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {message.type === 'incoming' ? (
                    <>
                      {/* Samantha Message - Left Side */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background:
                              'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            flexShrink: 0,
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
                        <span
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#ECECF1',
                          }}
                        >
                          Samantha
                        </span>
                        {message.timestamp && (
                          <span
                            style={{
                              fontFamily:
                                '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              fontSize: '16px',
                              color: '#565869',
                            }}
                          >
                            {message.timestamp}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          paddingLeft: '32px',
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '20px',
                          lineHeight: '1.6',
                          color: '#ECECF1',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {message.text}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* User Message - Right Side */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <span
                          style={{
                            fontFamily:
                              '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#8E8EA0',
                          }}
                        >
                          You
                        </span>
                      </div>
                      <div
                        style={{
                          background: '#2D2D30',
                          borderRadius: '16px',
                          padding: '16px 20px',
                          textAlign: 'left',
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '20px',
                          lineHeight: '1.6',
                          color: '#ECECF1',
                          whiteSpace: 'pre-wrap',
                          border: '1px solid #3E3E42',
                        }}
                      >
                        {message.text}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Input Box - Centered at Bottom like GPT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              width: '100%',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              paddingTop: '20px',
            }}
          >
            {/* Left Icons */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              {/* Camera Icon */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#8E8EA0', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#ECECF1')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#8E8EA0')
                  }
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </motion.button>

              {/* Image/Attach Icon */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#8E8EA0', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#ECECF1')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#8E8EA0')
                  }
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </motion.button>

              {/* Microphone Icon */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#8E8EA0', transition: 'color 0.2s ease' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#ECECF1')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#8E8EA0')
                  }
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </motion.button>
            </div>

            {/* Input Box */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
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
                  width: '100%',
                  padding: '16px 60px 16px 20px',
                  borderRadius: '12px',
                  border: '1px solid #40414F',
                  background: '#40414F',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '20px',
                  color: '#ECECF1',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.background = '#4A4B5F';
                  e.target.style.borderColor = '#565869';
                }}
                onBlur={(e) => {
                  e.target.style.background = '#40414F';
                  e.target.style.borderColor = '#40414F';
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                style={{
                  position: 'absolute',
                  right: '12px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: inputValue.trim() ? '#ECECF1' : '#565869',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '18px',
                  color: inputValue.trim() ? '#1D1D1F' : '#8E8EA0',
                  transition: 'all 0.2s ease',
                }}
              >
                ↑
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
