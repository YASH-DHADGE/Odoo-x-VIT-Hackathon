import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
export declare class OcrService {
    private prisma;
    private ocrQueue;
    private readonly logger;
    constructor(prisma: PrismaService, ocrQueue: Queue);
    dispatchScan(expenseId: string, imageUrl: string): Promise<{
        jobId: any;
        status: string;
    }>;
    getJobStatus(expenseId: string): Promise<any>;
}
