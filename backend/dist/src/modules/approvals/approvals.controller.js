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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const approvals_service_1 = require("./approvals.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ApprovalsController = class ApprovalsController {
    approvalsService;
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    getPending(user) {
        return this.approvalsService.getPendingForApprover(user.id, user.companyId);
    }
    approve(expenseId, comments, user) {
        return this.approvalsService.approve(expenseId, user.id, user.companyId, comments);
    }
    reject(expenseId, comments, user) {
        return this.approvalsService.reject(expenseId, user.id, user.companyId, comments);
    }
    createTemplate(dto, companyId) {
        return this.approvalsService.createTemplate(companyId, dto);
    }
    getTemplates(companyId) {
        return this.approvalsService.getTemplates(companyId);
    }
    getTemplate(id, companyId) {
        return this.approvalsService.getTemplate(id, companyId);
    }
    updateTemplate(id, dto, companyId) {
        return this.approvalsService.updateTemplate(id, companyId, dto);
    }
    deleteTemplate(id, companyId) {
        return this.approvalsService.deleteTemplate(id, companyId);
    }
    addStep(templateId, dto, companyId) {
        return this.approvalsService.addStep(templateId, companyId, dto);
    }
    deleteStep(id, companyId) {
        return this.approvalsService.deleteStep(id, companyId);
    }
    createRoutingRule(dto, companyId) {
        return this.approvalsService.createRoutingRule(companyId, dto);
    }
    getRoutingRules(companyId) {
        return this.approvalsService.getRoutingRules(companyId);
    }
    previewRouting(amount, companyId) {
        return this.approvalsService.previewRouting(companyId, parseFloat(amount));
    }
    getRoutingRule(id, companyId) {
        return this.approvalsService.getRoutingRule(id, companyId);
    }
    updateRoutingRule(id, dto, companyId) {
        return this.approvalsService.updateRoutingRule(id, companyId, dto);
    }
    deleteRoutingRule(id, companyId) {
        return this.approvalsService.deleteRoutingRule(id, companyId);
    }
    validateRules(rules, companyId) {
        return this.approvalsService.validateRoutingRules(companyId, rules);
    }
};
exports.ApprovalsController = ApprovalsController;
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Post)(':expenseId/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('expenseId')),
    __param(1, (0, common_1.Body)('comments')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':expenseId/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('expenseId')),
    __param(1, (0, common_1.Body)('comments')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Patch)('templates/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/steps'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "addStep", null);
__decorate([
    (0, common_1.Delete)('steps/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "deleteStep", null);
__decorate([
    (0, common_1.Post)('routing-rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "createRoutingRule", null);
__decorate([
    (0, common_1.Get)('routing-rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getRoutingRules", null);
__decorate([
    (0, common_1.Get)('routing-rules/preview'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "previewRouting", null);
__decorate([
    (0, common_1.Get)('routing-rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getRoutingRule", null);
__decorate([
    (0, common_1.Patch)('routing-rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "updateRoutingRule", null);
__decorate([
    (0, common_1.Delete)('routing-rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "deleteRoutingRule", null);
__decorate([
    (0, common_1.Post)('routing-rules/validate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('rules')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "validateRules", null);
exports.ApprovalsController = ApprovalsController = __decorate([
    (0, common_1.Controller)('approvals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], ApprovalsController);
//# sourceMappingURL=approvals.controller.js.map