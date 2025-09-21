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
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceSelector } from '@/components/ui/ServiceSelector';
import { HeaderBuilder } from '@/components/ui/HeaderBuilder';
import { JsonBodyBuilder } from '@/components/ui/JsonBodyBuilder';

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
      <motion.div
        className="p-6 text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-4xl">🎨</div>
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800">Configuration Panel</h3>
          <p className="text-sm text-gray-500">
            Select a workflow step to customize its settings
          </p>
        </div>
      </motion.div>
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
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      key={selected.id} // Re-animate on node change
    >
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          🎛️ Configure Step
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 bg-gray-100 rounded-lg font-mono text-xs">
            {selected.type === 'start' ? '✨ Trigger' : '🔗 Service'}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600 font-mono text-xs">{selected.id}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected.type === 'http' ? (
          <motion.div
            key="http-config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <HttpConfigForm
              nodeId={selected.id}
              currentConfig={selected.data?.config as HttpConfig}
            />
          </motion.div>
        ) : selected.type === 'start' ? (
          <motion.div
            key="start-config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-emerald-600 text-xl">✨</div>
                <div>
                  <h4 className="font-semibold text-emerald-800 mb-1">Workflow Trigger</h4>
                  <p className="text-sm text-emerald-700">
                    This is where your automation begins! When you run the workflow,
                    this trigger will start the entire process.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              No additional configuration needed for triggers
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8 space-y-3"
          >
            <div className="text-4xl">⚙️</div>
            <div className="text-gray-600 font-medium">No configuration available</div>
            <div className="text-sm text-gray-500">
              This step doesn't have any customizable settings yet
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  // Handle service template selection
  const handleServiceTemplate = (template: any) => {
    if (template) {
      setValue('method', template.method as any);
      setValue('url', template.urlTemplate);
      setValue('headers', JSON.stringify(template.headers, null, 2));
      if (template.bodyTemplate) {
        setValue('body', JSON.stringify(template.bodyTemplate, null, 2));
      }
    }
  };

  const watchedMethod = watch('method');
  const needsBody = watchedMethod === 'POST' || watchedMethod === 'PUT' || watchedMethod === 'PATCH';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Service Selector */}
      <ServiceSelector
        onChange={handleServiceTemplate}
      />

      {/* Basic Configuration */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          ⚙️ Basic Configuration
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Request Method</span>
              <select
                {...register('method')}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all bg-white"
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
              <span className="text-sm font-medium text-gray-700 mb-2 block">API Key</span>
              <select
                {...register('auth.credentialName')}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all bg-white"
              >
                <option value="">No authentication needed</option>
                {credentialList.map((cred) => (
                  <option key={cred.name} value={cred.name}>
                    🔑 {cred.name} ({cred.maskedPreview})
                  </option>
                ))}
              </select>
              {errors.auth?.credentialName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.auth.credentialName.message}
                </p>
              )}
            </label>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Service URL</span>
            <input
              {...register('url')}
              type="url"
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'url-error' : undefined}
              className={`w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 transition-all ${
                errors.url
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-coral-500 focus:ring-coral-500/20'
              }`}
              placeholder="https://api.example.com/endpoint"
            />
            {errors.url && (
              <p id="url-error" className="mt-1 text-xs text-red-600">
                {errors.url.message}
              </p>
            )}
          </label>
        </div>

        {/* Quick credential creation */}
        <motion.button
          type="button"
          className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-coral-300 hover:text-coral-600 hover:bg-coral-50/50 transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => {
            const name = prompt('Enter a name for your API key:');
            const value = prompt('Enter your API key or token:');
            if (name && value) {
              setCredential(name, value).then(() => {
                setValue('auth.credentialName', name);
              });
            }
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="text-base">🔑</span>
          Create New API Key
        </motion.button>
      </div>

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🔧 Advanced Options
          </h4>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-coral-600 hover:text-coral-700 transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Headers Builder */}
              <HeaderBuilder
                value={watch('headers') || ''}
                onChange={(value) => setValue('headers', value)}
                placeholder='{"Content-Type": "application/json"}'
              />

              {/* Body Builder - only show for methods that support body */}
              {needsBody && (
                <JsonBodyBuilder
                  value={watch('body') || ''}
                  onChange={(value) => setValue('body', value)}
                  placeholder='{"message": "Hello from AutomateOS!"}'
                />
              )}

              {!needsBody && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-500 mt-0.5">💡</div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        No Request Body Needed
                      </p>
                      <p className="text-xs text-blue-700">
                        {watchedMethod} requests typically don't include a request body.
                        Switch to POST, PUT, or PATCH if you need to send data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
