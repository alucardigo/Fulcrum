import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    this.logger.debug(`Tentando validar usuário: ${email}`);
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isPasswordMatching = await bcrypt.compare(pass, user.password);
      if (isPasswordMatching) {
        this.logger.log(`Usuário validado com sucesso: ${email}`);
        const { password, ...result } = user;
        return result;
      } else {
        this.logger.warn(`Falha na validação da senha para o usuário: ${email}`);
      }
    } else {
      this.logger.warn(`Tentativa de login para email não encontrado: ${email}`);
    }
    return null;
  }

  async login(user: Omit<User, 'password'>): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    this.logger.log(`Gerando token JWT para o usuário: ${user.email} (ID: ${user.id})`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
