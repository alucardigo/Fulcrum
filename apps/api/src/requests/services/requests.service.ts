import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.purchaseRequest.findMany();
  }

  findOne(id: string) {
    return this.prisma.purchaseRequest.findUnique({ where: { id } });
  }
}
