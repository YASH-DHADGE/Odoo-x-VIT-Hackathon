import { ApprovalsService } from './approvals.service';
export declare class ApprovalsController {
    private readonly approvalsService;
    constructor(approvalsService: ApprovalsService);
    getPending(user: any): Promise<any[]>;
    approve(expenseId: string, comments: string, user: any): Promise<{
        status: string;
        reason: string;
    }>;
    reject(expenseId: string, comments: string, user: any): Promise<{
        status: string;
    }>;
    createTemplate(dto: any, companyId: string): Promise<any>;
    getTemplates(companyId: string): Promise<any>;
    getTemplate(id: string, companyId: string): Promise<any>;
    updateTemplate(id: string, dto: any, companyId: string): Promise<any>;
    deleteTemplate(id: string, companyId: string): Promise<{
        message: string;
    }>;
    addStep(templateId: string, dto: any, companyId: string): Promise<any>;
    deleteStep(id: string, companyId: string): Promise<{
        message: string;
    }>;
    createRoutingRule(dto: any, companyId: string): Promise<any>;
    getRoutingRules(companyId: string): Promise<any>;
    previewRouting(amount: string, companyId: string): Promise<{
        template: any;
        templateId: string;
        routingRuleId: string | null;
        amount: number;
        error?: undefined;
    } | {
        amount: number;
        error: any;
    }>;
    getRoutingRule(id: string, companyId: string): Promise<any>;
    updateRoutingRule(id: string, dto: any, companyId: string): Promise<any>;
    deleteRoutingRule(id: string, companyId: string): Promise<{
        message: string;
    }>;
    validateRules(rules: any[], companyId: string): Promise<{
        valid: boolean;
        issues: string[];
    }>;
}
