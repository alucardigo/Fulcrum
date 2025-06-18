import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, IsPositive } from 'class-validator';

export class CreateItemForRequestDto {
  @IsString({ message: 'O nome do item deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do item não pode estar vazio.' })
  @MaxLength(150, { message: 'O nome do item deve ter no máximo 150 caracteres.' })
  name: string;

  @IsString({ message: 'A descrição do item deve ser uma string.' })
  @IsOptional()
  @MaxLength(500, { message: 'A descrição do item deve ter no máximo 500 caracteres.' })
  description?: string;

  @IsNumber({}, { message: 'A quantidade deve ser um número.'})
  @IsPositive({ message: 'A quantidade deve ser um número positivo.'})
  @Min(1, { message: 'A quantidade deve ser pelo menos 1.'})
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço unitário deve ser um número com no máximo 2 casas decimais.' })
  @IsPositive({ message: 'O preço unitário deve ser um valor positivo.'})
  unitPrice: number;

  @IsString({ message: 'O fornecedor deve ser uma string.'})
  @IsOptional()
  @MaxLength(100, { message: 'O nome do fornecedor deve ter no máximo 100 caracteres.'})
  supplier?: string;

  @IsString({ message: 'A URL do produto deve ser uma string.'})
  @IsOptional()
  @MaxLength(2048, { message: 'A URL do produto é muito longa.'})
  url?: string;
}
