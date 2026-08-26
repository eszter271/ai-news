import clsx from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  'aria-label'?: string;
  size?: 'sm' | 'md';
}

// 与设计稿设置页一致的开关
export function Toggle({
  checked,
  onChange,
  'aria-label': ariaLabel,
  size = 'md',
}: ToggleProps) {
  const dims =
    size === 'sm'
      ? { w: 'w-8 h-4.5', knob: 'w-3 h-3', onTranslate: 'translate-x-3.5' }
      : { w: 'w-9 h-5', knob: 'w-4 h-4', onTranslate: 'translate-x-4' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative rounded-full shrink-0 cursor-pointer transition-colors duration-200',
        dims.w,
        checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-muted)]',
      )}
    >
      <span
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 left-0.5 rounded-full bg-white transition-transform duration-200',
          dims.knob,
          checked && dims.onTranslate,
        )}
      />
    </button>
  );
}
