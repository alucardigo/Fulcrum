"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
let MetricsService = class MetricsService {
    httpRequestDuration;
    httpRequestsTotal;
    purchaseRequestsTotal;
    purchaseRequestsByState;
    constructor(httpRequestDuration, httpRequestsTotal, purchaseRequestsTotal, purchaseRequestsByState) {
        this.httpRequestDuration = httpRequestDuration;
        this.httpRequestsTotal = httpRequestsTotal;
        this.purchaseRequestsTotal = purchaseRequestsTotal;
        this.purchaseRequestsByState = purchaseRequestsByState;
    }
    recordHttpRequest(method, path, statusCode, duration) {
        this.httpRequestDuration.observe({ method, path, statusCode: statusCode.toString() }, duration);
        this.httpRequestsTotal.inc({ method, path, statusCode: statusCode.toString() });
    }
    recordPurchaseRequest(type) {
        this.purchaseRequestsTotal.inc({ type });
    }
    recordPurchaseRequestStateChange(fromState, toState) {
        this.purchaseRequestsByState.inc({ fromState, toState });
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_prometheus_1.InjectMetric)('http_request_duration_seconds')),
    __param(1, (0, nestjs_prometheus_1.InjectMetric)('http_requests_total')),
    __param(2, (0, nestjs_prometheus_1.InjectMetric)('purchase_requests_total')),
    __param(3, (0, nestjs_prometheus_1.InjectMetric)('purchase_requests_by_state')),
    __metadata("design:paramtypes", [prom_client_1.Histogram,
        prom_client_1.Counter,
        prom_client_1.Counter,
        prom_client_1.Counter])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map