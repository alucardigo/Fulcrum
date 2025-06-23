import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client'; // Import User type

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock user data
  const mockUser: User = {
    id: 'user-id-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserNoPassword = {
    id: mockUser.id,
    email: mockUser.email,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            // Add other methods if AuthService starts using them
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data (without password) if validation is successful', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(mockUser.email, 'correctPassword');
      expect(result).toEqual(mockUserNoPassword);
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', mockUser.password);
    });

    it('should return null if password does not match', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(mockUser.email, 'wrongPassword');
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', mockUser.password);
    });

    it('should return null if user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser('unknown@example.com', 'anyPassword');
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('unknown@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should log a warning if user is not found', async () => {
      const loggerWarnSpy = jest.spyOn(authService['logger'], 'warn');
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await authService.validateUser('unknown@example.com', 'anyPassword');
      expect(loggerWarnSpy).toHaveBeenCalledWith('Tentativa de login para email não encontrado: unknown@example.com');
    });

    it('should log a warning if password validation fails', async () => {
      const loggerWarnSpy = jest.spyOn(authService['logger'], 'warn');
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await authService.validateUser(mockUser.email, 'wrongPassword');
      expect(loggerWarnSpy).toHaveBeenCalledWith(`Falha na validação da senha para o usuário: ${mockUser.email}`);
    });
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      const mockToken = 'mockAccessToken';
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      // Pass a user object without password, as AuthService.login expects
      const result = await authService.login(mockUserNoPassword as Omit<User, 'password'>);

      expect(result).toEqual({ access_token: mockToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUserNoPassword.email,
        sub: mockUserNoPassword.id,
      });
    });

    it('should log the token generation process', async () => {
      const loggerLogSpy = jest.spyOn(authService['logger'], 'log');
      const mockToken = 'mockAccessToken';
      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      await authService.login(mockUserNoPassword as Omit<User, 'password'>);
      expect(loggerLogSpy).toHaveBeenCalledWith(`Gerando token JWT para o usuário: ${mockUserNoPassword.email} (ID: ${mockUserNoPassword.id})`);
    });
  });
});
