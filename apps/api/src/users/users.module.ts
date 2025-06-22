import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller'; // Import controller
import { CaslModule } from '../../casl/casl.module'; // Import CaslModule

// PrismaService é injetado no UsersService.
// Como AppModule provê PrismaService globalmente (se @Global() ou exportado e UsersModule importado por AppModule),
// UsersService (dentro de UsersModule) pode injetar PrismaService.
// Não é necessário importar PrismaModule ou prover PrismaService aqui novamente se já global.

@Module({
  imports: [
    ConfigModule, // ConfigService é usado em UsersService
    CaslModule,   // Necessário para AbilitiesGuard e CaslAbilityFactory
  ],
  controllers: [UsersController], // Adicionar UsersController
  providers: [
    UsersService,
    // PrismaService, // Removido - AppModule deve prover PrismaService
  ],
  exports: [UsersService], // UsersService é exportado para ser usado por AuthModule
})
export class UsersModule {}
