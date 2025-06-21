import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { User } from '@prisma/client';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    validate(email: string, pass: string): Promise<Omit<User, 'password'>>;
}
export {};
