import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES } from '../../common/constants/queues.constant';

@Processor(QUEUE_NAMES.OCR_PROCESSING)
export class OcrProcessor extends WorkerHost {
  private readonly logger = new Logger(OcrProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job) {
    const { jobId, expenseId, imageUrl } = job.data;
    this.logger.log(`Processing OCR job ${jobId} for expense ${expenseId}`);

    await this.prisma.ocrJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    try {
      const parsedData = await this.callGoogleVision(imageUrl);

      await this.prisma.ocrJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          parsedData,
        },
      });

      this.logger.log(`OCR job ${jobId} completed`);
      return parsedData;
    } catch (error) {
      this.logger.error(`OCR job ${jobId} failed: ${error.message}`);

      await this.prisma.ocrJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', rawResponse: { error: error.message } },
      });

      throw error; // Allow BullMQ to retry
    }
  }

  private async callGoogleVision(imageUrl: string) {
    const keyFile = this.configService.get<string>('GOOGLE_CLOUD_KEY_FILE');

    // Dynamically import to avoid startup failure if key not configured
    const vision = await import('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient({
      keyFilename: keyFile,
    });

    const [result] = await client.documentTextDetection(imageUrl);
    const fullText = result.fullTextAnnotation?.text || '';

    return this.parseReceiptText(fullText);
  }

  private parseReceiptText(text: string) {
    // Extract amount
    const amountMatch = text.match(/(?:total|amount|subtotal)[:\s]*[$₹€£]?\s*(\d+[\.,]\d{2})/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;

    // Extract date
    const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
    const date = dateMatch ? dateMatch[1] : null;

    // Extract vendor (first non-empty line often is vendor)
    const lines = text.split('\n').filter((l) => l.trim().length > 2);
    const vendor = lines[0] || null;

    // Guess category
    const lower = text.toLowerCase();
    let category = 'OTHER';
    if (/hotel|accommodation|lodge|stay/.test(lower)) category = 'ACCOMMODATION';
    else if (/flight|airline|taxi|uber|cab|transport/.test(lower)) category = 'TRAVEL';
    else if (/restaurant|food|cafe|meal|drink/.test(lower)) category = 'FOOD';
    else if (/office|equipment|laptop|monitor/.test(lower)) category = 'EQUIPMENT';

    return { amount, date, vendor, category, rawText: text };
  }
}
