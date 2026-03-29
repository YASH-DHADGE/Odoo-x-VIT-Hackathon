import { Module, forwardRef } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { ApprovalEngineService } from './approval-engine.service';
import { TemplateRoutingService } from './template-routing.service';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [forwardRef(() => ExpensesModule)],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, ApprovalEngineService, TemplateRoutingService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
