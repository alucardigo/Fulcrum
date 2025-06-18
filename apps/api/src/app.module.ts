import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Core Modules from earlier phases
    UsersModule,
    AuthModule,

    // Feature Modules - Phase 3
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
    // Logger, // Logger is typically instantiated directly: new Logger(Context)
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
