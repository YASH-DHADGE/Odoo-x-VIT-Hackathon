import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Role, ExpenseStatus } from '@prisma/client';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApprovalsService } from '../approvals/approvals.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    @Inject(forwardRef(() => ApprovalsService))
    private readonly approvalsService: ApprovalsService,
  ) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.create(
      user.id,
      user.companyId,
      dto,
      this.approvalsService,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: ExpenseStatus,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.expensesService.findAll(user.companyId, user.id, user.role, {
      status,
      category,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('stats')
  getStats(@CurrentUser('companyId') companyId: string) {
    return this.expensesService.getStats(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.findOne(id, user.companyId, user.id, user.role);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.cancel(id, user.id, user.companyId);
  }
}
