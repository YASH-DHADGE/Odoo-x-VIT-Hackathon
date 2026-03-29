import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    uploadReceipt(file: Express.Multer.File, folder?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    deleteFile(publicId: string): Promise<void>;
}
