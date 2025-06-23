import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { UsersService } from '../src/users/services/users.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UserRole } from '@prisma/client'; // Assuming UserRole is part of your prisma schema

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let usersService: UsersService;

  const testUserCredentials = {
    email: 'test-login@example.com',
    senha: 'Str0ngPassword!',
    primeiroNome: 'Test',
    ultimoNome: 'LoginUser',
    cargo: UserRole.SOLICITANTE, // Assuming a default role for testing
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Apply global validation pipe, as it's often done in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.userRoleAssignment.deleteMany({});
    await prisma.user.deleteMany({});

    // Create a test user
    await usersService.create(testUserCredentials);
  });

  afterAll(async () => {
    // Clean up database after all tests
    await prisma.userRoleAssignment.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should log in a user and return an access token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUserCredentials.email, senha: testUserCredentials.senha })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
      expect(response.body.access_token.length).toBeGreaterThan(0);
    });

    it('should return UNAUTHORIZED for incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUserCredentials.email, senha: 'WrongPassword!' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return UNAUTHORIZED for non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', senha: 'anyPassword' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return BAD_REQUEST if email is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ senha: testUserCredentials.senha })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(expect.arrayContaining(
        expect.stringMatching(/email should not be empty|email must be an email/),
      ));
    });

    it('should return BAD_REQUEST if password is missing', async () => {
        const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUserCredentials.email })
        .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toEqual(expect.arrayContaining(
          expect.stringMatching(/senha should not be empty/),
        ));
    });

    it('should return BAD_REQUEST if email is not a valid email format', async () => {
        const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', senha: testUserCredentials.senha })
        .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toEqual(expect.arrayContaining(
            expect.stringMatching(/email must be an email/),
        ));
    });
  });
});
