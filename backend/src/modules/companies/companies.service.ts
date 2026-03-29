import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(companyId: string, data: { name?: string; defaultCurrency?: string }) {
    return this.prisma.company.update({
      where: { id: companyId },
      data,
    });
  }
}
