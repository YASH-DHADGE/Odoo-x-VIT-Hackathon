import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
export declare class EmailProcessor extends WorkerHost {
    private emailService;
    private readonly logger;
    constructor(emailService: EmailService);
    process(job: Job): Promise<void>;
}
