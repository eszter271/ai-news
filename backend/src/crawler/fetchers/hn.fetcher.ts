import { Injectable, Logger } from '@nestjs/common';
import type { NewsSource } from '../../news/news.entity';
import type { FetchedNews } from './rss.fetcher';

// Hacker News via Algolia search API
@Injectable()
export class HnFetcher {
  private readonly logger = new Logger(HnFetcher.name);

  async fetch(source: NewsSource): Promise<FetchedNews[]> {
    const resp = await fetch(source.url, {
      headers: { 'User-Agent': 'AI-News-Bot/1.0' },
    });
    if (!resp.ok) throw new Error(`HN HTTP ${resp.status}`);
    const json: any = await resp.json();
    const hits: any[] = json.hits || [];
    return hits.slice(0, 30).map((h) => ({
      title: h.title || h.story_title || '无标题',
      summary: this.buildSummary(h),
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: source.name,
      sourceDomain: 'news.ycombinator.com',
      publishedAt: new Date(h.created_at || Date.now()),
      authorityScore: source.authorityScore,
    }));
  }

  private buildSummary(h: any): string {
    const parts: string[] = [];
    if (h.points != null) parts.push(`${h.points} points`);
    if (h.num_comments != null) parts.push(`${h.num_comments} comments`);
    if (h.author) parts.push(`by ${h.author}`);
    if (h.url) {
      try {
        parts.push(`from ${new URL(h.url).hostname}`);
      } catch {
        // ignore
      }
    }
    return parts.join(' · ').slice(0, 600);
  }
}
