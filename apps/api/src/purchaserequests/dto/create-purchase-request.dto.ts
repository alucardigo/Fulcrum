import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PurchaseRequestPriority } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

// Schema para validação
const CreatePurchaseRequestSchema = z.object({
  title: z.string().min(3).max(200).nonempty('O título da requisição não pode estar vazio.'),
  description: z.string().max(1000).optional(),
  priority: z.nativeEnum(PurchaseRequestPriority),
  projectId: z.string().cuid().optional(),
  costCenter: z.string().optional(),
  justification: z.string().min(10).max(2000),
  expectedDeliveryDate: z.date().optional(),
  items: z.array(z.object({
    name: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    supplier: z.string().optional(),
    supplierCNPJ: z.string().regex(/^\d{14}$/, 'CNPJ inválido').optional(),
  }))
});

// DTO Class
export class CreatePurchaseRequestDto extends createZodDto(CreatePurchaseRequestSchema) {
  @ApiProperty({
    example: 'Compra de laptops',
    description: 'Título da requisição de compra'
  })
  title: string;

  @ApiProperty({
    example: 'Aquisição de 10 laptops para o time de desenvolvimento',
    description: 'Descrição detalhada da requisição',
    required: false
  })
  description?: string;

  @ApiProperty({
    enum: PurchaseRequestPriority,
    example: 'NORMAL',
    description: 'Prioridade da requisição'
  })
  priority: PurchaseRequestPriority;

  @ApiProperty({
    example: 'ckwq3c9p30000jkr9j8q1q1q1',
    description: 'ID do projeto relacionado',
    required: false
  })
  projectId?: string;

  @ApiProperty({
    example: 'CC-001',
    description: 'Centro de custo',
    required: false
  })
  costCenter?: string;

  @ApiProperty({
    example: 'Necessário para equipar novos desenvolvedores',
    description: 'Justificativa para a compra'
  })
  justification: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Data prevista para entrega',
    required: false
  })
  expectedDeliveryDate?: Date;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Laptop Dell XPS' },
        description: { type: 'string', example: 'Laptop Dell XPS 15" 32GB RAM' },
        quantity: { type: 'number', example: 10 },
        unitPrice: { type: 'number', example: 8000.00 },
        supplier: { type: 'string', example: 'Dell Computadores' },
        supplierCNPJ: { type: 'string', example: '72381189000110' }
      }
    }
  })
  items: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    supplier?: string;
    supplierCNPJ?: string;
  }[];
}
