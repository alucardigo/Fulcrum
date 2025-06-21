import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';

// Módulos de infraestrutura
import { LoggerModule } from './logging/logger.module';
import { SecurityModule } from './security/security.module';
import { MetricsModule } from './metrics/metrics.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { HealthModule } from './health/health.module';

// Módulos principais (Fase 1 e 2)
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Módulos de funcionalidades (Fase 3)
import { CaslModule } from './casl/casl.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ProjectsModule } from './projects/projects.module';
import { ItemsModule } from './items/items.module';
import { PurchaseRequestsModule } from './purchaserequests/purchaserequests.module'; // Nome da pasta é 'purchaserequests'

@Module({
  imports: [
    // Configuração do ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    // Módulos de infraestrutura
    LoggerModule,
    SecurityModule,
    MetricsModule,
    RedisCacheModule,
    HealthModule,

    // Módulos principais de negócio
    UsersModule,
    AuthModule,

    // Módulos de funcionalidades - Fase 3
    CaslModule,
    WorkflowModule,
    ProjectsModule,
    ItemsModule,
    PurchaseRequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService, // PrismaService provided here is available to all imported modules
    Logger,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  constructor() {
    this.logger.log('AppModule inicializado e configurado com todos os módulos.');
    this.logger.log(`ENV: JWT_SECRET carregado: ${process.env.JWT_SECRET ? 'Sim' : 'Não - VERIFICAR .env!'}`);
    this.logger.log(`ENV: JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`);
    this.logger.log(`ENV: SALT_ROUNDS: ${process.env.SALT_ROUNDS}`);
    this.logger.log(`ENV: DATABASE_URL carregado: ${process.env.DATABASE_URL ? 'Sim' : 'Não - VERIFICAR .env!'}`);
    this.logger.log(`ENV: API_PORT: ${process.env.API_PORT}`);
  }
}
