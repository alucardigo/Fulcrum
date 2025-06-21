"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    prisma;
    logger = new common_1.Logger(ProjectsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProjectDto, ownerId) {
        this.logger.log(`Criando novo projeto: ${createProjectDto.name} para o proprietário ID: ${ownerId}`);
        const data = {
            name: createProjectDto.name,
            description: createProjectDto.description,
            owner: { connect: { id: ownerId } },
            budget: createProjectDto.budget ? new client_1.Prisma.Decimal(createProjectDto.budget) : 0,
        };
        try {
            return await this.prisma.project.create({ data });
        }
        catch (error) {
            this.logger.error(`Falha ao criar projeto para o proprietário ID: ${ownerId}`, error.stack);
            throw error;
        }
    }
    async findAll() {
        this.logger.log('Buscando todos os projetos.');
        return this.prisma.project.findMany({
            include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } }
        });
    }
    async findOne(id) {
        this.logger.log(`Buscando projeto com ID: ${id}`);
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } },
        });
        if (!project) {
            this.logger.warn(`Projeto com ID: ${id} não encontrado.`);
            throw new common_1.NotFoundException(`Projeto com ID '${id}' não encontrado.`);
        }
        return project;
    }
    async update(id, updateProjectDto) {
        this.logger.log(`Atualizando projeto com ID: ${id}`);
        const existingProject = await this.prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            this.logger.warn(`Projeto com ID: ${id} não encontrado para atualização.`);
            throw new common_1.NotFoundException(`Projeto com ID '${id}' não encontrado.`);
        }
        const dataToUpdate = {};
        if (updateProjectDto.name !== undefined)
            dataToUpdate.name = updateProjectDto.name;
        if (updateProjectDto.description !== undefined)
            dataToUpdate.description = updateProjectDto.description;
        if (updateProjectDto.budget !== undefined)
            dataToUpdate.budget = new client_1.Prisma.Decimal(updateProjectDto.budget);
        try {
            const updatedProject = await this.prisma.project.update({
                where: { id },
                data: dataToUpdate,
            });
            this.logger.log(`Projeto ID: ${id} atualizado com sucesso.`);
            return updatedProject;
        }
        catch (error) {
            this.logger.error(`Falha ao atualizar projeto ID: ${id}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Projeto com ID '${id}' não encontrado para atualização.`);
            }
            throw new common_1.InternalServerErrorException('Não foi possível atualizar o projeto.');
        }
    }
    async remove(id) {
        this.logger.log(`Removendo projeto com ID: ${id}`);
        const existingProject = await this.prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            this.logger.warn(`Projeto com ID: ${id} não encontrado para remoção.`);
            throw new common_1.NotFoundException(`Projeto com ID '${id}' não encontrado.`);
        }
        try {
            const deletedProject = await this.prisma.project.delete({
                where: { id },
            });
            this.logger.log(`Projeto ID: ${id} removido com sucesso.`);
            return deletedProject;
        }
        catch (error) {
            this.logger.error(`Falha ao remover projeto ID: ${id}`, error.stack);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Projeto com ID '${id}' não encontrado para remoção.`);
            }
            throw new common_1.InternalServerErrorException('Não foi possível remover o projeto.');
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map