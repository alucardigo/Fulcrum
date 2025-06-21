import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { User } from '@prisma/client';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null>;
    login(user: Omit<User, 'password'>): Promise<{
        access_token: string;
    }>;
}
