// Gamification engine: Badges, Daily Streaks, and Benchmark calculations

export const BADGES = [
  {
    id: 'first_step',
    title: 'Первый шаг',
    icon: '🚀',
    desc: 'Заверши свой самый первый урок в курсе',
    check: (completed) => completed.size >= 1,
  },
  {
    id: 'python_novice',
    title: 'Заклинатель Python',
    icon: '🐍',
    desc: 'Заверши модуль 2 «Основы Python»',
    check: (completed) => completed.has('py-vars') && completed.has('py-types') && completed.has('py-funcs'),
  },
  {
    id: 'oop_architect',
    title: 'Мастер ООП',
    icon: '📦',
    desc: 'Освой классы и объекты в модуле 3',
    check: (completed) => completed.has('classes-objects'),
  },
  {
    id: 'http_master',
    title: 'Властелин сети',
    icon: '🌐',
    desc: 'Разберись в протоколе HTTP в модуле 4',
    check: (completed) => completed.has('client-server') && completed.has('http-basics'),
  },
  {
    id: 'fastapi_pilot',
    title: 'FastAPI Пилот',
    icon: '⚡',
    desc: 'Запусти свой первый сервер в модуле 5',
    check: (completed) => completed.has('first-api'),
  },
  {
    id: 'database_guru',
    title: 'Повелитель SQL',
    icon: '🗄️',
    desc: 'Освой PostgreSQL и SQLAlchemy в модуле 7',
    check: (completed) => completed.has('intro-db') || completed.has('sqlalchemy-basics'),
  },
  {
    id: 'security_shield',
    title: 'Киберщит',
    icon: '🛡️',
    desc: 'Изучи безопасность и защиту от атак в модуле 11',
    check: (completed) => completed.has('cors-origin') || completed.has('security-basics'),
  },
  {
    id: 'async_ninja',
    title: 'Асинхронный ниндзя',
    icon: '⏱️',
    desc: 'Освой async/await и неблокирующий ввод-вывод в модуле 12',
    check: (completed) => completed.has('async-intro') || completed.has('async-gather'),
  },
  {
    id: 'docker_captain',
    title: 'Капитан Docker',
    icon: '🐳',
    desc: 'Собери свой первый образ в модуле 22',
    check: (completed) => completed.has('docker-basics') || completed.has('dockerfile-from-scratch'),
  },
  {
    id: 'queue_commander',
    title: 'Повелитель очередей',
    icon: '📬',
    desc: 'Запусти Celery и Redis в модуле 23',
    check: (completed) => completed.has('why-task-queues') || completed.has('celery-first-task'),
  },
  {
    id: 'ai_pioneer',
    title: 'AI Первопроходец',
    icon: '🤖',
    desc: 'Интегрируй нейросети в бэкенд в модуле 24',
    check: (completed) => completed.has('ai-api-basics'),
  },
  {
    id: 'marathoner',
    title: 'Марафонец бэкенда',
    icon: '🏆',
    desc: 'Заверши 25 или более уроков по всему курсу',
    check: (completed) => completed.size >= 25,
  },
];

export function getStreakData() {
  const defaultData = {
    currentStreak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    totalActiveDays: 1,
  };

  try {
    const raw = localStorage.getItem('backend_course_streak_data');
    if (!raw) return defaultData;
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

export function updateStreakOnActivity() {
  const today = new Date().toISOString().slice(0, 10);
  const current = getStreakData();

  if (current.lastActiveDate === today) {
    return current;
  }

  const last = new Date(current.lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

  let newStreak = current.currentStreak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const updated = {
    currentStreak: newStreak,
    lastActiveDate: today,
    totalActiveDays: (current.totalActiveDays || 1) + 1,
  };

  try {
    localStorage.setItem('backend_course_streak_data', JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

export function calculateBenchmark(completedCount) {
  if (completedCount === 0) {
    return {
      topPercentile: 'Старт',
      message: 'Начни первый урок, чтобы включиться в темп курса!',
    };
  }
  if (completedCount < 5) {
    return {
      topPercentile: 'Топ 90%',
      message: 'Отличное начало! Ты проходишь быстрее 30% начинающих.',
    };
  }
  if (completedCount < 15) {
    return {
      topPercentile: 'Топ 40%',
      message: 'Уверенный темп! Ты опережаешь 65% студентов платформы.',
    };
  }
  if (completedCount < 30) {
    return {
      topPercentile: 'Топ 15%',
      message: 'Высокая скорость! Твой прогресс выше, чем у 85% обучающихся.',
    };
  }
  return {
    topPercentile: 'Топ 3% 🚀',
    message: 'Невероятный результат! Ты входишь в элиту бэкенд-разработчиков.',
  };
}
