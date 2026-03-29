import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WelcomeEmailPayload {
  to: string;
  name: string;
  temporaryPassword: string;
  companyName: string;
}

export interface PasswordResetEmailPayload {
  to: string;
  name: string;
  resetUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
    // In production, replace with nodemailer / SendGrid / Resend
    this.logger.log(
      `[EMAIL] Welcome email to ${payload.to} (${payload.name}) @ ${payload.companyName}. Temp password: ${payload.temporaryPassword}`,
    );
    // TODO: integrate SMTP via nodemailer or transactional email provider
  }

  async sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void> {
    this.logger.log(
      `[EMAIL] Password reset email to ${payload.to} — URL: ${payload.resetUrl}`,
    );
  }
}
