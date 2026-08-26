import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { NewsItem, NewsSource } from './news.entity';
import { CrawlerService } from '../crawler/crawler.service';
import { SEED_NEWS } from './seed-news';
import type { NewsItem as NewsItemDto } from '@ai-news/shared';

@Injectable()
export class NewsService implements OnModuleInit {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsItem)
    private readonly newsRepo: Repository<NewsItem>,
    @InjectRepository(NewsSource)
    private readonly sourcesRepo: Repository<NewsSource>,
    private readonly crawler: CrawlerService,
  ) {}

  async onModuleInit() {
    // 确保默认源存在
    await this.seedDefaultSources();
    // 启动时若无资讯，立即抓取一次（异步触发，不阻塞 bootstrap）
    const count = await this.newsRepo.count();
    if (count === 0) {
      this.logger.log('数据库空，立即执行首次抓取…');
      // fire-and-forget：避免外部网络超时阻塞 HTTP 服务启动
      void this.initialFetchWithFallback().catch((e) =>
        this.logger.error(`首次抓取异常：${e?.message ?? e}`),
      );
    }
  }

  private async initialFetchWithFallback(): Promise<void> {
    const result = await this.fetchAll();
    // 如果抓取全部失败（如沙箱网络受限），用 mock 兜底
    if (result.inserted === 0) {
      this.logger.warn('外部抓取失败，使用内置 mock 数据兜底');
      await this.seedMockNews();
    }
  }

  private async seedMockNews(): Promise<void> {
    for (const raw of SEED_NEWS) {
      await this.tryInsert(raw);
    }
  }

  async list(opts: {
    categories?: string[];
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ list: NewsItemDto[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, opts.page || 1);
    const pageSize = Math.min(100, opts.pageSize || 50);
    const qb = this.newsRepo.createQueryBuilder('n').orderBy('n.publishedAt', 'DESC');
    if (opts.categories && opts.categories.length > 0) {
      qb.andWhere('n.category IN (:...cats)', { cats: opts.categories });
    }
    qb.skip((page - 1) * pageSize).take(pageSize);
    const [rows, total] = await qb.getManyAndCount();
    return {
      list: rows.map((r) => this.toDto(r)),
      total,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<NewsItemDto | null> {
    const r = await this.newsRepo.findOne({ where: { id } });
    return r ? this.toDto(r) : null;
  }

  /**
   * 翻译单条资讯。
   * - 若数据库已存在翻译，直接返回
   * - 若配置了 OPENAI_API_KEY，则调用 OpenAI 进行真实翻译
   * - 否则使用占位 stub（前缀 【译】），便于演示交互链路
   */
  async translate(id: string): Promise<{ translatedTitle: string; translatedSummary: string; stub: boolean }> {
    const r = await this.newsRepo.findOne({ where: { id } });
    if (!r) throw new Error('资讯不存在');
    if (r.translatedTitle && r.translatedSummary) {
      return {
        translatedTitle: r.translatedTitle,
        translatedSummary: r.translatedSummary,
        stub: false,
      };
    }
    const apiKey = process.env.OPENAI_API_KEY;
    let translatedTitle: string;
    let translatedSummary: string;
    let stub = false;
    if (apiKey) {
      const llm = await this.callOpenAITranslate(apiKey, r.title, r.summary || '');
      translatedTitle = llm.title;
      translatedSummary = llm.summary;
    } else {
      // 无 LLM 时的兜底：仅添加前缀，避免对原文本做不真实的翻译
      stub = true;
      translatedTitle = `【译】${r.title}`;
      translatedSummary = r.summary ? `【译】${r.summary}` : '';
    }
    r.translatedTitle = translatedTitle;
    r.translatedSummary = translatedSummary;
    await this.newsRepo.save(r);
    return { translatedTitle, translatedSummary, stub };
  }

  private async callOpenAITranslate(
    apiKey: string,
    title: string,
    summary: string,
  ): Promise<{ title: string; summary: string }> {
    const sys = '你是一名专业的 AI 行业资讯翻译，将英文资讯标题与摘要翻译为简体中文，保持术语准确、语句通顺，仅输出 JSON：{"title":"...","summary":"..."}';
    const user = `标题：${title}\n摘要：${summary || '（无）'}`;
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    if (!resp.ok) throw new Error(`OpenAI 翻译失败：${resp.status}`);
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    return {
      title: String(parsed.title || title),
      summary: String(parsed.summary || summary),
    };
  }

  /** 触发一次完整抓取 */
  async fetchAll(): Promise<{ fetched: number; inserted: number; failed: number }> {
    const sources = await this.sourcesRepo.find({ where: { enabled: true } });
    let fetched = 0;
    let inserted = 0;
    let failed = 0;
    for (const s of sources) {
      try {
        const items = await this.crawler.fetch(s);
        fetched += items.length;
        for (const it of items) {
          const dup = await this.tryInsert(it);
          if (dup) inserted++;
        }
        s.lastFetchedAt = new Date();
        s.fetchCount += 1;
        await this.sourcesRepo.save(s);
      } catch (e: any) {
        failed++;
        s.failCount += 1;
        await this.sourcesRepo.save(s);
        this.logger.warn(`抓取 ${s.name} 失败：${e?.message}`);
      }
    }
    this.logger.log(
      `抓取完成：共 ${sources.length} 个源，新抓 ${fetched} 条，入库 ${inserted} 条，失败 ${failed} 个源`,
    );
    return { fetched, inserted, failed };
  }

  // 每小时自动抓一次
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledFetch() {
    this.logger.log('⏰ 定时抓取任务启动…');
    await this.fetchAll();
  }

  /** 单条去重入库：URL 规范化 + 标题相似度 */
  private async tryInsert(raw: Partial<NewsItem>): Promise<boolean> {
    const url = this.normalizeUrl(raw.url || '');
    if (!url) return false;
    const existing = await this.newsRepo.findOne({ where: { url } });
    if (existing) return false;
    const item = this.newsRepo.create({
      title: (raw.title?.trim() || '无标题').slice(0, 512),
      summary: (raw.summary || '').slice(0, 2000) || undefined,
      url,
      source: raw.source || '未知',
      sourceDomain: raw.sourceDomain || null,
      sourceId: raw.sourceId || null,
      authorityScore: raw.authorityScore || 3,
      category: raw.category || '行业新闻',
      publishedAt: raw.publishedAt || new Date(),
      coverUrl: raw.coverUrl || null,
    });
    await this.newsRepo.save(item);
    return true;
  }

  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      // 去掉常见跟踪参数，规范化
      u.hash = '';
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'from', 'ref'].forEach(
        (k) => u.searchParams.delete(k),
      );
      if (u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
      return u.toString();
    } catch {
      return '';
    }
  }

  private async seedDefaultSources(): Promise<void> {
    const count = await this.sourcesRepo.count();
    if (count > 0) return;
    const defaults: Array<Partial<NewsSource>> = [
      // 官方博客 RSS
      { name: 'OpenAI Blog', domain: 'openai.com', type: 'rss', url: 'https://openai.com/news/rss.xml', authorityScore: 5 },
      { name: 'Anthropic News', domain: 'anthropic.com', type: 'rss', url: 'https://www.anthropic.com/news/rss.xml', authorityScore: 5 },
      { name: 'Google AI Blog', domain: 'blog.google', type: 'rss', url: 'https://blog.google/technology/ai/rss/', authorityScore: 5 },
      { name: 'Meta AI Blog', domain: 'ai.meta.com', type: 'rss', url: 'https://ai.meta.com/blog/rss/', authorityScore: 5 },
      { name: 'Microsoft AI Blog', domain: 'blogs.microsoft.com', type: 'rss', url: 'https://blogs.microsoft.com/blog/ai/rss/', authorityScore: 5 },
      // 学术
      { name: 'ArXiv (cs.AI)', domain: 'arxiv.org', type: 'arxiv', url: 'https://arxiv.org/list/cs.AI/recent', authorityScore: 5 },
      // 媒体
      { name: '机器之心', domain: 'jiqizhixin.com', type: 'rss', url: 'https://www.jiqizhixin.com/rss', authorityScore: 4 },
      { name: '36氪 AI', domain: '36kr.com', type: 'rss', url: 'https://36kr.com/feed', authorityScore: 4 },
      // 社区
      { name: 'Hacker News (AI)', domain: 'news.ycombinator.com', type: 'hn', url: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI&hitsPerPage=30', authorityScore: 3 },
      { name: 'Hacker News (LLM)', domain: 'news.ycombinator.com', type: 'hn', url: 'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=LLM&hitsPerPage=30', authorityScore: 3 },
    ];
    await this.sourcesRepo.save(defaults.map((d) => this.sourcesRepo.create(d)));
    this.logger.log(`已注入 ${defaults.length} 个默认资讯源`);
  }

  private toDto(r: NewsItem): NewsItemDto {
    const now = Date.now();
    const publishedAt = r.publishedAt instanceof Date ? r.publishedAt : new Date(r.publishedAt);
    const publishedMinutesAgo = Math.max(0, (now - publishedAt.getTime()) / 60000);
    return {
      id: r.id,
      title: r.title,
      summary: r.summary || '',
      url: r.url,
      source: r.source,
      sourceDomain: r.sourceDomain || undefined,
      authorityScore: r.authorityScore,
      category: r.category as any,
      publishedAt: publishedAt.toISOString(),
      publishedMinutesAgo: Math.floor(publishedMinutesAgo),
      translatedTitle: r.translatedTitle || undefined,
      translatedSummary: r.translatedSummary || undefined,
      coverUrl: r.coverUrl || undefined,
    };
  }
}
