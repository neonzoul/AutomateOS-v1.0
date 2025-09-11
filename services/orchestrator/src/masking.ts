/**
 * masking.ts
 * Utility helpers to mask sensitive header values before logging.
 */
const SENSITIVE_HEADER_REGEX =
  /^(authorization|x-api-key|api-key|x-auth-token)$/i;

export function maskHeaders(h: Record<string, any> | undefined) {
  if (!h) return {};
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(h)) {
    if (SENSITIVE_HEADER_REGEX.test(k)) {
      out[k] = typeof v === 'string' ? maskValue(v) : '***';
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function maskValue(v: string) {
  if (!v) return v;
  if (v.length <= 6) return '*'.repeat(v.length);
  return v.slice(0, 3) + '***' + v.slice(-2);
}
