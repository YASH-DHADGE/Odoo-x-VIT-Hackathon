import { PrismaService } from '../prisma/prisma.service';
import { TemplateRoutingService } from './template-routing.service';
export declare class ApprovalEngineService {
    private prisma;
    private routingService;
    private readonly logger;
    constructor(prisma: PrismaService, routingService: TemplateRoutingService);
    initializeApprovalChain(expenseId: string, companyId: string, convertedAmount: number, submittedById: string): Promise<void>;
    approve(expenseId: string, approverId: string, companyId: string, comments?: string): Promise<{
        status: string;
        reason: string;
    }>;
    reject(expenseId: string, approverId: string, companyId: string, comments: string): Promise<{
        status: string;
    }>;
    getPendingForApprover(approverId: string, companyId: string): Promise<any[]>;
    private validateApproverAction;
    private getCurrentStep;
    private evaluateConditionalRules;
    private finalizeExpense;
}
