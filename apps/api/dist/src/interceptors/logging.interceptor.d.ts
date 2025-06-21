import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
