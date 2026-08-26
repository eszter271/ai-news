import { useState } from 'react';
import { X } from 'lucide-react';
import { NEWS_CATEGORIES } from '@ai-news/shared';
import { Modal } from './ui/Modal';
import { useNewsStore } from '../store/newsStore';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
}

// 筛选设置弹窗（按设计稿：多选分类复选框）
export function FilterDialog({ open, onClose }: FilterDialogProps) {
  const activeTags = useNewsStore((s) => s.activeTags);
  const toggleTag = useNewsStore((s) => s.toggleTag);

  const handleConfirm = () => {
    onClose();
  };

  const allChecked = NEWS_CATEGORIES.map((c) => activeTags.includes(c));

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-[320px] max-w-[90vw]"
      backdropClassName="!bg-black/30"
    >
      <div
        className="flex flex-col"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h2
            className="text-[13px] font-semibold whitespace-nowrap"
            style={{ color: 'var(--color-foreground)' }}
          >
            筛选设置
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 hover:opacity-60 transition-opacity"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="flex flex-col"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {NEWS_CATEGORIES.map((c, i) => {
            const checked = allChecked[i];
            return (
              <label
                key={c}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--color-muted)] transition-colors"
                style={{
                  borderBottom:
                    i < NEWS_CATEGORIES.length - 1
                      ? '1px solid var(--color-border)'
                      : undefined,
                }}
                onClick={() => toggleTag(c)}
              >
                <span
                  className="w-2 h-2 shrink-0 border transition-colors"
                  style={{
                    borderRadius: '2px',
                    background: checked
                      ? 'var(--color-primary)'
                      : 'transparent',
                    borderColor: checked
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                  }}
                />
                <span
                  className="text-[13px] whitespace-nowrap"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {c}
                </span>
              </label>
            );
          })}
        </div>

        <div className="px-4 py-3">
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center w-full h-8 text-[13px] font-medium hover:opacity-90 active:opacity-80 transition-opacity"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              borderRadius: '8px',
            }}
          >
            确认
          </button>
        </div>
      </div>
    </Modal>
  );
}
