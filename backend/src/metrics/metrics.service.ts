import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { CreateMetricEventDto } from './dto/create-metric-event.dto';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly maxPropertiesBytes = 4096;
  private readonly csvHeaders = [
    'timestamp',
    'event',
    'sessionId',
    'userId',
    'screen',
    'durationMs',
    'success',
    'sessionCount',
    'isReturningUser',
    'daysSinceLastSeen',
    'mode',
    'score',
    'accuracy',
    'endpoint',
  ];

  record(event: CreateMetricEventDto) {
    this.validatePropertiesSize(event.properties);

    this.logger.log(`metric ${event.event} session=${event.sessionId ?? 'anonymous'}`);
    this.appendCsv(event);

    try {
      Sentry.addBreadcrumb({
        category: 'metric',
        message: event.event,
        level: 'info',
        data: event.properties,
      });

      Sentry.withScope((scope) => {
        scope.setLevel('info');
        scope.setTag('metric.event', event.event);
        if (event.sessionId) scope.setTag('metric.session_id', event.sessionId);
        if (event.userId) scope.setUser({ id: event.userId });
        scope.setContext('metric', {
          event: event.event,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          properties: event.properties,
        });
        Sentry.captureMessage(`metric:${event.event}`);
      });
    } catch (error) {
      this.logger.warn(`Unable to forward metric to Sentry: ${(error as Error).message}`);
    }

    return { accepted: true };
  }

  private appendCsv(event: CreateMetricEventDto) {
    try {
      const csvPath = process.env.METRICS_CSV_PATH ?? resolve(process.cwd(), 'storage', 'metrics_events.csv');
      mkdirSync(dirname(csvPath), { recursive: true });

      if (!existsSync(csvPath)) {
        appendFileSync(csvPath, `${this.csvHeaders.join(',')}\n`, 'utf8');
      }

      const properties = event.properties ?? {};
      const row = [
        event.timestamp,
        event.event,
        event.sessionId ?? '',
        event.userId ?? '',
        properties.screen,
        properties.durationMs,
        properties.success,
        properties.sessionCount,
        properties.isReturningUser,
        properties.daysSinceLastSeen,
        properties.mode,
        properties.score,
        properties.accuracy,
        properties.endpoint,
      ].map((value) => this.toCsvCell(value));

      appendFileSync(csvPath, `${row.join(',')}\n`, 'utf8');
    } catch (error) {
      this.logger.warn(`Unable to append metric CSV: ${(error as Error).message}`);
    }
  }

  private toCsvCell(value: unknown) {
    if (value === undefined || value === null) return '';
    const text = String(value);
    if (!/[",\n\r]/.test(text)) return text;
    return `"${text.replace(/"/g, '""')}"`;
  }

  private validatePropertiesSize(properties?: Record<string, unknown>) {
    if (!properties) return;

    const size = Buffer.byteLength(JSON.stringify(properties), 'utf8');
    if (size > this.maxPropertiesBytes) {
      throw new BadRequestException('Metric properties payload is too large');
    }
  }
}
