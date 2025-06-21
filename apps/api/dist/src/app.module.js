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
var AppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma.service");
const nestjs_zod_1 = require("nestjs-zod");
const core_1 = require("@nestjs/core");
const logger_module_1 = require("./logging/logger.module");
const security_module_1 = require("./security/security.module");
const metrics_module_1 = require("./metrics/metrics.module");
const redis_cache_module_1 = require("./cache/redis-cache.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const casl_module_1 = require("./casl/casl.module");
const workflow_module_1 = require("./workflow/workflow.module");
const projects_module_1 = require("./projects/projects.module");
const items_module_1 = require("./items/items.module");
const purchaserequests_module_1 = require("./purchaserequests/purchaserequests.module");
let AppModule = AppModule_1 = class AppModule {
    logger = new common_1.Logger(AppModule_1.name);
    constructor() {
        this.logger.log('AppModule inicializado e configurado com todos os módulos.');
        this.logger.log(`ENV: JWT_SECRET carregado: ${process.env.JWT_SECRET ? 'Sim' : 'Não - VERIFICAR .env!'}`);
        this.logger.log(`ENV: JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`);
        this.logger.log(`ENV: SALT_ROUNDS: ${process.env.SALT_ROUNDS}`);
        this.logger.log(`ENV: DATABASE_URL carregado: ${process.env.DATABASE_URL ? 'Sim' : 'Não - VERIFICAR .env!'}`);
        this.logger.log(`ENV: API_PORT: ${process.env.API_PORT}`);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = AppModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
            }),
            logger_module_1.LoggerModule,
            security_module_1.SecurityModule,
            metrics_module_1.MetricsModule,
            redis_cache_module_1.RedisCacheModule,
            health_module_1.HealthModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            casl_module_1.CaslModule,
            workflow_module_1.WorkflowModule,
            projects_module_1.ProjectsModule,
            items_module_1.ItemsModule,
            purchaserequests_module_1.PurchaseRequestsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            prisma_service_1.PrismaService,
            common_1.Logger,
            {
                provide: core_1.APP_PIPE,
                useClass: nestjs_zod_1.ZodValidationPipe,
            },
        ],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map