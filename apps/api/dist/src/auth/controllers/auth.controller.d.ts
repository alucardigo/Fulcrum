import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UsersService } from '../../users/services/users.service';
import { User as UserModel } from '@prisma/client';
interface AuthenticatedRequest extends Request {
    user: Omit<UserModel, 'password'> | {
        userId: string;
        email: string;
    };
}
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    private readonly logger;
    constructor(authService: AuthService, usersService: UsersService);
    login(req: AuthenticatedRequest, loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    getProfile(req: AuthenticatedRequest): Omit<UserModel, "password"> | {
        userId: string;
        email: string;
    };
    register(createUserDto: CreateUserDto): Promise<Omit<User, "password">>;
}
export {};
