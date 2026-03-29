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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const expenses_service_1 = require("./expenses.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const approvals_service_1 = require("../approvals/approvals.service");
let ExpensesController = class ExpensesController {
    expensesService;
    approvalsService;
    constructor(expensesService, approvalsService) {
        this.expensesService = expensesService;
        this.approvalsService = approvalsService;
    }
    create(dto, user) {
        return this.expensesService.create(user.id, user.companyId, dto, this.approvalsService);
    }
    findAll(user, status, category, page, limit) {
        return this.expensesService.findAll(user.companyId, user.id, user.role, {
            status,
            category,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    getStats(companyId) {
        return this.expensesService.getStats(companyId);
    }
    findOne(id, user) {
        return this.expensesService.findOne(id, user.companyId, user.id, user.role);
    }
    cancel(id, user) {
        return this.expensesService.cancel(id, user.id, user.companyId);
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof client_1.ExpenseStatus !== "undefined" && client_1.ExpenseStatus) === "function" ? _a : Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExpensesController.prototype, "cancel", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.Controller)('expenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => approvals_service_1.ApprovalsService))),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService,
        approvals_service_1.ApprovalsService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map