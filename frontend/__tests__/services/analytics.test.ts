const mockTrackMetric = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/services/api', () => ({
  api: { trackMetric: mockTrackMetric },
}));

jest.mock('@/services/retention', () => ({
  startRetentionSession: jest.fn().mockResolvedValue({
    sessionId: 'session-1',
    firstSeenAt: '2026-05-24T00:00:00.000Z',
    lastSeenAt: null,
    sessionCount: 1,
    daysSinceFirstSeen: 0,
    daysSinceLastSeen: null,
    isReturningUser: false,
  }),
  getRetentionContext: jest.fn().mockResolvedValue({
    sessionId: 'session-1',
    firstSeenAt: '2026-05-24T00:00:00.000Z',
    lastSeenAt: null,
    sessionCount: 1,
    daysSinceFirstSeen: 0,
    daysSinceLastSeen: null,
    isReturningUser: false,
  }),
}));

describe('analytics service', () => {
  beforeEach(() => {
    mockTrackMetric.mockClear();
  });

  it('sends event metrics with retention properties', async () => {
    const { trackEvent } = require('@/services/analytics');

    await trackEvent('play_pressed', { mode: 'solo' });

    expect(mockTrackMetric).toHaveBeenCalledWith(expect.objectContaining({
      event: 'play_pressed',
      sessionId: 'session-1',
      properties: expect.objectContaining({
        mode: 'solo',
        sessionCount: 1,
      }),
    }));
  });

  it('does not throw when metric transport fails', async () => {
    mockTrackMetric.mockRejectedValueOnce(new Error('offline'));
    const { trackEvent } = require('@/services/analytics');

    await expect(trackEvent('offline_event')).resolves.toBeUndefined();
  });
});
