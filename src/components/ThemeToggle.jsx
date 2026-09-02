import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition hover:bg-[var(--bg-hover)] ${className}`}
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
    >
      <span className="text-base leading-none">{isDark ? '🌙' : '☀️'}</span>
    </button>
  );
}
