import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding...');

  // Limpar banco de dados
  await prisma.requestHistory.deleteMany();
  await prisma.item.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userRoleAssignment.deleteMany();
  await prisma.user.deleteMany();

  console.log('Banco de dados limpo.');

  // Criar usuários com diferentes papéis
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fulcrum.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      department: 'TI',
      costCenter: 'CC001',
      approvalLimit: 100000,
      roles: {
        create: {
          role: 'ADMINISTRADOR'
        }
      }
    }
  });
  console.log('Usuário Admin criado:', admin.email);

  const gerente = await prisma.user.create({
    data: {
      email: 'gerente@fulcrum.com',
      password: await bcrypt.hash('gerente123', 10),
      firstName: 'Gerente',
      lastName: 'Projetos',
      department: 'Engenharia',
      costCenter: 'CC002',
      approvalLimit: 50000,
      roles: {
        create: {
          role: 'GERENCIA'
        }
      }
    }
  });
  console.log('Usuário Gerente criado:', gerente.email);

  const comprador = await prisma.user.create({
    data: {
      email: 'comprador@fulcrum.com',
      password: await bcrypt.hash('comprador123', 10),
      firstName: 'Comprador',
      lastName: 'Principal',
      department: 'Compras',
      costCenter: 'CC003',
      approvalLimit: 10000,
      roles: {
        create: {
          role: 'COMPRAS'
        }
      }
    }
  });
  console.log('Usuário Comprador criado:', comprador.email);

  const solicitante = await prisma.user.create({
    data: {
      email: 'solicitante@fulcrum.com',
      password: await bcrypt.hash('solicitante123', 10),
      firstName: 'Solicitante',
      lastName: 'Padrão',
      department: 'Marketing',
      costCenter: 'CC004',
      roles: {
        create: {
          role: 'SOLICITANTE'
        }
      }
    }
  });
  console.log('Usuário Solicitante criado:', solicitante.email);

  // Criar um projeto
  const projeto = await prisma.project.create({
    data: {
      name: 'Projeto Piloto',
      code: 'PILOT-2024',
      description: 'Projeto piloto para validação da plataforma',
      budget: 100000,
      remainingBudget: 100000,
      startDate: new Date(),
      endDate: new Date(2024, 11, 31),
      status: 'ACTIVE',
      ownerId: gerente.id,
      costCenter: 'CC002'
    }
  });
  console.log('Projeto criado:', projeto.name);

  // Criar uma requisição de compra
  const requisicao = await prisma.purchaseRequest.create({
    data: {
      title: 'Equipamentos de TI',
      description: 'Aquisição de equipamentos para novo time',
      status: 'PENDENTE_COMPRAS',
      priority: 'NORMAL',
      totalAmount: 15000,
      requesterId: solicitante.id,
      projectId: projeto.id,
      costCenter: 'CC004',
      justification: 'Necessário para expansão do time',
      items: {
        create: [
          {
            name: 'Notebook Dell Latitude',
            description: 'Notebook Dell Latitude 5420, i7, 16GB RAM, 512GB SSD',
            quantity: 3,
            unitPrice: 5000,
            totalPrice: 15000,
            supplier: 'Dell Computadores',
            supplierCNPJ: '72381189000110',
            category: 'EQUIPAMENTOS',
          }
        ]
      }
    }
  });
  console.log('Requisição de compra criada:', requisicao.title);

  // Criar histórico da requisição
  const historico = await prisma.requestHistory.create({
    data: {
      actionType: 'CREATE',
      actionDescription: 'Requisição criada',
      previousState: null,
      newState: JSON.stringify({ status: 'PENDENTE_COMPRAS' }),
      userId: solicitante.id,
      purchaseRequestId: requisicao.id,
    }
  });
  console.log('Histórico criado:', historico.actionType);

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Desconectado do Prisma.');
  });
