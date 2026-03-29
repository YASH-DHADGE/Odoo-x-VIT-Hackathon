import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from '@nestjs-modules/ioredis';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { UploadModule } from './modules/upload/upload.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`,
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CurrencyModule,
    ExpensesModule,
    ApprovalsModule,
    UploadModule,
    OcrModule,
    EmailModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
