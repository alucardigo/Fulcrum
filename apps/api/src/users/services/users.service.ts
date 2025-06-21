import { Injectable, ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

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

    // Remover uso de Prisma.UserCreateInput e ajustar para objeto simples
    const userData = {
      email,
      password: hashedPassword,
      firstName: primeiroNome,
      lastName: ultimoNome,
    };

    try {
      // Remover includes e checagens de roles
      const newUser = await this.prisma.user.create({
        data: userData
      });

      this.logger.log(`Usuário criado com sucesso: ${newUser.email} (ID: ${newUser.id})`);

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
    });

    if (!user) {
      this.logger.debug(`Nenhum usuário encontrado com o ID: ${id}`);
      return null;
    }

    this.logger.debug(`Usuário encontrado: ${user.email} (ID: ${user.id})`);
    const { password, ...result } = user;
    return result;
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
