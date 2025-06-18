import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength, IsPositive } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'O nome do projeto deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do projeto não pode estar vazio.' })
  @MaxLength(100, { message: 'O nome do projeto deve ter no máximo 100 caracteres.' })
  name: string;

  @IsString({ message: 'A descrição do projeto deve ser uma string.' })
  @IsOptional()
  @MaxLength(500, { message: 'A descrição do projeto deve ter no máximo 500 caracteres.' })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O orçamento deve ser um número com no máximo 2 casas decimais.' })
  @IsOptional()
  @IsPositive({ message: 'O orçamento deve ser um valor positivo.'})
  budget?: number;
}
