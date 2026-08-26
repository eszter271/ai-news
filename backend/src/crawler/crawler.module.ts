import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsSource } from '../news/news.entity';
import { CrawlerService } from './crawler.service';
import { RssFetcher } from './fetchers/rss.fetcher';
import { ArxivFetcher } from './fetchers/arxiv.fetcher';
import { HnFetcher } from './fetchers/hn.fetcher';
import { Classifier } from './classifier';

@Module({
  imports: [TypeOrmModule.forFeature([NewsSource])],
  providers: [CrawlerService, RssFetcher, ArxivFetcher, HnFetcher, Classifier],
  exports: [CrawlerService],
})
export class CrawlerModule {}
