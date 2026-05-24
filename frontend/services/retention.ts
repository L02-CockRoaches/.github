export interface RetentionContext {
  sessionId: string;
  firstSeenAt: string;
  lastSeenAt: string | null;
  sessionCount: number;
  daysSinceFirstSeen: number;
  daysSinceLastSeen: number | null;
  isReturningUser: boolean;
}

interface RetentionState {
  sessionId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  sessionCount: number;
}

const STORAGE_KEY = 'game2shape.retention';
const memoryStore = new Map<string, string>();
let currentContext: RetentionContext | null = null;
let startPromise: Promise<RetentionContext> | null = null;

const storage = {
  async getItem(key: string) {
    if (typeof globalThis.localStorage !== 'undefined') {
      return globalThis.localStorage.getItem(key);
    }
    return memoryStore.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  },
};

export async function startRetentionSession(now = new Date()): Promise<RetentionContext> {
  if (startPromise) return startPromise;

  startPromise = createRetentionContext(now);
  currentContext = await startPromise;
  return currentContext;
}

export async function getRetentionContext(): Promise<RetentionContext> {
  if (currentContext) return currentContext;
  return startRetentionSession();
}

async function createRetentionContext(now: Date): Promise<RetentionContext> {
  const stored = await readState();
  const firstSeenAt = stored?.firstSeenAt ?? now.toISOString();
  const previousLastSeenAt = stored?.lastSeenAt ?? null;
  const sessionCount = (stored?.sessionCount ?? 0) + 1;
  const sessionId = stored?.sessionId ?? createSessionId();

  const context: RetentionContext = {
    sessionId,
    firstSeenAt,
    lastSeenAt: previousLastSeenAt,
    sessionCount,
    daysSinceFirstSeen: daysBetween(firstSeenAt, now),
    daysSinceLastSeen: previousLastSeenAt ? daysBetween(previousLastSeenAt, now) : null,
    isReturningUser: Boolean(stored),
  };

  await storage.setItem(STORAGE_KEY, JSON.stringify({
    sessionId,
    firstSeenAt,
    lastSeenAt: now.toISOString(),
    sessionCount,
  }));

  return context;
}

async function readState(): Promise<RetentionState | null> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as RetentionState;
    if (!parsed.sessionId || !parsed.firstSeenAt || !parsed.lastSeenAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function createSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function daysBetween(fromIso: string, to: Date) {
  const from = new Date(fromIso).getTime();
  if (Number.isNaN(from)) return 0;
  return Math.max(0, Math.floor((to.getTime() - from) / 86_400_000));
}
