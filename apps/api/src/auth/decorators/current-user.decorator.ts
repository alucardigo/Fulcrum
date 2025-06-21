import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserWithRoles } from '../../casl/casl-ability.factory';

const logger = new Logger('CurrentUserDecorator');

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserWithRoles | null => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user) {
      // logger.debug(`Retornando usuário do request: ${JSON.stringify(request.user)}`);
      return request.user as UserWithRoles; // Type assertion from JwtStrategy.validate()
    }
    // logger.warn('Nenhum usuário encontrado no request. Retornando null.');
    return null;
  },
);
