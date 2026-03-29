import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.usersService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.usersService.findOne(id, companyId);
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser('companyId') companyId: string) {
    return this.usersService.create(companyId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.usersService.update(id, companyId, dto);
  }

  @Patch(':id/role')
  assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.usersService.assignRole(id, companyId, dto);
  }

  @Patch(':id/manager')
  assignManager(
    @Param('id') id: string,
    @Body('managerId') managerId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.usersService.assignManager(id, companyId, managerId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.usersService.remove(id, companyId);
  }
}
