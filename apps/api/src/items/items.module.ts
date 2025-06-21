import { Module } from '@nestjs/common';
import { ItemsService } from './services/items.service';
// import { ItemsController } from './controllers/items.controller';
// PrismaService é provido pelo AppModule e disponível para injeção
// import { PrismaService } from '../prisma.service';

@Module({
  // controllers: [ItemsController],
  providers: [
    ItemsService,
    // PrismaService // Não precisa ser provido aqui se ItemsService o injeta e AppModule o provê
  ],
  exports: [ItemsService],
})
export class ItemsModule {}
