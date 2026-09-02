import { useCallback, useEffect, useState } from 'react';

const KEY = 'backend-course:theme';

function readInitialTheme() {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // localStorage unavailable — theme just won't persist between visits
  }
}

// Тема уже применена синхронно инлайн-скриптом в index.html (чтобы не было
// "мигания" не той темой при загрузке страницы). Этот хук просто синхронизирует
// с ней React-состояние и даёт функцию для переключения.
export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
