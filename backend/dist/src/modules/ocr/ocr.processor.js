"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OcrProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queues_constant_1 = require("../../common/constants/queues.constant");
let OcrProcessor = OcrProcessor_1 = class OcrProcessor extends bullmq_1.WorkerHost {
    prisma;
    configService;
    logger = new common_1.Logger(OcrProcessor_1.name);
    constructor(prisma, configService) {
        super();
        this.prisma = prisma;
        this.configService = configService;
    }
    async process(job) {
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
        }
        catch (error) {
            this.logger.error(`OCR job ${jobId} failed: ${error.message}`);
            await this.prisma.ocrJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', rawResponse: { error: error.message } },
            });
            throw error;
        }
    }
    async callGoogleVision(imageUrl) {
        const keyFile = this.configService.get('GOOGLE_CLOUD_KEY_FILE');
        const vision = await import('@google-cloud/vision');
        const client = new vision.ImageAnnotatorClient({
            keyFilename: keyFile,
        });
        const [result] = await client.documentTextDetection(imageUrl);
        const fullText = result.fullTextAnnotation?.text || '';
        return this.parseReceiptText(fullText);
    }
    parseReceiptText(text) {
        const amountMatch = text.match(/(?:total|amount|subtotal)[:\s]*[$₹€£]?\s*(\d+[\.,]\d{2})/i);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;
        const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
        const date = dateMatch ? dateMatch[1] : null;
        const lines = text.split('\n').filter((l) => l.trim().length > 2);
        const vendor = lines[0] || null;
        const lower = text.toLowerCase();
        let category = 'OTHER';
        if (/hotel|accommodation|lodge|stay/.test(lower))
            category = 'ACCOMMODATION';
        else if (/flight|airline|taxi|uber|cab|transport/.test(lower))
            category = 'TRAVEL';
        else if (/restaurant|food|cafe|meal|drink/.test(lower))
            category = 'FOOD';
        else if (/office|equipment|laptop|monitor/.test(lower))
            category = 'EQUIPMENT';
        return { amount, date, vendor, category, rawText: text };
    }
};
exports.OcrProcessor = OcrProcessor;
exports.OcrProcessor = OcrProcessor = OcrProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_constant_1.QUEUE_NAMES.OCR_PROCESSING),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OcrProcessor);
//# sourceMappingURL=ocr.processor.js.map