import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('news_sources')
export class NewsSource extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  domain: string;

  @Column({ type: 'varchar', length: 32 })
  type: 'rss' | 'arxiv' | 'hn' | 'newsapi' | 'web';

  @Column({ type: 'varchar', length: 1024 })
  url: string;

  @Column({ name: 'authority_score', type: 'int', default: 3 })
  authorityScore: number; // 1-5

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ name: 'last_fetched_at', type: 'datetime', nullable: true })
  lastFetchedAt: Date | null;

  @Column({ name: 'fetch_count', type: 'int', default: 0 })
  fetchCount: number;

  @Column({ name: 'fail_count', type: 'int', default: 0 })
  failCount: number;
}

@Entity('news_items')
@Index('idx_news_published', ['publishedAt'])
@Index('idx_news_category', ['category'])
@Index('idx_news_url', ['url'], { unique: true })
export class NewsItem extends BaseEntity {
  @Column({ type: 'varchar', length: 512 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'varchar', length: 1024 })
  url: string;

  @Column({ type: 'varchar', length: 128 })
  source: string;

  @Column({ name: 'source_domain', type: 'varchar', length: 255, nullable: true })
  sourceDomain: string | null;

  @Column({ name: 'source_id', type: 'varchar', length: 64, nullable: true })
  sourceId: string | null;

  @Column({ name: 'authority_score', type: 'int', default: 3 })
  authorityScore: number;

  @Column({ type: 'varchar', length: 32 })
  category: string;

  @Column({ name: 'published_at', type: 'datetime' })
  publishedAt: Date;

  @Column({ name: 'translated_title', type: 'text', nullable: true })
  translatedTitle: string | null;

  @Column({ name: 'translated_summary', type: 'text', nullable: true })
  translatedSummary: string | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 1024, nullable: true })
  coverUrl: string | null;

  @Column({ name: 'language', type: 'varchar', length: 8, default: 'auto' })
  language: string;
}
