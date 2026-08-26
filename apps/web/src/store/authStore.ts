import { create } from 'zustand';
import type { User, UserSettings } from '@ai-news/shared';
import { api } from '../lib/api';
import { useAppStore } from './appStore';
import { setAlwaysOnTop, setAutoStart } from '../lib/tauri';

interface AuthState {
  user: User | null;
  token: string | null;
  settings: UserSettings | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  setSettings: (s: UserSettings | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, code: string) => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}

const TOKEN_KEY = 'ai-news:token';
const USER_KEY = 'ai-news:user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  token: localStorage.getItem(TOKEN_KEY),
  settings: null,
  loading: false,
  setUser: (u) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
    set({ user: u });
  },
  setToken: (t) => {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    set({ token: t });
  },
  setSettings: (s) => set({ settings: s }),
  login: async (email, password) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    get().setToken(res.token);
    get().setUser(res.user);
    await get().loadSettings();
  },
  register: async (email, password, code) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', {
      email,
      password,
      code,
    });
    get().setToken(res.token);
    get().setUser(res.user);
    await get().loadSettings();
  },
  logout: () => {
    get().setToken(null);
    get().setUser(null);
    set({ settings: null });
  },
  restore: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      get().setUser(res.user);
      await get().loadSettings();
    } catch {
      get().logout();
    }
  },
  loadSettings: async () => {
    try {
      const s = await api.get<UserSettings>('/settings');
      set({ settings: s });
      // 同步主题到 appStore
      if (s.darkMode) useAppStore.getState().setTheme(s.darkMode);
      // 同步到 Tauri 桌面端
      void setAlwaysOnTop(s.widgetTop);
      void setAutoStart(s.autoStart);
    } catch {
      // 未登录时静默
    }
  },
  updateSettings: async (patch) => {
    const s = await api.patch<UserSettings>('/settings', patch);
    set({ settings: s });
    if (s.darkMode) useAppStore.getState().setTheme(s.darkMode);
    if (patch.widgetTop !== undefined) void setAlwaysOnTop(s.widgetTop);
    if (patch.autoStart !== undefined) void setAutoStart(s.autoStart);
  },
}));
