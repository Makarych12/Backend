import { useState } from 'react';
import { realWorldSystems } from '../data/realWorldSystems';

function SystemDiagram({ type }) {
  if (type === 'netflix') {
    return (
      <div className="my-4 rounded-xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">📱</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Зритель (Smart TV / Phone)</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px]" style={{ color: 'var(--accent)' }}>1. Запрос метаданных</span>
            <span className="text-base font-bold">➔</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>FastAPI / Microservices</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Каталог & Рекомендации</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px]" style={{ color: '#22c55e' }}>2. Ссылка на CDN</span>
            <span className="text-base font-bold">➔</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-2.5 ring-2 ring-red-500/40" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Open Connect CDN</span>
            <span className="text-[10px] text-red-500 font-semibold">Сервер в твоём городе</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'uber') {
    return (
      <div className="my-4 rounded-xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">🙋</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Пассажир</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>GPS Координаты</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px]" style={{ color: 'var(--accent)' }}>Заказ поездки</span>
            <span className="text-base font-bold">➔</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">⬡</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Uber H3 Индексатор</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Поиск по соте #8826...</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px]" style={{ color: '#06b6d4' }}>Dispatch Пуш</span>
            <span className="text-base font-bold">➔</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-2.5 ring-2 ring-cyan-500/40" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">🚖</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Ближайший водитель</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>150 метров / 2 мин</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'instagram') {
    return (
      <div className="my-4 rounded-xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
          <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">📸</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Автор (Новое фото)</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px]" style={{ color: '#e1306c' }}>Прямой Presigned URL</span>
            <span className="text-base font-bold">➔</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">☁️</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>S3 / Cloud Storage</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Оригинальный файл</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px]" style={{ color: '#8b5cf6' }}>Fan-out в кэш</span>
            <span className="text-base font-bold">➔</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-2.5 ring-2 ring-purple-500/40" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <span className="text-2xl">👥</span>
            <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Redis Ленты подписчиков</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Мгновенный показ</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="flex flex-col items-center justify-between gap-3 text-xs sm:flex-row">
        <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-2xl">📱</span>
          <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Клиент А</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-[10px]" style={{ color: '#0088cc' }}>Постоянный TCP Сокет</span>
          <span className="text-base font-bold">➔</span>
        </div>

        <div className="flex flex-col items-center rounded-lg border p-2.5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-2xl">🏢</span>
          <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Ближайший Дата-центр</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Бинарный MTProto</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-[10px]" style={{ color: '#22c55e' }}>Доставка 50мс</span>
          <span className="text-base font-bold">➔</span>
        </div>

        <div className="flex flex-col items-center rounded-lg border p-2.5 ring-2 ring-blue-500/40" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <span className="text-2xl">📱</span>
          <span className="font-bold text-[11px]" style={{ color: 'var(--text-primary)' }}>Клиент Б</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Мгновенное уведомление</span>
        </div>
      </div>
    </div>
  );
}

export default function RealWorldSystems() {
  const [selectedSystemId, setSelectedSystemId] = useState(realWorldSystems[0].id);

  const activeSystem = realWorldSystems.find((s) => s.id === selectedSystemId) || realWorldSystems[0];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-8 sm:px-6 sm:py-10">
      {/* Шапка */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-2xl">
            🏛️
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Как это устроено: разбор реальных систем
            </h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Простые и наглядные объяснения архитектуры Netflix, Uber, Instagram и Telegram без занудства и сухих терминов.
            </p>
          </div>
        </div>
      </div>

      {/* Список систем (Табы / Карточки выбора) */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {realWorldSystems.map((item) => {
          const isSelected = item.id === selectedSystemId;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedSystemId(item.id)}
              className="flex flex-col justify-between rounded-2xl border p-4 text-left transition hover:shadow-md"
              style={{
                background: isSelected ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-secondary)',
                borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
                  >
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {item.title.split(':')[0]}
                </h3>
              </div>
              <p className="mt-2 line-clamp-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {item.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Подробный разбор выбранной системы */}
      <div
        className="space-y-6 rounded-3xl border p-6 sm:p-8"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeSystem.icon}</span>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                {activeSystem.title}
              </h2>
              <span className="text-xs font-semibold uppercase" style={{ color: 'var(--accent)' }}>
                {activeSystem.category}
              </span>
            </div>
          </div>
        </div>

        {/* Проблема и Аналогия */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500">
              <span>⚠️</span> В чём главная инженерная сложность?
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {activeSystem.problem}
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
              <span>💡</span> Бытовая аналогия для понимания:
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {activeSystem.analogy}
            </p>
          </div>
        </div>

        {/* Наглядная схема потока данных */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Архитектурная схема взаимодействия:
          </h3>
          <SystemDiagram type={activeSystem.svgDiagram} />
        </div>

        {/* 3 шага архитектуры */}
        <div>
          <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            3 ключевых архитектурных решения:
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {activeSystem.architectureSteps.map((step) => (
              <div
                key={step.step}
                className="flex flex-col justify-between rounded-2xl border p-4"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div>
                  <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
                    {step.step}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Главный инсайт */}
        <div
          className="rounded-2xl border-l-4 p-4 text-xs sm:text-sm leading-relaxed font-medium"
          style={{
            background: 'var(--bg-hover)',
            borderColor: 'var(--accent)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="font-bold">Главный вывод для тебя как разработчика: </span>
          {activeSystem.keyTakeaway}
        </div>
      </div>
    </div>
  );
}
