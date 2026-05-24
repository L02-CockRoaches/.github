function createLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => store.set(key, value)),
    removeItem: jest.fn((key: string) => store.delete(key)),
    clear: jest.fn(() => store.clear()),
  };
}

describe('retention service', () => {
  beforeEach(() => {
    jest.resetModules();
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorage(),
      configurable: true,
    });
  });

  it('creates first-session retention context', async () => {
    const { startRetentionSession } = require('@/services/retention');

    const context = await startRetentionSession(new Date('2026-05-24T00:00:00.000Z'));

    expect(context.sessionCount).toBe(1);
    expect(context.isReturningUser).toBe(false);
    expect(context.daysSinceFirstSeen).toBe(0);
    expect(context.sessionId).toMatch(/^session_/);
  });

  it('increments returning session count from persisted state', async () => {
    let retention = require('@/services/retention');
    await retention.startRetentionSession(new Date('2026-05-20T00:00:00.000Z'));

    jest.resetModules();
    retention = require('@/services/retention');
    const context = await retention.startRetentionSession(new Date('2026-05-24T00:00:00.000Z'));

    expect(context.sessionCount).toBe(2);
    expect(context.isReturningUser).toBe(true);
    expect(context.daysSinceFirstSeen).toBe(4);
    expect(context.daysSinceLastSeen).toBe(4);
  });
});
