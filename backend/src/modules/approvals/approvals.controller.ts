import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  // ─── PENDING QUEUE ──────────────────────────────────────────────────────────

  @Get('pending')
  getPending(@CurrentUser() user: any) {
    return this.approvalsService.getPendingForApprover(user.id, user.companyId);
  }

  // ─── APPROVE / REJECT ───────────────────────────────────────────────────────

  @Post(':expenseId/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('expenseId') expenseId: string,
    @Body('comments') comments: string,
    @CurrentUser() user: any,
  ) {
    return this.approvalsService.approve(expenseId, user.id, user.companyId, comments);
  }

  @Post(':expenseId/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('expenseId') expenseId: string,
    @Body('comments') comments: string,
    @CurrentUser() user: any,
  ) {
    return this.approvalsService.reject(expenseId, user.id, user.companyId, comments);
  }

  // ─── TEMPLATES ──────────────────────────────────────────────────────────────

  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createTemplate(@Body() dto: any, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.createTemplate(companyId, dto);
  }

  @Get('templates')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getTemplates(@CurrentUser('companyId') companyId: string) {
    return this.approvalsService.getTemplates(companyId);
  }

  @Get('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getTemplate(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.getTemplate(id, companyId);
  }

  @Patch('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.approvalsService.updateTemplate(id, companyId, dto);
  }

  @Delete('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteTemplate(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.deleteTemplate(id, companyId);
  }

  // ─── STEPS ──────────────────────────────────────────────────────────────────

  @Post('templates/:id/steps')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  addStep(
    @Param('id') templateId: string,
    @Body() dto: any,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.approvalsService.addStep(templateId, companyId, dto);
  }

  @Delete('steps/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteStep(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.deleteStep(id, companyId);
  }

  // ─── ROUTING RULES ──────────────────────────────────────────────────────────

  @Post('routing-rules')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createRoutingRule(@Body() dto: any, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.createRoutingRule(companyId, dto);
  }

  @Get('routing-rules')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getRoutingRules(@CurrentUser('companyId') companyId: string) {
    return this.approvalsService.getRoutingRules(companyId);
  }

  @Get('routing-rules/preview')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  previewRouting(
    @Query('amount') amount: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.approvalsService.previewRouting(companyId, parseFloat(amount));
  }

  @Get('routing-rules/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getRoutingRule(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.getRoutingRule(id, companyId);
  }

  @Patch('routing-rules/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateRoutingRule(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.approvalsService.updateRoutingRule(id, companyId, dto);
  }

  @Delete('routing-rules/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteRoutingRule(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.deleteRoutingRule(id, companyId);
  }

  @Post('routing-rules/validate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  validateRules(@Body('rules') rules: any[], @CurrentUser('companyId') companyId: string) {
    return this.approvalsService.validateRoutingRules(companyId, rules);
  }
}
