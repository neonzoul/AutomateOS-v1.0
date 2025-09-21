'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JsonBodyBuilderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function JsonBodyBuilder({ value, onChange, placeholder }: JsonBodyBuilderProps) {
  const [showRawJSON, setShowRawJSON] = useState(false);
  const [keyValuePairs, setKeyValuePairs] = useState<Array<{ id: string; key: string; value: string; type: 'text' | 'number' | 'boolean' }>>(() => {
    try {
      if (!value.trim()) return [];
      const parsed = JSON.parse(value);
      return Object.entries(parsed).map(([key, val], index) => ({
        id: `field-${index}`,
        key,
        value: String(val),
        type: typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'text'
      }));
    } catch {
      return [];
    }
  });

  const updateJSON = (pairs: typeof keyValuePairs) => {
    setKeyValuePairs(pairs);

    const obj = pairs.reduce((acc, pair) => {
      if (pair.key.trim()) {
        let val: any = pair.value;
        if (pair.type === 'number') {
          val = Number(pair.value) || 0;
        } else if (pair.type === 'boolean') {
          val = pair.value === 'true';
        }
        acc[pair.key.trim()] = val;
      }
      return acc;
    }, {} as Record<string, any>);

    onChange(Object.keys(obj).length > 0 ? JSON.stringify(obj, null, 2) : '');
  };

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      key: '',
      value: '',
      type: 'text' as const
    };
    updateJSON([...keyValuePairs, newField]);
  };

  const removeField = (id: string) => {
    updateJSON(keyValuePairs.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<typeof keyValuePairs[0]>) => {
    updateJSON(keyValuePairs.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Common JSON templates
  const templates = [
    {
      label: 'Slack Message',
      icon: '📢',
      data: {
        text: 'Hello from AutomateOS!',
        username: 'AutomateOS Bot',
        icon_emoji: ':robot_face:'
      }
    },
    {
      label: 'User Profile',
      icon: '👤',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      }
    },
    {
      label: 'Task Item',
      icon: '✅',
      data: {
        title: 'Complete automation setup',
        completed: false,
        priority: 'high'
      }
    }
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    const pairs = Object.entries(template.data).map(([key, val], index) => ({
      id: `field-${Date.now()}-${index}`,
      key,
      value: String(val),
      type: typeof val === 'number' ? 'number' as const : typeof val === 'boolean' ? 'boolean' as const : 'text' as const
    }));
    updateJSON(pairs);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Request Body</span>
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
          >
            <textarea
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                // Update visual builder state
                try {
                  if (e.target.value.trim()) {
                    const parsed = JSON.parse(e.target.value);
                    const pairs = Object.entries(parsed).map(([key, val], index) => ({
                      id: `field-${Date.now()}-${index}`,
                      key,
                      value: String(val),
                      type: typeof val === 'number' ? 'number' as const : typeof val === 'boolean' ? 'boolean' as const : 'text' as const
                    }));
                    setKeyValuePairs(pairs);
                  } else {
                    setKeyValuePairs([]);
                  }
                } catch {
                  // Keep existing state on invalid JSON
                }
              }}
              rows={6}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all"
              placeholder={placeholder || '{\n  "message": "Hello World",\n  "priority": "high"\n}'}
            />
          </motion.div>
        ) : (
          <motion.div
            key="visual-builder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Templates */}
            {keyValuePairs.length === 0 && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-sm text-gray-600">Choose a template to get started:</div>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((template, index) => (
                    <motion.button
                      key={template.label}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-coral-50 hover:to-coral-100 hover:border-coral-200 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{template.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{template.label}</div>
                          <div className="text-xs text-gray-500 font-mono">
                            {Object.keys(template.data).join(', ')}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Field Builder */}
            <div className="space-y-2">
              <AnimatePresence>
                {keyValuePairs.map((field, index) => (
                  <motion.div
                    key={field.id}
                    className="flex gap-2 items-center p-3 bg-white border border-gray-200 rounded-xl shadow-soft"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => updateField(field.id, { key: e.target.value })}
                        placeholder="Field name"
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-coral-500 focus:ring-1 focus:ring-coral-500/20 transition-all"
                      />
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={field.value}
                        onChange={(e) => updateField(field.id, { value: e.target.value })}
                        placeholder={field.type === 'boolean' ? 'true/false' : 'Field value'}
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-coral-500 focus:ring-1 focus:ring-coral-500/20 transition-all"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, {
                          type: e.target.value as any,
                          value: e.target.value === 'boolean' ? 'false' : field.value
                        })}
                        className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:border-coral-500 focus:ring-1 focus:ring-coral-500/20 transition-all"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => removeField(field.id)}
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

            {/* Add Field Button */}
            <motion.button
              type="button"
              onClick={addField}
              className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-coral-300 hover:text-coral-600 hover:bg-coral-50/50 transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-base">+</span>
              Add Field
            </motion.button>

            {/* Help Text */}
            {keyValuePairs.length === 0 && (
              <motion.p
                className="text-xs text-gray-500 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Or click "Add Field" to build your JSON manually
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}