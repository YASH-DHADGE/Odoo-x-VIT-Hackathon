import { PrismaService } from '../prisma/prisma.service';
export declare class CompaniesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUser(companyId: string): Promise<any>;
    update(companyId: string, data: {
        name?: string;
        defaultCurrency?: string;
    }): Promise<any>;
}
