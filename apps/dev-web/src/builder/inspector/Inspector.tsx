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
      <div className="p-6 text-center space-y-3">
        <h3 className="text-title-3 text-primary">Inspector</h3>
        <p className="text-body text-secondary">
          Select a node to configure its settings
        </p>
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
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-title-3 text-primary">
          Configure {selected.type === 'start' ? 'Start' : 'HTTP'} Node
        </h3>
        <div className="flex items-center gap-2 text-caption">
          <span className="px-2 py-1 bg-off-white border border-separator rounded font-mono text-xs text-secondary">
            {selected.type}
          </span>
          <span className="text-separator">·</span>
          <span className="text-secondary font-mono text-xs">{selected.id}</span>
        </div>
      </div>

      {selected.type === 'http' ? (
        <HttpConfigForm
          nodeId={selected.id}
          currentConfig={selected.data?.config as HttpConfig}
        />
      ) : selected.type === 'start' ? (
        <div className="space-y-4">
          <div className="p-4 bg-off-white border border-separator rounded">
            <h4 className="text-body font-medium text-primary mb-2">Workflow Trigger</h4>
            <p className="text-caption text-secondary">
              This node starts the workflow when executed. No additional configuration required.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-3">
          <div className="text-body font-medium text-primary">No configuration available</div>
          <div className="text-caption text-secondary">
            This node type doesn't have configurable settings
          </div>
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
  const [showAdvanced, setShowAdvanced] = React.useState(false);

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
    setValue,
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


  const watchedMethod = watch('method');
  const needsBody = watchedMethod === 'POST' || watchedMethod === 'PUT' || watchedMethod === 'PATCH';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Basic Configuration */}
      <div className="space-y-4">
        <h4 className="text-body font-medium text-primary">
          Basic Configuration
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block">
              <span className="text-caption font-medium text-primary mb-2 block">Request Method</span>
              <select
                {...register('method')}
                className="w-full rounded border border-separator px-3 py-2 text-caption focus:border-system-blue focus:ring-2 focus:ring-system-blue/20 transition-all duration-micro ease-apple bg-white"
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.method && (
                <p className="mt-1 text-caption text-system-red">{errors.method.message}</p>
              )}
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-caption font-medium text-primary mb-2 block">API Key</span>
              <select
                {...register('auth.credentialName')}
                className="w-full rounded border border-separator px-3 py-2 text-caption focus:border-system-blue focus:ring-2 focus:ring-system-blue/20 transition-all duration-micro ease-apple bg-white"
              >
                <option value="">No authentication needed</option>
                {credentialList.map((cred) => (
                  <option key={cred.name} value={cred.name}>
                    {cred.name} ({cred.maskedPreview})
                  </option>
                ))}
              </select>
              {errors.auth?.credentialName && (
                <p className="mt-1 text-caption text-system-red">
                  {errors.auth.credentialName.message}
                </p>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="text-caption font-medium text-primary mb-2 block">Service URL</span>
            <input
              {...register('url')}
              type="url"
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'url-error' : undefined}
              className={`w-full rounded border px-3 py-2 text-caption focus:ring-2 transition-all duration-micro ease-apple ${
                errors.url
                  ? 'border-system-red focus:border-system-red focus:ring-system-red/20'
                  : 'border-separator focus:border-system-blue focus:ring-system-blue/20'
              }`}
              placeholder="https://api.example.com/endpoint"
            />
            {errors.url && (
              <p id="url-error" className="mt-1 text-caption text-system-red">
                {errors.url.message}
              </p>
            )}
          </label>
        </div>

        {/* Quick credential creation */}
        <button
          type="button"
          className="w-full p-3 border border-dashed border-separator rounded text-caption text-secondary hover:border-system-blue hover:text-system-blue hover:bg-system-blue/5 transition-all duration-micro ease-apple flex items-center justify-center gap-2"
          onClick={() => {
            const name = prompt('Enter a name for your API key:');
            const value = prompt('Enter your API key or token:');
            if (name && value) {
              setCredential(name, value).then(() => {
                setValue('auth.credentialName', name);
              });
            }
          }}
        >
          Create New API Key
        </button>
      </div>

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-body font-medium text-primary">
            Advanced Options
          </h4>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-caption text-system-blue hover:text-system-blue/80 transition-colors duration-micro ease-apple"
          >
            {showAdvanced ? 'Hide' : 'Show'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-6">
              {/* Headers */}
              <div>
                <label className="block">
                  <span className="text-caption font-medium text-primary mb-2 block">Headers (JSON)</span>
                  <textarea
                    {...register('headers')}
                    rows={4}
                    className="w-full rounded border border-separator px-3 py-2 text-caption font-mono focus:border-system-blue focus:ring-2 focus:ring-system-blue/20 transition-all duration-micro ease-apple"
                    placeholder='{"Content-Type": "application/json"}'
                  />
                  {errors.headers && (
                    <p className="mt-1 text-caption text-system-red">{errors.headers.message}</p>
                  )}
                </label>
              </div>

              {/* Request Body - only show for methods that support body */}
              {needsBody && (
                <div>
                  <label className="block">
                    <span className="text-caption font-medium text-primary mb-2 block">Request Body (JSON)</span>
                    <textarea
                      {...register('body')}
                      rows={6}
                      className="w-full rounded border border-separator px-3 py-2 text-caption font-mono focus:border-system-blue focus:ring-2 focus:ring-system-blue/20 transition-all duration-micro ease-apple"
                      placeholder='{"message": "Hello from AutomateOS!"}'
                    />
                    {errors.body && (
                      <p className="mt-1 text-caption text-system-red">{errors.body.message}</p>
                    )}
                  </label>
                </div>
              )}

              {!needsBody && (
                <div className="p-3 bg-off-white border border-separator rounded">
                  <p className="text-caption font-medium text-primary mb-1">
                    No Request Body Needed
                  </p>
                  <p className="text-caption text-secondary">
                    {watchedMethod} requests typically don't include a request body.
                    Switch to POST, PUT, or PATCH if you need to send data.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </form>
  );
}
