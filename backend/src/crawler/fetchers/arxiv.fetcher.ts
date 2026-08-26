import { Injectable, Logger } from '@nestjs/common';
import type { NewsSource } from '../../news/news.entity';
import type { FetchedNews } from './rss.fetcher';

// ArXiv API：http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=30
@Injectable()
export class ArxivFetcher {
  private readonly logger = new Logger(ArxivFetcher.name);

  async fetch(source: NewsSource): Promise<FetchedNews[]> {
    const url =
      'http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=30';
    const xml = await this.fetchText(url);
    const items: FetchedNews[] = [];
    const re = /<entry>[\s\S]*?<\/entry>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const entry = m[0];
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || '';
      const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.trim() || '';
      const id = (entry.match(/<id>([\s\S]*?)<\/id>/) || [])[1]?.trim() || '';
      const published = (entry.match(/<published>([\s\S]*?)<\/published>/) || [])[1]?.trim();
      items.push({
        title: this.norm(title),
        summary: this.norm(summary).slice(0, 600),
        url: id.replace('abs', 'pdf').replace('http://', 'https://'),
        source: source.name,
        sourceDomain: source.domain,
        publishedAt: published ? new Date(published) : new Date(),
        authorityScore: source.authorityScore,
      });
    }
    return items.slice(0, 30);
  }

  private async fetchText(url: string): Promise<string> {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'AI-News-Bot/1.0 (contact@ai-news.local)' },
    });
    if (!resp.ok) throw new Error(`ArXiv HTTP ${resp.status}`);
    return await resp.text();
  }

  private norm(s: string): string {
    return s.replace(/\s+/g, ' ').trim();
  }
}
