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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
const currency_service_1 = require("../currency/currency.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    currencyService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService, currencyService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.currencyService = currencyService;
    }
    async signup(dto) {
        try {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existing) {
                throw new common_1.ConflictException('An account with this email already exists');
            }
            let defaultCurrency = 'USD';
            try {
                defaultCurrency = await this.currencyService.getCurrencyForCountry(dto.country);
            }
            catch {
                this.logger.warn(`Could not fetch currency for ${dto.country}, defaulting to USD`);
            }
            const passwordHash = await bcrypt.hash(dto.password, 12);
            const result = await this.prisma.$transaction(async (tx) => {
                const company = await tx.company.create({
                    data: {
                        name: dto.companyName,
                        country: dto.country,
                        defaultCurrency,
                    },
                });
                const user = await tx.user.create({
                    data: {
                        companyId: company.id,
                        name: dto.name,
                        email: dto.email,
                        passwordHash,
                        role: 'ADMIN',
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        companyId: true,
                        mustChangePassword: true,
                    },
                });
                return { company, user };
            });
            const tokens = await this.generateTokens(result.user.id, result.user.email, result.user.role);
            await this.storeRefreshToken(result.user.id, tokens.refreshToken);
            return { user: result.user, company: result.company, ...tokens };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException)
                throw error;
            this.logger.error('Signup failed', error);
            throw error;
        }
    }
    async login(dto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
                include: { company: { select: { id: true, name: true, defaultCurrency: true } } },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
            if (!passwordMatch) {
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const tokens = await this.generateTokens(user.id, user.email, user.role);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            const { passwordHash, refreshToken, ...safeUser } = user;
            return { user: safeUser, ...tokens };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            this.logger.error('Login failed', error);
            throw error;
        }
    }
    async refreshTokens(userId, email, role, oldRefreshToken) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const rtMatch = await bcrypt.compare(oldRefreshToken, user.refreshToken);
        if (!rtMatch) {
            throw new common_1.UnauthorizedException('Access denied - refresh token mismatch');
        }
        const tokens = await this.generateTokens(userId, email, role);
        await this.storeRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { message: 'Logged out successfully' };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyId: true,
                managerId: true,
                isManagerApprover: true,
                mustChangePassword: true,
                createdAt: true,
                company: {
                    select: { id: true, name: true, defaultCurrency: true, country: true },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const passwordMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
        if (!passwordMatch) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash, mustChangePassword: false },
        });
        return { message: 'Password changed successfully' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            return { message: 'If that email exists, a reset link has been sent' };
        }
        await this.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: { userId: user.id, token, expiresAt },
        });
        const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
        this.logger.log(`[DEV] Password reset link for ${dto.email}: ${resetUrl}`);
        return { message: 'If that email exists, a reset link has been sent' };
    }
    async resetPassword(dto) {
        const tokenRecord = await this.prisma.passwordResetToken.findUnique({
            where: { token: dto.token },
        });
        if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: tokenRecord.userId },
                data: { passwordHash: newHash, mustChangePassword: false },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: tokenRecord.id },
                data: { used: true },
            }),
        ]);
        return { message: 'Password reset successfully. You can now log in.' };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(userId, token) {
        const hashed = await bcrypt.hash(token, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashed },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        currency_service_1.CurrencyService])
], AuthService);
//# sourceMappingURL=auth.service.js.map