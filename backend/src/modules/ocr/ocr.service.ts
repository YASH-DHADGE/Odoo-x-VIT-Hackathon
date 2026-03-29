import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES, JOB_NAMES } from '../../common/constants/queues.constant';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.OCR_PROCESSING) private ocrQueue: Queue,
  ) {}

  async dispatchScan(expenseId: string, imageUrl: string) {
    // Create OCR job record
    const job = await this.prisma.ocrJob.upsert({
      where: { expenseId },
      create: { expenseId, status: 'QUEUED' },
      update: { status: 'QUEUED', rawResponse: undefined, parsedData: undefined },
    });

    // Dispatch to BullMQ queue
    await this.ocrQueue.add(
      JOB_NAMES.SCAN_RECEIPT,
      { jobId: job.id, expenseId, imageUrl },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`OCR job dispatched for expense ${expenseId}`);
    return { jobId: job.id, status: 'QUEUED' };
  }

  async getJobStatus(expenseId: string) {
    const job = await this.prisma.ocrJob.findUnique({ where: { expenseId } });
    if (!job) return null;
    return job;
  }
}
