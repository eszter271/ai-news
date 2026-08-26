import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from =
      config.get<string>('SMTP_FROM') || 'AI News <no-reply@ai-news.local>';
    const host = config.get<string>('SMTP_HOST');
    const port = config.get<number>('SMTP_PORT');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: (port || 587) === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP 已配置：${user}@${host}:${port}`);
    } else {
      this.logger.warn('SMTP 未配置：验证码将仅打印到日志（开发模式）');
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const subject = `【AI News】您的验证码是 ${code}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 8px;">AI News 验证码</h2>
        <p style="color: #666; margin: 0 0 24px;">您正在注册 AI News 账号，验证码为：</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px; margin-bottom: 16px;">${code}</div>
        <p style="color: #999; margin: 0;">验证码 5 分钟内有效，请勿向他人泄露。如非本人操作请忽略此邮件。</p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject,
        html,
      });
    } else {
      // 开发模式：打印到日志
      this.logger.log(`\n========== 邮件预览 ==========\n收件人: ${email}\n主题: ${subject}\n验证码: ${code}\n================================\n`);
    }
  }
}
