import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateRoutingService } from './template-routing.service';

@Injectable()
export class ApprovalEngineService {
  private readonly logger = new Logger(ApprovalEngineService.name);

  constructor(
    private prisma: PrismaService,
    private routingService: TemplateRoutingService,
  ) {}

  // ─── INITIALIZE APPROVAL CHAIN ───────────────────────────────────────────────

  async initializeApprovalChain(
    expenseId: string,
    companyId: string,
    convertedAmount: number,
    submittedById: string,
  ) {
    // Step 1: Select template via routing service
    const { templateId, routingRuleId } = await this.routingService.selectTemplate(
      companyId,
      convertedAmount,
    );

    // Step 2: Fetch template with ordered steps
    const template = await this.prisma.approvalTemplate.findUnique({
      where: { id: templateId },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!template) throw new NotFoundException('Approval template not found');

    // Step 3: Get employee to check isManagerApprover
    const employee = await this.prisma.user.findUnique({ where: { id: submittedById } });
    if (!employee) throw new NotFoundException('Employee not found');

    // Build ordered approver list
    const approvalRecords: Array<{ approverId: string; stepOrder: number }> = [];
    let stepOffset = 0;

    // Manager auto-insert as step 0
    if (employee.isManagerApprover && employee.managerId) {
      approvalRecords.push({ approverId: employee.managerId, stepOrder: 0 });
      stepOffset = 1;
    }

    // Copy template steps
    for (const step of template.steps) {
      approvalRecords.push({
        approverId: step.approverId,
        stepOrder: step.stepOrder + stepOffset,
      });
    }

    if (approvalRecords.length === 0) {
      // No approvers — auto-approve
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED', templateId, routingRuleId },
      });
      return;
    }

    // Step 4: Create expense approval records + update expense
    await this.prisma.$transaction([
      this.prisma.expense.update({
        where: { id: expenseId },
        data: { templateId, routingRuleId },
      }),
      ...approvalRecords.map((r) =>
        this.prisma.expenseApproval.create({
          data: {
            expenseId,
            approverId: r.approverId,
            stepOrder: r.stepOrder,
            status: 'PENDING',
          },
        }),
      ),
    ]);

    this.logger.log(
      `Initialized ${approvalRecords.length} approval steps for expense ${expenseId}`,
    );
  }

  // ─── APPROVE ─────────────────────────────────────────────────────────────────

  async approve(expenseId: string, approverId: string, companyId: string, comments?: string) {
    const { expense, currentStep } = await this.validateApproverAction(
      expenseId,
      approverId,
      companyId,
    );

    // Mark this step approved
    await this.prisma.expenseApproval.update({
      where: { id: currentStep.id },
      data: { status: 'APPROVED', comments, actionedAt: new Date() },
    });

    // Evaluate conditional rules
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
      // Mark remaining as SKIPPED and expense APPROVED
      await this.finalizeExpense(expenseId, 'APPROVED', allApprovals);
      return { status: 'APPROVED', reason: 'Conditional rule satisfied' };
    }

    // Check if this was the last step
    const remainingPending = allApprovals.filter(
      (a) => a.id !== currentStep.id && a.status === 'PENDING',
    );

    if (remainingPending.length === 0) {
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED' },
      });
      return { status: 'APPROVED', reason: 'All steps completed' };
    }

    return { status: 'PENDING', reason: 'Awaiting next approver' };
  }

  // ─── REJECT ──────────────────────────────────────────────────────────────────

  async reject(expenseId: string, approverId: string, companyId: string, comments: string) {
    const { currentStep } = await this.validateApproverAction(
      expenseId,
      approverId,
      companyId,
    );

    // Mark this step rejected
    await this.prisma.expenseApproval.update({
      where: { id: currentStep.id },
      data: { status: 'REJECTED', comments, actionedAt: new Date() },
    });

    // Mark all remaining steps SKIPPED and expense REJECTED
    const allApprovals = await this.prisma.expenseApproval.findMany({
      where: { expenseId },
    });
    await this.finalizeExpense(expenseId, 'REJECTED', allApprovals);

    return { status: 'REJECTED' };
  }

  // ─── PENDING FOR APPROVER ────────────────────────────────────────────────────

  async getPendingForApprover(approverId: string, companyId: string) {
    // Get all PENDING approvals assigned to this user
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

    // Filter to only the expenses where this approver is the CURRENT step
    const pendingExpenses = [];
    for (const approval of approvals) {
      if (approval.expense.companyId !== companyId) continue;
      if (approval.expense.status !== 'PENDING') continue;

      const currentStep = await this.getCurrentStep(approval.expenseId);
      if (currentStep && currentStep.approverId === approverId) {
        pendingExpenses.push({ ...approval.expense, myApprovalStep: approval });
      }
    }

    return pendingExpenses;
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private async validateApproverAction(expenseId: string, approverId: string, companyId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, companyId },
    });

    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.status !== 'PENDING') {
      throw new BadRequestException(`Expense is already ${expense.status}`);
    }

    const currentStep = await this.getCurrentStep(expenseId);
    if (!currentStep) throw new BadRequestException('No pending approval step found');

    if (currentStep.approverId !== approverId) {
      throw new ForbiddenException('It is not your turn to approve this expense');
    }

    return { expense, currentStep };
  }

  private async getCurrentStep(expenseId: string) {
    return this.prisma.expenseApproval.findFirst({
      where: { expenseId, status: 'PENDING' },
      orderBy: { stepOrder: 'asc' },
    });
  }

  private async evaluateConditionalRules(approvals: any[], template: any): Promise<boolean> {
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
          return approvals.some(
            (a) => a.approverId === template.specificApproverId && a.status === 'APPROVED',
          );
        }
        return false;

      case 'HYBRID':
        const percentageMet =
          template.percentageThreshold &&
          total > 0 &&
          approved / total >= template.percentageThreshold / 100;

        const specificMet =
          template.specificApproverId &&
          approvals.some(
            (a) => a.approverId === template.specificApproverId && a.status === 'APPROVED',
          );

        return !!(percentageMet || specificMet);

      default:
        return false;
    }
  }

  private async finalizeExpense(
    expenseId: string,
    finalStatus: 'APPROVED' | 'REJECTED',
    allApprovals: any[],
  ) {
    const pendingIds = allApprovals
      .filter((a) => a.status === 'PENDING')
      .map((a) => a.id);

    const ops: any[] = [
      this.prisma.expense.update({
        where: { id: expenseId },
        data: { status: finalStatus },
      }),
    ];

    if (pendingIds.length > 0) {
      ops.push(
        this.prisma.expenseApproval.updateMany({
          where: { id: { in: pendingIds } },
          data: { status: 'SKIPPED' },
        }),
      );
    }

    await this.prisma.$transaction(ops);
  }
}
