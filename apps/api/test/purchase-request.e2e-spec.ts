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

  describe('PATCH /purchase-requests/:id/transition', () => {
    let solicitanteUser: any;
    let gerenteUser: any;
    let comprasUser: any;
    let solicitanteToken: string;
    let gerenteToken: string;
    let comprasToken: string;

    beforeEach(async () => {
      // Criar usuários com diferentes papéis
      solicitanteUser = await prisma.user.create({
        data: {
          email: 'solicitante@example.com', password: 'password', firstName: 'Solicitante', lastName: 'User',
          roles: { create: [{ role: UserRole.SOLICITANTE }] },
        }, include: { roles: true },
      });
      gerenteUser = await prisma.user.create({
        data: {
          email: 'gerente@example.com', password: 'password', firstName: 'Gerente', lastName: 'User',
          roles: { create: [{ role: UserRole.GERENCIA }] },
        }, include: { roles: true },
      });
      comprasUser = await prisma.user.create({
        data: {
          email: 'compras@example.com', password: 'password', firstName: 'Compras', lastName: 'User',
          roles: { create: [{ role: UserRole.COMPRAS }] },
        }, include: { roles: true },
      });

      solicitanteToken = generateTestToken(solicitanteUser);
      gerenteToken = generateTestToken(gerenteUser);
      comprasToken = generateTestToken(comprasUser);
    });

    it('Gerente should approve a PENDENTE_GERENCIA request to APROVADO', async () => {
      // 1. Criar uma requisição pelo solicitante
      const prData = { title: 'PR for Gerente Approval', requesterId: solicitanteUser.id, status: 'PENDENTE_COMPRAS', priority: 'MEDIA' };
      const initialPR = await prisma.purchaseRequest.create({ data: prData });

      // 2. Simular a transição de Compras para PENDENTE_GERENCIA (fora do escopo deste teste, mas necessário para o estado inicial)
      await prisma.purchaseRequest.update({
        where: { id: initialPR.id },
        data: { status: 'PENDENTE_GERENCIA' },
      });

      // 3. Gerente aprova (nível 2)
      const transitionDto = { type: 'APPROVE_LEVEL_2' };
      const response = await request(app.getHttpServer())
        .patch(`/purchase-requests/${initialPR.id}/transition`)
        .set('Authorization', `Bearer ${gerenteToken}`)
        .send(transitionDto)
        .expect(200);

      expect(response.body.status).toBe('APROVADO');
      expect(response.body.approvedAt).toBeDefined();

      // Verificar histórico
      const history = await prisma.requestHistory.findFirst({ where: { purchaseRequestId: initialPR.id, newState: 'APROVADO' } });
      expect(history).toBeDefined();
      expect(history?.actionType).toBe('APPROVE_LEVEL_2');
      expect(history?.userId).toBe(gerenteUser.id);
    });

    // Mais testes de transição aqui...

    it('Gerente should reject a PENDENTE_GERENCIA request to REJEITADO with reason', async () => {
      const prData = { title: 'PR for Gerente Rejection', requesterId: solicitanteUser.id, status: 'PENDENTE_GERENCIA', priority: 'ALTA' };
      const initialPR = await prisma.purchaseRequest.create({ data: prData });
      const rejectionReason = 'Fora do orçamento aprovado para o trimestre.';
      const transitionDto = { type: 'REJECT', payload: { rejectionReason } };

      const response = await request(app.getHttpServer())
        .patch(`/purchase-requests/${initialPR.id}/transition`)
        .set('Authorization', `Bearer ${gerenteToken}`)
        .send(transitionDto)
        .expect(200);

      expect(response.body.status).toBe('REJEITADO');
      expect(response.body.rejectionReason).toBe(rejectionReason);
      expect(response.body.rejectedAt).toBeDefined();

      const history = await prisma.requestHistory.findFirst({ where: { purchaseRequestId: initialPR.id, newState: 'REJEITADO' } });
      expect(history).toBeDefined();
      expect(history?.actionDescription).toContain(rejectionReason);
    });

    it('Compras should execute an APROVADO request to CONCLUIDO', async () => {
      const prData = { title: 'PR for Compras Execution', requesterId: solicitanteUser.id, status: 'APROVADO', priority: 'BAIXA' };
      const initialPR = await prisma.purchaseRequest.create({ data: prData });
      const transitionDto = { type: 'EXECUTE' };

      const response = await request(app.getHttpServer())
        .patch(`/purchase-requests/${initialPR.id}/transition`)
        .set('Authorization', `Bearer ${comprasToken}`)
        .send(transitionDto)
        .expect(200);

      expect(response.body.status).toBe('CONCLUIDO');
      expect(response.body.orderedAt).toBeDefined(); // orderedAt é setado em CONCLUIDO no service

      const history = await prisma.requestHistory.findFirst({ where: { purchaseRequestId: initialPR.id, newState: 'CONCLUIDO' } });
      expect(history).toBeDefined();
      expect(history?.actionType).toBe('EXECUTE');
      expect(history?.userId).toBe(comprasUser.id);
    });

    it('Should return 403 Forbidden if Solicitante tries to approve a PENDENTE_GERENCIA request', async () => {
      const prData = { title: 'PR for Wrong Role Test', requesterId: solicitanteUser.id, status: 'PENDENTE_GERENCIA', priority: 'MEDIA' };
      const initialPR = await prisma.purchaseRequest.create({ data: prData });
      const transitionDto = { type: 'APPROVE_LEVEL_2' };

      await request(app.getHttpServer())
        .patch(`/purchase-requests/${initialPR.id}/transition`)
        .set('Authorization', `Bearer ${solicitanteToken}`) // Solicitante tentando aprovar
        .send(transitionDto)
        .expect(403); // Espera-se Forbidden, pois o CASL Guard deve bloquear

      // Verificar que o estado não mudou
      const unchangedPR = await prisma.purchaseRequest.findUnique({ where: { id: initialPR.id } });
      expect(unchangedPR?.status).toBe('PENDENTE_GERENCIA');
    });

    it('Should return 400 Bad Request for an invalid transition for the current state', async () => {
        const prData = { title: 'PR for Invalid Transition', requesterId: solicitanteUser.id, status: 'RASCUNHO', priority: 'MEDIA' };
        const initialPR = await prisma.purchaseRequest.create({ data: prData });
        // Tentando executar uma requisição em RASCUNHO (deveria ser APROVADO)
        const transitionDto = { type: 'EXECUTE' };

        await request(app.getHttpServer())
          .patch(`/purchase-requests/${initialPR.id}/transition`)
          .set('Authorization', `Bearer ${comprasToken}`) // Usuário com permissão de EXECUTE
          .send(transitionDto)
          .expect(400); // A máquina de estado deve rejeitar a transição

        const unchangedPR = await prisma.purchaseRequest.findUnique({ where: { id: initialPR.id } });
        expect(unchangedPR?.status).toBe('RASCUNHO');
      });

  });
});

function generateTestToken(user: any): string {
  // Gera um JWT real para o usuário de teste
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles.map((r: any) => r.role), // Garante que roles seja um array de strings
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_jwt_secret_for_dev', { expiresIn: '1h' });
}
