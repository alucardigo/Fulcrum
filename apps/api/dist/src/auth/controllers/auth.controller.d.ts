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
    getProfile(req: AuthenticatedRequest): Omit<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        department: string | null;
        costCenter: string | null;
        approvalLimit: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }, "password"> | {
        userId: string;
        email: string;
    };
    register(createUserDto: CreateUserDto): Promise<Omit<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        department: string | null;
        costCenter: string | null;
        approvalLimit: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
}
export {};
