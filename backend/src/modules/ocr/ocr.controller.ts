import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('scan')
  scan(@Body() body: { expenseId: string; imageUrl: string }) {
    return this.ocrService.dispatchScan(body.expenseId, body.imageUrl);
  }

  @Get('jobs/:expenseId')
  getJobStatus(@Param('expenseId') expenseId: string) {
    return this.ocrService.getJobStatus(expenseId);
  }
}
