import { PrismaService } from '../../prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project } from '@prisma/client';
export declare class ProjectsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project>;
    findAll(): Promise<Project[]>;
    findOne(id: string): Promise<Project | null>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;
    remove(id: string): Promise<Project>;
}
