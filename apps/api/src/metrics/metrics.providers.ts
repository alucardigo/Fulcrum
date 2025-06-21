import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const metricsProviders = [
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'statusCode'],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),
  makeCounterProvider({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'statusCode'],
  }),
  makeCounterProvider({
    name: 'purchase_requests_total',
    help: 'Total number of purchase requests by operation type',
    labelNames: ['type'],
  }),
  makeCounterProvider({
    name: 'purchase_requests_by_state',
    help: 'Purchase requests by state transition',
    labelNames: ['fromState', 'toState'],
  }),
];
