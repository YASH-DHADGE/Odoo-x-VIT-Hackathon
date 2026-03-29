import { ExpenseStatus } from '@prisma/client';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ApprovalsService } from '../approvals/approvals.service';
export declare class ExpensesController {
    private readonly expensesService;
    private readonly approvalsService;
    constructor(expensesService: ExpensesService, approvalsService: ApprovalsService);
    create(dto: CreateExpenseDto, user: any): Promise<any>;
    findAll(user: any, status?: ExpenseStatus, category?: string, page?: string, limit?: string): Promise<import("../../common/utils/pagination.util").PaginatedResult<unknown>>;
    getStats(companyId: string): Promise<{
        total: any;
        pending: any;
        approved: any;
        rejected: any;
        cancelled: any;
        totalApprovedAmount: any;
    }>;
    findOne(id: string, user: any): Promise<any>;
    cancel(id: string, user: any): Promise<any>;
}
