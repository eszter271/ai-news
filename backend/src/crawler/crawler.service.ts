import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsSource } from '../news/news.entity';
import { RssFetcher, FetchedNews } from './fetchers/rss.fetcher';
import { ArxivFetcher } from './fetchers/arxiv.fetcher';
import { HnFetcher } from './fetchers/hn.fetcher';
import { Classifier } from './classifier';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    @InjectRepository(NewsSource)
    private readonly sourcesRepo: Repository<NewsSource>,
    private readonly rss: RssFetcher,
    private readonly arxiv: ArxivFetcher,
    private readonly hn: HnFetcher,
    private readonly classifier: Classifier,
  ) {}

  async fetch(source: NewsSource): Promise<FetchedNews[]> {
    let items: FetchedNews[] = [];
    switch (source.type) {
      case 'rss':
        items = await this.rss.fetch(source);
        break;
      case 'arxiv':
        items = await this.arxiv.fetch(source);
        break;
      case 'hn':
        items = await this.hn.fetch(source);
        break;
      default:
        this.logger.warn(`暂不支持的源类型：${source.type} (${source.name})`);
        return [];
    }
    // 自动分类
    for (const it of items) {
      (it as any).category = this.classifier.classify(
        it.title,
        it.summary,
        it.sourceDomain,
      );
      // ArXiv 强制归为学术论文
      if (source.type === 'arxiv') (it as any).category = '学术论文';
    }
    return items;
  }
}
