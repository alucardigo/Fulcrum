import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project, User, Prisma } from '@prisma/client'; // User para tipar ownerId, Prisma para tipos de input

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    this.logger.log(`Criando novo projeto: ${createProjectDto.name} para o proprietário ID: ${ownerId}`);
    const data: any = {
      name: createProjectDto.name,
      description: createProjectDto.description,
      owner: { connect: { id: ownerId } },
      budget: createProjectDto.budget ? new Prisma.Decimal(createProjectDto.budget) : 0,
    };
    try {
      return await this.prisma.project.create({ data });
    } catch (error) {
      this.logger.error(`Falha ao criar projeto para o proprietário ID: ${ownerId}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Project[]> {
    this.logger.log('Buscando todos os projetos.');
    return this.prisma.project.findMany({
      include: { owner: {select: {id: true, email: true, firstName: true, lastName: true}} }
    });
  }

  async findOne(id: string): Promise<Project | null> {
    this.logger.log(`Buscando projeto com ID: ${id}`);
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: {select: {id: true, email: true, firstName: true, lastName: true}} },
    });
    if (!project) {
      this.logger.warn(`Projeto com ID: ${id} não encontrado.`);
      throw new NotFoundException(`Projeto com ID '${id}' não encontrado.`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    this.logger.log(`Atualizando projeto com ID: ${id}`);
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      this.logger.warn(`Projeto com ID: ${id} não encontrado para atualização.`);
      throw new NotFoundException(`Projeto com ID '${id}' não encontrado.`);
    }

    const dataToUpdate: any = {};
    if (updateProjectDto.name !== undefined) dataToUpdate.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined) dataToUpdate.description = updateProjectDto.description;
    if (updateProjectDto.budget !== undefined) dataToUpdate.budget = new Prisma.Decimal(updateProjectDto.budget);

    try {
      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: dataToUpdate,
      });
      this.logger.log(`Projeto ID: ${id} atualizado com sucesso.`);
      return updatedProject;
    } catch (error) {
      this.logger.error(`Falha ao atualizar projeto ID: ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Projeto com ID '${id}' não encontrado para atualização.`);
      }
      throw new InternalServerErrorException('Não foi possível atualizar o projeto.');
    }
  }

  async remove(id: string): Promise<Project> {
    this.logger.log(`Removendo projeto com ID: ${id}`);
    const existingProject = await this.prisma.project.findUnique({ where: { id } });
    if (!existingProject) {
      this.logger.warn(`Projeto com ID: ${id} não encontrado para remoção.`);
      throw new NotFoundException(`Projeto com ID '${id}' não encontrado.`);
    }
    try {
      const deletedProject = await this.prisma.project.delete({
        where: { id },
      });
      this.logger.log(`Projeto ID: ${id} removido com sucesso.`);
      return deletedProject;
    } catch (error) {
      this.logger.error(`Falha ao remover projeto ID: ${id}`, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException(`Projeto com ID '${id}' não encontrado para remoção.`);
      }
      throw new InternalServerErrorException('Não foi possível remover o projeto.');
    }
  }
}
