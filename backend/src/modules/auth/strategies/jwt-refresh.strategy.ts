import { Injectable, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'],
        ExtractJwt.fromBodyField('refreshToken'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken =
      req?.cookies?.['refresh_token'] || req?.body?.refreshToken;

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Store the raw token for comparison in auth service
    return { ...user, refreshToken };
  }
}
