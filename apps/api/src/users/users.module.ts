import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// PrismaService é injetado no UsersService.
// Como AppModule provê PrismaService e UsersModule é importado por AppModule,
// UsersService (dentro de UsersModule) pode injetar PrismaService.
// Não é necessário importar PrismaModule ou prover PrismaService aqui novamente.
// import { PrismaService } from '../prisma.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    ConfigModule, // ConfigService é usado em UsersService
  ],
  providers: [
    UsersService,
    // PrismaService, // Removido - AppModule já provê PrismaService
  ],
  exports: [UsersService], // UsersService é exportado para ser usado por AuthModule
})
export class UsersModule {}
