import { BadRequestException } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { MetricsService } from './metrics.service';

jest.mock('@sentry/nestjs', () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((callback: any) => callback({
    setLevel: jest.fn(),
    setTag: jest.fn(),
    setUser: jest.fn(),
    setContext: jest.fn(),
  })),
}));

describe('MetricsService', () => {
  let service: MetricsService;
  let csvPath: string;

  beforeEach(() => {
    jest.clearAllMocks();
    csvPath = join(tmpdir(), `metrics-${Date.now()}-${Math.random().toString(36).slice(2)}.csv`);
    process.env.METRICS_CSV_PATH = csvPath;
    service = new MetricsService();
  });

  afterEach(() => {
    delete process.env.METRICS_CSV_PATH;
    if (existsSync(csvPath)) {
      rmSync(csvPath);
    }
  });

  it('records a metric event in Sentry', () => {
    const result = service.record({
      event: 'onboarding_cta_pressed',
      timestamp: '2026-05-24T10:30:00.000Z',
      sessionId: 'session-1',
      userId: '42',
      properties: { screen: 'onboarding' },
    });

    expect(result).toEqual({ accepted: true });
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
      category: 'metric',
      message: 'onboarding_cta_pressed',
    }));
    expect(Sentry.captureMessage).toHaveBeenCalledWith('metric:onboarding_cta_pressed');
  });

  it('appends metric events to CSV', () => {
    service.record({
      event: 'game_completed',
      timestamp: '2026-05-24T10:30:00.000Z',
      sessionId: 'session-1',
      properties: {
        screen: 'game',
        durationMs: 123000,
        success: true,
        sessionCount: 2,
        isReturningUser: true,
        daysSinceLastSeen: 1,
        mode: 'solo',
        score: 7400,
        accuracy: 90,
        endpoint: 'scores',
      },
    });

    const csv = readFileSync(csvPath, 'utf8');
    expect(csv).toContain('timestamp,event,sessionId,userId,screen,durationMs,success,sessionCount,isReturningUser,daysSinceLastSeen,mode,score,accuracy,endpoint');
    expect(csv).toContain('2026-05-24T10:30:00.000Z,game_completed,session-1,,game,123000,true,2,true,1,solo,7400,90,scores');
  });

  it('rejects oversized metric properties', () => {
    expect(() => service.record({
      event: 'large_event',
      timestamp: '2026-05-24T10:30:00.000Z',
      properties: { value: 'x'.repeat(5000) },
    })).toThrow(BadRequestException);
  });
});
