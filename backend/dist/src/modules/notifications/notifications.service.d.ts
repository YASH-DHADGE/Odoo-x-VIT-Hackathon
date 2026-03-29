import { PrismaService } from '../prisma/prisma.service';
export type NotificationType = 'expense.submitted' | 'expense.approved' | 'expense.rejected' | 'user.created';
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    notify(type: NotificationType, payload: Record<string, unknown>): void;
}
