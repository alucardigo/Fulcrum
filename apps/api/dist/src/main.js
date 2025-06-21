"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const global_exception_filter_1 = require("./filters/global-exception.filter");
const helmet_1 = require("helmet");
const rateLimit = require('express-rate-limit');
const swagger_1 = require("@nestjs/swagger");
const metrics_service_1 = require("./metrics/metrics.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.useLogger(app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER));
    const globalPrefix = configService.get('API_PREFIX') || 'api';
    app.setGlobalPrefix(globalPrefix);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Fulcrum API')
        .setDescription('API da Plataforma de Compras Empresarial')
        .setVersion('1.0')
        .addTag('auth', 'Autenticação e autorização')
        .addTag('users', 'Gerenciamento de usuários')
        .addTag('projects', 'Gerenciamento de projetos')
        .addTag('items', 'Catálogo de itens')
        .addTag('purchaserequests', 'Requisições de compra')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const metricsService = app.get(metrics_service_1.MetricsService);
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(metricsService));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.enableCors({
        origin: configService.get('CORS_ORIGIN'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.use((0, helmet_1.default)());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.'
    }));
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`🚀 Aplicação está rodando em: http://localhost:${port}/${globalPrefix}`);
    logger.log(`🌍 Ambiente: ${configService.get('NODE_ENV')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map