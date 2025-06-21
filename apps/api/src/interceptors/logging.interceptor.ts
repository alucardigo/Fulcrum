import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly metricsService: MetricsService;

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const duration = (Date.now() - startTime) / 1000; // Convert to seconds
          const statusCode = context.switchToHttp().getResponse().statusCode;

          this.logger.log(
            `${method} ${url} ${statusCode} ${duration}s`,
          );

          // Record metrics
          this.metricsService.recordHttpRequest(
            method,
            url,
            statusCode,
            duration,
          );
        },
        error: (error: any) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;

          this.logger.error(
            `${method} ${url} ${statusCode} ${duration}s - ${error.message}`,
          );

          // Record metrics for errors too
          this.metricsService.recordHttpRequest(
            method,
            url,
            statusCode,
            duration,
          );
        },
      }),
    );
  }
}
