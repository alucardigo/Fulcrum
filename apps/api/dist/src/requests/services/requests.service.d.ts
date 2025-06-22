import { PrismaService } from '../../prisma.service';
export declare class RequestsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: string): any;
}
