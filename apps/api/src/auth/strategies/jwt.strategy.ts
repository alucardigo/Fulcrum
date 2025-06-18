import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { User as PrismaUser, Role as PrismaRole } from '@prisma/client'; // Role might not be needed here directly
import { UserWithRoles } from '../../casl/casl-ability.factory';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    this.logger.log('JwtStrategy inicializada.');
    if (!configService.get<string>('JWT_SECRET')) {
        this.logger.error('CRÍTICO: JWT_SECRET não está definido nas variáveis de ambiente!');
    }
  }

  async validate(payload: { sub: string; email: string }): Promise<UserWithRoles> {
    this.logger.debug(`JwtStrategy: Validando payload JWT para usuário ID: ${payload.sub}`);
    if (!payload || !payload.sub) {
        this.logger.warn('JwtStrategy: Payload JWT inválido ou ID do usuário ausente.');
        throw new UnauthorizedException('Token JWT malformado ou ID do usuário ausente.');
    }

    // UsersService.findById already returns Omit<User, 'password'> & { roles: Role[] }
    // which is compatible with UserWithRoles (PrismaUser & { roles: PrismaRole[] })
    // as long as PrismaUser is the base for Omit.
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      this.logger.warn(`JwtStrategy: Usuário com ID ${payload.sub} não encontrado no banco.`);
      throw new UnauthorizedException('Usuário associado ao token não encontrado.');
    }

    if (!user.isActive) {
      this.logger.warn(`JwtStrategy: Usuário com ID ${payload.sub} está inativo.`);
      throw new UnauthorizedException('Usuário está inativo.');
    }

    this.logger.log(`JwtStrategy: Usuário ${user.email} autenticado e recuperado com papéis.`);
    return user as UserWithRoles; // Cast is safe if findById ensures roles and omits password
  }
}
