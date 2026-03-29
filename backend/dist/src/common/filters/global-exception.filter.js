"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const res = exceptionResponse;
                message = res.message || exception.message;
                error = res.error || exception.name;
            }
            else {
                message = exceptionResponse;
                error = exception.name;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const prismaError = this.handlePrismaError(exception);
            statusCode = prismaError.statusCode;
            message = prismaError.message;
            error = prismaError.error;
        }
        else if (exception instanceof Error) {
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
            message = 'An unexpected error occurred';
        }
        this.logger.error(`${request.method} ${request.url} → ${statusCode}`);
        response.status(statusCode).json({
            statusCode,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
    handlePrismaError(exception) {
        switch (exception.code) {
            case 'P2002':
                return {
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: `A record with this value already exists`,
                    error: 'Conflict',
                };
            case 'P2025':
                return {
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    message: 'The requested record was not found',
                    error: 'Not Found',
                };
            case 'P2003':
                return {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Foreign key constraint failed',
                    error: 'Bad Request',
                };
            default:
                this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
                return {
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database error occurred',
                    error: 'Internal Server Error',
                };
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map