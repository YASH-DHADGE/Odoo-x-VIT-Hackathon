import { PrismaService } from '../prisma/prisma.service';
import { ApprovalEngineService } from './approval-engine.service';
import { TemplateRoutingService } from './template-routing.service';
export declare class ApprovalsService {
    private prisma;
    private engine;
    private routingService;
    constructor(prisma: PrismaService, engine: ApprovalEngineService, routingService: TemplateRoutingService);
    initializeApprovalChain(expenseId: string, companyId: string, convertedAmount: number, submittedById: string): Promise<void>;
    approve(expenseId: string, approverId: string, companyId: string, comments?: string): Promise<{
        status: string;
        reason: string;
    }>;
    reject(expenseId: string, approverId: string, companyId: string, comments: string): Promise<{
        status: string;
    }>;
    getPendingForApprover(approverId: string, companyId: string): Promise<any[]>;
    createTemplate(companyId: string, dto: {
        name: string;
        conditionalRuleType?: string;
        percentageThreshold?: number;
        specificApproverId?: string;
        isDefault?: boolean;
    }): Promise<any>;
    getTemplates(companyId: string): Promise<any>;
    getTemplate(id: string, companyId: string): Promise<any>;
    updateTemplate(id: string, companyId: string, dto: any): Promise<any>;
    deleteTemplate(id: string, companyId: string): Promise<{
        message: string;
    }>;
    addStep(templateId: string, companyId: string, dto: {
        approverId: string;
        stepOrder: number;
        roleLabel?: string;
    }): Promise<any>;
    deleteStep(stepId: string, companyId: string): Promise<{
        message: string;
    }>;
    createRoutingRule(companyId: string, dto: any): Promise<any>;
    getRoutingRules(companyId: string): Promise<any>;
    getRoutingRule(id: string, companyId: string): Promise<any>;
    updateRoutingRule(id: string, companyId: string, dto: any): Promise<any>;
    deleteRoutingRule(id: string, companyId: string): Promise<{
        message: string;
    }>;
    validateRoutingRules(companyId: string, rules: any[]): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    previewRouting(companyId: string, amount: number): Promise<{
        template: any;
        templateId: string;
        routingRuleId: string | null;
        amount: number;
        error?: undefined;
    } | {
        amount: number;
        error: any;
    }>;
}
