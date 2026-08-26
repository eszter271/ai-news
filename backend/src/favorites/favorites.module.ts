import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { NewsItem } from '../news/news.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, NewsItem])],
  providers: [FavoritesService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
