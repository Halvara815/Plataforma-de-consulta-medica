import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService, REFRESH_COOKIE_NAME } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto, this.correlationId(request));
    this.setRefreshCookie(response, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const result = await this.authService.refresh(this.refreshToken(request), this.correlationId(request));
      this.setRefreshCookie(response, result.refreshToken);
      return { accessToken: result.accessToken, user: result.user };
    } catch (error) {
      this.clearRefreshCookie(response);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(this.refreshToken(request), this.correlationId(request));
    this.clearRefreshCookie(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: Request) {
    const user = request.user as { id?: string };
    if (!user?.id) throw new UnauthorizedException('Sesión inválida');
    return this.authService.getMe(user.id);
  }

  private refreshToken(request: Request): string | undefined {
    const cookie = request.headers.cookie;
    if (!cookie) return undefined;
    const value = cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${REFRESH_COOKIE_NAME}=`));
    return value ? decodeURIComponent(value.slice(REFRESH_COOKIE_NAME.length + 1)) : undefined;
  }

  private setRefreshCookie(response: Response, token: string): void {
    response.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.configService.get<string>('REFRESH_COOKIE_SECURE', 'false') === 'true',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: this.authService.getRefreshCookieMaxAge(),
    });
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: this.configService.get<string>('REFRESH_COOKIE_SECURE', 'false') === 'true',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  }

  private correlationId(request: Request): string | undefined {
    const value = request.headers['x-request-id'];
    return typeof value === 'string' && value.length <= 128 ? value : undefined;
  }
}
