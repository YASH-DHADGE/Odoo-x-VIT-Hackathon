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
var ApprovalEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const template_routing_service_1 = require("./template-routing.service");
let ApprovalEngineService = ApprovalEngineService_1 = class ApprovalEngineService {
    prisma;
    routingService;
    logger = new common_1.Logger(ApprovalEngineService_1.name);
    constructor(prisma, routingService) {
        this.prisma = prisma;
        this.routingService = routingService;
    }
    async initializeApprovalChain(expenseId, companyId, convertedAmount, submittedById) {
        const { templateId, routingRuleId } = await this.routingService.selectTemplate(companyId, convertedAmount);
        const template = await this.prisma.approvalTemplate.findUnique({
            where: { id: templateId },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
        });
        if (!template)
            throw new common_1.NotFoundException('Approval template not found');
        const employee = await this.prisma.user.findUnique({ where: { id: submittedById } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const approvalRecords = [];
        let stepOffset = 0;
        if (employee.isManagerApprover && employee.managerId) {
            approvalRecords.push({ approverId: employee.managerId, stepOrder: 0 });
            stepOffset = 1;
        }
        for (const step of template.steps) {
            approvalRecords.push({
                approverId: step.approverId,
                stepOrder: step.stepOrder + stepOffset,
            });
        }
        if (approvalRecords.length === 0) {
            await this.prisma.expense.update({
                where: { id: expenseId },
                data: { status: 'APPROVED', templateId, routingRuleId },
            });
            return;
        }
        await this.prisma.$transaction([
            this.prisma.expense.update({
                where: { id: expenseId },
                data: { templateId, routingRuleId },
            }),
            ...approvalRecords.map((r) => this.prisma.expenseApproval.create({
                data: {
                    expenseId,
                    approverId: r.approverId,
                    stepOrder: r.stepOrder,
                    status: 'PENDING',
                },
            })),
        ]);
        this.logger.log(`Initialized ${approvalRecords.length} approval steps for expense ${expenseId}`);
    }
    async approve(expenseId, approverId, companyId, comments) {
        const { expense, currentStep } = await this.validateApproverAction(expenseId, approverId, companyId);
        await this.prisma.expenseApproval.update({
            where: { id: currentStep.id },
            data: { status: 'APPROVED', comments, actionedAt: new Date() },
        });
        const allApprovals = await this.prisma.expenseApproval.findMany({
            where: { expenseId },
        });
        const template = expense.templateId
            ? await this.prisma.approvalTemplate.findUnique({ where: { id: expense.templateId } })
            : null;
        const conditionalResult = template
            ? await this.evaluateConditionalRules(allApprovals, template)
            : false;
        if (conditionalResult) {
            await this.finalizeExpense(expenseId, 'APPROVED', allApprovals);
            return { status: 'APPROVED', reason: 'Conditional rule satisfied' };
        }
        const remainingPending = allApprovals.filter((a) => a.id !== currentStep.id && a.status === 'PENDING');
        if (remainingPending.length === 0) {
            await this.prisma.expense.update({
                where: { id: expenseId },
                data: { status: 'APPROVED' },
            });
            return { status: 'APPROVED', reason: 'All steps completed' };
        }
        return { status: 'PENDING', reason: 'Awaiting next approver' };
    }
    async reject(expenseId, approverId, companyId, comments) {
        const { currentStep } = await this.validateApproverAction(expenseId, approverId, companyId);
        await this.prisma.expenseApproval.update({
            where: { id: currentStep.id },
            data: { status: 'REJECTED', comments, actionedAt: new Date() },
        });
        const allApprovals = await this.prisma.expenseApproval.findMany({
            where: { expenseId },
        });
        await this.finalizeExpense(expenseId, 'REJECTED', allApprovals);
        return { status: 'REJECTED' };
    }
    async getPendingForApprover(approverId, companyId) {
        const approvals = await this.prisma.expenseApproval.findMany({
            where: { approverId, status: 'PENDING' },
            include: {
                expense: {
                    include: {
                        submittedBy: { select: { id: true, name: true, email: true } },
                        company: { select: { id: true, defaultCurrency: true } },
                    },
                },
            },
        });
        const pendingExpenses = [];
        for (const approval of approvals) {
            if (approval.expense.companyId !== companyId)
                continue;
            if (approval.expense.status !== 'PENDING')
                continue;
            const currentStep = await this.getCurrentStep(approval.expenseId);
            if (currentStep && currentStep.approverId === approverId) {
                pendingExpenses.push({ ...approval.expense, myApprovalStep: approval });
            }
        }
        return pendingExpenses;
    }
    async validateApproverAction(expenseId, approverId, companyId) {
        const expense = await this.prisma.expense.findFirst({
            where: { id: expenseId, companyId },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if (expense.status !== 'PENDING') {
            throw new common_1.BadRequestException(`Expense is already ${expense.status}`);
        }
        const currentStep = await this.getCurrentStep(expenseId);
        if (!currentStep)
            throw new common_1.BadRequestException('No pending approval step found');
        if (currentStep.approverId !== approverId) {
            throw new common_1.ForbiddenException('It is not your turn to approve this expense');
        }
        return { expense, currentStep };
    }
    async getCurrentStep(expenseId) {
        return this.prisma.expenseApproval.findFirst({
            where: { expenseId, status: 'PENDING' },
            orderBy: { stepOrder: 'asc' },
        });
    }
    async evaluateConditionalRules(approvals, template) {
        const approved = approvals.filter((a) => a.status === 'APPROVED').length;
        const total = approvals.length;
        switch (template.conditionalRuleType) {
            case 'PERCENTAGE':
                if (template.percentageThreshold && total > 0) {
                    return approved / total >= template.percentageThreshold / 100;
                }
                return false;
            case 'SPECIFIC_APPROVER':
                if (template.specificApproverId) {
                    return approvals.some((a) => a.approverId === template.specificApproverId && a.status === 'APPROVED');
                }
                return false;
            case 'HYBRID':
                const percentageMet = template.percentageThreshold &&
                    total > 0 &&
                    approved / total >= template.percentageThreshold / 100;
                const specificMet = template.specificApproverId &&
                    approvals.some((a) => a.approverId === template.specificApproverId && a.status === 'APPROVED');
                return !!(percentageMet || specificMet);
            default:
                return false;
        }
    }
    async finalizeExpense(expenseId, finalStatus, allApprovals) {
        const pendingIds = allApprovals
            .filter((a) => a.status === 'PENDING')
            .map((a) => a.id);
        const ops = [
            this.prisma.expense.update({
                where: { id: expenseId },
                data: { status: finalStatus },
            }),
        ];
        if (pendingIds.length > 0) {
            ops.push(this.prisma.expenseApproval.updateMany({
                where: { id: { in: pendingIds } },
                data: { status: 'SKIPPED' },
            }));
        }
        await this.prisma.$transaction(ops);
    }
};
exports.ApprovalEngineService = ApprovalEngineService;
exports.ApprovalEngineService = ApprovalEngineService = ApprovalEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        template_routing_service_1.TemplateRoutingService])
], ApprovalEngineService);
//# sourceMappingURL=approval-engine.service.js.map