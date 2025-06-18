import { IsString, IsNotEmpty, IsOptional, MaxLength, IsArray, ValidateNested, ArrayMinSize, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemForRequestDto } from './create-item-for-request.dto';
import { RequisicaoCompraPrioridade } from '@prisma/client';

export class CreatePurchaseRequestDto {
  @IsString({ message: 'O título da requisição deve ser uma string.' })
  @IsNotEmpty({ message: 'O título da requisição não pode estar vazio.' })
  @MaxLength(200, { message: 'O título da requisição deve ter no máximo 200 caracteres.' })
  title: string;

  @IsString({ message: 'A descrição da requisição deve ser uma string.' })
  @IsOptional()
  @MaxLength(1000, { message: 'A descrição da requisição deve ter no máximo 1000 caracteres.' })
  description?: string;

  @IsString()
  @IsOptional()
  // @IsCuid({ message: 'O ID do projeto deve ser um CUID válido.' }) // Consider adding class-validator-cuid or similar
  projectId?: string;

  @IsOptional()
  @IsEnum(RequisicaoCompraPrioridade, { message: 'Prioridade inválida. Valores válidos: BAIXA, MEDIA, ALTA' })
  priority?: RequisicaoCompraPrioridade;

  @IsArray({ message: 'Os itens devem ser uma lista.' })
  @ValidateNested({ each: true, message: 'Cada item na lista deve ser válido.' })
  @ArrayMinSize(1, { message: 'A requisição deve ter pelo menos um item.' })
  @Type(() => CreateItemForRequestDto)
  items: CreateItemForRequestDto[];
}
