import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;
        const slowRequestMs = Number(process.env.METRICS_SLOW_REQUEST_MS ?? 1000);
        this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`);

        if (delay >= slowRequestMs) {
          Sentry.withScope((scope) => {
            scope.setLevel('warning');
            scope.setTag('metric.event', 'performance_api_slow');
            scope.setContext('http_request', { method, url, statusCode, durationMs: delay });
            Sentry.captureMessage('performance_api_slow');
          });
        }
      }),
    );
  }
}
