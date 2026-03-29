import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadReceipt(
    file: Express.Multer.File,
    folder = 'reimbursement/receipts',
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
          max_bytes: 10 * 1024 * 1024, // 10 MB
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(new Error(`Upload failed: ${error.message}`));
          }
          resolve({ url: result!.secure_url, publicId: result!.public_id });
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
  }
}
