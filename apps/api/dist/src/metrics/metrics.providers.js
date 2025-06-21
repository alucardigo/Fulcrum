"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsProviders = void 0;
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
exports.metricsProviders = [
    (0, nestjs_prometheus_1.makeHistogramProvider)({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'path', 'statusCode'],
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'path', 'statusCode'],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'purchase_requests_total',
        help: 'Total number of purchase requests by operation type',
        labelNames: ['type'],
    }),
    (0, nestjs_prometheus_1.makeCounterProvider)({
        name: 'purchase_requests_by_state',
        help: 'Purchase requests by state transition',
        labelNames: ['fromState', 'toState'],
    }),
];
//# sourceMappingURL=metrics.providers.js.map