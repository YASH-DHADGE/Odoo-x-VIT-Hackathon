import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('receipt')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and PDF files are allowed'), false);
        }
      },
    }),
  )
  uploadReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadService.uploadReceipt(file);
  }
}
