/**
 * Credential Store with AES-GCM Encryption
 * Sprint 4: In-memory secure credential management
 *
 * Security principles:
 * - Credentials stored encrypted in memory only
 * - Never persisted to localStorage or exports
 * - AES-GCM provides authenticated encryption
 * - Only masked previews visible in UI
 */

import { create } from 'zustand';

// Credential store types
export interface CredentialEntry {
  name: string;
  encryptedValue: ArrayBuffer;
  iv: ArrayBuffer;
  maskedPreview: string;
  createdAt: string;
}

interface CredentialStore {
  credentials: Map<string, CredentialEntry>;
  masterKey: CryptoKey | null;

  // Actions
  setCredential: (name: string, value: string) => Promise<void>;
  getCredential: (name: string) => Promise<string | null>;
  listCredentials: () => { name: string; maskedPreview: string; createdAt: string }[];
  deleteCredential: (name: string) => void;
  clearAll: () => void;
}

// Utility functions for encryption
const generateKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // not extractable for security
    ['encrypt', 'decrypt']
  );
};

const generateIV = (): ArrayBuffer => {
  const ivArray = new Uint8Array(12); // 96-bit IV for AES-GCM
  window.crypto.getRandomValues(ivArray);
  return ivArray.buffer;
};

const encryptValue = async (key: CryptoKey, value: string): Promise<{ encrypted: ArrayBuffer; iv: ArrayBuffer }> => {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    data
  );

  return { encrypted, iv };
};

const decryptValue = async (key: CryptoKey, encrypted: ArrayBuffer, iv: ArrayBuffer): Promise<string> => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

const maskValue = (value: string): string => {
  if (!value) return '';
  if (value.length <= 8) return '*'.repeat(value.length);
  return value.slice(0, 3) + '*'.repeat(Math.min(value.length - 5, 10)) + value.slice(-2);
};

// Zustand store
export const useCredentialStore = create<CredentialStore>((set, get) => ({
  credentials: new Map(),
  masterKey: null,

  setCredential: async (name: string, value: string) => {
    let { masterKey } = get();

    // Generate master key on first use
    if (!masterKey) {
      masterKey = await generateKey();
      set({ masterKey });
    }

    // Encrypt the credential
    const { encrypted, iv } = await encryptValue(masterKey, value);

    // Create credential entry
    const entry: CredentialEntry = {
      name,
      encryptedValue: encrypted,
      iv,
      maskedPreview: maskValue(value),
      createdAt: new Date().toISOString(),
    };

    // Store in memory
    const newCredentials = new Map(get().credentials);
    newCredentials.set(name, entry);
    set({ credentials: newCredentials });
  },

  getCredential: async (name: string): Promise<string | null> => {
    const { credentials, masterKey } = get();

    if (!masterKey) {
      console.warn('No master key available for credential decryption');
      return null;
    }

    const entry = credentials.get(name);
    if (!entry) {
      return null;
    }

    try {
      return await decryptValue(masterKey, entry.encryptedValue, entry.iv);
    } catch (error) {
      console.error('Failed to decrypt credential:', error);
      return null;
    }
  },

  listCredentials: () => {
    const { credentials } = get();
    return Array.from(credentials.values()).map((entry) => ({
      name: entry.name,
      maskedPreview: entry.maskedPreview,
      createdAt: entry.createdAt,
    }));
  },

  deleteCredential: (name: string) => {
    const newCredentials = new Map(get().credentials);
    newCredentials.delete(name);
    set({ credentials: newCredentials });
  },

  clearAll: () => {
    set({ credentials: new Map(), masterKey: null });
  },
}));

// Convenience hooks for credential management
export const useCredentials = () => {
  const { setCredential, getCredential, listCredentials, deleteCredential } = useCredentialStore();
  return { setCredential, getCredential, listCredentials, deleteCredential };
};

export const useCredentialList = () => {
  const listCredentials = useCredentialStore((state) => state.listCredentials);
  return listCredentials();
};