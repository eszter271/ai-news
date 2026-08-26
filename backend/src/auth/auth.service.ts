import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SettingsService } from '../settings/settings.service';
import { MailerService } from '../mailer/mailer.service';
import { CodeStore } from '../mailer/code.store';
import type { User } from '../users/user.entity';

const CODE_TTL_SEC = 5 * 60; // 5 分钟有效
const RESEND_THROTTLE_SEC = 60; // 60 秒内不可重发

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly settings: SettingsService,
    private readonly mailer: MailerService,
    private readonly codeStore: CodeStore,
    private readonly config: ConfigService,
  ) {}

  private genCode(): string {
    const fixed = this.config.get<string>('DEV_FIXED_CODE');
    if (fixed) return fixed;
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendCode(email: string): Promise<void> {
    // 限流：同邮箱 60s 内不可重发
    const last = await this.codeStore.lastSentAt(`reg:${email}`);
    if (last) {
      const elapsed = (Date.now() - last) / 1000;
      if (elapsed < RESEND_THROTTLE_SEC) {
        throw new ConflictException(
          `请 ${Math.ceil(RESEND_THROTTLE_SEC - elapsed)} 秒后再试`,
        );
      }
    }
    // 已注册用户禁止注册
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('该邮箱已注册，请直接登录');
    }

    const code = this.genCode();
    await this.codeStore.set(`reg:${email}`, code, CODE_TTL_SEC);
    await this.mailer.sendVerificationCode(email, code);
    await this.codeStore.markSent(`reg:${email}`, RESEND_THROTTLE_SEC);
    this.logger.log(`验证码已发送至 ${email}`);
  }

  async register(email: string, password: string, code: string): Promise<{ token: string; user: User }> {
    const stored = await this.codeStore.take(`reg:${email}`);
    if (!stored || stored !== code) {
      throw new UnauthorizedException('验证码错误或已过期');
    }
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }
    const user = await this.users.create(email, password);
    // 自动初始化默认设置
    await this.settings.ensureDefault(user.id);
    const token = this.signToken(user);
    return { token, user };
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await this.users.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    const ok = await this.users.verifyPassword(user, password);
    if (!ok) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    await this.settings.ensureDefault(user.id);
    const token = this.signToken(user);
    return { token, user };
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }
}
