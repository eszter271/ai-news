import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useNewsStore } from '../store/newsStore';
import { isMobileViewport, watchViewport, isTauri } from '../lib/device';
import { Widget } from '../components/Widget';
import { NewsCard } from '../components/NewsCard';

export default function NewsPage() {
  const { widgetState, setWidgetState, isMobile, setMobile } = useAppStore();
  const fetch = useNewsStore((s) => s.fetch);
  const loadFavorites = useNewsStore((s) => s.loadFavorites);

  // 初始化设备/挂件态
  useEffect(() => {
    const mobile = isMobileViewport();
    setMobile(mobile);
    // 桌面端默认收起为挂件；移动端默认展开
    if (!mobile && !isTauri()) {
      // 浏览器大屏访问时默认展开（更友好）
      setWidgetState('expanded');
    } else if (!mobile && isTauri()) {
      // Tauri 桌面端默认收起
      setWidgetState('collapsed');
    } else {
      setWidgetState('expanded');
    }
    const unwatch = watchViewport(() => setMobile(isMobileViewport()));
    return unwatch;
  }, [setMobile, setWidgetState]);

  // 拉数据 + 同步收藏
  useEffect(() => {
    fetch();
    loadFavorites();
  }, [fetch, loadFavorites]);

  const isExpanded = isMobile || widgetState === 'expanded';

  // 容器样式：桌面端居中浮窗 + 半透明背景；移动端全屏
  const containerStyle: React.CSSProperties = isMobile
    ? {
        height: '100%',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflow: 'auto',
      };

  return (
    <main
      data-viewport-mode="app-shell"
      data-scroll-region="primary"
      style={containerStyle}
    >
      {isMobile ? (
        // 移动端：卡片铺满全屏，去掉最大高度限制
        <div
          style={{
            ['--card-max-w' as any]: '100%',
            ['--card-max-h' as any]: '100%',
            width: '100%',
            flex: 1,
            display: 'flex',
          }}
        >
          <NewsCard />
        </div>
      ) : isExpanded ? (
        <NewsCard />
      ) : (
        <Widget />
      )}
    </main>
  );
}
