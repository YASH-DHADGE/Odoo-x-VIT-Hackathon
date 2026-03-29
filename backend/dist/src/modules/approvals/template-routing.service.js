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
var TemplateRoutingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRoutingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TemplateRoutingService = TemplateRoutingService_1 = class TemplateRoutingService {
    prisma;
    logger = new common_1.Logger(TemplateRoutingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async selectTemplate(companyId, convertedAmount) {
        const rules = await this.prisma.templateRoutingRule.findMany({
            where: { companyId, isActive: true },
            orderBy: { priority: 'asc' },
            include: { template: true },
        });
        for (const rule of rules) {
            const min = Number(rule.minAmount);
            const max = rule.maxAmount !== null ? Number(rule.maxAmount) : Infinity;
            if (convertedAmount >= min && convertedAmount <= max) {
                this.logger.log(`Routing rule matched: ${rule.id} → template "${rule.template.name}" for amount ${convertedAmount}`);
                return { templateId: rule.templateId, routingRuleId: rule.id };
            }
        }
        const defaultTemplate = await this.prisma.approvalTemplate.findFirst({
            where: { companyId, isDefault: true },
        });
        if (defaultTemplate) {
            this.logger.log(`No routing rule matched; using default template "${defaultTemplate.name}"`);
            return { templateId: defaultTemplate.id, routingRuleId: null };
        }
        const anyTemplate = await this.prisma.approvalTemplate.findFirst({
            where: { companyId },
        });
        if (anyTemplate) {
            return { templateId: anyTemplate.id, routingRuleId: null };
        }
        throw new common_1.BadRequestException('No approval template configured for this company. Please ask your admin to set up approval templates.');
    }
    async createRule(companyId, dto) {
        const template = await this.prisma.approvalTemplate.findFirst({
            where: { id: dto.templateId, companyId },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (dto.maxAmount !== undefined && dto.minAmount >= dto.maxAmount) {
            throw new common_1.BadRequestException('minAmount must be less than maxAmount');
        }
        if (dto.minAmount < 0) {
            throw new common_1.BadRequestException('minAmount must be >= 0');
        }
        await this.validateNoOverlap(companyId, dto.minAmount, dto.maxAmount, dto.priority ?? 0);
        return this.prisma.templateRoutingRule.create({
            data: {
                companyId,
                templateId: dto.templateId,
                minAmount: dto.minAmount,
                maxAmount: dto.maxAmount ?? null,
                priority: dto.priority ?? 0,
                isActive: dto.isActive ?? true,
            },
            include: { template: { select: { id: true, name: true } } },
        });
    }
    async findAll(companyId) {
        return this.prisma.templateRoutingRule.findMany({
            where: { companyId },
            orderBy: { priority: 'asc' },
            include: { template: { select: { id: true, name: true } } },
        });
    }
    async findOne(id, companyId) {
        const rule = await this.prisma.templateRoutingRule.findFirst({
            where: { id, companyId },
            include: { template: { select: { id: true, name: true } } },
        });
        if (!rule)
            throw new common_1.NotFoundException('Routing rule not found');
        return rule;
    }
    async updateRule(id, companyId, dto) {
        const existing = await this.findOne(id, companyId);
        const newMin = dto.minAmount ?? Number(existing.minAmount);
        const newMax = dto.maxAmount !== undefined ? dto.maxAmount : Number(existing.maxAmount);
        if (newMax !== null && newMin >= newMax) {
            throw new common_1.BadRequestException('minAmount must be less than maxAmount');
        }
        return this.prisma.templateRoutingRule.update({
            where: { id },
            data: dto,
            include: { template: { select: { id: true, name: true } } },
        });
    }
    async deleteRule(id, companyId) {
        await this.findOne(id, companyId);
        await this.prisma.templateRoutingRule.delete({ where: { id } });
        return { message: 'Routing rule deleted' };
    }
    async preview(companyId, amount) {
        try {
            const result = await this.selectTemplate(companyId, amount);
            const template = await this.prisma.approvalTemplate.findUnique({
                where: { id: result.templateId },
                include: { steps: { include: { approver: { select: { id: true, name: true } } } } },
            });
            return { amount, ...result, template };
        }
        catch (err) {
            return { amount, error: err.message };
        }
    }
    async validateOverlapDryRun(companyId, rules) {
        const issues = [];
        for (let i = 0; i < rules.length; i++) {
            for (let j = i + 1; j < rules.length; j++) {
                const a = rules[i];
                const b = rules[j];
                const aMax = a.maxAmount ?? Infinity;
                const bMax = b.maxAmount ?? Infinity;
                if (a.minAmount <= bMax && aMax >= b.minAmount) {
                    if (a.priority === b.priority) {
                        issues.push(`Overlap with same priority between rule ${i + 1} and rule ${j + 1}`);
                    }
                }
            }
        }
        return { valid: issues.length === 0, issues };
    }
    async validateNoOverlap(companyId, minAmount, maxAmount, priority, excludeId) {
        const existingRules = await this.prisma.templateRoutingRule.findMany({
            where: { companyId, isActive: true, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
        });
        for (const rule of existingRules) {
            const rMin = Number(rule.minAmount);
            const rMax = rule.maxAmount !== null ? Number(rule.maxAmount) : Infinity;
            const newMax = maxAmount ?? Infinity;
            const overlaps = minAmount <= rMax && newMax >= rMin;
            if (overlaps && rule.priority === priority) {
                throw new common_1.ConflictException(`Overlapping amount range [${minAmount} - ${maxAmount ?? '∞'}] with existing rule ` +
                    `[${rMin} - ${rMax === Infinity ? '∞' : rMax}] at the same priority. ` +
                    `Use a different priority to allow overlapping ranges.`);
            }
        }
    }
};
exports.TemplateRoutingService = TemplateRoutingService;
exports.TemplateRoutingService = TemplateRoutingService = TemplateRoutingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateRoutingService);
//# sourceMappingURL=template-routing.service.js.map