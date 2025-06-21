import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('purchase_requests_total')
    private readonly purchaseRequestsTotal: Counter<string>,
    @InjectMetric('purchase_requests_by_state')
    private readonly purchaseRequestsByState: Counter<string>,
  ) {}

  recordHttpRequest(method: string, path: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe(
      { method, path, statusCode: statusCode.toString() },
      duration,
    );
    this.httpRequestsTotal.inc({ method, path, statusCode: statusCode.toString() });
  }

  recordPurchaseRequest(type: 'created' | 'updated' | 'deleted') {
    this.purchaseRequestsTotal.inc({ type });
  }

  recordPurchaseRequestStateChange(fromState: string, toState: string) {
    this.purchaseRequestsByState.inc({ fromState, toState });
  }
}
