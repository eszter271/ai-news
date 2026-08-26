// Tauri 桌面端能力封装：浏览器环境下降级为 no-op
// 涉及窗口置顶、开机自启、隐藏到托盘等

import { isTauri } from './device';

const inTauri = isTauri();

// 动态 import 以避免浏览器环境加载 Tauri runtime
async function getWindow() {
  if (!inTauri) return null;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow();
  } catch {
    return null;
  }
}

async function getAutostart() {
  if (!inTauri) return null;
  try {
    const mod = await import('@tauri-apps/plugin-autostart');
    return mod;
  } catch {
    return null;
  }
}

/** 设置窗口始终置顶 */
export async function setAlwaysOnTop(top: boolean): Promise<void> {
  const w = await getWindow();
  if (!w) return;
  try {
    await w.setAlwaysOnTop(top);
  } catch {
    // 静默
  }
}

/** 启用 / 禁用开机自启 */
export async function setAutoStart(enable: boolean): Promise<void> {
  const m = await getAutostart();
  if (!m) return;
  try {
    if (enable) await m.enable();
    else await m.disable();
  } catch {
    // 静默
  }
}

/** 查询开机自启状态 */
export async function isAutoStartEnabled(): Promise<boolean | null> {
  const m = await getAutostart();
  if (!m) return null;
  try {
    return await m.isEnabled();
  } catch {
    return null;
  }
}

/** 隐藏窗口（关闭按钮的语义：隐藏到托盘，而非退出） */
export async function hideWindow(): Promise<void> {
  const w = await getWindow();
  if (!w) return;
  try {
    await w.hide();
  } catch {
    // 静默
  }
}

/** 退出应用 */
export async function quitApp(): Promise<void> {
  const w = await getWindow();
  if (!w) return;
  try {
    await w.close();
  } catch {
    // 静默
  }
}

/** 监听来自 Rust 侧的托盘事件（如点击托盘图标显示窗口） */
export async function onTrayShow(callback: () => void): Promise<() => void> {
  if (!inTauri) return () => {};
  try {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen('tray-show', () => callback());
    return unlisten;
  } catch {
    return () => {};
  }
}
