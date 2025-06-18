import { Module } from '@nestjs/common';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CaslModule } from '../casl/casl.module'; // Importar CaslModule

@Module({
  imports: [
    AuthModule, // Para JwtAuthGuard
    CaslModule, // Para CaslAbilityFactory (se for usada em ProjectsService/Controller)
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    // PrismaService // Provido pelo AppModule
  ],
})
export class ProjectsModule {}
