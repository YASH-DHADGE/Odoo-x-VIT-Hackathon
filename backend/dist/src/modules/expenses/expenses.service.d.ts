import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseStatus, Role } from '@prisma/client';
export declare class ExpensesService {
    private prisma;
    private currencyService;
    private readonly logger;
    constructor(prisma: PrismaService, currencyService: CurrencyService);
    create(submittedById: string, companyId: string, dto: CreateExpenseDto, approvalsService: any): Promise<any>;
    findAll(companyId: string, userId: string, role: Role, query: {
        status?: ExpenseStatus;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<import("../../common/utils/pagination.util").PaginatedResult<unknown>>;
    findOne(id: string, companyId: string, userId: string, role: string): Promise<any>;
    cancel(id: string, userId: string, companyId: string): Promise<any>;
    getStats(companyId: string): Promise<{
        total: any;
        pending: any;
        approved: any;
        rejected: any;
        cancelled: any;
        totalApprovedAmount: any;
    }>;
}
