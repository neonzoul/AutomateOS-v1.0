'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MainHeaderProps {
  onRun?: () => void;
  onExport?: () => void;
  isRunning?: boolean;
}

export function MainHeader({ onExport }: MainHeaderProps) {
  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        zIndex: 9999,
        background: '#E63946',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        {/* Logo Section */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* DNA Ribbon Logo */}
          <div style={{
            width: '81.2px',
            height: '24.93px',
            position: 'relative'
          }}>
            <Image
              src="/assets/ribbon_logo.svg"
              alt="AutomateOS Logo"
              width={81.2}
              height={24.93}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* AutomateOS Text */}
          <span
            style={{
              fontFamily: 'Helvetica',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '28.49px',
              lineHeight: '33px',
              display: 'flex',
              alignItems: 'center',
              color: '#FEE7DB',
            }}
          >
            AutomateOS
          </span>
        </motion.div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px',
            gap: '8px',
          }}
        >
          {/* Download Button */}
          <motion.button
            onClick={onExport}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px 40px',
              gap: '4px',
              width: '150px',
              height: '52px',
              border: '2px solid #FFFFFF',
              borderRadius: '12px',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'center',
              color: '#FFFFFF',
            }}>
              Download
            </span>
          </motion.button>

          {/* Share Button */}
          <motion.button
            onClick={() => console.log('Share')}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px 40px',
              gap: '4px',
              width: '150px',
              height: '52px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '24px',
              textAlign: 'center',
              color: '#E63946',
            }}>
              Share
            </span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
