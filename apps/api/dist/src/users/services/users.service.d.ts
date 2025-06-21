import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<Omit<User, 'password'> | null>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
}
