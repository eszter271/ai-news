import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ListFilter, Settings as SettingsIcon, X, Star } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';
import { useAppStore } from '../store/appStore';
import { NewsItemRow } from './NewsItemRow';
import { FilterBar } from './FilterBar';
import { FilterDialog } from './FilterDialog';
import { isTauri } from '../lib/device';
import { hideWindow } from '../lib/tauri';

interface NewsCardProps {
  onClose?: () => void;
}

// 资讯主卡片（展开态）
export function NewsCard({ onClose }: NewsCardProps) {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const list = useNewsStore((s) => s.filtered());
  const fetch = useNewsStore((s) => s.fetch);
  const loading = useNewsStore((s) => s.loading);
  const activeTags = useNewsStore((s) => s.activeTags);
  const setWidgetState = useAppStore((s) => s.setWidgetState);

  const onRefresh = () => {
    fetch();
  };

  const onNavFavorites = () => navigate('/favorites');
  const onNavSettings = () => navigate('/settings');
  const onCloseCard = () => {
    if (onClose) onClose();
    else if (isTauri()) void hideWindow();
    else setWidgetState('collapsed');
  };

  return (
    <div
      className="w-full flex flex-col rounded-lg overflow-hidden anim-fade-in-up"
      style={{
        maxWidth: 'var(--card-max-w, 520px)',
        maxHeight: 'var(--card-max-h, 70vh)',
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* 顶部工具条 - data-tauri-drag-region 让窗口可被拖动 */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span
          className="font-semibold text-sm whitespace-nowrap"
          style={{ color: 'var(--color-foreground)' }}
        >
          AI资讯日报
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--color-accent)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="刷新"
            disabled={loading}
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin' : ''}
            />
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-md text-xs font-medium whitespace-nowrap hover:bg-[var(--color-accent)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ListFilter size={13} />
            <span>筛选</span>
            {activeTags.length > 0 && (
              <span
                className="ml-0.5 px-1 rounded-full text-[10px] leading-none"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-foreground)',
                  padding: '1px 4px',
                }}
              >
                {activeTags.length}
              </span>
            )}
          </button>
          <button
            onClick={onNavFavorites}
            className="inline-flex items-center justify-center gap-1 px-2 h-7 rounded-md text-xs font-medium whitespace-nowrap hover:bg-[var(--color-accent)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <Star size={13} />
            <span>收藏</span>
          </button>
          <button
            onClick={onNavSettings}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--color-accent)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="设置"
          >
            <SettingsIcon size={14} />
          </button>
          <button
            onClick={onCloseCard}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--color-accent)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="关闭"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 顶部分类标签栏 */}
      <FilterBar />

      {/* 滚动新闻列表 */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        {list.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-10"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <p className="text-sm">暂无符合条件的资讯</p>
            <button
              onClick={() => useNewsStore.getState().clearTags()}
              className="text-xs underline"
            >
              清除筛选
            </button>
          </div>
        ) : (
          list.map((item, i) => (
            <NewsItemRow
              key={item.id}
              item={item}
              showDivider={i < list.length - 1}
            />
          ))
        )}
      </div>

      <FilterDialog open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
