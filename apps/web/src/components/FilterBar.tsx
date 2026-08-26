import clsx from 'clsx';
import { NEWS_CATEGORIES, type NewsCategory } from '@ai-news/shared';
import { useNewsStore } from '../store/newsStore';

// 顶部快速分类标签栏
export function FilterBar() {
  const activeTags = useNewsStore((s) => s.activeTags);
  const toggleTag = useNewsStore((s) => s.toggleTag);

  return (
    <div
      id="filter-bar"
      className="flex items-center gap-2 px-4 py-2 shrink-0 overflow-x-auto no-scrollbar"
    >
      {NEWS_CATEGORIES.map((c: NewsCategory) => {
        const active = activeTags.includes(c);
        return (
          <button
            key={c}
            onClick={() => toggleTag(c)}
            className={clsx(
              'inline-flex items-center justify-center h-6 px-3 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150',
            )}
            style={{
              background: active
                ? 'var(--color-primary)'
                : 'var(--color-secondary)',
              color: active
                ? 'var(--color-primary-foreground)'
                : 'var(--color-secondary-foreground)',
            }}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
