"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    logger = new common_1.Logger(JwtAuthGuard_1.name);
    handleRequest(err, user, info, context) {
        if (err || !user) {
            this.logger.warn(`JwtAuthGuard: Autenticação JWT falhou. Info: ${info?.message || 'Nenhuma info.'}. Erro: ${err?.message}`);
            let message = 'Acesso não autorizado.';
            if (info?.name === 'TokenExpiredError') {
                message = 'Token JWT expirado.';
            }
            else if (info?.name === 'JsonWebTokenError') {
                message = 'Token JWT malformado ou inválido.';
            }
            throw err || new common_1.UnauthorizedException(message);
        }
        this.logger.log(`JwtAuthGuard: Autenticação JWT bem-sucedida para: ${user?.email}`);
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map