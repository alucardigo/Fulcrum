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
exports.CacheConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_ioredis_yet_1 = require("cache-manager-ioredis-yet");
let CacheConfigService = class CacheConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async createCacheOptions() {
        const store = await (0, cache_manager_ioredis_yet_1.redisStore)({
            host: this.configService.get('REDIS_HOST') || 'localhost',
            port: this.configService.get('REDIS_PORT') || 6379,
            password: this.configService.get('REDIS_PASSWORD'),
            tls: this.configService.get('REDIS_TLS') === 'true',
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });
        return {
            store: store,
            ttl: 60 * 60 * 24,
            max: 100,
        };
    }
};
exports.CacheConfigService = CacheConfigService;
exports.CacheConfigService = CacheConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheConfigService);
//# sourceMappingURL=cache-config.service.js.map