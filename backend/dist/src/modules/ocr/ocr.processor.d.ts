import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class OcrProcessor extends WorkerHost {
    private prisma;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    process(job: Job): Promise<{
        amount: number | null;
        date: string | null;
        vendor: string | null;
        category: string;
        rawText: string;
    }>;
    private callOcrSpace;
    private parseReceiptText;
}
