import { ApiProperty } from '@nestjs/swagger';

export class PurchaseRequestEntity {
  @ApiProperty({ example: 1, description: 'ID único da requisição' })
  id: number;

  @ApiProperty({ example: 'Compra de laptops', description: 'Título da requisição' })
  title: string;

  @ApiProperty({ example: 'Compra de 10 laptops para o time de desenvolvimento', description: 'Descrição detalhada' })
  description: string;

  @ApiProperty({ example: 'DRAFT', description: 'Estado atual da requisição no workflow' })
  state: string;

  @ApiProperty({ example: 1, description: 'ID do projeto relacionado' })
  projectId: number;

  @ApiProperty({ example: 1, description: 'ID do usuário que criou a requisição' })
  createdById: number;

  @ApiProperty({ example: new Date(), description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'Data da última atualização' })
  updatedAt: Date;
}

export class UserEntity {
  @ApiProperty({ example: 1, description: 'ID único do usuário' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  email: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  name: string;

  @ApiProperty({ example: true, description: 'Se o usuário está ativo' })
  isActive: boolean;

  @ApiProperty({ example: ['USUARIO', 'COMPRAS'], description: 'Papéis do usuário no sistema' })
  roles: string[];

  @ApiProperty({ example: new Date(), description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'Data da última atualização' })
  updatedAt: Date;
}

export class ProjectEntity {
  @ApiProperty({ example: 1, description: 'ID único do projeto' })
  id: number;

  @ApiProperty({ example: 'Projeto Alpha', description: 'Nome do projeto' })
  name: string;

  @ApiProperty({ example: 'Projeto de expansão da área de TI', description: 'Descrição do projeto' })
  description: string;

  @ApiProperty({ example: true, description: 'Se o projeto está ativo' })
  isActive: boolean;

  @ApiProperty({ example: 1, description: 'ID do gerente do projeto' })
  managerId: number;

  @ApiProperty({ example: new Date(), description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'Data da última atualização' })
  updatedAt: Date;
}

export class ItemEntity {
  @ApiProperty({ example: 1, description: 'ID único do item' })
  id: number;

  @ApiProperty({ example: 'Laptop Dell XPS', description: 'Nome do item' })
  name: string;

  @ApiProperty({ example: 'Laptop Dell XPS 15" 32GB RAM', description: 'Descrição do item' })
  description: string;

  @ApiProperty({ example: 'HARDWARE', description: 'Categoria do item' })
  category: string;

  @ApiProperty({ example: 'ABC123', description: 'Código SKU do item' })
  sku: string;

  @ApiProperty({ example: new Date(), description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'Data da última atualização' })
  updatedAt: Date;
}
