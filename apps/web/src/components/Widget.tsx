import { useAppStore } from '../store/appStore';

// 悬浮挂件（默认态）：电脑端缩成一个小图标，支持拖拽
export function Widget() {
  const setWidgetState = useAppStore((s) => s.setWidgetState);
  return (
    <div className="flex flex-col items-center gap-2 anim-fade-in-up">
      <button
        data-tauri-drag-region
        onClick={() => setWidgetState('expanded')}
        className="flex items-center justify-center w-12 h-12 cursor-pointer border overflow-hidden hover:scale-105 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform duration-150"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        }}
        aria-label="展开 AI 资讯"
      >
        <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
          AI
        </span>
      </button>
    </div>
  );
}
