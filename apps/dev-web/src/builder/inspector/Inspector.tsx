// ::Component:: Inspector

'use client';

import React from 'react';
import { useSelectedNode, useSelectionActions } from '@/core/state';
import type { HttpConfig } from '@/builder/registry/nodeSpecs';

/**
 * Inspector: Minimal shell that shows the selected node's type and a placeholder form.
 * Reads selection from Zustand; provides simple inputs (no validation) for HTTP config.
 */
export function Inspector() {
  const selected = useSelectedNode();
  const { updateNodeConfig } = useSelectionActions();

  if (!selected) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Select a node to configure its properties
      </div>
    );
  }

  const isHttp = selected.type === 'http';
  const rawCfg =
    (selected.data?.config as Partial<HttpConfig> & { label?: string }) || {};
  const label = rawCfg.label ?? selected.data?.label ?? '';
  const cfg = rawCfg;
  const method = cfg.method ?? 'GET';
  const url = cfg.url ?? '';

  const onChange = (key: string, value: unknown) => {
    updateNodeConfig(selected.id, { [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Inspector</h3>
        <p className="text-xs text-gray-500">
          Type: <span className="font-mono">{selected.type}</span> · ID:{' '}
          <span className="font-mono">{selected.id}</span>
        </p>
      </div>

      {/* Placeholder form: basic fields */}
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Label</span>
          <input
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            type="text"
            value={label}
            onChange={(e) => {
              // TODO(sprint-2): Move to schema-driven form; store currently merges into data.config
              const value = e.target.value;
              updateNodeConfig(selected.id, { label: value });
            }}
            placeholder="(placeholder)"
          />
        </label>

        {isHttp && (
          <>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Method</span>
              <select
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                value={method}
                onChange={(e) => onChange('method', e.target.value)}
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">URL</span>
              <input
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                type="url"
                value={url}
                onChange={(e) => onChange('url', e.target.value)}
                placeholder="https://api.example.com"
              />
            </label>
          </>
        )}

        {!isHttp && (
          <div className="text-xs text-gray-500">
            No configurable fields for this node yet.
          </div>
        )}
      </div>
      {/* TODO(sprint-2): Replace with schema-driven form using NODE_SPECS[type].configSchema + zodResolver */}
    </div>
  );
}
