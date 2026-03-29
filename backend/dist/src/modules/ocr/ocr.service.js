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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const queues_constant_1 = require("../../common/constants/queues.constant");
let OcrService = OcrService_1 = class OcrService {
    prisma;
    ocrQueue;
    logger = new common_1.Logger(OcrService_1.name);
    constructor(prisma, ocrQueue) {
        this.prisma = prisma;
        this.ocrQueue = ocrQueue;
    }
    async dispatchScan(expenseId, imageUrl) {
        const job = await this.prisma.ocrJob.upsert({
            where: { expenseId },
            create: { expenseId, status: 'QUEUED' },
            update: { status: 'QUEUED', rawResponse: undefined, parsedData: undefined },
        });
        await this.ocrQueue.add(queues_constant_1.JOB_NAMES.SCAN_RECEIPT, { jobId: job.id, expenseId, imageUrl }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
        });
        this.logger.log(`OCR job dispatched for expense ${expenseId}`);
        return { jobId: job.id, status: 'QUEUED' };
    }
    async getJobStatus(expenseId) {
        const job = await this.prisma.ocrJob.findUnique({ where: { expenseId } });
        if (!job)
            return null;
        return job;
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)(queues_constant_1.QUEUE_NAMES.OCR_PROCESSING)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], OcrService);
//# sourceMappingURL=ocr.service.js.map