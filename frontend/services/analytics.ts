import { api, MetricEventPayload } from './api';
import { getRetentionContext, startRetentionSession } from './retention';

type MetricProperties = Record<string, unknown>;

export async function startSession(properties: MetricProperties = {}) {
  const retention = await startRetentionSession();
  await sendMetric({
    event: 'session_started',
    timestamp: new Date().toISOString(),
    sessionId: retention.sessionId,
    properties: { ...retention, ...properties },
  });
  return retention;
}

export async function trackEvent(event: string, properties: MetricProperties = {}) {
  const retention = await getRetentionContext();
  await sendMetric({
    event,
    timestamp: new Date().toISOString(),
    sessionId: retention.sessionId,
    properties: { ...retention, ...properties },
  });
}

export async function trackScreenView(screen: string, properties: MetricProperties = {}) {
  await trackEvent('screen_viewed', { screen, ...properties });
}

export async function trackPerformance(name: string, durationMs: number, properties: MetricProperties = {}) {
  await trackEvent(`performance_${name}`, { durationMs, ...properties });
}

export async function trackError(error: unknown, properties: MetricProperties = {}) {
  const message = error instanceof Error ? error.message : String(error);
  await trackEvent('client_error', { message, ...properties });
}

async function sendMetric(payload: MetricEventPayload) {
  try {
    await api.trackMetric(payload);
  } catch {
    // Metrics must never interrupt user flows.
  }
}
