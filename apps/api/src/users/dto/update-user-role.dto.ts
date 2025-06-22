import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'O novo cargo a ser atribuído ao usuário.',
    enum: UserRole,
    example: UserRole.COMPRAS,
  })
  @IsNotEmpty({ message: 'O cargo não pode estar vazio.' })
  @IsEnum(UserRole, { message: 'Cargo inválido.' })
  role: UserRole;
}
