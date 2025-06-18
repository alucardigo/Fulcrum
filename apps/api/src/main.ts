import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Segurança: Helmet
  app.use(helmet());

  // Segurança: Rate Limiting
  // Typedef for rateLimit options to avoid type errors with express-rate-limit v7+
  // if specific options like 'handler' or 'store' were more complex.
  // For 'max' and 'windowMs', it's usually fine.
  const limiterOptions: rateLimit.Options = {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Limite cada IP a 100 requisições por janela (windowMs)
      message: 'Too many requests from this IP, please try again after 15 minutes',
      // Standard headers can be true or false.
      // Legacy headers are 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After'
      // standardHeaders: true, // Recommended: 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'
      // legacyHeaders: false, // Disable X-RateLimit-* headers
  };
  app.use(rateLimit.default(limiterOptions));


  // Pipes Globais: ValidationPipe para validação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      transform: true, // Transforma o payload para instâncias de DTO
      forbidNonWhitelisted: true, // Lança erro se propriedades não whitelisted são enviadas
      transformOptions: {
        enableImplicitConversion: true, // Permite conversão implícita de tipos primitivos
      },
    }),
  );

  // CORS (Habilitar se o frontend estiver em um domínio/porta diferente)
  app.enableCors({
    origin: '*', // Em produção, restrinja para o domínio do seu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Prefixo Global para todas as rotas (ex: /api/v1)
  // app.setGlobalPrefix('api/v1');


  const port = configService.get<number>('API_PORT') || 3001; // Usa API_PORT do .env ou 3001 como padrão
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
