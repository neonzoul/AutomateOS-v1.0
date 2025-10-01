'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AppNodeToolbarProps {
  appNodeHandlers: Record<string, (e: React.MouseEvent) => void>;
}

interface AppIconProps {
  name: string;
  iconContent: React.ReactNode;
  index: number;
  isDark?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

function AppIcon({ name, iconContent, index, isDark = false, onClick }: AppIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{
        y: -4,
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: isDark ? '#1D3557' : '#FFFFFF',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.cursor = 'grabbing';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.cursor = 'grab';
      }}
      onClick={onClick}
      title={name}
    >
      {iconContent}
    </motion.div>
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );
}

// Slack Icon Component
function SlackIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
      <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z" fill="#36C5F0"/>
      <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" fill="#2EB67D"/>
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E"/>
    </svg>
  );
}

// LINE Icon Component
function LineIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#00C300" rx="15%"/>
      <path fill="#FFF" d="M443 233c0-84-84-152-188-152S67 149 67 233c0 75 66 138 156 150 6 1 14 4 16 9 2 4 1 11 1 15v35c0 3 2 6 6 5 2-1 90-53 123-91h-1c27-30 43-63 43-123zm-265 37h-70c-3 0-6-3-6-6v-88c0-3 3-6 6-6s6 3 6 6v82h64c3 0 6 3 6 6s-3 6-6 6zm39-94v88c0 3-3 6-6 6s-6-3-6-6v-88c0-3 3-6 6-6s6 3 6 6zm101 94h-70c-3 0-6-3-6-6v-88c0-3 3-6 6-6s6 3 6 6v82h64c3 0 6 3 6 6s-3 6-6 6zm88-63l-54 63c-1 1-2 2-4 2h-1c-3 0-5-3-5-6v-88c0-3 2-6 5-6h1c2 0 3 1 4 2l54 63v-59c0-3 3-6 6-6s6 3 6 6v88c0 3-3 6-6 6s-5-2-6-5z"/>
    </svg>
  );
}

// Notion Icon Component
function NotionIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 59.9 62.6" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFFFFF" d="M3.8,2.7l34.6-2.6c4.2-0.4,5.3-0.1,8,1.8l11.1,7.8c1.8,1.3,2.4,1.7,2.4,3.2v42.7c0,2.7-1,4.3-4.4,4.5 l-40.2,2.4c-2.6,0.1-3.8-0.2-5.1-1.9L2.1,50.1c-1.5-2-2.1-3.4-2.1-5.1V7C0,4.8,1,2.9,3.8,2.7L3.8,2.7z M3.8,2.7"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M38.4,0.1L3.8,2.7C1,2.9,0,4.8,0,7v38c0,1.7,0.6,3.2,2.1,5.1l8.1,10.6c1.3,1.7,2.6,2.1,5.1,1.9l40.2-2.4 c3.4-0.2,4.4-1.8,4.4-4.5V12.9c0-1.4-0.5-1.8-2.2-3c-0.1-0.1-0.2-0.1-0.3-0.2L46.4,2C43.8,0,42.7-0.2,38.4,0.1L38.4,0.1z M16.2,12.2c-3.3,0.2-4,0.3-5.9-1.3L5.6,7.2C5.1,6.7,5.3,6.1,6.6,6l33.3-2.4c2.8-0.2,4.2,0.7,5.3,1.6l5.7,4.1 c0.3,0.1,0.9,0.8,0.1,0.8l-34.4,2.1L16.2,12.2z M12.4,55.3V19c0-1.6,0.5-2.3,1.9-2.4l39.5-2.3c1.3-0.1,1.9,0.7,1.9,2.3v36 c0,1.6-0.3,2.9-2.4,3l-37.8,2.2C13.4,58,12.4,57.2,12.4,55.3L12.4,55.3z M49.7,21c0.2,1.1,0,2.2-1.1,2.3l-1.8,0.4v26.8 c-1.6,0.9-3,1.3-4.2,1.3c-1.9,0-2.4-0.6-3.9-2.4L26.7,30.6v18.1l3.8,0.9c0,0,0,2.2-3,2.2l-8.4,0.5c-0.2-0.5,0-1.7,0.8-1.9l2.2-0.6 v-24l-3-0.3c-0.2-1.1,0.4-2.7,2.1-2.8l9-0.6l12.4,19V24.3l-3.2-0.4c-0.2-1.3,0.7-2.3,1.9-2.4L49.7,21z M49.7,21"/>
    </svg>
  );
}

// Facebook Icon Component
function FacebookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

// TikTok Icon Component
function TikTokIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

// DNA Logo for AutomateOS
function DNAIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
      <path d="M12 2c.825 0 1.5.675 1.5 1.5v3.55a4.5 4.5 0 0 1 0 9.9v3.55c0 .825-.675 1.5-1.5 1.5s-1.5-.675-1.5-1.5v-3.55a4.5 4.5 0 0 1 0-9.9V3.5c0-.825.675-1.5 1.5-1.5z"/>
    </svg>
  );
}

// HTTP Icon Component
function HttpIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

// Workflow/Refresh Icon Component
function WorkflowIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
    </svg>
  );
}

// AI Agent Icon Component
function AIAgentIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
      <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/>
    </svg>
  );
}

// Condition/Branch Icon Component
function ConditionIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M12 2v6M12 8l-5 6M12 8l5 6M7 14v6M17 14v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="2" r="1.5" fill="white"/>
      <circle cx="7" cy="20" r="1.5" fill="white"/>
      <circle cx="17" cy="20" r="1.5" fill="white"/>
    </svg>
  );
}

export function AppNodeToolbar({ appNodeHandlers }: AppNodeToolbarProps) {
  // App icons - Google, Slack, LINE, Notion, Facebook, TikTok
  const appIcons = [
    { name: 'Google', icon: <GoogleIcon />, onClick: appNodeHandlers.google },
    { name: 'Slack', icon: <SlackIcon />, onClick: appNodeHandlers.slack },
    { name: 'LINE', icon: <LineIcon />, onClick: appNodeHandlers.line },
    { name: 'Notion', icon: <NotionIcon />, onClick: appNodeHandlers.notion },
    { name: 'Facebook', icon: <FacebookIcon />, onClick: appNodeHandlers.facebook },
    { name: 'TikTok', icon: <TikTokIcon />, onClick: appNodeHandlers.tiktok },
  ];

  // Control icons - HTTP, Condition, AutomateOS, Workflow, AI
  const controlIcons = [
    { name: 'HTTP', icon: <HttpIcon />, isDark: true, onClick: appNodeHandlers.http },
    { name: 'Condition', icon: <ConditionIcon />, isDark: true, onClick: appNodeHandlers.condition },
    { name: 'AutomateOS', icon: <DNAIcon />, isDark: true },
    { name: 'Workflow', icon: <WorkflowIcon />, isDark: true },
    { name: 'AI Agent', icon: <AIAgentIcon />, isDark: true },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Floating Toolbar Container */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: 'rgba(245, 245, 247, 0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '8px 20px',
          gap: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* App Icons Group */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}>
          {appIcons.map((item, index) => (
            <AppIcon
              key={item.name}
              name={item.name}
              iconContent={item.icon}
              index={index}
              isDark={false}
              onClick={item.onClick}
            />
          ))}
        </div>

        {/* Vertical Divider */}
        <div style={{
          width: '1.5px',
          height: '44px',
          background: 'rgba(0, 0, 0, 0.12)',
          flexShrink: 0,
          borderRadius: '1px'
        }} />

        {/* Control Icons Group */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}>
          {controlIcons.map((item, index) => (
            <AppIcon
              key={item.name}
              name={item.name}
              iconContent={item.icon}
              index={appIcons.length + index}
              isDark={item.isDark}
              onClick={item.onClick}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
