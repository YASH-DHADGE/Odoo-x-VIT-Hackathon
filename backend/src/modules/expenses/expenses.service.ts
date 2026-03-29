import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseStatus, Role } from '@prisma/client';
import { paginate, buildPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
  ) {}

  async create(
    submittedById: string,
    companyId: string,
    dto: CreateExpenseDto,
    approvalsService: any, // injected lazily to avoid circular dep
  ) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    // Convert amount to company currency
    let convertedAmount = dto.amount;
    let exchangeRateUsed = 1;
    let rateTimestamp = new Date();

    if (dto.currency !== company.defaultCurrency) {
      try {
        const conversion = await this.currencyService.convertAmount(
          dto.amount,
          dto.currency,
          company.defaultCurrency,
        );
        convertedAmount = conversion.convertedAmount;
        exchangeRateUsed = conversion.rate;
        rateTimestamp = conversion.timestamp;
      } catch (err) {
        throw new BadRequestException(
          `Could not convert ${dto.currency} to ${company.defaultCurrency}: ${err.message}`,
        );
      }
    }

    // Create the expense record first (template will be set by approvals service)
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

    // Route to correct template and initialize approval chain
    if (approvalsService) {
      try {
        await approvalsService.initializeApprovalChain(
          expense.id,
          companyId,
          convertedAmount,
          submittedById,
        );
      } catch (err) {
        this.logger.error(`Failed to init approval chain: ${err.message}`);
        // Don't fail the expense submission; admin can manually handle
      }
    }

    return this.findOne(expense.id, companyId, submittedById, 'EMPLOYEE');
  }

  async findAll(
    companyId: string,
    userId: string,
    role: Role,
    query: {
      status?: ExpenseStatus;
      category?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const { skip, take } = paginate(query);

    const where: any = { companyId };

    if (role === Role.EMPLOYEE) {
      where.submittedById = userId;
    }
    // MANAGER sees all expenses — filtered further in approval queue
    // ADMIN sees all

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

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

    return buildPaginatedResult(expenses, total, query.page || 1, query.limit || 20);
  }

  async findOne(id: string, companyId: string, userId: string, role: string) {
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

    if (!expense) throw new NotFoundException('Expense not found');

    if (role === 'EMPLOYEE' && expense.submittedById !== userId) {
      throw new ForbiddenException('You can only view your own expenses');
    }

    return expense;
  }

  async cancel(id: string, userId: string, companyId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, companyId, submittedById: userId },
    });

    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING expenses can be cancelled');
    }

    return this.prisma.expense.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getStats(companyId: string) {
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
}
