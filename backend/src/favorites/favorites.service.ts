import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { NewsItem } from '../news/news.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favRepo: Repository<Favorite>,
    @InjectRepository(NewsItem)
    private readonly newsRepo: Repository<NewsItem>,
  ) {}

  async list(userId: string): Promise<{ list: { newsId: string; createdAt: string }[] }> {
    const favs = await this.favRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return {
      list: favs.map((f) => ({
        newsId: f.newsId,
        createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : new Date(f.createdAt).toISOString(),
      })),
    };
  }

  async listFull(userId: string) {
    const favs = await this.favRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const ids = favs.map((f) => f.newsId);
    if (ids.length === 0) return { list: [] };
    const news = await this.newsRepo.findByIds(ids);
    const map = new Map(news.map((n) => [n.id, n]));
    return {
      list: favs
        .filter((f) => map.has(f.newsId))
        .map((f) => ({ ...this.toNewsDto(map.get(f.newsId)!), createdAt: f.createdAt.toISOString() })),
    };
  }

  async add(userId: string, newsId: string): Promise<{ newsId: string }> {
    const news = await this.newsRepo.findOne({ where: { id: newsId } });
    if (!news) throw new NotFoundException('资讯不存在');
    const existing = await this.favRepo.findOne({ where: { userId, newsId } });
    if (!existing) {
      await this.favRepo.save(this.favRepo.create({ userId, newsId }));
    }
    return { newsId };
  }

  async remove(userId: string, newsId: string): Promise<{ newsId: string }> {
    await this.favRepo.delete({ userId, newsId });
    return { newsId };
  }

  private toNewsDto(n: NewsItem) {
    return {
      id: n.id,
      title: n.title,
      summary: n.summary || '',
      url: n.url,
      source: n.source,
      sourceDomain: n.sourceDomain || undefined,
      authorityScore: n.authorityScore,
      category: n.category,
      publishedAt: n.publishedAt instanceof Date ? n.publishedAt.toISOString() : new Date(n.publishedAt).toISOString(),
      coverUrl: n.coverUrl || undefined,
    };
  }
}
