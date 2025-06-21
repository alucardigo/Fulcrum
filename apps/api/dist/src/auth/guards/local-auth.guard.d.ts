import { ExecutionContext } from '@nestjs/common';
declare const LocalAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class LocalAuthGuard extends LocalAuthGuard_base {
    private readonly logger;
    handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext): TUser;
}
export {};
