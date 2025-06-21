import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import helmet from 'helmet';
const rateLimit = require('express-rate-limit');
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Helmet para segurança de cabeçalhos HTTP
    consumer.apply(helmet()).forRoutes('*');
    consumer.apply(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // limite 100 requisições por windowMs
      message: 'Muitas requisições vindas deste IP, tente novamente mais tarde.',
      standardHeaders: true,
      legacyHeaders: false,
    })).exclude(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/refresh', method: RequestMethod.POST },
    ).forRoutes('*');

    // Cookie parser para lidar com cookies de forma segura
    consumer.apply(cookieParser()).forRoutes('*');

    // Compressão para reduzir tamanho das respostas
    consumer.apply(compression()).forRoutes('*');
  }
}
