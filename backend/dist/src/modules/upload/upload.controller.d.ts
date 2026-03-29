import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadReceipt(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
}
