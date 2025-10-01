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
      text: 'สวัสดีค่ะ! มีอะไรให้ช่วยไหมคะ 😊',
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
    const currentInput = inputValue;
    setInputValue('');

    // Check if message contains task details
    const lowerInput = currentInput.toLowerCase();
    const hasTaskDetails =
      (lowerInput.includes('task') || lowerInput.includes('งาน')) &&
      (lowerInput.includes('notion') || lowerInput.includes('slack'));

    // Extract details if present
    const taskNameMatch = currentInput.match(/"([^"]+)"/);
    const assignMatch = currentInput.match(/assign[^\s]*\s+[ให้]*\s*([a-zA-Zก-๙]+)/i);
    const dateMatch = currentInput.match(/(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม))/i);

    if (hasTaskDetails && taskNameMatch && assignMatch) {
      // Detailed task request detected
      const taskName = taskNameMatch[1];
      const assignTo = assignMatch[1];
      const dueDate = dateMatch ? dateMatch[0] : 'ไม่ระบุ';

      // Processing message
      setTimeout(() => {
        const processingMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'incoming',
          text: 'เข้าใจแล้วค่ะ! กำลังดำเนินการ...\n\n✨ สร้าง Task ใน Notion\n📱 ส่งข้อความแจ้งเตือนไปยัง Slack',
        };
        setMessages((prev) => [...prev, processingMessage]);
      }, 800);

      // Success confirmation
      setTimeout(() => {
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'incoming',
          text: `เรียบร้อยแล้วค่ะ! ✅\n\nฉันได้:\n• สร้าง Task "${taskName}" ใน Notion Database แล้ว\n• Assign ให้ ${assignTo}\n• กำหนดวันที่: ${dueDate}\n• ส่งข้อความแจ้งเตือนไปยัง ${assignTo} ทาง Slack เรียบร้อยแล้ว\n\nมีอะไรให้ช่วยอีกไหมคะ? 😊`,
        };
        setMessages((prev) => [...prev, successMessage]);
      }, 2500);
    } else if (hasTaskDetails) {
      // Task mentioned but missing details
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'incoming',
          text: 'เข้าใจแล้วค่ะ! เพื่อให้ฉันสร้าง Task ใน Notion และส่งข้อความไปยัง Slack ได้\n\nโปรดระบุรายละเอียดเพิ่มเติม:\n• ชื่อ Task (ใส่ใน "...")\n• Assign ให้ใคร\n• วันที่กำหนด (ถ้ามี)\n\nตัวอย่าง: ช่วยเพิ่ม Task "Review Q4 Budget" ไปให้ใน Notion, assign ให้ Sarah, วันที่ 15 Oct แล้วส่งข้อความไปหา Sarah ใน Slack ให้ด้วย',
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 1000);
    } else {
      // Generic response
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'incoming',
          text: 'ฉันสามารถช่วยคุณสร้าง workflow automation ได้นะคะ\n\nลองพิมพ์: "ช่วยเพิ่ม Task ไปให้ใน Notion แล้วส่งข้อความไปหา Slack ให้ด้วย" เพื่อดูตัวอย่างการทำงาน 😊',
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick response buttons
  const handleQuickResponse = () => {
    setInputValue('ช่วยเพิ่ม Task "Review Q4 Budget" ไปให้ใน Notion, assign ให้ Sarah, วันที่ 15 Oct แล้วส่งข้อความไปหา Sarah ใน Slack ให้ด้วย');
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
                  initial={{ opacity: 0, x: message.type === 'incoming' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    alignSelf: message.type === 'incoming' ? 'flex-start' : 'flex-end',
                    maxWidth: '70%',
                  }}
                >
                  <div
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
                  </div>
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

          {/* Quick Response Suggestion */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#F2F2F7',
                borderRadius: '12px',
                border: '1px dashed #D1D1D6',
              }}
            >
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  color: '#86868B',
                  margin: '0 0 8px 0',
                }}
              >
                💡 ลองตัวอย่างคำสั่ง:
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQuickResponse}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D1D6',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  color: '#007AFF',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                ช่วยเพิ่ม Task ไปให้ใน Notion แล้วส่งข้อความไปหา Slack ให้ด้วย
              </motion.button>
            </motion.div>
          )}

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
