"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    companyId: true,
    managerId: true,
    isManagerApprover: true,
    mustChangePassword: true,
    createdAt: true,
    updatedAt: true,
    manager: { select: { id: true, name: true, email: true } },
};
let UsersService = UsersService_1 = class UsersService {
    prisma;
    emailService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async findAll(companyId) {
        return this.prisma.user.findMany({
            where: { companyId },
            select: USER_SELECT,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, companyId) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId },
            select: USER_SELECT,
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async create(companyId, dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        if (dto.managerId) {
            const manager = await this.prisma.user.findFirst({
                where: { id: dto.managerId, companyId, role: 'MANAGER' },
            });
            if (!manager)
                throw new common_1.BadRequestException('Invalid manager: must be a MANAGER in the same company');
        }
        const randomPassword = this.generateRandomPassword();
        this.logger.log(`[DEV] Auto-generated password for ${dto.email}: ${randomPassword}`);
        const passwordHash = await bcrypt.hash(randomPassword, 12);
        const [user, company] = await Promise.all([
            this.prisma.user.create({
                data: {
                    companyId,
                    name: dto.name,
                    email: dto.email,
                    passwordHash,
                    role: dto.role,
                    managerId: dto.managerId ?? null,
                    isManagerApprover: dto.isManagerApprover ?? false,
                    mustChangePassword: true,
                },
                select: USER_SELECT,
            }),
            this.prisma.company.findUnique({ where: { id: companyId } }),
        ]);
        this.emailService
            .sendWelcomeEmail({
            to: dto.email,
            name: dto.name,
            temporaryPassword: randomPassword,
            companyName: company?.name ?? 'Your Company',
        })
            .catch((err) => this.logger.error(`Failed to queue welcome email: ${err.message}`));
        return { user, temporaryPassword: randomPassword };
    }
    async update(id, companyId, dto) {
        await this.findOne(id, companyId);
        if (dto.managerId) {
            const manager = await this.prisma.user.findFirst({
                where: { id: dto.managerId, companyId, role: 'MANAGER' },
            });
            if (!manager)
                throw new common_1.BadRequestException('Invalid manager');
        }
        return this.prisma.user.update({
            where: { id },
            data: dto,
            select: USER_SELECT,
        });
    }
    async assignRole(id, companyId, dto) {
        await this.findOne(id, companyId);
        return this.prisma.user.update({
            where: { id },
            data: { role: dto.role },
            select: USER_SELECT,
        });
    }
    async assignManager(id, companyId, managerId) {
        await this.findOne(id, companyId);
        const manager = await this.prisma.user.findFirst({
            where: { id: managerId, companyId, role: 'MANAGER' },
        });
        if (!manager)
            throw new common_1.BadRequestException('Manager not found or not a MANAGER role');
        return this.prisma.user.update({
            where: { id },
            data: { managerId },
            select: USER_SELECT,
        });
    }
    async remove(id, companyId) {
        await this.findOne(id, companyId);
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
    generateRandomPassword(length = 16) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map