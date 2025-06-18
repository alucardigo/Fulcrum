import { Module } from '@nestjs/common';
import { RequestsService } from './services/requests.service';
import { RequestsController } from './controllers/requests.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RequestsController],
  providers: [RequestsService, PrismaService],
  exports: [RequestsService],
})
export class RequestsModule {}
