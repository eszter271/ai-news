import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type WidgetState = 'collapsed' | 'expanded';

interface AppState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  widgetState: WidgetState;
  isMobile: boolean;
  setTheme: (t: Theme) => void;
  initTheme: () => void;
  applyTheme: () => void;
  setWidgetState: (s: WidgetState) => void;
  toggleWidget: () => void;
  setMobile: (m: boolean) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyDocument(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('ai-news:theme') as Theme) || 'system',
  resolvedTheme: 'light',
  widgetState: 'expanded', // 移动端默认展开；桌面端会先收起
  isMobile: false,
  setTheme: (t) => {
    localStorage.setItem('ai-news:theme', t);
    set({ theme: t });
    get().applyTheme();
  },
  applyTheme: () => {
    const { theme } = get();
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    set({ resolvedTheme: resolved });
    applyDocument(resolved);
  },
  initTheme: () => {
    const theme = (localStorage.getItem('ai-news:theme') as Theme) || 'system';
    set({ theme });
    get().applyTheme();
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        if (get().theme === 'system') get().applyTheme();
      };
      mq.addEventListener('change', handler);
    }
  },
  setWidgetState: (s) => set({ widgetState: s }),
  toggleWidget: () =>
    set((st) => ({
      widgetState: st.widgetState === 'collapsed' ? 'expanded' : 'collapsed',
    })),
  setMobile: (m) => set({ isMobile: m }),
}));
