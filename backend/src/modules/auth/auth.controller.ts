import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto);
    this.setRefreshCookie(res, result.refreshToken);
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(
      user.id,
      user.email,
      user.role,
      user.refreshToken,
    );
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token');
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
