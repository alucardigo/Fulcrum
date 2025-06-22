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
    create(createProjectDto: CreateProjectDto, req: AuthenticatedRequest): Promise<Project>;
    findAll(req: AuthenticatedRequest): Promise<Project[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<any>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: AuthenticatedRequest): Promise<Project>;
    remove(id: string, req: AuthenticatedRequest): Promise<void>;
}
export {};
