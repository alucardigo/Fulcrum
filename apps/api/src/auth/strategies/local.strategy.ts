import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'senha' // Explicitly set to match LoginDto field 'senha'
    });
  }

  async validate(email: string, pass: string): Promise<Omit<User, 'password'>> {
    this.logger.debug(`LocalStrategy: Validando credenciais para ${email}`);
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      this.logger.warn(`LocalStrategy: Falha na autenticação para ${email}`);
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu email e senha.');
    }
    this.logger.log(`LocalStrategy: Autenticação bem-sucedida para ${email}`);
    return user;
  }
}
