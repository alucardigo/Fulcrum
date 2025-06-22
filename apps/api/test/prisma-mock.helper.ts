import { PrismaClient } from '@prisma/client'; // For type hints, not actual client
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

// Create a type for your PrismaClient to use with jest-mock-extended
// This helps with type safety in your tests.
export type MockPrismaClient = DeepMockProxy<PrismaClient>;

// Function to create a new mock Prisma client for each test suite
export const createMockPrismaClient = (): MockPrismaClient => {
  const mockPrisma = mockDeep<PrismaClient>();

  // You can pre-configure common model mocks here if needed,
  // but often it's cleaner to let mockDeep handle the structure
  // and then override specific methods in your tests.

  // Example of how specific models would be available (jest-mock-extended handles this):
  // mockPrisma.user.findUnique.mockResolvedValue(...);
  // mockPrisma.userRoleAssignment.create.mockResolvedValue(...);
  // mockPrisma.purchaseRequest.findMany.mockResolvedValue(...);

  // Mocking $transaction
  // This is a common way to mock $transaction when it takes an array of operations.
  // If you use the interactive transaction callback, the mock might need to be more complex.
  mockPrisma.$transaction.mockImplementation(async (args: any) => {
    // If args is an array of promises (operations)
    if (Array.isArray(args)) {
      const results = [];
      for (const operation of args) {
        // We assume each 'operation' is something that would have been awaited
        // This is a simplification; real operations might be direct calls to prisma methods
        // For testing, you might just push dummy results or results based on prior individual mocks
        results.push(await operation);
      }
      return results;
    }
    // If args is a callback function (interactive transaction)
    if (typeof args === 'function') {
      // The callback function expects the Prisma transaction client (tx) as an argument.
      // We pass our mockPrisma itself (or a specifically tailored mock for 'tx')
      // to simulate the transaction context.
      try {
        return await args(mockPrisma); // or a more specific 'tx' mock if needed
      } catch (error) {
        // Handle or rethrow transaction rollback scenarios if your tests need it
        throw error;
      }
    }
    throw new Error('Unsupported $transaction arguments for mock');
  });

  return mockPrisma;
};

// Optional: A helper to reset the mock client (though mockReset from jest-mock-extended can also be used)
export const resetMockPrismaClient = (mockPrisma: MockPrismaClient) => {
  mockReset(mockPrisma);
};

// Example Usage in a test file (e.g., users.service.spec.ts)
/*
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../services/users.service';
import { PrismaService } from '../../prisma.service';
import { createMockPrismaClient, MockPrismaClient } from '../../../test/prisma-mock.helper';
import { ConfigService } from '@nestjs/config'; // If UsersService uses it

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: MockPrismaClient;

  beforeEach(async () => {
    mockPrisma = createMockPrismaClient();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: jest.fn() } }, // Mock ConfigService if needed
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    resetMockPrismaClient(mockPrisma); // Or jest.clearAllMocks() if preferred and sufficient
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserRole', () => {
    it('should update a user role and return the user without password', async () => {
      const userId = 'test-user-id';
      const newRole = UserRole.ADMINISTRADOR; // Assuming UserRole enum is available
      const mockUser = { id: userId, email: 'test@example.com', password: 'hashedpassword', roles: [] };
      const mockUpdatedUserWithRole = {
        ...mockUser,
        password: '', // Or ensure it's excluded
        roles: [{ userId, role: newRole, id: 'role-assign-id', createdAt: new Date(), updatedAt: new Date() }]
      };

      // Mock Prisma calls expected by updateUserRole
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any); // Cast as any if type complains due to mock
      mockPrisma.userRoleAssignment.deleteMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.userRoleAssignment.create.mockResolvedValueOnce(mockUpdatedUserWithRole.roles[0] as any);
      // Mock the findUniqueOrThrow call within the transaction
      mockPrisma.user.findUniqueOrThrow.mockResolvedValueOnce(mockUpdatedUserWithRole as any);


      const result = await service.updateUserRole(userId, newRole);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Inside transaction:
      expect(mockPrisma.userRoleAssignment.deleteMany).toHaveBeenCalledWith({ where: { userId: userId } });
      expect(mockPrisma.userRoleAssignment.create).toHaveBeenCalledWith({ data: { userId: userId, role: newRole } });
      expect(mockPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: userId }, include: { roles: true } });

      expect(result.id).toEqual(userId);
      expect(result.roles[0].role).toEqual(newRole);
      expect(result.password).toBeUndefined();
    });
  });
});
*/

[end of apps/api/test/prisma-mock.helper.ts]
