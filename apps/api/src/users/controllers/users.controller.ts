import { Controller, Get, Param, UseGuards, Patch, Body, ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AbilitiesGuard } from '../../casl/abilities.guard';
import { CheckAbilities } from '../../casl/check-abilities.decorator';
import { Action, UserWithRoles } from '../../casl/casl-ability.factory'; // UserWithRoles might be needed for req.user typing
import { User as UserModel } from '@prisma/client'; // Prisma User model
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; // To get current user from request

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: 'User' }) // Or Action.Manage if more appropriate
  @ApiOperation({ summary: 'Listar todos os usuários (somente Administradores)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.'})
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  async findAll(@CurrentUser() user: UserWithRoles) {
    // Double check with CASL, although guard should handle it.
    // For more complex scenarios, you might check ability directly:
    // if (ability.cannot(Action.Read, 'User')) { throw new ForbiddenException(); }
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: 'User' })
  @ApiOperation({ summary: 'Buscar um usuário pelo ID (somente Administradores ou o próprio usuário)' })
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso.'})
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserWithRoles) {
    // Example of more granular control: allow user to see their own profile
    // const ability = this.caslAbilityFactory.createForUser(user);
    // if (id !== user.id && ability.cannot(Action.Read, 'User')) {
    //   throw new ForbiddenException('Você não tem permissão para visualizar este usuário.');
    // }
    // if (id === user.id && ability.cannot(Action.Read, subject('User', {id: user.id} as any))) {
    //  throw new ForbiddenException('Você não tem permissão para visualizar seu próprio perfil.');
    // }
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, AbilitiesGuard)
  @CheckAbilities({ action: Action.Update, subject: 'User' }) // Or Action.Manage
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Atualizar o cargo de um usuário (somente Administradores)' })
  @ApiResponse({ status: 200, description: 'Cargo do usuário atualizado com sucesso.'})
  @ApiResponse({ status: 400, description: 'Dados inválidos na requisição.'})
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do usuário a ser atualizado' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @CurrentUser() user: UserWithRoles // For logging or additional checks if needed
  ) {
    // The AbilitiesGuard already checks if the current user (admin) can update 'User'
    // No need to manually check user.id === userId here, as admins can change anyone's role.
    return this.usersService.updateUserRole(userId, updateUserRoleDto.role);
  }
}
