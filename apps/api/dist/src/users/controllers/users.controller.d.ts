import { UsersService } from '../services/users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    } | null>;
}
