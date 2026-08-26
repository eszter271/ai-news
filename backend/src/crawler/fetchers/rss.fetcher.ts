import { Injectable, Logger } from '@nestjs/common';
import RssParser from 'rss-parser';
import type { NewsSource } from '../../news/news.entity';

export interface FetchedNews {
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceDomain?: string;
  publishedAt: Date;
  coverUrl?: string;
  authorityScore?: number;
}

@Injectable()
export class RssFetcher {
  private readonly logger = new Logger(RssFetcher.name);
  private parser = new RssParser({ timeout: 15000 });

  async fetch(source: NewsSource): Promise<FetchedNews[]> {
    const feed = await this.parser.parseURL(source.url).catch((e: any) => {
      throw new Error(`RSS parse failed: ${e?.message || e}`);
    });
    const items = feed.items || [];
    const domain = source.domain;
    return items.slice(0, 30).map((it: any) => ({
      title: this.stripHtml(it.title || '') || '无标题',
      summary: this.stripHtml(it.contentSnippet || it.content || it.summary || '').slice(0, 600),
      url: it.link || '',
      source: source.name,
      sourceDomain: domain,
      publishedAt: this.parseDate(it.isoDate || it.pubDate),
      coverUrl: this.extractCover(it),
      authorityScore: source.authorityScore,
    }));
  }

  private parseDate(s?: string): Date {
    if (!s) return new Date();
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private stripHtml(s: string): string {
    return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  private extractCover(item: any): string | undefined {
    if (item.enclosure?.url) return item.enclosure.url;
    const m = (item.content || '').match(/<img[^>]+src="([^"]+)"/);
    if (m) return m[1];
    return undefined;
  }
}
