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
import { CustomDropdown } from '@/components/ui/CustomDropdown';

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
    <div
      className="p-8 space-y-8"
      style={{
        background: 'linear-gradient(180deg, #FFF9F2 0%, #FFF5E6 50%, #FFEDE0 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl border ${selected.type === 'start'
            ? 'bg-gradient-to-br from-sage-whisper/10 to-golden-hour/10 border-sage-whisper/20'
            : 'bg-gradient-to-br from-coral-sunset/10 to-golden-hour/10 border-coral-sunset/20'
          }`}>
            {selected.type === 'start' ? (
              <svg className="w-5 h-5 text-sage-whisper" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-coral-sunset" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <h3 className="text-title-2 text-warm-gray-800 font-display">
            Configure {selected.type === 'start' ? 'Start' : 'HTTP'} Node
          </h3>
        </div>
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
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 rounded-lg bg-sage-whisper/20">
                <svg className="w-4 h-4 text-sage-whisper" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a.5.5 0 01.5.5v5.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L7.5 7.293V1.5A.5.5 0 018 1z"/>
                  <path d="M3 9.5a.5.5 0 01.5-.5h9a.5.5 0 010 1H3.5a.5.5 0 01-.5-.5zM2.5 12a.5.5 0 000 1h11a.5.5 0 000-1h-11z"/>
                </svg>
              </div>
              <h4 className="text-title-3 font-display text-warm-gray-800">
                Workflow Trigger
              </h4>
            </div>
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-coral-sunset to-golden-hour rounded-full"></div>
          <h4 className="text-title-3 font-display text-warm-gray-800">
            Basic Configuration
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block">
              <span className="text-body font-medium text-warm-gray-700 mb-3 block flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-coral-sunset/60"></div>
                Request Method
              </span>
              <CustomDropdown
                options={[
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'PATCH', label: 'PATCH' },
                  { value: 'DELETE', label: 'DELETE' },
                ]}
                value={watch('method') || 'GET'}
                onChange={(value) => setValue('method', value as any)}
                placeholder="Select method"
              />
              {errors.method && (
                <p className="mt-2 text-body text-coral-sunset">{errors.method.message}</p>
              )}
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-body font-medium text-warm-gray-700 mb-3 block flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-golden-hour/60"></div>
                API Key
              </span>
              <CustomDropdown
                options={[
                  { value: '', label: 'No authentication needed' },
                  ...credentialList.map((cred) => ({
                    value: cred.name,
                    label: `${cred.name} (${cred.maskedPreview})`
                  }))
                ]}
                value={watch('auth.credentialName') || ''}
                onChange={(value) => setValue('auth.credentialName', value)}
                placeholder="Select authentication"
              />
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
          className="group w-full p-4 border-2 border-dashed border-coral-sunset/30 rounded-2xl text-body text-warm-gray-600 hover:border-coral-sunset hover:text-coral-sunset hover:bg-coral-sunset/5 transition-all duration-300 ease-out flex items-center justify-center gap-3 backdrop-blur-sm"
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
          <svg className="w-5 h-5 text-coral-sunset/60 group-hover:text-coral-sunset transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 7a3 3 0 016 0v2.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 9.5V9a3 3 0 013-3v1a2 2 0 104 0V7z" clipRule="evenodd" />
            <path d="M6 11.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
          <span>Create New API Key</span>
        </button>
      </div>

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-lavender-twilight to-coral-sunset rounded-full"></div>
            <h4 className="text-title-3 font-display text-warm-gray-800">
              Advanced Options
            </h4>
          </div>
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
