import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserRole } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    private excludePassword;
    private excludePasswordFromArray;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<Omit<User, 'password'> | null>;
    findAll(): Promise<Omit<User, 'password'>[]>;
    findOne(id: string): Promise<Omit<User, 'password'> | null>;
    updateUserRole(userId: string, newRole: UserRole): Promise<Omit<User, 'password'>>;
}
