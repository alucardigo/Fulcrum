import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
interface AuthenticatedUser {
    userId: string;
    email: string;
}
interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
export declare class ProjectsController {
    private readonly projectsService;
    private readonly logger;
    constructor(projectsService: ProjectsService);
    create(createProjectDto: CreateProjectDto, req: AuthenticatedRequest): Promise<{
        id: string;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        remainingBudget: import("@prisma/client/runtime/library").Decimal;
        startDate: Date;
        endDate: Date | null;
        status: string;
        ownerId: string;
    }>;
    findAll(req: AuthenticatedRequest): Promise<{
        id: string;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        remainingBudget: import("@prisma/client/runtime/library").Decimal;
        startDate: Date;
        endDate: Date | null;
        status: string;
        ownerId: string;
    }[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        id: string;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        remainingBudget: import("@prisma/client/runtime/library").Decimal;
        startDate: Date;
        endDate: Date | null;
        status: string;
        ownerId: string;
    } | null>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: AuthenticatedRequest): Promise<{
        id: string;
        costCenter: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        remainingBudget: import("@prisma/client/runtime/library").Decimal;
        startDate: Date;
        endDate: Date | null;
        status: string;
        ownerId: string;
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<void>;
}
export {};
