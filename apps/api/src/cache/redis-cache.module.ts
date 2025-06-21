import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from './cache-config.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
