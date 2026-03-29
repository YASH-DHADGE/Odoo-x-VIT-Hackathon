import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto, res: Response): Promise<{
        accessToken: string;
        user: any;
        company: any;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: any;
    }>;
    refresh(user: any, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(userId: string, res: Response): Promise<{
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
    private setRefreshCookie;
}
