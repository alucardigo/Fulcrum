"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma.service");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    configService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    excludePassword(user) {
        const { password, ...result } = user;
        return result;
    }
    excludePasswordFromArray(users) {
        return users.map(user => this.excludePassword(user));
    }
    async create(createUserDto) {
        const { email, senha, primeiroNome, ultimoNome, cargo } = createUserDto;
        const existingUserByEmail = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUserByEmail) {
            this.logger.warn(`Tentativa de criar usuário com email já existente: ${email}`);
            throw new common_1.ConflictException('Já existe um usuário com este endereço de email.');
        }
        let saltRounds = 10;
        try {
            const saltRoundsStr = this.configService.get('SALT_ROUNDS');
            if (saltRoundsStr) {
                const parsedSaltRounds = parseInt(saltRoundsStr, 10);
                if (!isNaN(parsedSaltRounds) && parsedSaltRounds > 0) {
                    saltRounds = parsedSaltRounds;
                }
                else {
                    this.logger.warn('SALT_ROUNDS não é um número válido ou positivo, usando padrão 10.');
                }
            }
        }
        catch (e) {
            this.logger.warn('Erro ao ler SALT_ROUNDS da configuração, usando padrão 10.', e);
        }
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(senha, saltRounds);
        }
        catch (error) {
            this.logger.error('Erro ao hashear a senha.', error.stack);
            throw new common_1.InternalServerErrorException('Erro ao processar o registro do usuário.');
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
                include: { roles: true },
            });
            if (cargo && Object.values(client_1.UserRole).includes(cargo)) {
                await this.prisma.userRoleAssignment.create({
                    data: {
                        userId: newUser.id,
                        role: cargo,
                    },
                });
                const userWithRole = await this.prisma.user.findUnique({
                    where: { id: newUser.id },
                    include: { roles: true },
                });
                this.logger.log(`Usuário criado com sucesso: ${userWithRole.email} (ID: ${userWithRole.id}) com cargo ${cargo}`);
                return this.excludePassword(userWithRole);
            }
            this.logger.log(`Usuário criado com sucesso: ${newUser.email} (ID: ${newUser.id})`);
            return this.excludePassword(newUser);
        }
        catch (error) {
            this.logger.error(`Falha ao criar usuário ${email}. Erro: ${error.message}`, error.stack);
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new common_1.ConflictException('Já existe um usuário com este endereço de email.');
            }
            else if (error.code === 'P2002') {
                throw new common_1.ConflictException(`Erro de constraint: ${error.meta?.target?.join(', ')}`);
            }
            throw new common_1.InternalServerErrorException('Não foi possível criar o usuário.');
        }
    }
    async findByEmail(email) {
        this.logger.debug(`Tentando encontrar usuário por email: ${email}`);
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });
        if (user) {
            this.logger.debug(`Usuário encontrado: ${user.email}`);
        }
        else {
            this.logger.debug(`Nenhum usuário encontrado com o email: ${email}`);
        }
        return user;
    }
    async findById(id) {
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
    async findAll() {
        this.logger.debug('Buscando todos os usuários');
        const users = await this.prisma.user.findMany({
            include: { roles: true },
        });
        this.logger.log(`Encontrados ${users.length} usuários.`);
        return this.excludePasswordFromArray(users);
    }
    async findOne(id) {
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
    async updateUserRole(userId, newRole) {
        this.logger.log(`Tentando atualizar cargo do usuário ${userId} para ${newRole}`);
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!userExists) {
            this.logger.warn(`Usuário ${userId} não encontrado para atualização de cargo.`);
            throw new common_1.NotFoundException(`Usuário com ID ${userId} não encontrado.`);
        }
        if (!Object.values(client_1.UserRole).includes(newRole)) {
            this.logger.error(`Tentativa de atribuir um cargo inválido: ${newRole}`);
            throw new common_1.ConflictException(`Cargo inválido: ${newRole}`);
        }
        try {
            const updatedUser = await this.prisma.$transaction(async (prisma) => {
                await prisma.userRoleAssignment.deleteMany({
                    where: { userId: userId },
                });
                this.logger.debug(`Cargos antigos do usuário ${userId} removidos.`);
                await prisma.userRoleAssignment.create({
                    data: {
                        userId: userId,
                        role: newRole,
                    },
                });
                this.logger.debug(`Novo cargo ${newRole} atribuído ao usuário ${userId}.`);
                const userWithNewRole = await prisma.user.findUniqueOrThrow({
                    where: { id: userId },
                    include: { roles: true },
                });
                return userWithNewRole;
            });
            this.logger.log(`Cargo do usuário ${userId} atualizado para ${newRole} com sucesso.`);
            return this.excludePassword(updatedUser);
        }
        catch (error) {
            this.logger.error(`Falha ao atualizar cargo do usuário ${userId} para ${newRole}. Erro: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Não foi possível atualizar o cargo do usuário.');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map