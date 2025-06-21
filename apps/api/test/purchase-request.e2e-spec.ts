import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

describe('PurchaseRequestController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Limpa o banco de dados antes de cada teste
    await prisma.item.deleteMany();
    await prisma.requestHistory.deleteMany();
    await prisma.purchaseRequest.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /purchase-requests', () => {
    it('should create a purchase request', async () => {
      // Cria um usuário e atribui role via tabela intermediária
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashed_password',
          firstName: 'Test',
          lastName: 'User',
          roles: {
            create: [{ role: UserRole.SOLICITANTE }],
          },
        },
        include: { roles: true },
      });

      // Dados da requisição de compra
      const purchaseRequestData = {
        title: 'Compra de Equipamentos',
        description: 'Equipamentos para o departamento de TI',
        priority: 'MEDIA',
        justification: 'Necessário para o time de TI',
        items: [
          {
            name: 'Notebook',
            description: 'Notebook Dell XPS',
            quantity: 1,
            unitPrice: 5000.00,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/purchase-requests')
        .set('Authorization', `Bearer ${generateTestToken(user)}`)
        .send(purchaseRequestData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(purchaseRequestData.title);
      expect(response.body.status).toBe('RASCUNHO');
    });

    it('should validate purchase request data', async () => {
      const response = await request(app.getHttpServer())
        .post('/purchase-requests')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Erro de validação');
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });
});

function generateTestToken(user: any): string {
  // Gera um JWT real para o usuário de teste
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles.map((r: any) => r.role),
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_jwt_secret_for_dev', { expiresIn: '1h' });
}
