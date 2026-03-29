import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me')
  getMyCompany(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.findByUser(companyId);
  }

  @Patch('me')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateMyCompany(
    @CurrentUser('companyId') companyId: string,
    @Body() body: { name?: string; defaultCurrency?: string },
  ) {
    return this.companiesService.update(companyId, body);
  }
}
