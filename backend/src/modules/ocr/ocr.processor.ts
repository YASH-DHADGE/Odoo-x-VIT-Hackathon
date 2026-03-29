import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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
      const { parsedData, rawResponse } = await this.callOcrSpace(imageUrl);

      await this.prisma.ocrJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          rawResponse,
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

  private async callOcrSpace(imageUrl: string) {
    const apiKey = this.configService.get<string>('OCR_SPACE_API_KEY');
    if (!apiKey) {
      throw new Error('OCR_SPACE_API_KEY is not configured');
    }

    const endpoint =
      this.configService.get<string>('OCR_SPACE_API_URL') ?? 'https://api.ocr.space/parse/image';

    const body = new URLSearchParams({
      apikey: apiKey,
      url: imageUrl,
      language: 'eng',
      isOverlayRequired: 'false',
      OCREngine: '2',
      scale: 'true',
    });

    const response = await axios.post(endpoint, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    });

    const data = response.data as {
      IsErroredOnProcessing?: boolean;
      ErrorMessage?: string | string[];
      ParsedResults?: Array<{ ParsedText?: string }>;
    };

    if (data?.IsErroredOnProcessing) {
      const errorMessage = Array.isArray(data.ErrorMessage)
        ? data.ErrorMessage.join('; ')
        : data.ErrorMessage || 'OCR.space processing failed';
      throw new Error(errorMessage);
    }

    const fullText = (data?.ParsedResults ?? [])
      .map((item) => item?.ParsedText ?? '')
      .join('\n')
      .trim();

    return {
      rawResponse: data,
      parsedData: this.parseReceiptText(fullText),
    };
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
