import clsx from 'clsx';
import { Star, Languages } from 'lucide-react';
import type { NewsItem } from '@ai-news/shared';
import { useNewsStore } from '../store/newsStore';
import { formatRelativeTime } from '../lib/format';

interface NewsItemRowProps {
  item: NewsItem;
  showDivider?: boolean;
}

export function NewsItemRow({ item, showDivider = true }: NewsItemRowProps) {
  const favorited = useNewsStore((s) => s.isFavorited(item.id));
  const toggleFavorite = useNewsStore((s) => s.toggleFavorite);
  const translate = useNewsStore((s) => s.translate);
  const translating = useNewsStore((s) => s.translatingIds.has(item.id));

  const onOpen = () => {
    if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const onTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await translate(item.id);
    if (!ok) alert('翻译失败，请稍后重试');
  };

  const onFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  const title = item.translatedTitle || item.title;
  const summary = item.translatedSummary || item.summary;

  return (
    <div
      className="news-item px-4 py-3 cursor-pointer hover:bg-[var(--color-muted)]/50 transition-colors"
      style={
        showDivider
          ? { borderBottom: '1px solid var(--color-border)' }
          : undefined
      }
      onClick={onOpen}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="inline-flex items-center justify-center h-5 px-2 rounded-md text-[11px] font-medium whitespace-nowrap"
          style={{
            background: 'var(--color-secondary)',
            color: 'var(--color-muted-foreground)',
            opacity: 0.85,
          }}
        >
          {item.category}
        </span>
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          {formatRelativeTime(item.publishedMinutesAgo)}
        </span>
        {item.authorityScore && item.authorityScore >= 5 && (
          <span
            className="text-[10px] px-1.5 rounded"
            style={{
              background: 'rgba(98,209,120,0.16)',
              color: 'var(--color-success)',
            }}
            title={`权威等级 ${item.authorityScore}/5`}
          >
            权威
          </span>
        )}
      </div>
      <h3
        className="text-[13px] font-semibold leading-snug mb-1 line-clamp-2"
        style={{ color: 'var(--color-foreground)' }}
      >
        {title}
      </h3>
      <p
        className="text-xs leading-relaxed line-clamp-2 mb-2"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {summary}
      </p>
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] truncate flex items-center gap-1"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          {item.source}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="inline-flex items-center gap-1 text-[11px] hover:opacity-70 transition-opacity disabled:opacity-50"
            style={{ color: 'var(--color-muted-foreground)' }}
            onClick={onTranslate}
            disabled={translating}
          >
            <Languages size={12} />
            <span>{translating ? '翻译中…' : '翻译'}</span>
          </button>
          <button
            className={clsx(
              'inline-flex items-center justify-center hover:opacity-70 transition-colors',
              favorited && 'fav-active',
            )}
            style={{
              color: favorited
                ? 'var(--color-favorite)'
                : 'var(--color-muted-foreground)',
            }}
            aria-label={favorited ? '取消收藏' : '收藏'}
            onClick={onFav}
          >
            <Star
              size={13}
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
