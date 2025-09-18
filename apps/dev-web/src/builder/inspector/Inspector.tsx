// ::Component:: Inspector

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelectedNode, useSelectionActions } from '@/core/state';
import { NODE_SPECS } from '@/builder/registry/nodeSpecs';
import { HttpConfigSchema, type HttpConfig } from '@automateos/workflow-schema';
import { useCredentialList, useCredentials } from '@/core/credentials';

// Form type that matches the schema input (method is optional with default)
type HttpConfigFormInput = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  auth?: {
    credentialName: string;
  };
};

/**
 * Inspector: renders a form from the selected node's Zod schema.
 * Reads from Zustand selection; writes via updateNodeConfig(nodeId, values).
 * No secrets in client; only public config fields appear.
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

  const nodeSpec = NODE_SPECS[selected.type as keyof typeof NODE_SPECS];

  if (!nodeSpec) {
    return (
      <div className="p-4 text-sm text-red-500">
        Unknown node type: {selected.type}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Inspector</h3>
        <p className="text-xs text-gray-500">
          Type: <span className="font-mono">{selected.type}</span> · ID:{' '}
          <span className="font-mono">{selected.id}</span>
        </p>
      </div>

      {selected.type === 'http' ? (
        <HttpConfigForm
          nodeId={selected.id}
          currentConfig={selected.data?.config as HttpConfig}
        />
      ) : (
        <div className="text-xs text-gray-500">
          No configurable fields for this node yet.
        </div>
      )}
    </div>
  );
}

/**
 * HTTP Configuration Form using react-hook-form + Zod validation
 */
function HttpConfigForm({
  nodeId,
  currentConfig,
}: {
  nodeId: string;
  currentConfig?: Partial<HttpConfig>;
}) {
  const { updateNodeConfig } = useSelectionActions();
  const credentialList = useCredentialList();
  const { setCredential } = useCredentials();

  const form = useForm<HttpConfigFormInput>({
    resolver: zodResolver(HttpConfigSchema),
    defaultValues: {
      method: currentConfig?.method ?? 'GET',
      url: currentConfig?.url ?? '',
      headers: currentConfig?.headers ?? {},
      body: currentConfig?.body ?? '',
      auth: currentConfig?.auth ? {
        credentialName: currentConfig.auth.credentialName
      } : undefined,
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  // Watch form changes and sync to store when valid
  React.useEffect(() => {
    const subscription = watch((values) => {
      const result = HttpConfigSchema.safeParse(values);
      if (result.success) {
        updateNodeConfig(nodeId, result.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, nodeId, updateNodeConfig]);

  const onSubmit = (data: any) => {
    const validated = HttpConfigSchema.parse(data);
    updateNodeConfig(nodeId, validated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Method</span>
          <select
            {...register('method')}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {errors.method && (
            <p className="mt-1 text-xs text-red-600">{errors.method.message}</p>
          )}
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">URL</span>
          <input
            {...register('url')}
            type="url"
            aria-invalid={!!errors.url}
            aria-describedby={errors.url ? 'url-error' : undefined}
            className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-1 ${
              errors.url
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="https://api.example.com"
          />
          {errors.url && (
            <p id="url-error" className="mt-1 text-xs text-red-600">
              {errors.url.message}
            </p>
          )}
        </label>
      </div>

      {/* Credential Authentication */}
      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Authentication (optional)
          </span>
          <select
            {...register('auth.credentialName')}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">No authentication</option>
            {credentialList.map((cred) => (
              <option key={cred.name} value={cred.name}>
                {cred.name} ({cred.maskedPreview})
              </option>
            ))}
          </select>
          {errors.auth?.credentialName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.auth.credentialName.message}
            </p>
          )}
        </label>

        {/* Quick credential creation */}
        <div className="mt-2">
          <button
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700"
            onClick={() => {
              const name = prompt('Credential name:');
              const value = prompt('Credential value (e.g., Bearer token):');
              if (name && value) {
                setCredential(name, value).then(() => {
                  // Re-render will happen automatically due to store update
                });
              }
            }}
          >
            + Create new credential
          </button>
        </div>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Body (optional)
          </span>
          <textarea
            {...register('body')}
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Request body (JSON, text, etc.)"
          />
          {errors.body && (
            <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>
          )}
        </label>
      </div>

      {/* Headers section - simplified for now */}
      <div className="text-xs text-gray-500">
        Headers configuration will be added in a future sprint.
      </div>
    </form>
  );
}
