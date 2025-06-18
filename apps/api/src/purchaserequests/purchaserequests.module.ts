import { Module } from '@nestjs/common';
import { PurchaseRequestsService } from './services/purchaserequests.service';
import { PurchaseRequestsController } from './controllers/purchaserequests.controller';
// PrismaService é provido globalmente pelo AppModule
import { AuthModule } from '../auth/auth.module'; // Para JwtAuthGuard e CurrentUser
import { ItemsModule } from '../items/items.module'; // ItemsService é injetado em PurchaseRequestsService
import { CaslModule } from '../casl/casl.module';   // Para injetar CaslAbilityFactory

@Module({
  imports: [
    AuthModule,
    ItemsModule, // PurchaseRequestsService construtor injeta ItemsService
    CaslModule,
  ],
  controllers: [PurchaseRequestsController],
  providers: [
    PurchaseRequestsService,
    // PrismaService // Não é provido aqui, AppModule o faz.
  ],
  // exports: [PurchaseRequestsService], // Exportar se outro módulo precisar dele diretamente.
})
export class PurchaseRequestsModule {}
