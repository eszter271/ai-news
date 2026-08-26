import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('favorites')
@Index('idx_fav_user', ['userId'])
@Index('idx_fav_unique', ['userId', 'newsId'], { unique: true })
export class Favorite extends BaseEntity {
  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'news_id', type: 'varchar' })
  newsId: string;
}
