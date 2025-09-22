'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { motionVariants } from './motion';

interface Header {
  id: string;
  key: string;
  value: string;
}

interface HeaderBuilderProps {
  value: string; // JSON string
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HeaderBuilder({ value, onChange, placeholder }: HeaderBuilderProps) {
  // Parse JSON string to headers array
  const parseHeaders = (jsonString: string): Header[] => {
    try {
      if (!jsonString.trim()) return [];
      const obj = JSON.parse(jsonString);
      return Object.entries(obj).map(([key, value], index) => ({
        id: `header-${index}`,
        key,
        value: String(value),
      }));
    } catch {
      return [];
    }
  };

  // Convert headers array back to JSON string
  const serializeHeaders = (headers: Header[]): string => {
    const obj = headers.reduce((acc, header) => {
      if (header.key.trim() && header.value.trim()) {
        acc[header.key.trim()] = header.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    return Object.keys(obj).length > 0 ? JSON.stringify(obj, null, 2) : '';
  };

  const [headers, setHeaders] = useState<Header[]>(() => parseHeaders(value));
  const [showRawJSON, setShowRawJSON] = useState(false);

  // Common header presets
  const headerPresets = [
    { label: 'Content-Type: JSON', key: 'Content-Type', value: 'application/json' },
    { label: 'Content-Type: Form', key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
    { label: 'Notion API Version', key: 'Notion-Version', value: '2022-06-28' },
    { label: 'User-Agent', key: 'User-Agent', value: 'AutomateOS/1.0' },
  ];

  const updateHeaders = (newHeaders: Header[]) => {
    setHeaders(newHeaders);
    onChange(serializeHeaders(newHeaders));
  };

  const addHeader = (key: string = '', value: string = '') => {
    const newHeader: Header = {
      id: `header-${Date.now()}`,
      key,
      value,
    };
    updateHeaders([...headers, newHeader]);
  };

  const removeHeader = (id: string) => {
    updateHeaders(headers.filter(h => h.id !== id));
  };

  const updateHeaderField = (id: string, field: 'key' | 'value', newValue: string) => {
    updateHeaders(headers.map(h =>
      h.id === id ? { ...h, [field]: newValue } : h
    ));
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Request Headers</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRawJSON(!showRawJSON)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showRawJSON ? '🎨 Visual Builder' : '📝 Raw JSON'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showRawJSON ? (
          <motion.div
            key="raw-json"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <textarea
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setHeaders(parseHeaders(e.target.value));
              }}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all"
              placeholder={placeholder || '{"Content-Type": "application/json"}'}
            />
          </motion.div>
        ) : (
          <motion.div
            key="visual-builder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Header Presets */}
            {headers.length === 0 && (
              <motion.div
                className="grid grid-cols-2 gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {headerPresets.map((preset, index) => (
                  <motion.button
                    key={preset.label}
                    type="button"
                    onClick={() => addHeader(preset.key, preset.value)}
                    className="p-2 text-xs bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg hover:from-coral-50 hover:to-coral-100 hover:border-coral-200 transition-all duration-200 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="font-medium text-gray-700">{preset.label}</div>
                    <div className="text-gray-500 truncate">{preset.key}: {preset.value}</div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Header List */}
            <div className="space-y-2">
              <AnimatePresence>
                {headers.map((header, index) => (
                  <motion.div
                    key={header.id}
                    className="flex gap-2 items-center p-3 bg-white border border-gray-200 rounded-xl shadow-soft"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeaderField(header.id, 'key', e.target.value)}
                        placeholder="Header name"
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-coral-500 focus:ring-1 focus:ring-coral-500/20 transition-all"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeaderField(header.id, 'value', e.target.value)}
                        placeholder="Header value"
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-coral-500 focus:ring-1 focus:ring-coral-500/20 transition-all"
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => removeHeader(header.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Header Button */}
            <motion.button
              type="button"
              onClick={() => addHeader()}
              className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-coral-300 hover:text-coral-600 hover:bg-coral-50/50 transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-base">+</span>
              Add Header
            </motion.button>

            {/* Help Text */}
            {headers.length === 0 && (
              <motion.p
                className="text-xs text-gray-500 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Choose a preset above or click "Add Header" to create custom headers
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}