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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../../users/services/users.service");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    usersService;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        this.logger.debug(`Tentando validar usuário: ${email}`);
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const isPasswordMatching = await bcrypt.compare(pass, user.password);
            if (isPasswordMatching) {
                this.logger.log(`Usuário validado com sucesso: ${email}`);
                const { password, ...result } = user;
                return result;
            }
            else {
                this.logger.warn(`Falha na validação da senha para o usuário: ${email}`);
            }
        }
        else {
            this.logger.warn(`Tentativa de login para email não encontrado: ${email}`);
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id };
        this.logger.log(`Gerando token JWT para o usuário: ${user.email} (ID: ${user.id})`);
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map