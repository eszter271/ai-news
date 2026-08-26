import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('user_settings')
export class UserSetting extends BaseEntity {
  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'notify_push', type: 'boolean', default: true })
  notifyPush: boolean;

  @Column({ name: 'daily_time', type: 'varchar', length: 8, default: '08:00' })
  dailyTime: string;

  @Column({ name: 'widget_top', type: 'boolean', default: true })
  widgetTop: boolean;

  @Column({ name: 'auto_start', type: 'boolean', default: false })
  autoStart: boolean;

  @Column({ name: 'dark_mode', type: 'varchar', length: 16, default: 'system' })
  darkMode: 'light' | 'dark' | 'system';

  @Column({ name: 'data_sync', type: 'boolean', default: true })
  dataSync: boolean;
}
