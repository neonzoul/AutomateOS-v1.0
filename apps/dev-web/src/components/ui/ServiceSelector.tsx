'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ServiceTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  method: string;
  urlTemplate: string;
  headers: Record<string, string>;
  bodyTemplate?: any;
}

interface ServiceSelectorProps {
  value?: string;
  onChange: (template: ServiceTemplate | null) => void;
}

const serviceTemplates: ServiceTemplate[] = [
  {
    id: 'slack-webhook',
    name: 'Slack Webhook',
    icon: '📢',
    description: 'Send messages to Slack channels',
    method: 'POST',
    urlTemplate: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    headers: {
      'Content-Type': 'application/json'
    },
    bodyTemplate: {
      text: 'Hello from AutomateOS! 🚀',
      username: 'AutomateOS Bot',
      icon_emoji: ':robot_face:'
    }
  },
  {
    id: 'notion-database',
    name: 'Notion Database',
    icon: '📝',
    description: 'Add entries to Notion databases',
    method: 'POST',
    urlTemplate: 'https://api.notion.com/v1/pages',
    headers: {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    bodyTemplate: {
      parent: {
        database_id: 'YOUR_DATABASE_ID'
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: 'New Entry from AutomateOS'
              }
            }
          ]
        }
      }
    }
  },
  {
    id: 'discord-webhook',
    name: 'Discord Webhook',
    icon: '🎮',
    description: 'Post messages to Discord channels',
    method: 'POST',
    urlTemplate: 'https://discord.com/api/webhooks/YOUR/WEBHOOK/URL',
    headers: {
      'Content-Type': 'application/json'
    },
    bodyTemplate: {
      content: 'Hello from AutomateOS! 🤖',
      username: 'AutomateOS',
      avatar_url: 'https://i.imgur.com/4M34hi2.png'
    }
  },
  {
    id: 'github-api',
    name: 'GitHub API',
    icon: '🐙',
    description: 'Interact with GitHub repositories',
    method: 'GET',
    urlTemplate: 'https://api.github.com/user/repos',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AutomateOS/1.0'
    }
  },
  {
    id: 'custom',
    name: 'Custom API',
    icon: '🔗',
    description: 'Connect to any REST API',
    method: 'GET',
    urlTemplate: 'https://api.example.com/endpoint',
    headers: {
      'Content-Type': 'application/json'
    }
  }
];

export function ServiceSelector({ value, onChange }: ServiceSelectorProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(value || null);

  const handleSelect = (template: ServiceTemplate) => {
    setSelectedId(template.id);
    onChange(template);
  };

  const handleClear = () => {
    setSelectedId(null);
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Choose a Service</span>
        {selectedId && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {serviceTemplates.map((template, index) => {
          const isSelected = selectedId === template.id;

          return (
            <motion.button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-coral-500 bg-coral-50 shadow-glow-soft'
                  : 'border-gray-200 bg-white hover:border-coral-300 hover:bg-coral-50/50 shadow-soft hover:shadow-medium'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{template.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-coral-900' : 'text-gray-900'
                    }`}>
                      {template.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      template.method === 'GET'
                        ? 'bg-blue-100 text-blue-700'
                        : template.method === 'POST'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {template.method}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isSelected ? 'text-coral-700' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>
                  <p className={`text-xs mt-1 font-mono truncate ${
                    isSelected ? 'text-coral-600' : 'text-gray-500'
                  }`}>
                    {template.urlTemplate}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    className="text-coral-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    ✓
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedId && (
        <motion.div
          className="p-3 bg-blue-50 border border-blue-200 rounded-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-start gap-2">
            <div className="text-blue-500 mt-0.5">💡</div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Template Applied!
              </p>
              <p className="text-xs text-blue-700">
                The service configuration has been pre-filled. You can customize the URL, headers, and body as needed.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}