import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, Logger, ForbiddenException, InternalServerErrorException, ParseIntPipe } from '@nestjs/common';
// Note: Removed ParseUUIDPipe as Prisma uses CUIDs by default for string IDs. Add custom CUID pipe if strict format validation on param is needed.
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

interface AuthenticatedUser {
  userId: string;
  email: string;
}

interface AuthenticatedRequest extends Request { // Express Request
  user: AuthenticatedUser;
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req: AuthenticatedRequest) {
    this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está criando um novo projeto: ${createProjectDto.name}`);
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está buscando todos os projetos.`);
    return this.projectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está buscando o projeto ID: ${id}`);
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: AuthenticatedRequest
  ) {
    this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está atualizando o projeto ID: ${id}`);
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está removendo o projeto ID: ${id}`);
    await this.projectsService.remove(id);
  }
}
