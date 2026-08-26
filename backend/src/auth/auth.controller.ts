import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendCodeDto, RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDto) {
    await this.auth.sendCode(dto.email);
    return { message: '验证码已发送，请查收邮件' };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { token, user } = await this.auth.register(dto.email, dto.password, dto.code);
    return { token, user: this.sanitize(user) };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { token, user } = await this.auth.login(dto.email, dto.password);
    return { token, user: this.sanitize(user) };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return { user: this.sanitize(req.user as User) };
  }

  private sanitize(u: User) {
    return { id: u.id, email: u.email, createdAt: u.createdAt };
  }
}
