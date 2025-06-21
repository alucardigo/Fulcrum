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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProjectsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("../services/projects.service");
const create_project_dto_1 = require("../dto/create-project.dto");
const update_project_dto_1 = require("../dto/update-project.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let ProjectsController = ProjectsController_1 = class ProjectsController {
    projectsService;
    logger = new common_1.Logger(ProjectsController_1.name);
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async create(createProjectDto, req) {
        this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está criando um novo projeto: ${createProjectDto.name}`);
        return this.projectsService.create(createProjectDto, req.user.userId);
    }
    async findAll(req) {
        this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está buscando todos os projetos.`);
        return this.projectsService.findAll();
    }
    async findOne(id, req) {
        this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está buscando o projeto ID: ${id}`);
        return this.projectsService.findOne(id);
    }
    async update(id, updateProjectDto, req) {
        this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está atualizando o projeto ID: ${id}`);
        return this.projectsService.update(id, updateProjectDto);
    }
    async remove(id, req) {
        this.logger.log(`Usuário ${req.user.email} (ID: ${req.user.userId}) está removendo o projeto ID: ${id}`);
        await this.projectsService.remove(id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
exports.ProjectsController = ProjectsController = ProjectsController_1 = __decorate([
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map