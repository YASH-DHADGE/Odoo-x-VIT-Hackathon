import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private currencyService: CurrencyService,
  ) {}

  // ─── SIGNUP ─────────────────────────────────────────────────────────────────

  async signup(dto: SignupDto) {
    try {
      // Check if email already exists
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('An account with this email already exists');
      }

      // Fetch default currency for the country
      let defaultCurrency = 'USD';
      try {
        defaultCurrency = await this.currencyService.getCurrencyForCountry(dto.country);
      } catch {
        this.logger.warn(`Could not fetch currency for ${dto.country}, defaulting to USD`);
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      // Create company + admin user atomically
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
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error('Signup failed', error);
      throw error;
    }
  }

  // ─── LOGIN ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: { company: { select: { id: true, name: true, defaultCurrency: true } } },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      const { passwordHash, refreshToken, ...safeUser } = user;
      return { user: safeUser, ...tokens };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  // ─── REFRESH TOKEN ──────────────────────────────────────────────────────────

  async refreshTokens(userId: string, email: string, role: string, oldRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const rtMatch = await bcrypt.compare(oldRefreshToken, user.refreshToken);
    if (!rtMatch) {
      throw new UnauthorizedException('Access denied - refresh token mismatch');
    }

    const tokens = await this.generateTokens(userId, email, role);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  // ─── LOGOUT ─────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  // ─── GET ME ─────────────────────────────────────────────────────────────────

  async getMe(userId: string) {
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

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── CHANGE PASSWORD ────────────────────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    return { message: 'Password changed successfully' };
  }

  // ─── FORGOT PASSWORD ────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent' };
    }

    // Invalidate any existing tokens
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // In dev: log reset link; in prod: queue email
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    this.logger.log(`[DEV] Password reset link for ${dto.email}: ${resetUrl}`);

    return { message: 'If that email exists, a reset link has been sent' };
  }

  // ─── RESET PASSWORD ─────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
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

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}
