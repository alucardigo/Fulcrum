import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';
import { URL } from 'url';
import { v4 } from 'uuid';

const generateDatabaseURL = (schema: string) => {
  const url = new URL(process.env.DATABASE_URL || 'mysql://root:root_password@localhost:3306/fulcrumdb_test');
  url.searchParams.append('schema', schema);
  return url.toString();
};

const schemaId = `test_${v4()}`;
const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma');

const setupDatabase = () => {
  // Generate new schema
  process.env.DATABASE_URL = generateDatabaseURL(schemaId);

  // Run migrations
  execSync(`${prismaBinary} migrate deploy`, {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
};

const teardownDatabase = () => {
  const prisma = new PrismaClient();
  return prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${schemaId}`);
};

beforeAll(() => {
  setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

// Mock do Redis para testes
jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return RedisMock;
});

const prisma = new PrismaClient();

const truncateAll = async () => {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  await prisma.item.deleteMany();
  await prisma.requestHistory.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userRoleAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
};

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await prisma.$disconnect();
});
