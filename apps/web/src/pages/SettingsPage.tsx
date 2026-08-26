import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Toggle } from '../components/ui/Toggle';
import type { UserSettings } from '@ai-news/shared';

export default function SettingsPage() {
  const navigate = useNavigate();
  const isMobile = useAppStore((s) => s.isMobile);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const { user, settings, updateSettings, logout } = useAuthStore();

  const s: UserSettings = settings || {
    notifyPush: true,
    dailyTime: '08:00',
    widgetTop: true,
    autoStart: false,
    darkMode: 'system',
    dataSync: true,
  };

  const patch = (p: Partial<UserSettings>) => updateSettings(p).catch(() => {});

  const containerStyle: React.CSSProperties = isMobile
    ? {
        height: '100%',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        height: '100%',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      };

  return (
    <main data-viewport-mode="app-shell" style={containerStyle}>
      <div
        className="relative z-10 w-full max-w-[520px] max-h-[70vh] rounded-lg overflow-hidden flex flex-col anim-fade-in-up"
        style={{
          background: 'var(--color-card)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 1px 1px rgba(0,0,0,0.03)',
        }}
      >
        {/* 工具条 */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--color-muted)] transition-colors"
              aria-label="返回"
            >
              <ArrowLeft size={16} style={{ color: 'var(--color-foreground)' }} />
            </button>
            <span
              className="text-[13px] font-medium"
              style={{ color: 'var(--color-foreground)' }}
            >
              设置
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--color-muted)] transition-colors"
            aria-label="关闭"
          >
            <X size={16} style={{ color: 'var(--color-foreground)' }} />
          </button>
        </div>

        {/* 可滚动内容 */}
        <div className="flex-1 overflow-y-auto">
          {/* 通知 */}
          <div className="px-4 pt-4 pb-1">
            <span
              className="text-[11px] font-medium tracking-wide uppercase"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              通知
            </span>
          </div>
          <div className="px-4">
            <Row label="推送提醒" border>
              <Toggle
                checked={s.notifyPush}
                onChange={(v) => patch({ notifyPush: v })}
                aria-label="推送提醒"
              />
            </Row>
            <Row label="每日更新时间" border>
              <input
                type="time"
                value={s.dailyTime}
                onChange={(e) => patch({ dailyTime: e.target.value })}
                className="bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--color-muted-foreground)' }}
              />
            </Row>
          </div>

          {/* 显示 */}
          <div className="px-4 pt-5 pb-1">
            <span
              className="text-[11px] font-medium tracking-wide uppercase"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              显示
            </span>
          </div>
          <div className="px-4">
            <Row label="悬浮窗置顶" border>
              <Toggle
                checked={s.widgetTop}
                onChange={(v) => patch({ widgetTop: v })}
                aria-label="悬浮窗置顶"
              />
            </Row>
            <Row label="开机自启动" border>
              <Toggle
                checked={s.autoStart}
                onChange={(v) => patch({ autoStart: v })}
                aria-label="开机自启动"
              />
            </Row>
            <Row label="主题" border>
              <select
                value={theme}
                onChange={(e) => {
                  const v = e.target.value as 'light' | 'dark' | 'system';
                  setTheme(v);
                  patch({ darkMode: v });
                }}
                className="bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="system">跟随系统</option>
              </select>
            </Row>
          </div>

          {/* 账号 */}
          <div className="px-4 pt-5 pb-1">
            <span
              className="text-[11px] font-medium tracking-wide uppercase"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              账号
            </span>
          </div>
          <div className="px-4">
            <Row label="登录状态" border>
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] truncate"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {user ? user.email : '未登录'}
                </span>
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="text-[13px] shrink-0 hover:underline"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    退出
                  </button>
                ) : (
                  <a
                    onClick={() => navigate('/login')}
                    className="text-[13px] shrink-0 hover:underline cursor-pointer"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    登录
                  </a>
                )}
              </div>
            </Row>
            <Row label="数据同步" border>
              <span
                className="text-[13px]"
                style={{ color: 'var(--color-success)', opacity: 0.85 }}
              >
                {s.dataSync ? '已开启' : '未开启'}
              </span>
            </Row>
          </div>

          {/* 其他 */}
          <div className="px-4 pt-5 pb-1">
            <span
              className="text-[11px] font-medium tracking-wide uppercase"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              其他
            </span>
          </div>
          <div className="px-4">
            <Row
              label="清除缓存"
              border
              onClick={() => {
                localStorage.removeItem('ai-news:fav-ids');
                alert('缓存已清除');
              }}
            >
              <ChevronRight
                size={16}
                style={{ color: 'var(--color-muted-foreground)' }}
              />
            </Row>
            <Row label="版本">
              <span
                className="text-[13px]"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                V1.0
              </span>
            </Row>
          </div>

          <div className="h-3" />
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  children,
  border,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  border?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-3"
      style={{
        borderBottom: border ? '1px solid var(--color-border)' : undefined,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span className="text-[13px]" style={{ color: 'var(--color-foreground)' }}>
        {label}
      </span>
      {children}
    </div>
  );
}
