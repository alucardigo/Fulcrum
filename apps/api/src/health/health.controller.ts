import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Verifica conexão com o banco de dados
      () => this.prisma.$queryRaw`SELECT 1`.then(() => ({ db: { status: 'up' } })),
      
      // Verifica uso de disco
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
      
      // Verifica uso de memória
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
      () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024), // 3GB
      
      // Verifica endpoints essenciais
      () => this.http.pingCheck('auth-service', 'http://localhost:3000/api/auth/health'),
    ]);
  }
}
