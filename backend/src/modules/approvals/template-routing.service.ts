import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateRoutingService {
  private readonly logger = new Logger(TemplateRoutingService.name);

  constructor(private prisma: PrismaService) {}

  // ─── SELECT TEMPLATE FOR AMOUNT ──────────────────────────────────────────────

  async selectTemplate(
    companyId: string,
    convertedAmount: number,
  ): Promise<{ templateId: string; routingRuleId: string | null }> {
    const rules = await this.prisma.templateRoutingRule.findMany({
      where: { companyId, isActive: true },
      orderBy: { priority: 'asc' },
      include: { template: true },
    });

    for (const rule of rules) {
      const min = Number(rule.minAmount);
      const max = rule.maxAmount !== null ? Number(rule.maxAmount) : Infinity;

      if (convertedAmount >= min && convertedAmount <= max) {
        this.logger.log(
          `Routing rule matched: ${rule.id} → template "${rule.template.name}" for amount ${convertedAmount}`,
        );
        return { templateId: rule.templateId, routingRuleId: rule.id };
      }
    }

    // Fall back to default template
    const defaultTemplate = await this.prisma.approvalTemplate.findFirst({
      where: { companyId, isDefault: true },
    });

    if (defaultTemplate) {
      this.logger.log(`No routing rule matched; using default template "${defaultTemplate.name}"`);
      return { templateId: defaultTemplate.id, routingRuleId: null };
    }

    // Check if any template exists at all
    const anyTemplate = await this.prisma.approvalTemplate.findFirst({
      where: { companyId },
    });

    if (anyTemplate) {
      return { templateId: anyTemplate.id, routingRuleId: null };
    }

    throw new BadRequestException(
      'No approval template configured for this company. Please ask your admin to set up approval templates.',
    );
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  async createRule(companyId: string, dto: {
    templateId: string;
    minAmount: number;
    maxAmount?: number;
    priority?: number;
    isActive?: boolean;
  }) {
    // Validate template belongs to company
    const template = await this.prisma.approvalTemplate.findFirst({
      where: { id: dto.templateId, companyId },
    });
    if (!template) throw new NotFoundException('Template not found');

    // Validate range
    if (dto.maxAmount !== undefined && dto.minAmount >= dto.maxAmount) {
      throw new BadRequestException('minAmount must be less than maxAmount');
    }
    if (dto.minAmount < 0) {
      throw new BadRequestException('minAmount must be >= 0');
    }

    // Check for overlapping ranges with same priority
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

  async findAll(companyId: string) {
    return this.prisma.templateRoutingRule.findMany({
      where: { companyId },
      orderBy: { priority: 'asc' },
      include: { template: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string, companyId: string) {
    const rule = await this.prisma.templateRoutingRule.findFirst({
      where: { id, companyId },
      include: { template: { select: { id: true, name: true } } },
    });
    if (!rule) throw new NotFoundException('Routing rule not found');
    return rule;
  }

  async updateRule(id: string, companyId: string, dto: {
    minAmount?: number;
    maxAmount?: number | null;
    priority?: number;
    isActive?: boolean;
    templateId?: string;
  }) {
    const existing = await this.findOne(id, companyId);

    const newMin = dto.minAmount ?? Number(existing.minAmount);
    const newMax = dto.maxAmount !== undefined ? dto.maxAmount : Number(existing.maxAmount);

    if (newMax !== null && newMin >= newMax) {
      throw new BadRequestException('minAmount must be less than maxAmount');
    }

    return this.prisma.templateRoutingRule.update({
      where: { id },
      data: dto,
      include: { template: { select: { id: true, name: true } } },
    });
  }

  async deleteRule(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.prisma.templateRoutingRule.delete({ where: { id } });
    return { message: 'Routing rule deleted' };
  }

  async preview(companyId: string, amount: number) {
    try {
      const result = await this.selectTemplate(companyId, amount);
      const template = await this.prisma.approvalTemplate.findUnique({
        where: { id: result.templateId },
        include: { steps: { include: { approver: { select: { id: true, name: true } } } } },
      });
      return { amount, ...result, template };
    } catch (err) {
      return { amount, error: err.message };
    }
  }

  // ─── VALIDATION ───────────────────────────────────────────────────────────────

  async validateOverlapDryRun(companyId: string, rules: Array<{
    minAmount: number; maxAmount?: number; priority: number;
  }>) {
    const issues: string[] = [];
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

  private async validateNoOverlap(
    companyId: string,
    minAmount: number,
    maxAmount: number | undefined,
    priority: number,
    excludeId?: string,
  ) {
    const existingRules = await this.prisma.templateRoutingRule.findMany({
      where: { companyId, isActive: true, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });

    for (const rule of existingRules) {
      const rMin = Number(rule.minAmount);
      const rMax = rule.maxAmount !== null ? Number(rule.maxAmount) : Infinity;
      const newMax = maxAmount ?? Infinity;

      const overlaps = minAmount <= rMax && newMax >= rMin;
      if (overlaps && rule.priority === priority) {
        throw new ConflictException(
          `Overlapping amount range [${minAmount} - ${maxAmount ?? '∞'}] with existing rule ` +
          `[${rMin} - ${rMax === Infinity ? '∞' : rMax}] at the same priority. ` +
          `Use a different priority to allow overlapping ranges.`,
        );
      }
    }
  }
}
