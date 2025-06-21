import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = any>(
    err: any, 
    user: TUser, 
    info: any, 
    context: ExecutionContext
  ): TUser {
    if (err || !user) {
      this.logger.warn(`JwtAuthGuard: Autenticação JWT falhou. Info: ${info?.message || 'Nenhuma info.'}. Erro: ${err?.message}`);
      let message = 'Acesso não autorizado.';
      if (info?.name === 'TokenExpiredError') {
        message = 'Token JWT expirado.';
      } else if (info?.name === 'JsonWebTokenError') {
        message = 'Token JWT malformado ou inválido.';
      }
      throw err || new UnauthorizedException(message);
    }
    this.logger.log(`JwtAuthGuard: Autenticação JWT bem-sucedida para: ${(user as any)?.email}`);
    return user;
  }
}
