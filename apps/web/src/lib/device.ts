// 设备检测：判断是否在 Tauri 桌面端、是否移动端

export function isTauri(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
      (window as any).__TAURI_INTERNALS__ !== undefined,
  );
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 640px)').matches;
}

export function watchViewport(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(max-width: 640px)');
  const handler = () => cb();
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export function isStandalone(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true),
  );
}
