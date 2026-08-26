import { create } from 'zustand';
import type { NewsItem, NewsCategory } from '@ai-news/shared';
import { api } from '../lib/api';
import { MOCK_NEWS } from '../data/mock';

interface NewsState {
  list: NewsItem[];
  loading: boolean;
  error: string | null;
  // 客户端筛选态（来自筛选弹窗 + 顶部快速标签）
  activeTags: NewsCategory[];
  favoriteIds: Set<string>;
  // 翻译中状态：避免重复请求
  translatingIds: Set<string>;
  // 操作
  fetch: () => Promise<void>;
  toggleTag: (c: NewsCategory) => void;
  clearTags: () => void;
  isFavorited: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  translate: (id: string) => Promise<boolean>;
  filtered: () => NewsItem[];
}

const STORAGE_FAV = 'ai-news:fav-ids';

function loadLocalFav(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_FAV) || '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveLocalFav(s: Set<string>) {
  localStorage.setItem(STORAGE_FAV, JSON.stringify(Array.from(s)));
}

export const useNewsStore = create<NewsState>((set, get) => ({
  list: MOCK_NEWS,
  loading: false,
  error: null,
  activeTags: [],
  favoriteIds: loadLocalFav(),
  translatingIds: new Set(),
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<{ list: NewsItem[] }>('/news');
      set({ list: res.list || [], loading: false });
    } catch (e: any) {
      // 后端没起来时降级用 mock
      set({ list: MOCK_NEWS, loading: false, error: e?.message || null });
    }
  },
  toggleTag: (c) =>
    set((s) => {
      const has = s.activeTags.includes(c);
      return {
        activeTags: has
          ? s.activeTags.filter((t) => t !== c)
          : [...s.activeTags, c],
      };
    }),
  clearTags: () => set({ activeTags: [] }),
  isFavorited: (id) => get().favoriteIds.has(id),
  toggleFavorite: async (id) => {
    const cur = get().favoriteIds;
    const next = new Set(cur);
    if (next.has(id)) {
      next.delete(id);
      try {
        await api.delete(`/favorites/${id}`);
      } catch {
        // 静默
      }
    } else {
      next.add(id);
      try {
        await api.post(`/favorites`, { newsId: id });
      } catch {
        // 静默
      }
    }
    saveLocalFav(next);
    set({ favoriteIds: next });
  },
  loadFavorites: async () => {
    // 本地降级 + 在线合并
    try {
      const res = await api.get<{ list: { newsId: string }[] }>('/favorites');
      const online = new Set(res.list.map((i) => i.newsId));
      const merged = new Set([...get().favoriteIds, ...online]);
      saveLocalFav(merged);
      set({ favoriteIds: merged });
    } catch {
      // 静默
    }
  },
  translate: async (id) => {
    if (get().translatingIds.has(id)) return false;
    set({ translatingIds: new Set([...get().translatingIds, id]) });
    try {
      const r = await api.post<{
        translatedTitle: string;
        translatedSummary: string;
        stub?: boolean;
      }>(`/news/${id}/translate`);
      set((s) => ({
        list: s.list.map((it) =>
          it.id === id
            ? { ...it, translatedTitle: r.translatedTitle, translatedSummary: r.translatedSummary }
            : it,
        ),
      }));
      return true;
    } catch {
      return false;
    } finally {
      set((s) => {
        const next = new Set(s.translatingIds);
        next.delete(id);
        return { translatingIds: next };
      });
    }
  },
  filtered: () => {
    const { list, activeTags } = get();
    if (activeTags.length === 0) return list;
    return list.filter((n) => activeTags.includes(n.category));
  },
}));
