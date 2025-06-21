import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  handleRequest<TUser = any>(
    err: any, 
    user: TUser, 
    info: any, 
    context: ExecutionContext
  ): TUser {
    if (err || !user) {
      this.logger.warn(`LocalAuthGuard: Autenticação falhou. Info: ${info?.message || 'Nenhuma info.'}. Erro: ${err?.message}`);
      throw err || new UnauthorizedException(info?.message || 'Acesso não autorizado.');
    }
    this.logger.log(`LocalAuthGuard: Autenticação bem-sucedida para: ${(user as any)?.email}`);
    return user;
  }
}
