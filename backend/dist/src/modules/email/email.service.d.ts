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
export declare class EmailService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void>;
    sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void>;
}
