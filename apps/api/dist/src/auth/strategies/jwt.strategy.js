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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/services/users.service");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    configService;
    usersService;
    logger = new common_1.Logger(JwtStrategy_1.name);
    constructor(configService, usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
        this.configService = configService;
        this.usersService = usersService;
        this.logger.log('JwtStrategy inicializada.');
        if (!configService.get('JWT_SECRET')) {
            this.logger.error('CRÍTICO: JWT_SECRET não está definido nas variáveis de ambiente!');
        }
    }
    async validate(payload) {
        this.logger.debug(`JwtStrategy: Validando payload JWT para usuário ID: ${payload.sub}`);
        if (!payload || !payload.sub) {
            this.logger.warn('JwtStrategy: Payload JWT inválido ou ID do usuário ausente.');
            throw new common_1.UnauthorizedException('Token JWT malformado ou ID do usuário ausente.');
        }
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            this.logger.warn(`JwtStrategy: Usuário com ID ${payload.sub} não encontrado no banco.`);
            throw new common_1.UnauthorizedException('Usuário associado ao token não encontrado.');
        }
        if (!user.isActive) {
            this.logger.warn(`JwtStrategy: Usuário com ID ${payload.sub} está inativo.`);
            throw new common_1.UnauthorizedException('Usuário está inativo.');
        }
        this.logger.log(`JwtStrategy: Usuário ${user.email} autenticado e recuperado com papéis.`);
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map