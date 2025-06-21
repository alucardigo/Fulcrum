import { HealthCheckService, HttpHealthIndicator, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma.service';
export declare class HealthController {
    private health;
    private http;
    private disk;
    private memory;
    private prisma;
    constructor(health: HealthCheckService, http: HttpHealthIndicator, disk: DiskHealthIndicator, memory: MemoryHealthIndicator, prisma: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
