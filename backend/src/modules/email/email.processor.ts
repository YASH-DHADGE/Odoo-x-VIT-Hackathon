import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService, WelcomeEmailPayload, PasswordResetEmailPayload } from './email.service';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private emailService: EmailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing email job: ${job.name}`);

    try {
      switch (job.name) {
        case 'welcome':
          await this.emailService.sendWelcomeEmail(job.data as WelcomeEmailPayload);
          break;
        case 'password-reset':
          await this.emailService.sendPasswordResetEmail(job.data as PasswordResetEmailPayload);
          break;
        default:
          this.logger.warn(`Unknown email job type: ${job.name}`);
      }
    } catch (err) {
      this.logger.error(`Email job failed: ${err.message}`, err.stack);
      throw err; // BullMQ will retry
    }
  }
}
