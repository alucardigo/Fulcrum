import { PrismaClient, Prisma } from '@prisma/client';
// O enum RoleName não existe, usaremos strings para nomes de papéis.

const prisma = new PrismaClient();

interface RoleData {
  name: string;
  permissions: string; // Armazenar como string JSON
}

const rolesToSeed: RoleData[] = [
  {
    name: 'ADMINISTRADOR',
    permissions: JSON.stringify({
      description: 'Acesso total a todos os recursos e configurações do sistema.',
      rules: [{ action: 'manage', subject: 'all' }]
    }),
  },
  {
    name: 'SOLICITANTE',
    permissions: JSON.stringify({
      description: 'Pode criar, visualizar e gerenciar suas próprias requisições de compra.',
      rules: [
        { action: 'create', subject: 'PurchaseRequest' },
        { action: 'read', subject: 'PurchaseRequest', conditions: { requesterId: '{USER_ID}' } }, // Placeholder para USER_ID
        { action: 'update', subject: 'PurchaseRequest', conditions: { requesterId: '{USER_ID}', status: 'RASCUNHO' } },
        { action: 'submit', subject: 'PurchaseRequest', conditions: { requesterId: '{USER_ID}', status: 'RASCUNHO' } },
        { action: 'read', subject: 'User', conditions: { id: '{USER_ID}' } },
        { action: 'update', subject: 'User', conditions: { id: '{USER_ID}' } },
      ]
    }),
  },
  {
    name: 'COMPRAS',
    permissions: JSON.stringify({
      description: 'Pode visualizar todas as requisições, aprovar/rejeitar no primeiro nível.',
      rules: [
        { action: 'read', subject: 'PurchaseRequest' },
        { action: 'approve_level_1', subject: 'PurchaseRequest', conditions: { status: 'PENDENTE_COMPRAS' } },
        { action: 'reject', subject: 'PurchaseRequest', conditions: { status: 'PENDENTE_COMPRAS' } },
        { action: 'read', subject: 'Project' }, // Exemplo: pode ver projetos
      ]
    }),
  },
  {
    name: 'GERENCIA',
    permissions: JSON.stringify({
      description: 'Pode visualizar todas as requisições e projetos, aprovar/rejeitar no segundo nível.',
      rules: [
        { action: 'read', subject: 'PurchaseRequest' },
        { action: 'read', subject: 'Project' },
        // { action: 'approve_level_2', subject: 'PurchaseRequest', conditions: { status: 'PENDENTE_GERENCIA' } },
        // { action: 'reject', subject: 'PurchaseRequest', conditions: { status: 'PENDENTE_GERENCIA' } },
      ]
    }),
  },
];

async function main() {
  console.log(`Iniciando seeding de Roles (${rolesToSeed.map(r => r.name).join(', ')})...`);

  for (const roleData of rolesToSeed) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { permissions: roleData.permissions },
      create: {
        name: roleData.name,
        permissions: roleData.permissions,
      },
    });
    console.log(`Role '${role.name}' (ID: ${role.id}) criado/atualizado com sucesso.`);
  }

  console.log('Seeding de Roles concluído.');

  // Exemplo de criação de usuário admin (adaptar e descomentar se necessário)
  // const adminEmail = 'admin@fulcrum.com';
  // const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  // if (!adminExists) {
  //   const bcrypt = await import('bcrypt'); // Importar bcrypt dinamicamente
  //   const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS, 10) : 10;
  //   const hashedPassword = await bcrypt.hash('AdminP@ssw0rd123!', saltRounds);
  //   const adminUser = await prisma.user.create({
  //     data: {
  //       email: adminEmail,
  //       password: hashedPassword,
  //       firstName: 'Admin',
  //       lastName: 'Fulcrum',
  //       isActive: true,
  //       roles: { connect: { name: 'ADMINISTRADOR' } },
  //     },
  //   });
  //   console.log(`Usuário administrador '${adminUser.email}' criado com ID: ${adminUser.id}`);
  // } else {
  //   console.log(`Usuário administrador '${adminEmail}' já existe.`);
  // }
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1); // Manter exit 1 aqui para falhar o processo de seed se houver erro
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Desconectado do Prisma.');
  });
