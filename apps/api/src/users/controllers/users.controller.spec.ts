import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CaslAbilityFactory, AppAbility, UserRole, Action, UserWithRoles } from '../../casl/casl-ability.factory';
import { AbilitiesGuard } from '../../casl/abilities.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';

// Helper to create a mock user for req.user
const mockReqUser = (id: string, email: string, roles: UserRole[]): UserWithRoles => ({
  id,
  email,
  firstName: 'Test',
  lastName: 'User',
  // Add other Prisma.UserGetPayload fields if your CASL factory or services depend on them directly from req.user
  // For basic role checking, id, email, and roles are key.
  // The actual User model has more fields, but for req.user context in CASL factory, this might be sufficient.
  // Let's ensure it matches UserWithRoles structure closely.
  password: 'hashedPassword', // Will be excluded by service, but part of User model
  isActive: true,
  department: null,
  costCenter: null,
  approvalLimit: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: roles.map(role => ({ id: `role-${role}`, userId: id, role, createdAt: new Date(), updatedAt: new Date() })),
});

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;
  let caslAbilityFactory: CaslAbilityFactory; // Keep instance for creating abilities

  // Mock UsersService methods
  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateUserRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        CaslAbilityFactory, // Provide the real factory
        Reflector, // AbilitiesGuard depends on Reflector
      ],
    })
    // Mock JwtAuthGuard to always allow access for simplicity in these tests
    // Focus is on AbilitiesGuard and controller logic
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    // We will manually call and check AbilitiesGuard where needed or mock its result
    .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService); // This is the mock
    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should allow ADMIN to find all users', async () => {
      const adminUser = mockReqUser('admin-id', 'admin@example.com', [UserRole.ADMINISTRADOR]);
      const mockUsersList = [
        { id: 'user1', email: 'user1@example.com', roles: [{role: UserRole.SOLICITANTE}], password: '' }, // password excluded
        { id: 'user2', email: 'user2@example.com', roles: [{role: UserRole.COMPRAS}], password: '' },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsersList as any); // as any to simplify mock type

      // Simulate AbilitiesGuard logic for this endpoint
      const ability = caslAbilityFactory.createForUser(adminUser);
      expect(ability.can(Action.Read, 'User')).toBe(true); // Admin can manage all

      const result = await controller.findAll(adminUser);
      expect(result).toEqual(mockUsersList);
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('should forbid SOLICITANTE from finding all users', async () => {
      const solicitanteUser = mockReqUser('sol-id', 'sol@example.com', [UserRole.SOLICITANTE]);

      const ability = caslAbilityFactory.createForUser(solicitanteUser);
      expect(ability.can(Action.Read, 'User')).toBe(false);
      // For a controller test, you'd typically check if the guard throws.
      // Here, we are unit testing the controller method more directly after guard concepts.
      // To truly test the guard, you'd need a higher-level e2e test or more complex guard mocking.
      // For this conceptual step, we confirm the ability check.
      // If AbilitiesGuard were to run, it would throw ForbiddenException.
      // Let's simulate this by checking the ability and expecting a call to throw if it were real.
      try {
        if (!ability.can(Action.Read, 'User')) {
          throw new ForbiddenException();
        }
        await controller.findAll(solicitanteUser); // This line wouldn't be reached
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
      expect(usersService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    const userIdToUpdate = 'user-to-update';
    const updateUserRoleDto: UpdateUserRoleDto = { role: UserRole.COMPRAS };

    it('should allow ADMIN to update user role', async () => {
      const adminUser = mockReqUser('admin-id', 'admin@example.com', [UserRole.ADMINISTRADOR]);
      const updatedUserMock = { id: userIdToUpdate, email: 'updated@example.com', roles: [{role: UserRole.COMPRAS}], password: '' };
      mockUsersService.updateUserRole.mockResolvedValue(updatedUserMock as any);

      const ability = caslAbilityFactory.createForUser(adminUser);
      expect(ability.can(Action.Update, 'User')).toBe(true); // Admin can manage all

      const result = await controller.updateUserRole(userIdToUpdate, updateUserRoleDto, adminUser);
      expect(result).toEqual(updatedUserMock);
      expect(usersService.updateUserRole).toHaveBeenCalledWith(userIdToUpdate, updateUserRoleDto.role);
    });

    it('should forbid SOLICITANTE from updating user role', async () => {
      const solicitanteUser = mockReqUser('sol-id', 'sol@example.com', [UserRole.SOLICITANTE]);

      const ability = caslAbilityFactory.createForUser(solicitanteUser);
      expect(ability.can(Action.Update, 'User')).toBe(false);

      try {
        if (!ability.can(Action.Update, 'User')) {
          throw new ForbiddenException();
        }
        await controller.updateUserRole(userIdToUpdate, updateUserRoleDto, solicitanteUser);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
      expect(usersService.updateUserRole).not.toHaveBeenCalled();
    });
  });

  // Test for findOne as it's in the controller
  describe('findOne', () => {
    const targetUserId = 'target-user-id';

    it('should allow ADMIN to find any user', async () => {
        const adminUser = mockReqUser('admin-id', 'admin@example.com', [UserRole.ADMINISTRADOR]);
        const mockTargetUser = { id: targetUserId, email: 'target@example.com', roles: [{role: UserRole.SOLICITANTE}], password: '' };
        mockUsersService.findOne.mockResolvedValue(mockTargetUser as any);

        const ability = caslAbilityFactory.createForUser(adminUser);
        expect(ability.can(Action.Read, 'User')).toBe(true);

        const result = await controller.findOne(targetUserId, adminUser);
        expect(result).toEqual(mockTargetUser);
        expect(usersService.findOne).toHaveBeenCalledWith(targetUserId);
    });

    it('should forbid SOLICITANTE from finding another user if not self (and no specific rule allows it)', async () => {
        const solicitanteUser = mockReqUser('sol-id', 'sol@example.com', [UserRole.SOLICITANTE]);
        // Attempting to find a different user
        const anotherUserId = 'another-user-id';

        const ability = caslAbilityFactory.createForUser(solicitanteUser);
        // Assuming 'User' subject here is a general 'User' type, not a specific instance for this check
        // If it were an instance, it'd be subject('User', { id: anotherUserId })
        expect(ability.can(Action.Read, 'User')).toBe(false); // General read on User type

        try {
            if (!ability.can(Action.Read, 'User')) { // Simplified check, real guard is more nuanced
                 throw new ForbiddenException();
            }
            await controller.findOne(anotherUserId, solicitanteUser);
        } catch (e) {
            expect(e).toBeInstanceOf(ForbiddenException);
        }
        expect(usersService.findOne).not.toHaveBeenCalled();
    });
  });
});
