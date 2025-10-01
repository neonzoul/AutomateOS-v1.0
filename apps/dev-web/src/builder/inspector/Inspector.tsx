// ::Component:: Inspector

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useSelectedNode,
  useSelectionActions,
  useBuilderStore,
} from '@/core/state';
import { NODE_SPECS } from '@/builder/registry/nodeSpecs';
import { HttpConfigSchema, type HttpConfig } from '@automateos/workflow-schema';
import { z } from 'zod';
import { useCredentialList, useCredentials } from '@/core/credentials';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { motion } from 'framer-motion';

// Form schema with string headers (for JSON input)
const HttpConfigFormSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  url: z.string().url('Please enter a valid URL').min(1, 'URL is required'),
  headers: z.string().optional(), // JSON string in form
  body: z.string().optional(),
  auth: z
    .object({
      credentialName: z.string(),
    })
    .optional(),
});

type HttpConfigFormInput = z.infer<typeof HttpConfigFormSchema>;

// Slack icon component
function SlackIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 127 127"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="127" height="127" fill="#1D1C1D" rx="8" />
      <g transform="translate(20, 20) scale(0.7)">
        <path
          d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z"
          fill="#E01E5A"
        />
        <path
          d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z"
          fill="#36C5F0"
        />
        <path
          d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z"
          fill="#2EB67D"
        />
        <path
          d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z"
          fill="#ECB22E"
        />
      </g>
    </svg>
  );
}

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          height: '100%',
          background: '#1D1C1D',
          boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.15)',
          padding: '40px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '280px' }}>
          <h3
            style={{
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '28px',
              lineHeight: '34px',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}
          >
            Inspector
          </h3>
          <p
            style={{
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Select a node to configure its settings
          </p>
        </div>
      </motion.div>
    );
  }

  const nodeSpec = NODE_SPECS[selected.type as keyof typeof NODE_SPECS];

  if (!nodeSpec) {
    return (
      <div
        style={{
          height: '100%',
          background: '#1D1C1D',
          padding: '20px',
          color: '#FFFFFF',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            color: '#E63946',
          }}
        >
          Unknown node type: {selected.type}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        height: '100%',
        background: '#1D1C1D',
        boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.15)',
        padding: '20px',
        color: '#FFFFFF',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Header with Icon and Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '30px',
          paddingTop: '8px',
        }}
      >
        {/* App Icon */}
        {selected.type === 'app' && <SlackIcon />}
        {selected.type === 'http' && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#E63946',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            🌐
          </div>
        )}
        {selected.type === 'start' && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#00DFA2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            ✨
          </div>
        )}
        {selected.type === 'agent' && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#A29BFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            🤖
          </div>
        )}

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '34px',
            color: '#FFFFFF',
          }}
        >
          {selected.type === 'app'
            ? 'Slack'
            : selected.type === 'http'
              ? 'HTTP'
              : selected.type === 'agent'
                ? 'Agent'
                : 'Start'}
        </h2>
      </motion.div>

      {/* Form Content */}
      {selected.type === 'http' || selected.type === 'app' ? (
        <HttpConfigForm
          nodeId={selected.id}
          currentConfig={selected.data?.config as HttpConfig}
        />
      ) : selected.type === 'start' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{
            padding: '30px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            This magical node starts your workflow journey. When triggered, it
            begins the flow of automation through your connected nodes.
          </p>
        </motion.div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <p>No configuration available for this node type</p>
        </div>
      )}
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
  const [showCredentialDropdown, setShowCredentialDropdown] =
    React.useState(false);

  const form = useForm<HttpConfigFormInput>({
    resolver: zodResolver(HttpConfigFormSchema),
    defaultValues: {
      method: currentConfig?.method ?? 'GET',
      url: currentConfig?.url ?? 'https://api.example.com',
      headers: JSON.stringify(currentConfig?.headers ?? {}, null, 2),
      body: currentConfig?.body ?? '',
      auth: currentConfig?.auth
        ? {
            credentialName: currentConfig.auth.credentialName,
          }
        : undefined,
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
        transformed.headers = values.headers;
      }
    }

    // If body contains JSON, also set json_body for engine compatibility
    if (typeof values.body === 'string' && values.body.trim()) {
      try {
        const parsedBody = JSON.parse(values.body);
        transformed.json_body = parsedBody;
      } catch (e) {
        transformed.json_body = undefined;
      }
    } else {
      transformed.json_body = undefined;
    }

    return transformed;
  };

  // Initialize form with proper URL if not set
  React.useEffect(() => {
    if (!currentConfig?.url) {
      setValue('url', 'https://api.example.com');
      updateNodeConfig(nodeId, { url: 'https://api.example.com' });
    }
  }, [currentConfig, nodeId, updateNodeConfig, setValue]);

  // Watch form changes and sync to store when valid
  React.useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      // Always update config immediately for URL changes
      if (name === 'url' && values.url && typeof values.url === 'string') {
        try {
          new URL(values.url);
          updateNodeConfig(nodeId, { url: values.url });
        } catch (e) {
          // Invalid URL
        }
      }

      // Full validation and update
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
  const watchedCredential = watch('auth.credentialName');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      {/* CHANEL Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#FFFFFF',
            marginBottom: '14px',
            letterSpacing: '0.05em',
          }}
        >
          CHANEL
        </h3>
        <div>
          <label style={{ display: 'block' }}>
            <span
              style={{
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '20px',
                lineHeight: '24px',
                color: '#FFFFFF',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              #weekly-updates
            </span>
            <input
              {...register('url')}
              type="text"
              style={{
                width: '100%',
                height: '57px',
                background: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '10px',
                padding: '0 16px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                color: '#FFFFFF',
                outline: 'none',
              }}
              placeholder="#weekly-updates"
            />
          </label>
        </div>
      </motion.div>

      {/* MESSAGE Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h3
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#FFFFFF',
            marginBottom: '14px',
            letterSpacing: '0.05em',
          }}
        >
          MESSAGE
        </h3>
        <div>
          <label style={{ display: 'block' }}>
            <span
              style={{
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '20px',
                lineHeight: '24px',
                color: '#FFFFFF',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              {'{{summary}}'}
            </span>
            <textarea
              {...register('body')}
              style={{
                width: '100%',
                height: '123px',
                background: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '10px',
                padding: '16px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                color: '#FFFFFF',
                outline: 'none',
                resize: 'none',
              }}
              placeholder="{'{{summary}}'}"
            />
          </label>
        </div>
      </motion.div>

      {/* CREDENTIALS Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <h3
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 600,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#FFFFFF',
            marginBottom: '14px',
            letterSpacing: '0.05em',
          }}
        >
          CREDENTIALS
        </h3>
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block' }}>
            <span
              style={{
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '20px',
                lineHeight: '24px',
                color: '#FFFFFF',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Slack API Key
            </span>
            <div
              onClick={() => setShowCredentialDropdown(!showCredentialDropdown)}
              style={{
                width: '100%',
                height: '57px',
                background: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: '10px',
                padding: '0 16px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                color: '#FFFFFF',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <span>{watchedCredential || 'Select credential'}</span>
              {/* Chevron icon */}
              <svg
                width="10"
                height="14"
                viewBox="0 0 10 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 10L0 5L1.41 3.59L5 7.17L8.59 3.59L10 5L5 10Z"
                  fill="#FFFFFF"
                  transform={
                    showCredentialDropdown ? 'rotate(180 5 7)' : 'rotate(0)'
                  }
                />
                <path
                  d="M5 5L0 10L1.41 11.41L5 7.83L8.59 11.41L10 10L5 5Z"
                  fill="#FFFFFF"
                  transform={
                    showCredentialDropdown ? 'rotate(0)' : 'rotate(180 5 7)'
                  }
                />
              </svg>
            </div>
          </label>

          {/* Dropdown menu */}
          {showCredentialDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: '#2D2D2D',
                border: '1px solid #FFFFFF',
                borderRadius: '10px',
                padding: '8px',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {/* Create new credential button */}
              <div
                onClick={async () => {
                  const name = prompt('Enter credential name:');
                  if (!name) return;

                  const value = prompt(
                    'Enter credential value (e.g., Bearer token):'
                  );
                  if (!value) return;

                  try {
                    await setCredential(name, value);
                    setValue('auth.credentialName', name);
                    setShowCredentialDropdown(false);
                  } catch (error) {
                    console.error('Failed to create credential:', error);
                    alert('Failed to create credential. Please try again.');
                  }
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  color: '#40B8FF',
                  fontSize: '14px',
                  marginBottom: '8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(64, 184, 255, 0.1)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 0V16M0 8H16" stroke="#40B8FF" strokeWidth="2" />
                </svg>
                Create new credential
              </div>
              <div
                onClick={() => {
                  setValue('auth.credentialName', '');
                  setShowCredentialDropdown(false);
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  marginBottom: '4px',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.1)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                No authentication needed
              </div>
              {credentialList.map((cred) => (
                <div
                  key={cred.name}
                  onClick={() => {
                    setValue('auth.credentialName', cred.name);
                    setShowCredentialDropdown(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.1)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {cred.name} ({cred.maskedPreview})
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </form>
  );
}
