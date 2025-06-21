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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_service_1 = require("../metrics/metrics.service");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    metricsService;
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const duration = (Date.now() - startTime) / 1000;
                const statusCode = context.switchToHttp().getResponse().statusCode;
                this.logger.log(`${method} ${url} ${statusCode} ${duration}s`);
                this.metricsService.recordHttpRequest(method, url, statusCode, duration);
            },
            error: (error) => {
                const duration = (Date.now() - startTime) / 1000;
                const statusCode = error.status || 500;
                this.logger.error(`${method} ${url} ${statusCode} ${duration}s - ${error.message}`);
                this.metricsService.recordHttpRequest(method, url, statusCode, duration);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map