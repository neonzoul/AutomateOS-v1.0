/**
 * Unit tests for Engine HTTP header masking functionality
 * Tests the masking utilities used in the engine to ensure sensitive headers are properly masked in logs
 */

import { describe, it, expect } from 'vitest';

// Replicate the masking utilities from engine/server.js for testing
const SENSITIVE_HEADER_REGEX = /^(authorization|x-api-key|api-key|x-auth-token)$/i;

function maskValue(v: string): string {
  if (!v) return v;
  if (v.length <= 6) return '*'.repeat(v.length);
  return v.slice(0, 3) + '*'.repeat(Math.min(v.length - 5, 10)) + v.slice(-2);
}

function maskHeaders(headers: Record<string, any> | undefined): Record<string, any> {
  if (!headers) return {};
  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADER_REGEX.test(key)) {
      masked[key] = typeof value === 'string' ? maskValue(value) : '***';
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

describe('Engine HTTP Masking', () => {
  describe('maskValue', () => {
    it('should mask short values completely', () => {
      expect(maskValue('abc')).toBe('***');
      expect(maskValue('test12')).toBe('******');
      expect(maskValue('')).toBe('');
    });

    it('should mask long values with partial reveal', () => {
      expect(maskValue('Bearer token123')).toBe('Bea**********23'); // 15 chars
      expect(maskValue('sk-1234567890abcdef')).toBe('sk-**********ef'); // 18 chars
      expect(maskValue('very-long-secret-key')).toBe('ver**********ey'); // 20 chars
    });

    it('should handle edge cases', () => {
      expect(maskValue('a')).toBe('*');
      expect(maskValue('ab')).toBe('**');
      expect(maskValue('abcdefg')).toBe('abc**fg'); // 7 chars: 3 + 2 + 2 = 7
    });
  });

  describe('maskHeaders', () => {
    it('should mask sensitive headers', () => {
      const headers = {
        'Authorization': 'Bearer sk-1234567890',
        'X-API-Key': 'api-key-secret-123',
        'api-key': 'another-secret-key',
        'x-auth-token': 'auth-token-value',
        'Content-Type': 'application/json',
        'User-Agent': 'AutomateOS/1.0',
      };

      const masked = maskHeaders(headers);

      expect(masked['Authorization']).toBe('Bea**********90'); // Bearer sk-1234567890
      expect(masked['X-API-Key']).toBe('api**********23'); // api-key-secret-123
      expect(masked['api-key']).toBe('ano**********ey'); // another-secret-key
      expect(masked['x-auth-token']).toBe('aut**********ue'); // auth-token-value
      expect(masked['Content-Type']).toBe('application/json'); // Not masked
      expect(masked['User-Agent']).toBe('AutomateOS/1.0'); // Not masked
    });

    it('should handle case-insensitive header matching', () => {
      const headers = {
        'AUTHORIZATION': 'Bearer token',
        'authorization': 'Basic auth',
        'X-Api-Key': 'key123',
        'x-AUTH-token': 'token456',
      };

      const masked = maskHeaders(headers);

      expect(masked['AUTHORIZATION']).toBe('Bea*******en'); // Bearer token = 12 chars
      expect(masked['authorization']).toBe('Bas*****th'); // Basic auth = 10 chars
      expect(masked['X-Api-Key']).toBe('******'); // key123 = 6 chars, fully masked
      expect(masked['x-AUTH-token']).toBe('tok***56'); // token456 = 8 chars
    });

    it('should handle non-string values', () => {
      const headers = {
        'Authorization': 123,
        'X-API-Key': null,
        'Content-Length': 1024,
      };

      const masked = maskHeaders(headers);

      expect(masked['Authorization']).toBe('***');
      expect(masked['X-API-Key']).toBe('***');
      expect(masked['Content-Length']).toBe(1024); // Not sensitive, preserved
    });

    it('should handle empty or undefined headers', () => {
      expect(maskHeaders(undefined)).toEqual({});
      expect(maskHeaders({})).toEqual({});
    });

    it('should preserve non-sensitive headers exactly', () => {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'AutomateOS/1.0',
        'Cache-Control': 'no-cache',
        'X-Custom-Header': 'custom-value',
      };

      const masked = maskHeaders(headers);

      expect(masked).toEqual(headers); // Should be identical
    });

    it('should handle notion-specific headers correctly', () => {
      const headers = {
        'Authorization': 'Bearer secret_1234567890abcdef',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      };

      const masked = maskHeaders(headers);

      expect(masked['Authorization']).toBe('Bea**********ef'); // Masked
      expect(masked['Notion-Version']).toBe('2022-06-28'); // Not masked
      expect(masked['Content-Type']).toBe('application/json'); // Not masked
    });

    it('should handle slack webhook headers correctly', () => {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'AutomateOS-Webhook/1.0',
      };

      const masked = maskHeaders(headers);

      expect(masked).toEqual(headers); // No sensitive headers, preserved
    });
  });

  describe('Real-world scenarios', () => {
    it('should properly mask typical Notion API request', () => {
      const notionHeaders = {
        'Authorization': 'Bearer secret_AbCdEfGhIjKlMnOpQrStUvWxYz123456',
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
        'User-Agent': 'AutomateOS/1.0',
      };

      const masked = maskHeaders(notionHeaders);
      const logLine = `HTTP POST https://api.notion.com/v1/pages (headers: ${JSON.stringify(masked)})`;

      expect(logLine).toContain('Bea**********56'); // Masked token
      expect(logLine).toContain('2022-06-28'); // Version preserved
      expect(logLine).toContain('application/json'); // Content-Type preserved
      expect(logLine).not.toContain('secret_AbCdEfGhIjKlMnOpQrStUvWxYz123456'); // Original token not present
    });

    it('should properly mask typical Slack webhook request', () => {
      // Slack webhooks typically don't have auth headers, just the webhook URL contains the secret
      const slackHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'AutomateOS-Slack/1.0',
      };

      const masked = maskHeaders(slackHeaders);
      const logLine = `HTTP POST https://hooks.slack.com/services/SECRET/PATH (headers: ${JSON.stringify(masked)})`;

      expect(logLine).toContain('application/json');
      expect(logLine).toContain('AutomateOS-Slack/1.0');
      // Note: URL secrets are masked separately, not by header masking
    });

    it('should handle multiple API keys in same request', () => {
      const headers = {
        'Authorization': 'Bearer primary-token',
        'X-API-Key': 'secondary-api-key',
        'X-Auth-Token': 'tertiary-auth-token',
        'Content-Type': 'application/json',
      };

      const masked = maskHeaders(headers);

      expect(masked['Authorization']).toBe('Bea**********en'); // primary-token = 13 chars
      expect(masked['X-API-Key']).toBe('sec**********ey'); // secondary-api-key = 17 chars
      expect(masked['X-Auth-Token']).toBe('ter**********en'); // tertiary-auth-token = 19 chars
      expect(masked['Content-Type']).toBe('application/json');

      // Ensure all secrets are masked
      const maskedString = JSON.stringify(masked);
      expect(maskedString).not.toContain('primary-token');
      expect(maskedString).not.toContain('secondary-api-key');
      expect(maskedString).not.toContain('tertiary-auth-token');
    });
  });
});