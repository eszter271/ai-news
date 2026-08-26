import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsItem, NewsSource } from './news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  imports: [TypeOrmModule.forFeature([NewsItem, NewsSource]), CrawlerModule],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
