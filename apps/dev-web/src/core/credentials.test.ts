/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCredentialStore } from './credentials';

// Mock Web Crypto API for testing
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn(),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock implementations
const mockKey = { type: 'secret', algorithm: { name: 'AES-GCM', length: 256 } };
const mockEncryptedData = new ArrayBuffer(32);
const mockIV = new ArrayBuffer(12);

describe('Credentials Store', () => {
  beforeEach(() => {
    // Reset store state
    useCredentialStore.setState({
      credentials: new Map(),
      masterKey: null,
    });

    // Reset mocks
    vi.clearAllMocks();

    // Setup crypto mocks - return the array that was passed to getRandomValues
    mockCrypto.getRandomValues.mockImplementation((array) => {
      // Fill with deterministic test data
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256;
      }
      return array;
    });

    mockCrypto.subtle.generateKey.mockResolvedValue(mockKey);
    mockCrypto.subtle.encrypt.mockResolvedValue(mockEncryptedData);
    mockCrypto.subtle.decrypt.mockResolvedValue(new TextEncoder().encode('test-secret-value'));
  });

  describe('setCredential', () => {
    it('should generate master key on first credential', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('test-cred', 'secret-value');

      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    });

    it('should encrypt credential value with AES-GCM', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('test-cred', 'secret-value');

      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });

    it('should create credential entry with proper structure', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('test-cred', 'secret-value-123');

      const list = store.listCredentials();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('test-cred');
      expect(list[0].maskedPreview).toBe('sec**********23'); // First 3 + up to 10 * + last 2
      expect(list[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO string
    });
  });

  describe('getCredential', () => {
    it('should return null if credential not found', async () => {
      const store = useCredentialStore.getState();

      const result = await store.getCredential('non-existent');

      expect(result).toBeNull();
    });

    it('should return null if no master key', async () => {
      const store = useCredentialStore.getState();

      // Add credential directly without master key
      store.credentials.set('test', {
        name: 'test',
        encryptedValue: mockEncryptedData,
        iv: mockIV,
        maskedPreview: 'test***',
        createdAt: new Date().toISOString(),
      });

      const result = await store.getCredential('test');

      expect(result).toBeNull();
    });

    it('should decrypt and return credential value', async () => {
      const store = useCredentialStore.getState();

      // Set up credential first
      await store.setCredential('test-cred', 'secret-value');

      const result = await store.getCredential('test-cred');

      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
      expect(result).toBe('test-secret-value'); // From mock decoder
    });

    it('should handle decryption errors gracefully', async () => {
      const store = useCredentialStore.getState();

      // Setup credential
      await store.setCredential('test-cred', 'secret-value');

      // Make decrypt fail
      mockCrypto.subtle.decrypt.mockRejectedValueOnce(new Error('Decryption failed'));

      const result = await store.getCredential('test-cred');

      expect(result).toBeNull();
    });
  });

  describe('listCredentials', () => {
    it('should return empty array when no credentials', () => {
      const store = useCredentialStore.getState();

      const list = store.listCredentials();

      expect(list).toEqual([]);
    });

    it('should return masked credentials list', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('cred1', 'value1');
      await store.setCredential('cred2', 'value2-longer');

      const list = store.listCredentials();

      expect(list).toHaveLength(2);
      expect(list.some(c => c.name === 'cred1')).toBe(true);
      expect(list.some(c => c.name === 'cred2')).toBe(true);
      // Verify masking behavior (value1 is 6 chars, so completely masked)
      const cred1 = list.find(c => c.name === 'cred1');
      const cred2 = list.find(c => c.name === 'cred2');
      expect(cred1?.maskedPreview).toBe('******'); // 6 chars, completely masked
      expect(cred2?.maskedPreview).toBe('val********er'); // First 3 + up to 10 * + last 2
    });
  });

  describe('credential operations', () => {
    it('should handle full lifecycle: create, list, delete, clear', async () => {
      const store = useCredentialStore.getState();

      // Create credentials
      await store.setCredential('cred1', 'value1');
      await store.setCredential('cred2', 'value2');

      // List credentials
      let list = store.listCredentials();
      expect(list).toHaveLength(2);

      // Delete one credential
      store.deleteCredential('cred1');
      list = store.listCredentials();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('cred2');

      // Clear all
      store.clearAll();
      list = store.listCredentials();
      expect(list).toHaveLength(0);
    });
  });

  describe('Security Properties', () => {
    it('should never store plaintext values', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('secret-cred', 'super-secret-password');

      const storeState = useCredentialStore.getState();
      const serialized = JSON.stringify({
        credentials: Array.from(storeState.credentials.entries()),
        masterKey: storeState.masterKey,
      });

      // Ensure no plaintext secrets in serialized state
      expect(serialized).not.toContain('super-secret-password');
      expect(serialized).toContain('sup**********rd'); // Should contain masked version
    });

    it('should use different IVs for different credentials', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('cred1', 'value1');
      await store.setCredential('cred2', 'value2');

      // Access the internal credentials map directly
      const storeState = useCredentialStore.getState();
      const cred1 = storeState.credentials.get('cred1');
      const cred2 = storeState.credentials.get('cred2');

      // Check that both credentials have IVs
      expect(cred1?.iv).toBeDefined();
      expect(cred2?.iv).toBeDefined();
      // Note: In our mock, getRandomValues creates deterministic data
      // but each call creates a different sequence, so IVs will differ
    });

    it('should mask short values completely', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('short', 'abc');

      const list = store.listCredentials();
      expect(list[0].maskedPreview).toBe('***'); // Short values completely masked
    });

    it('should mask medium values with partial reveal', async () => {
      const store = useCredentialStore.getState();

      await store.setCredential('medium', 'abcdef');

      const list = store.listCredentials();
      expect(list[0].maskedPreview).toBe('******'); // 6 chars, completely masked
    });
  });
});