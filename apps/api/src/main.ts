import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import helmet from 'helmet';
const rateLimit = require('express-rate-limit');
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MetricsService } from './metrics/metrics.service';

async function bootstrap() {
  // Cria a aplicação com Winston logger
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  
  // Usa o Winston logger para logs do NestJS
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Configuração global de prefixo da API
  const globalPrefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(globalPrefix);

  // Configuração do Swagger
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Interceptors globais
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new LoggingInterceptor(metricsService));

  // Filtros de exceção globais
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configuração de CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Segurança: Helmet
  app.use(helmet());

  // Segurança: Rate Limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.'
  }));

  // Inicia o servidor
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Aplicação está rodando em: http://localhost:${port}/${globalPrefix}`);
  logger.log(`🌍 Ambiente: ${configService.get('NODE_ENV')}`);
}
bootstrap();
