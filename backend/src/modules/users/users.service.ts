import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  companyId: true,
  managerId: true,
  isManagerApprover: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
  manager: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(companyId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    if (dto.managerId) {
      const manager = await this.prisma.user.findFirst({
        where: { id: dto.managerId, companyId, role: 'MANAGER' },
      });
      if (!manager) throw new BadRequestException('Invalid manager: must be a MANAGER in the same company');
    }

    const randomPassword = this.generateRandomPassword();
    this.logger.log(`[DEV] Auto-generated password for ${dto.email}: ${randomPassword}`);

    const passwordHash = await bcrypt.hash(randomPassword, 12);

    const [user, company] = await Promise.all([
      this.prisma.user.create({
        data: {
          companyId,
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role,
          managerId: dto.managerId ?? null,
          isManagerApprover: dto.isManagerApprover ?? false,
          mustChangePassword: true,
        },
        select: USER_SELECT,
      }),
      this.prisma.company.findUnique({ where: { id: companyId } }),
    ]);

    // Queue welcome email (fire-and-forget — don't fail user creation if email fails)
    this.emailService
      .sendWelcomeEmail({
        to: dto.email,
        name: dto.name,
        temporaryPassword: randomPassword,
        companyName: company?.name ?? 'Your Company',
      })
      .catch((err) => this.logger.error(`Failed to queue welcome email: ${err.message}`));

    return { user, temporaryPassword: randomPassword };
  }

  async update(id: string, companyId: string, dto: UpdateUserDto) {
    await this.findOne(id, companyId);

    if (dto.managerId) {
      const manager = await this.prisma.user.findFirst({
        where: { id: dto.managerId, companyId, role: 'MANAGER' },
      });
      if (!manager) throw new BadRequestException('Invalid manager');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async assignRole(id: string, companyId: string, dto: AssignRoleDto) {
    await this.findOne(id, companyId);
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: USER_SELECT,
    });
  }

  async assignManager(id: string, companyId: string, managerId: string) {
    await this.findOne(id, companyId);
    const manager = await this.prisma.user.findFirst({
      where: { id: managerId, companyId, role: 'MANAGER' },
    });
    if (!manager) throw new BadRequestException('Manager not found or not a MANAGER role');

    return this.prisma.user.update({
      where: { id },
      data: { managerId },
      select: USER_SELECT,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  private generateRandomPassword(length = 16): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
