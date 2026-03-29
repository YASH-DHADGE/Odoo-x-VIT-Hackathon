import { OcrService } from './ocr.service';
export declare class OcrController {
    private readonly ocrService;
    constructor(ocrService: OcrService);
    scan(body: {
        expenseId: string;
        imageUrl: string;
    }): Promise<{
        jobId: any;
        status: string;
    }>;
    getJobStatus(expenseId: string): Promise<any>;
}
