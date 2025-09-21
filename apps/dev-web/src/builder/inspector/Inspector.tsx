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
      <div className="p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-coral-sunset/20 flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="w-8 h-8 rounded-full bg-coral-sunset/40"></div>
        </div>
        <h3 className="text-title-3 text-warm-gray-800 font-display">Inspector</h3>
        <p className="text-body text-warm-gray-600 leading-relaxed">
          Select a node to configure its settings and bring your workflow to life
        </p>
      </div>
    );
  }

  const nodeSpec = NODE_SPECS[selected.type as keyof typeof NODE_SPECS];

  if (!nodeSpec) {
    return (
      <div className="p-6 bg-coral-sunset/10 rounded-2xl border border-coral-sunset/20">
        <p className="text-body text-coral-sunset font-medium">
          Unknown node type: {selected.type}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-warm-glow min-h-full">
      <div className="space-y-4">
        <h3 className="text-title-2 text-warm-gray-800 font-display">
          Configure {selected.type === 'start' ? '✨ Start' : '🌐 HTTP'} Node
        </h3>
        <div className="flex items-center gap-3 text-caption">
          <span className="px-3 py-1.5 bg-coral-sunset/10 border border-coral-sunset/20 rounded-full font-mono text-xs text-coral-sunset">
            {selected.type}
          </span>
          <span className="text-coral-sunset/40">·</span>
          <span className="text-warm-gray-500 font-mono text-xs">{selected.id}</span>
        </div>
      </div>

      {selected.type === 'http' ? (
        <HttpConfigForm
          nodeId={selected.id}
          currentConfig={selected.data?.config as HttpConfig}
        />
      ) : selected.type === 'start' ? (
        <div className="space-y-6">
          <div className="p-6 bg-sage-whisper/10 border border-sage-whisper/20 rounded-2xl backdrop-blur-sm">
            <h4 className="text-title-3 font-display text-warm-gray-800 mb-3">✨ Workflow Trigger</h4>
            <p className="text-body text-warm-gray-600 leading-relaxed">
              This magical node starts your workflow journey. When triggered, it begins the flow of automation through your connected nodes.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-lavender-twilight/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-lavender-twilight/40"></div>
          </div>
          <div className="text-title-3 font-display text-warm-gray-800">No configuration available</div>
          <div className="text-body text-warm-gray-600">
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
        <h4 className="text-title-3 font-display text-warm-gray-800">
          🌐 Basic Configuration
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block">
              <span className="text-body font-medium text-warm-gray-700 mb-3 block">Request Method</span>
              <select
                {...register('method')}
                className="w-full rounded-xl border-2 border-coral-sunset/20 px-4 py-3 text-body focus:border-coral-sunset focus:ring-4 focus:ring-coral-sunset/10 transition-all duration-300 ease-out bg-cream-warm backdrop-blur-sm"
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.method && (
                <p className="mt-2 text-body text-coral-sunset">{errors.method.message}</p>
              )}
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-body font-medium text-warm-gray-700 mb-3 block">API Key</span>
              <select
                {...register('auth.credentialName')}
                className="w-full rounded-xl border-2 border-coral-sunset/20 px-4 py-3 text-body focus:border-coral-sunset focus:ring-4 focus:ring-coral-sunset/10 transition-all duration-300 ease-out bg-cream-warm backdrop-blur-sm"
              >
                <option value="">No authentication needed</option>
                {credentialList.map((cred) => (
                  <option key={cred.name} value={cred.name}>
                    {cred.name} ({cred.maskedPreview})
                  </option>
                ))}
              </select>
              {errors.auth?.credentialName && (
                <p className="mt-2 text-body text-coral-sunset">
                  {errors.auth.credentialName.message}
                </p>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="text-body font-medium text-warm-gray-700 mb-3 block">Service URL</span>
            <input
              {...register('url')}
              type="url"
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'url-error' : undefined}
              className={`w-full rounded-xl border-2 px-4 py-3 text-body focus:ring-4 transition-all duration-300 ease-out bg-cream-warm backdrop-blur-sm ${
                errors.url
                  ? 'border-coral-sunset focus:border-coral-sunset focus:ring-coral-sunset/10'
                  : 'border-coral-sunset/20 focus:border-coral-sunset focus:ring-coral-sunset/10'
              }`}
              placeholder="https://api.example.com/endpoint"
            />
            {errors.url && (
              <p id="url-error" className="mt-2 text-body text-coral-sunset">
                {errors.url.message}
              </p>
            )}
          </label>
        </div>

        {/* Quick credential creation */}
        <button
          type="button"
          className="w-full p-4 border-2 border-dashed border-coral-sunset/30 rounded-2xl text-body text-warm-gray-600 hover:border-coral-sunset hover:text-coral-sunset hover:bg-coral-sunset/5 transition-all duration-300 ease-out flex items-center justify-center gap-3 backdrop-blur-sm"
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
          🔑 Create New API Key
        </button>
      </div>

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-title-3 font-display text-warm-gray-800">
            ⚙️ Advanced Options
          </h4>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-body text-coral-sunset hover:text-coral-sunset/80 transition-colors duration-300 ease-out font-medium"
          >
            {showAdvanced ? 'Hide' : 'Show'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-6">
              {/* Headers */}
              <div>
                <label className="block">
                  <span className="text-body font-medium text-warm-gray-700 mb-3 block">Headers (JSON)</span>
                  <textarea
                    {...register('headers')}
                    rows={4}
                    className="w-full rounded-2xl border-2 border-coral-sunset/20 px-4 py-3 text-body font-mono focus:border-coral-sunset focus:ring-4 focus:ring-coral-sunset/10 transition-all duration-300 ease-out bg-cream-warm backdrop-blur-sm"
                    placeholder='{"Content-Type": "application/json"}'
                  />
                  {errors.headers && (
                    <p className="mt-2 text-body text-coral-sunset">{errors.headers.message}</p>
                  )}
                </label>
              </div>

              {/* Request Body - only show for methods that support body */}
              {needsBody && (
                <div>
                  <label className="block">
                    <span className="text-body font-medium text-warm-gray-700 mb-3 block">Request Body (JSON)</span>
                    <textarea
                      {...register('body')}
                      rows={6}
                      className="w-full rounded-2xl border-2 border-coral-sunset/20 px-4 py-3 text-body font-mono focus:border-coral-sunset focus:ring-4 focus:ring-coral-sunset/10 transition-all duration-300 ease-out bg-cream-warm backdrop-blur-sm"
                      placeholder='{"message": "Hello from AutomateOS!"}'
                    />
                    {errors.body && (
                      <p className="mt-2 text-body text-coral-sunset">{errors.body.message}</p>
                    )}
                  </label>
                </div>
              )}

              {!needsBody && (
                <div className="p-6 bg-lavender-twilight/10 border border-lavender-twilight/20 rounded-2xl backdrop-blur-sm">
                  <p className="text-body font-medium text-warm-gray-800 mb-2">
                    No Request Body Needed
                  </p>
                  <p className="text-body text-warm-gray-600 leading-relaxed">
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
