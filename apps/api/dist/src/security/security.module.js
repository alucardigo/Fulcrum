"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const rateLimit = require('express-rate-limit');
const cookieParser = require("cookie-parser");
const compression = require("compression");
let SecurityModule = class SecurityModule {
    configure(consumer) {
        consumer.apply((0, helmet_1.default)()).forRoutes('*');
        consumer.apply(rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.',
            standardHeaders: true,
            legacyHeaders: false,
        })).exclude({ path: 'auth/login', method: common_1.RequestMethod.POST }, { path: 'auth/refresh', method: common_1.RequestMethod.POST }).forRoutes('*');
        consumer.apply(cookieParser()).forRoutes('*');
        consumer.apply(compression()).forRoutes('*');
    }
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({})
], SecurityModule);
//# sourceMappingURL=security.module.js.map