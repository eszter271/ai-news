import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Languages, Star, ArrowUpDown } from 'lucide-react';
import { NEWS_CATEGORIES, type NewsCategory } from '@ai-news/shared';
import { useNewsStore } from '../store/newsStore';
import { useAppStore } from '../store/appStore';
import { formatRelativeTime } from '../lib/format';
import clsx from 'clsx';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const isMobile = useAppStore((s) => s.isMobile);
  const list = useNewsStore((s) => s.list);
  const favoriteIds = useNewsStore((s) => s.favoriteIds);
  const toggleFavorite = useNewsStore((s) => s.toggleFavorite);
  const translate = useNewsStore((s) => s.translate);
  const translatingIds = useNewsStore((s) => s.translatingIds);
  const fetch = useNewsStore((s) => s.fetch);
  const loadFavorites = useNewsStore((s) => s.loadFavorites);

  const [activeCat, setActiveCat] = useState<'all' | NewsCategory>('all');
  const [sortDesc, setSortDesc] = useState(true);

  // 直达 /favorites 时也要拉一次列表 + 同步收藏
  useEffect(() => {
    fetch();
    loadFavorites();
  }, [fetch, loadFavorites]);

  const favItems = useMemo(() => {
    return list
      .filter((n) => favoriteIds.has(n.id))
      .filter((n) => activeCat === 'all' || n.category === activeCat)
      .sort((a, b) =>
        sortDesc
          ? b.publishedMinutesAgo - a.publishedMinutesAgo
          : a.publishedMinutesAgo - b.publishedMinutesAgo,
      );
  }, [list, favoriteIds, activeCat, sortDesc]);

  const cats: ('all' | NewsCategory)[] = ['all', ...NEWS_CATEGORIES];

  const containerStyle: React.CSSProperties = isMobile
    ? {
        height: '100%',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      };

  return (
    <main data-viewport-mode="app-shell" style={containerStyle}>
      <div
        className="flex flex-col"
        style={
          isMobile
            ? {
                width: '100%',
                flex: 1,
                background: 'var(--color-card)',
                borderRadius: 0,
                border: 'none',
                overflow: 'hidden',
              }
            : {
                maxWidth: 520,
                maxHeight: '70vh',
                width: '100%',
                background: 'var(--color-card)',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
              }
        }
      >
        {/* 工具条 */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-7 h-7 rounded hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-foreground)' }}
              aria-label="返回资讯"
            >
              <ArrowLeft size={16} />
            </button>
            <span
              className="font-semibold text-[13px]"
              style={{ color: 'var(--color-foreground)' }}
            >
              我的收藏
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-7 h-7 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* 分类 + 排序 */}
        <div
          id="fav-controls"
          className="flex items-center justify-between gap-2 px-4 py-2 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {cats.map((c) => {
              const active = activeCat === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className="inline-flex items-center justify-center h-6 px-3 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors"
                  style={{
                    background: active
                      ? 'var(--color-primary)'
                      : 'var(--color-secondary)',
                    color: active
                      ? 'var(--color-primary-foreground)'
                      : 'var(--color-secondary-foreground)',
                  }}
                >
                  {c === 'all' ? '全部' : c}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSortDesc((v) => !v)}
            className="inline-flex items-center justify-center gap-1 h-6 px-2 rounded-md text-xs font-medium whitespace-nowrap shrink-0"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ArrowUpDown size={12} />
            <span>{sortDesc ? '最新优先' : '最早优先'}</span>
          </button>
        </div>

        {/* 列表 */}
        <div
          id="fav-list"
          className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-0"
        >
          {favItems.length === 0 ? (
            <div
              id="empty-state"
              className="flex flex-col items-center justify-center gap-3 py-10"
            >
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--color-muted)',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                <Star size={40} />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                收藏夹空空如也~
              </p>
            </div>
          ) : (
            favItems.map((item, i) => (
              <div
                key={item.id}
                className="fav-item flex flex-col gap-1.5 py-3"
                style={{
                  borderBottom:
                    i < favItems.length - 1
                      ? '1px solid var(--color-border)'
                      : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: 'var(--color-muted)',
                      color: 'var(--color-foreground)',
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="text-[10px] whitespace-nowrap"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {formatRelativeTime(item.publishedMinutesAgo)}
                  </span>
                </div>
                <h3
                  className="text-[13px] font-medium leading-snug cursor-pointer"
                  style={{ color: 'var(--color-foreground)' }}
                  onClick={() =>
                    item.url &&
                    window.open(item.url, '_blank', 'noopener,noreferrer')
                  }
                >
                  {item.translatedTitle || item.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed line-clamp-2"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {item.translatedSummary || item.summary}
                </p>
                <div className="flex items-center gap-3 pt-0.5">
                  <button
                    className="flex items-center gap-1 text-[10px] hover:opacity-70 transition-opacity disabled:opacity-50"
                    style={{ color: 'var(--color-muted-foreground)' }}
                    onClick={() => translate(item.id)}
                    disabled={translatingIds.has(item.id)}
                  >
                    <Languages size={12} />
                    <span>{translatingIds.has(item.id) ? '翻译中…' : '翻译'}</span>
                  </button>
                  <button
                    className={clsx(
                      'flex items-center gap-1 text-[10px] hover:opacity-70 transition-opacity',
                    )}
                    style={{ color: 'var(--color-favorite)' }}
                    onClick={() => toggleFavorite(item.id)}
                  >
                    <Star size={12} fill="currentColor" />
                    <span>已收藏</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部计数 */}
        <div
          className="shrink-0 px-4 py-2 text-center"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <span
            className="text-[10px] whitespace-nowrap"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            已收藏 {favItems.length} 条
          </span>
        </div>
      </div>
    </main>
  );
}
