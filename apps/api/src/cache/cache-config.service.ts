import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const store = await redisStore({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      password: this.configService.get('REDIS_PASSWORD'),
      tls: this.configService.get('REDIS_TLS') === 'true',
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000), // Exponential backoff
    });

    return {
      store: store,
      ttl: 60 * 60 * 24, // 24 horas padrão
      max: 100, // Máximo de 100 itens em cache
    };
  }
}
