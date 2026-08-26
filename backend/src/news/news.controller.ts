import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { NewsService } from './news.service';

class ListQueryDto {
  @IsOptional()
  @IsString()
  category?: string; // 多个用逗号分隔

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

@Controller('news')
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  async list(@Query() q: ListQueryDto) {
    const categories = q.category
      ? q.category.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    return this.news.list({
      categories,
      page: q.page ? Number(q.page) : 1,
      pageSize: q.pageSize ? Number(q.pageSize) : 50,
    });
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.news.getById(id);
  }

  @Post('refresh')
  async refresh() {
    return this.news.fetchAll();
  }

  @Post(':id/translate')
  async translate(@Param('id') id: string) {
    return this.news.translate(id);
  }
}
