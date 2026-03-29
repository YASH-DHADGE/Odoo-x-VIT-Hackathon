"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const ioredis_1 = require("@nestjs-modules/ioredis");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const companies_module_1 = require("./modules/companies/companies.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const approvals_module_1 = require("./modules/approvals/approvals.module");
const currency_module_1 = require("./modules/currency/currency.module");
const upload_module_1 = require("./modules/upload/upload.module");
const ocr_module_1 = require("./modules/ocr/ocr.module");
const email_module_1 = require("./modules/email/email.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            ioredis_1.RedisModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'single',
                    url: `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`,
                }),
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    connection: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                    },
                }),
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            companies_module_1.CompaniesModule,
            currency_module_1.CurrencyModule,
            expenses_module_1.ExpensesModule,
            approvals_module_1.ApprovalsModule,
            upload_module_1.UploadModule,
            ocr_module_1.OcrModule,
            email_module_1.EmailModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map