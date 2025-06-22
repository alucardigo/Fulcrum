import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { createMockPrismaClient, MockPrismaClient } from '../../../test/prisma-mock.helper';
import { UserRole, User } from '@prisma/client'; // Assuming UserRole enum is available
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

// Helper to create a mock user object
const createMockUser = (id: string, email: string, role?: UserRole, otherProps: Partial<User> = {}): User & { roles: { role: UserRole }[] } => ({
  id,
  email,
  password: 'hashedPassword',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  department: null,
  costCenter: null,
  approvalLimit: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...otherProps,
  roles: role ? [{ userId: id, role, id: `role-assign-${id}`, createdAt: new Date(), updatedAt: new Date() }] : [],
});


describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: MockPrismaClient;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaClient();
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'SALT_ROUNDS') return '10';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService as ConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without passwords and with roles', async () => {
      const mockUser1 = createMockUser('user1', 'user1@example.com', UserRole.SOLICITANTE);
      const mockUser2 = createMockUser('user2', 'user2@example.com', UserRole.ADMINISTRADOR);
      const usersFromDb = [mockUser1, mockUser2];

      mockPrisma.user.findMany.mockResolvedValue(usersFromDb as any[]); // Cast if DeepMockProxy has trouble with relation types

      const result = await service.findAll();

      expect(result.length).toBe(2);
      expect(result[0].email).toEqual(mockUser1.email);
      expect(result[0].password).toBeUndefined();
      expect(result[0].roles[0].role).toEqual(UserRole.SOLICITANTE);
      expect(result[1].email).toEqual(mockUser2.email);
      expect(result[1].password).toBeUndefined();
      expect(result[1].roles[0].role).toEqual(UserRole.ADMINISTRADOR);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({ include: { roles: true } });
    });
  });

  describe('findOne (used by controller, similar to findById but for controller layer)', () => {
    it('should return a single user without password by id', async () => {
      const userId = 'test-id';
      const mockUser = createMockUser(userId, 'test@example.com', UserRole.COMPRAS);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.findOne(userId);

      expect(result?.email).toEqual(mockUser.email);
      expect(result?.password).toBeUndefined();
      expect(result?.roles[0].role).toEqual(UserRole.COMPRAS);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId }, include: { roles: true } });
    });

    it('should return null if user not found by findOne', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findOne('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findById (similar to findOne, but used internally or if exposed differently)', () => {
    it('should return a user by ID without password', async () => {
      const userId = 'user-by-id';
      const mockUser = createMockUser(userId, 'findbyid@example.com', UserRole.GERENCIA);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.findById(userId);
      expect(result?.id).toBe(userId);
      expect(result?.password).toBeUndefined();
      expect(result?.roles[0].role).toBe(UserRole.GERENCIA);
    });
  });


  describe('updateUserRole', () => {
    const userId = 'user-to-update-role';
    const newRole = UserRole.ADMINISTRADOR;

    it('should successfully update user role', async () => {
      const existingUser = createMockUser(userId, 'updaterole@example.com', UserRole.SOLICITANTE);
      const updatedUserWithNewRole = {
        ...existingUser,
        roles: [{ ...existingUser.roles[0], role: newRole }], // Simulate role update
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser as any); // For the initial userExists check

      // Mocking the transaction parts:
      // 1. deleteMany for old roles
      mockPrisma.userRoleAssignment.deleteMany.mockResolvedValue({ count: 1 });
      // 2. create for new role
      mockPrisma.userRoleAssignment.create.mockResolvedValue({ id: 'new-role-assignment-id', userId, role: newRole, createdAt: new Date(), updatedAt: new Date() });
      // 3. findUniqueOrThrow to return the user with the new role
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(updatedUserWithNewRole as any);

      const result = await service.updateUserRole(userId, newRole);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrisma.$transaction).toHaveBeenCalled(); // Confirms transaction was called
      // Check calls within the transaction mock in prisma-mock.helper.ts if more detail is needed,
      // or by directly checking the mocks if they are exposed/spied on.
      // For this setup, we directly mock the methods called by the transaction callback.
      expect(mockPrisma.userRoleAssignment.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(mockPrisma.userRoleAssignment.create).toHaveBeenCalledWith({ data: { userId, role: newRole } });
      expect(mockPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: userId }, include: { roles: true } });

      expect(result.roles.some(r => r.role === newRole)).toBe(true);
      expect(result.password).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // User not found for initial check

      await expect(service.updateUserRole(userId, newRole))
        .rejects.toThrow(NotFoundException);

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should throw ConflictException for invalid role string (though DTO validation handles this earlier)', async () => {
        const existingUser = createMockUser(userId, 'updaterole@example.com', UserRole.SOLICITANTE);
        mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser as any);
        // Simulate an invalid role not caught by enum type (e.g. if UserRole was just string)
        // This test is more conceptual as UserRole enum prevents this at compile time if used strictly.
        // However, if the input `newRole` could somehow bypass enum typing:
        await expect(service.updateUserRole(userId, 'INVALID_ROLE' as UserRole))
            .rejects.toThrow(ConflictException); // "Cargo inválido: INVALID_ROLE"
    });

    it('should throw InternalServerErrorException if $transaction fails', async () => {
      const existingUser = createMockUser(userId, 'updaterole@example.com', UserRole.SOLICITANTE);
      mockPrisma.user.findUnique.mockResolvedValueOnce(existingUser as any);

      // Make the transaction fail
      mockPrisma.$transaction.mockRejectedValueOnce(new Error('Transaction failed'));

      await expect(service.updateUserRole(userId, newRole))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  // Basic create user test (can be expanded)
  describe('create', () => {
    it('should create a user and assign role if provided', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        senha: 'password123',
        primeiroNome: 'New',
        ultimoNome: 'User',
        cargo: UserRole.SOLICITANTE, // Role provided
      };
      const createdUserDb = { // What prisma.user.create would return (before role assignment)
        id: 'new-user-id',
        email: createUserDto.email,
        password: 'hashedPassword', // bcrypt will hash it
        firstName: createUserDto.primeiroNome,
        lastName: createUserDto.ultimoNome,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [] // Initially no roles from user creation itself
      };
       const userAfterRoleAssignment = {
        ...createdUserDb,
        roles: [{ userId: createdUserDb.id, role: createUserDto.cargo, id: 'role-id', createdAt: new Date(), updatedAt: new Date() }]
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // For checking existing user
      mockPrisma.user.create.mockResolvedValueOnce(createdUserDb as any);
      mockPrisma.userRoleAssignment.create.mockResolvedValueOnce(userAfterRoleAssignment.roles[0] as any);
      // The service refetches the user after role assignment if cargo is provided
      mockPrisma.user.findUnique.mockResolvedValueOnce(userAfterRoleAssignment as any);


      const result = await service.create(createUserDto as any);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.userRoleAssignment.create).toHaveBeenCalledWith({
        data: { userId: createdUserDb.id, role: createUserDto.cargo },
      });
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBeUndefined();
      expect(result.roles.length).toBe(1);
      expect(result.roles[0].role).toBe(UserRole.SOLICITANTE);
    });

     it('should throw ConflictException if user email already exists', async () => {
      const createUserDto = { email: 'existing@example.com', senha: 'password', primeiroNome: 'Test', ultimoNome: 'User' };
      mockPrisma.user.findUnique.mockResolvedValueOnce(createMockUser('exist-id', createUserDto.email) as any); // User exists

      await expect(service.create(createUserDto as any)).rejects.toThrow(ConflictException);
    });
  });

});
