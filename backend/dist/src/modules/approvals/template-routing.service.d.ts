import { PrismaService } from '../prisma/prisma.service';
export declare class TemplateRoutingService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    selectTemplate(companyId: string, convertedAmount: number): Promise<{
        templateId: string;
        routingRuleId: string | null;
    }>;
    createRule(companyId: string, dto: {
        templateId: string;
        minAmount: number;
        maxAmount?: number;
        priority?: number;
        isActive?: boolean;
    }): Promise<any>;
    findAll(companyId: string): Promise<any>;
    findOne(id: string, companyId: string): Promise<any>;
    updateRule(id: string, companyId: string, dto: {
        minAmount?: number;
        maxAmount?: number | null;
        priority?: number;
        isActive?: boolean;
        templateId?: string;
    }): Promise<any>;
    deleteRule(id: string, companyId: string): Promise<{
        message: string;
    }>;
    preview(companyId: string, amount: number): Promise<{
        template: any;
        templateId: string;
        routingRuleId: string | null;
        amount: number;
        error?: undefined;
    } | {
        amount: number;
        error: any;
    }>;
    validateOverlapDryRun(companyId: string, rules: Array<{
        minAmount: number;
        maxAmount?: number;
        priority: number;
    }>): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    private validateNoOverlap;
}
