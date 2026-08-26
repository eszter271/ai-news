import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsSource, NewsItem } from './news/news.entity';
import { User } from './users/user.entity';
import { UserSetting } from './settings/user-setting.entity';
import { Favorite } from './favorites/favorite.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { NewsModule } from './news/news.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CrawlerModule } from './crawler/crawler.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL') || 'sqlite:./data/ai-news.db';
        if (url.startsWith('sqlite:')) {
          const path = url.slice('sqlite:'.length);
          return {
            type: 'better-sqlite3' as any,
            database: path,
            entities: [User, UserSetting, NewsItem, NewsSource, Favorite],
            synchronize: true,
            logging: false,
          };
        }
        if (url.startsWith('postgres')) {
          // DATABASE_URL=postgres://user:pass@host:5432/db
          const u = new URL(url);
          return {
            type: 'postgres' as any,
            host: u.hostname,
            port: Number(u.port) || 5432,
            username: u.username,
            password: decodeURIComponent(u.password),
            database: u.pathname.slice(1),
            entities: [User, UserSetting, NewsItem, NewsSource, Favorite],
            synchronize: true,
            logging: false,
          };
        }
        throw new Error(`Unsupported DATABASE_URL: ${url}`);
      },
    }),
    MailerModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    NewsModule,
    FavoritesModule,
    CrawlerModule,
  ],
})
export class AppModule {}
