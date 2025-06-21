import { Injectable, ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client'; // Added UserRole

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // Helper to exclude password from user object
  private excludePassword(user: User): Omit<User, 'password'> {
    const { password, ...result } = user;
    return result;
  }

  // Helper to exclude password from user array
  private excludePasswordFromArray(users: User[]): Omit<User, 'password'>[] {
    return users.map(user => this.excludePassword(user));
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, senha, primeiroNome, ultimoNome, cargo } = createUserDto; // cargo might not be used directly if role assignment is separate

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      this.logger.warn(`Tentativa de criar usuário com email já existente: ${email}`);
      throw new ConflictException('Já existe um usuário com este endereço de email.');
    }

    let saltRounds = 10;
    try {
      const saltRoundsStr = this.configService.get<string>('SALT_ROUNDS');
      if (saltRoundsStr) {
        const parsedSaltRounds = parseInt(saltRoundsStr, 10);
        if (!isNaN(parsedSaltRounds) && parsedSaltRounds > 0) {
          saltRounds = parsedSaltRounds;
        } else {
          this.logger.warn('SALT_ROUNDS não é um número válido ou positivo, usando padrão 10.');
        }
      }
    } catch (e) {
        this.logger.warn('Erro ao ler SALT_ROUNDS da configuração, usando padrão 10.', e);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(senha, saltRounds);
    } catch (error) {
      this.logger.error('Erro ao hashear a senha.', error.stack);
      throw new InternalServerErrorException('Erro ao processar o registro do usuário.');
    }

    const userData = {
      email,
      password: hashedPassword,
      firstName: primeiroNome,
      lastName: ultimoNome,
    };

    try {
      const newUser = await this.prisma.user.create({
        data: userData,
        include: { roles: true }, // Include roles to return them
      });

      // Assign default role if `cargo` is provided in DTO, or handle role assignment separately
      // For now, assuming `cargo` from DTO is the role to be assigned.
      // This part needs to be aligned with how roles are managed (e.g., during user creation or as a separate step)
      // If `cargo` is UserRole enum:
      if (cargo && Object.values(UserRole).includes(cargo as UserRole)) {
        await this.prisma.userRoleAssignment.create({
          data: {
            userId: newUser.id,
            role: cargo as UserRole,
          },
        });
        // Re-fetch user to include the new role in the returned object
        const userWithRole = await this.prisma.user.findUnique({
            where: { id: newUser.id },
            include: { roles: true },
        });
        this.logger.log(`Usuário criado com sucesso: ${userWithRole.email} (ID: ${userWithRole.id}) com cargo ${cargo}`);
        return this.excludePassword(userWithRole);
      }


      this.logger.log(`Usuário criado com sucesso: ${newUser.email} (ID: ${newUser.id})`);
      return this.excludePassword(newUser);

    } catch (error) {
      this.logger.error(`Falha ao criar usuário ${email}. Erro: ${error.message}`, error.stack);
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('Já existe um usuário com este endereço de email.');
      } else if (error.code === 'P2002') {
         throw new ConflictException(`Erro de constraint: ${error.meta?.target?.join(', ')}`);
      }
      throw new InternalServerErrorException('Não foi possível criar o usuário.');
    }
  }

  async findByEmail(email: string): Promise<User | null> { // Returns full user object
    this.logger.debug(`Tentando encontrar usuário por email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (user) {
      this.logger.debug(`Usuário encontrado: ${user.email}`);
    } else {
      this.logger.debug(`Nenhum usuário encontrado com o email: ${email}`);
    }
    return user;
  }

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    this.logger.debug(`Tentando encontrar usuário por ID: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!user) {
      this.logger.debug(`Nenhum usuário encontrado com o ID: ${id}`);
      return null;
    }

    this.logger.debug(`Usuário encontrado: ${user.email} (ID: ${user.id})`);
    return this.excludePassword(user);
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    this.logger.debug('Buscando todos os usuários');
    const users = await this.prisma.user.findMany({
      include: { roles: true }, // Include roles
    });
    this.logger.log(`Encontrados ${users.length} usuários.`);
    return this.excludePasswordFromArray(users);
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> { // Changed to return Omit<User, 'password'>
    this.logger.debug(`Buscando usuário por ID: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!user) {
      this.logger.warn(`Usuário com ID ${id} não encontrado.`);
      return null;
    }
    return this.excludePassword(user);
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<Omit<User, 'password'>> {
    this.logger.log(`Tentando atualizar cargo do usuário ${userId} para ${newRole}`);

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      this.logger.warn(`Usuário ${userId} não encontrado para atualização de cargo.`);
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    // It's common practice to ensure the role exists in the enum
    if (!Object.values(UserRole).includes(newRole)) {
        this.logger.error(`Tentativa de atribuir um cargo inválido: ${newRole}`);
        throw new ConflictException(`Cargo inválido: ${newRole}`);
    }

    try {
      // Using a transaction to ensure atomicity
      const updatedUser = await this.prisma.$transaction(async (prisma) => {
        // Remove existing roles for the user
        await prisma.userRoleAssignment.deleteMany({
          where: { userId: userId },
        });
        this.logger.debug(`Cargos antigos do usuário ${userId} removidos.`);

        // Add the new role
        await prisma.userRoleAssignment.create({
          data: {
            userId: userId,
            role: newRole,
          },
        });
        this.logger.debug(`Novo cargo ${newRole} atribuído ao usuário ${userId}.`);

        // Fetch the updated user with their new roles
        const userWithNewRole = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          include: { roles: true },
        });
        return userWithNewRole;
      });

      this.logger.log(`Cargo do usuário ${userId} atualizado para ${newRole} com sucesso.`);
      return this.excludePassword(updatedUser);
    } catch (error) {
      this.logger.error(`Falha ao atualizar cargo do usuário ${userId} para ${newRole}. Erro: ${error.message}`, error.stack);
      // Handle specific Prisma errors if necessary, e.g., foreign key constraints if roles were tied elsewhere
      throw new InternalServerErrorException('Não foi possível atualizar o cargo do usuário.');
    }
  }
}
