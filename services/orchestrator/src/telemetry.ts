/**
 * Minimal telemetry module for tracking spans
 * Provides basic OpenTelemetry-like interface without heavy dependencies
 */

export interface SpanContext {
  traceId: string;
  spanId: string;
  runId?: string;
  operation: string;
  startTime: number;
  attributes: Record<string, unknown>;
}

export interface SpanResult {
  success: boolean;
  duration: number;
  error?: string;
}

const activeSpans = new Map<string, SpanContext>();

function generateId(): string {
  return Math.random().toString(36).substr(2, 16);
}

function logEvent(
  level: string,
  msg: string,
  meta: Record<string, unknown> = {}
) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      component: 'Telemetry',
      ...meta,
    })
  );
}

export function startSpan(
  operation: string,
  attributes: Record<string, unknown> = {}
): string {
  const spanId = generateId();
  const traceId = (attributes.traceId as string) || generateId();

  const span: SpanContext = {
    traceId,
    spanId,
    runId: attributes.runId as string,
    operation,
    startTime: Date.now(),
    attributes,
  };

  activeSpans.set(spanId, span);

  logEvent('debug', 'span.start', {
    traceId,
    spanId,
    operation,
    runId: span.runId,
    attributes,
  });

  return spanId;
}

export function endSpan(
  spanId: string,
  result: Partial<SpanResult> = {}
): void {
  const span = activeSpans.get(spanId);
  if (!span) {
    logEvent('warn', 'span.not_found', { spanId });
    return;
  }

  const duration = Date.now() - span.startTime;
  const success = result.success ?? true;

  logEvent('info', 'span.end', {
    traceId: span.traceId,
    spanId,
    operation: span.operation,
    runId: span.runId,
    duration,
    success,
    error: result.error,
    attributes: span.attributes,
  });

  activeSpans.delete(spanId);
}

export function recordError(spanId: string, error: Error | string): void {
  const span = activeSpans.get(spanId);
  if (!span) {
    logEvent('warn', 'span.error.not_found', { spanId });
    return;
  }

  const errorMsg = error instanceof Error ? error.message : error;

  logEvent('error', 'span.error', {
    traceId: span.traceId,
    spanId,
    operation: span.operation,
    runId: span.runId,
    error: errorMsg,
    attributes: span.attributes,
  });
}

export async function withSpan<T>(
  operation: string,
  fn: (spanId: string) => Promise<T>,
  attributes: Record<string, unknown> = {}
): Promise<T> {
  const spanId = startSpan(operation, attributes);
  try {
    const result = await fn(spanId);
    endSpan(spanId, { success: true });
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    recordError(spanId, errorMsg);
    endSpan(spanId, { success: false, error: errorMsg });
    throw error;
  }
}
