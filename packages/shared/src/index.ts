// 前后端共享的类型定义

export type NewsCategory =
  | '行业新闻'
  | '模型更新'
  | '产品上新'
  | '学术论文'
  | '投融资';

export const NEWS_CATEGORIES: NewsCategory[] = [
  '行业新闻',
  '模型更新',
  '产品上新',
  '学术论文',
  '投融资',
];

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  sourceDomain?: string;
  authorityScore?: number; // 1-5
  category: NewsCategory;
  publishedAt: string; // ISO
  publishedMinutesAgo: number; // 用于"X小时前"展示
  translatedTitle?: string;
  translatedSummary?: string;
  coverUrl?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  type: 'rss' | 'arxiv' | 'hn' | 'newsapi' | 'web';
  url: string;
  authorityScore: number; // 1-5
  enabled: boolean;
  lastFetchedAt?: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserSettings {
  notifyPush: boolean;
  dailyTime: string; // "08:00"
  widgetTop: boolean;
  autoStart: boolean;
  darkMode: 'light' | 'dark' | 'system';
  dataSync: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  newsId: string;
  news?: NewsItem;
  createdAt: string;
}

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
