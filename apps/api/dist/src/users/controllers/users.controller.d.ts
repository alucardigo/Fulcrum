import { UsersService } from '../services/users.service';
import { UserWithRoles } from '../../casl/casl-ability.factory';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(user: UserWithRoles): Promise<Omit<User, "password">[]>;
    findOne(id: string, user: UserWithRoles): Promise<Omit<User, "password"> | null>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto, user: UserWithRoles): Promise<Omit<User, "password">>;
}
