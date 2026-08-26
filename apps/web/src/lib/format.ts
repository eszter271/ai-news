import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatRelativeTime(minutesAgo: number): string {
  if (minutesAgo < 60) return `${Math.max(1, Math.floor(minutesAgo))}分钟前`;
  if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)}小时前`;
  if (minutesAgo < 1440 * 2) return '1天前';
  const days = Math.floor(minutesAgo / 1440);
  if (days < 7) return `${days}天前`;
  return dayjs().subtract(minutesAgo, 'minute').format('MM-DD');
}

export function toIsoFromMinutesAgo(minutesAgo: number): string {
  return dayjs().subtract(minutesAgo, 'minute').toISOString();
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
