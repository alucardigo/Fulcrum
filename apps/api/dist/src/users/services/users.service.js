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
let UsersService = UsersService_1 = class UsersService {
    prisma;
    configService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
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
                data: userData
            });
            this.logger.log(`Usuário criado com sucesso: ${newUser.email} (ID: ${newUser.id})`);
            const { password, ...result } = newUser;
            return result;
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
        });
        if (!user) {
            this.logger.debug(`Nenhum usuário encontrado com o ID: ${id}`);
            return null;
        }
        this.logger.debug(`Usuário encontrado: ${user.email} (ID: ${user.id})`);
        const { password, ...result } = user;
        return result;
    }
    findAll() {
        return this.prisma.user.findMany();
    }
    findOne(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map