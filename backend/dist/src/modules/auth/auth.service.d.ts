import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrencyService } from '../currency/currency.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private currencyService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, currencyService: CurrencyService);
    signup(dto: SignupDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
        company: any;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    refreshTokens(userId: string, email: string, role: string, oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<any>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateTokens;
    private storeRefreshToken;
}
