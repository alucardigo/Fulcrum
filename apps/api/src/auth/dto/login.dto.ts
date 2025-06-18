import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, forneça um endereço de email válido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  senha: string;
}
