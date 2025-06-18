import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O primeiro nome não pode estar vazio.' })
  @MaxLength(50, { message: 'O primeiro nome deve ter no máximo 50 caracteres.'})
  primeiroNome: string;

  @IsString()
  @IsNotEmpty({ message: 'O último nome não pode estar vazio.' })
  @MaxLength(50, { message: 'O último nome deve ter no máximo 50 caracteres.'})
  ultimoNome: string;

  @IsEmail({}, { message: 'Por favor, forneça um endereço de email válido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  senha: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'O cargo deve ter no máximo 50 caracteres.'})
  cargo?: string;
}
