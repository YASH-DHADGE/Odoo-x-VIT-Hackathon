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
var ExpensesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const currency_service_1 = require("../currency/currency.service");
const client_1 = require("@prisma/client");
const pagination_util_1 = require("../../common/utils/pagination.util");
let ExpensesService = ExpensesService_1 = class ExpensesService {
    prisma;
    currencyService;
    logger = new common_1.Logger(ExpensesService_1.name);
    constructor(prisma, currencyService) {
        this.prisma = prisma;
        this.currencyService = currencyService;
    }
    async create(submittedById, companyId, dto, approvalsService) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        let convertedAmount = dto.amount;
        let exchangeRateUsed = 1;
        let rateTimestamp = new Date();
        if (dto.currency !== company.defaultCurrency) {
            try {
                const conversion = await this.currencyService.convertAmount(dto.amount, dto.currency, company.defaultCurrency);
                convertedAmount = conversion.convertedAmount;
                exchangeRateUsed = conversion.rate;
                rateTimestamp = conversion.timestamp;
            }
            catch (err) {
                throw new common_1.BadRequestException(`Could not convert ${dto.currency} to ${company.defaultCurrency}: ${err.message}`);
            }
        }
        const expense = await this.prisma.expense.create({
            data: {
                companyId,
                submittedById,
                amount: dto.amount,
                currency: dto.currency,
                convertedAmount,
                companyCurrency: company.defaultCurrency,
                exchangeRateUsed,
                rateTimestamp,
                category: dto.category,
                description: dto.description,
                date: new Date(dto.date),
                status: 'PENDING',
                receiptUrl: dto.receiptUrl ?? null,
                ocrExtracted: !!dto.ocrJobId,
            },
            include: {
                submittedBy: { select: { id: true, name: true, email: true } },
            },
        });
        if (approvalsService) {
            try {
                await approvalsService.initializeApprovalChain(expense.id, companyId, convertedAmount, submittedById);
            }
            catch (err) {
                this.logger.error(`Failed to init approval chain: ${err.message}`);
            }
        }
        return this.findOne(expense.id, companyId, submittedById, 'EMPLOYEE');
    }
    async findAll(companyId, userId, role, query) {
        const { skip, take } = (0, pagination_util_1.paginate)(query);
        const where = { companyId };
        if (role === client_1.Role.EMPLOYEE) {
            where.submittedById = userId;
        }
        if (query.status)
            where.status = query.status;
        if (query.category)
            where.category = query.category;
        const [expenses, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    submittedBy: { select: { id: true, name: true, email: true } },
                    template: { select: { id: true, name: true } },
                    approvals: {
                        orderBy: { stepOrder: 'asc' },
                        include: { approver: { select: { id: true, name: true, email: true } } },
                    },
                },
            }),
            this.prisma.expense.count({ where }),
        ]);
        return (0, pagination_util_1.buildPaginatedResult)(expenses, total, query.page || 1, query.limit || 20);
    }
    async findOne(id, companyId, userId, role) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, companyId },
            include: {
                submittedBy: { select: { id: true, name: true, email: true } },
                template: { select: { id: true, name: true } },
                routingRule: { select: { id: true, minAmount: true, maxAmount: true, priority: true } },
                approvals: {
                    orderBy: { stepOrder: 'asc' },
                    include: { approver: { select: { id: true, name: true, email: true } } },
                },
                ocrJob: true,
            },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if (role === 'EMPLOYEE' && expense.submittedById !== userId) {
            throw new common_1.ForbiddenException('You can only view your own expenses');
        }
        return expense;
    }
    async cancel(id, userId, companyId) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, companyId, submittedById: userId },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if (expense.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only PENDING expenses can be cancelled');
        }
        return this.prisma.expense.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }
    async getStats(companyId) {
        const [total, pending, approved, rejected, cancelled] = await Promise.all([
            this.prisma.expense.count({ where: { companyId } }),
            this.prisma.expense.count({ where: { companyId, status: 'PENDING' } }),
            this.prisma.expense.count({ where: { companyId, status: 'APPROVED' } }),
            this.prisma.expense.count({ where: { companyId, status: 'REJECTED' } }),
            this.prisma.expense.count({ where: { companyId, status: 'CANCELLED' } }),
        ]);
        const totalAmountResult = await this.prisma.expense.aggregate({
            where: { companyId, status: 'APPROVED' },
            _sum: { convertedAmount: true },
        });
        return {
            total,
            pending,
            approved,
            rejected,
            cancelled,
            totalApprovedAmount: totalAmountResult._sum.convertedAmount ?? 0,
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = ExpensesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map