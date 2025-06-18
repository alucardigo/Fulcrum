import { Injectable, ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client'; // Importar Role também

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, senha, primeiroNome, ultimoNome, cargo } = createUserDto;

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
        if (!isNaN(parsedSaltRounds) && parsedSaltRounds > 0) { // Ensure it's a positive number
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

    const userData: Prisma.UserCreateInput = { // Use Prisma.UserCreateInput for better typing
      email,
      password: hashedPassword,
      firstName: primeiroNome,
      lastName: ultimoNome,
    };

    if (cargo) {
      this.logger.log(`Tentando associar usuário ${email} ao cargo/role: ${cargo}`);
      try {
        const roleToConnect = await this.prisma.role.findUnique({
          where: { name: cargo },
        });

        if (roleToConnect) {
          this.logger.log(`Role '${cargo}' encontrado (ID: ${roleToConnect.id}). Associando ao usuário.`);
          userData.roles = {
            connect: { id: roleToConnect.id },
          };
        } else {
          this.logger.warn(`Role com nome '${cargo}' não encontrado. O usuário será criado sem este cargo específico.`);
        }
      } catch (roleError) {
        this.logger.error(`Erro ao buscar o role '${cargo}'. O usuário será criado sem o cargo.`, roleError.stack);
      }
    }

    try {
      // Use include to get roles back for logging confirmation, if desired.
      const newUser = await this.prisma.user.create({
        data: userData,
        include: { roles: true } // Include roles in the returned object
      });

      this.logger.log(`Usuário criado com sucesso: ${newUser.email} (ID: ${newUser.id})`);
      if (cargo) {
        // Check if the roles array in the returned user object contains the target role
        const roleAssociated = newUser.roles?.some(r => r.name === cargo);
        if (roleAssociated) {
          this.logger.log(`Usuário ${newUser.email} associado com sucesso ao cargo/role: ${cargo}`);
        } else {
          // This can happen if role wasn't found, or if include somehow didn't populate it (unlikely for create)
          this.logger.warn(`Associação do cargo '${cargo}' para ${newUser.email} não confirmada no objeto retornado (Role não encontrado ou problema no 'include').`);
        }
      }

      const { password, ...result } = newUser;
      return result;

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

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Tentando encontrar usuário por email: ${email}`);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true }
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
      include: { roles: true }
    });

    if (!user) {
      this.logger.debug(`Nenhum usuário encontrado com o ID: ${id}`);
      return null;
    }

    this.logger.debug(`Usuário encontrado: ${user.email} (ID: ${user.id})`);
    const { password, ...result } = user;
    return result;
  }
}
