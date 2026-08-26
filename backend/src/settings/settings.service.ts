import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSetting } from './user-setting.entity';
import type { UserSettings } from '@ai-news/shared';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private readonly repo: Repository<UserSetting>,
  ) {}

  async ensureDefault(userId: string): Promise<UserSetting> {
    let s = await this.repo.findOne({ where: { userId } });
    if (!s) {
      s = this.repo.create({
        userId,
        notifyPush: true,
        dailyTime: '08:00',
        widgetTop: true,
        autoStart: false,
        darkMode: 'system',
        dataSync: true,
      });
      s = await this.repo.save(s);
    }
    return s;
  }

  async get(userId: string): Promise<UserSettings> {
    const s = await this.ensureDefault(userId);
    return this.toDto(s);
  }

  async update(userId: string, patch: Partial<UserSetting>): Promise<UserSettings> {
    await this.ensureDefault(userId);
    await this.repo.update({ userId }, patch as any);
    const s = (await this.repo.findOne({ where: { userId } }))!;
    return this.toDto(s);
  }

  private toDto(s: UserSetting): UserSettings {
    return {
      notifyPush: s.notifyPush,
      dailyTime: s.dailyTime,
      widgetTop: s.widgetTop,
      autoStart: s.autoStart,
      darkMode: s.darkMode as 'light' | 'dark' | 'system',
      dataSync: s.dataSync,
    };
  }
}
