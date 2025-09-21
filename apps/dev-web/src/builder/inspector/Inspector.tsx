// ::Component:: Inspector

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelectedNode, useSelectionActions } from '@/core/state';
import { NODE_SPECS } from '@/builder/registry/nodeSpecs';
import { HttpConfigSchema, type HttpConfig } from '@automateos/workflow-schema';
import { z } from 'zod';
import { useCredentialList, useCredentials } from '@/core/credentials';

// Form schema with string headers (for JSON input)
const HttpConfigFormSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  url: z.string().url('Please enter a valid URL').min(1, 'URL is required'),
  headers: z.string().optional(), // JSON string in form
  body: z.string().optional(),
  auth: z.object({
    credentialName: z.string(),
  }).optional(),
});

type HttpConfigFormInput = z.infer<typeof HttpConfigFormSchema>;

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
    resolver: zodResolver(HttpConfigFormSchema),
    defaultValues: {
      method: currentConfig?.method ?? 'GET',
      url: currentConfig?.url ?? '',
      headers: JSON.stringify(currentConfig?.headers ?? {}, null, 2),
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

  // Transform headers string to object for validation
  const transformFormData = (values: any) => {
    const transformed = { ...values };

    // Parse headers from JSON string to object
    if (typeof values.headers === 'string' && values.headers.trim()) {
      try {
        transformed.headers = JSON.parse(values.headers);
      } catch (e) {
        // If JSON parsing fails, keep as string for validation error
        transformed.headers = values.headers;
      }
    }

    // If body contains JSON, also set json_body for engine compatibility
    if (typeof values.body === 'string' && values.body.trim()) {
      try {
        const parsedBody = JSON.parse(values.body);
        transformed.json_body = parsedBody;
        // Keep body as string for form display
      } catch (e) {
        // If not valid JSON, just keep as body string
        // But clear any existing json_body to prevent conflicts
        transformed.json_body = undefined;
      }
    } else {
      // If no body, clear json_body
      transformed.json_body = undefined;
    }

    return transformed;
  };

  // Watch form changes and sync to store when valid
  React.useEffect(() => {
    const subscription = watch((values) => {
      const transformed = transformFormData(values);
      const result = HttpConfigSchema.safeParse(transformed);
      if (result.success) {
        updateNodeConfig(nodeId, result.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, nodeId, updateNodeConfig]);

  const onSubmit = (data: any) => {
    const transformed = transformFormData(data);
    const validated = HttpConfigSchema.parse(transformed);
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

      {/* Headers section */}
      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Headers (optional)
          </span>
          <textarea
            {...register('headers')}
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder='{"Content-Type": "application/json", "Notion-Version": "2022-06-28"}'
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter headers as JSON object. For Notion API, include: {'"Notion-Version": "2022-06-28"'}
          </p>
          {errors.headers && (
            <p className="mt-1 text-xs text-red-600">{errors.headers?.message}</p>
          )}
        </label>
      </div>
    </form>
  );
}
