import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BackendPulseButton({ compact = false, className = '' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState(14);
  const [pingCount, setPingCount] = useState(1);
  const [lastPingTime, setLastPingTime] = useState('Только что');

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    if (modalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const handleTestPing = () => {
    if (pinging) return;
    setPinging(true);
    setTimeout(() => {
      const randomLatency = Math.floor(Math.random() * 11) + 8; // 8 - 18 ms
      setPingLatency(randomLatency);
      setPingCount((prev) => prev + 1);
      setLastPingTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setPinging(false);
    }, 450);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 animate-backend-glow cursor-pointer ${className}`}
        title="Backend статус: 200 OK (Нажми для инфо)"
        aria-label="Backend статус и телеметрия"
      >
        {/* Анимированный световой блик (Shimmer) */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-backend-shimmer"
          aria-hidden="true"
        />

        {/* Индикатор онлайн-сервера с живым пульсом (Ping radar) */}
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-90" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-100 shadow-sm" />
        </span>

        {/* Иконка молнии/сервера с легкой микро-анимацией */}
        <span className="text-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          ⚡
        </span>

        {/* Основной текст кнопки */}
        <span className="font-bold tracking-wide">
          Backend
        </span>

        {/* Дополнительный технологичный бейдж со статусом (скрывается в очень компактном режиме) */}
        {!compact && (
          <span className="hidden rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-emerald-200 backdrop-blur-sm sm:inline-block">
            200 OK
          </span>
        )}
      </button>

      {/* Интерактивное модальное окно Backend Hub / Telemetry */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl transition-all"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Декоративная фоновая подсветка шапки */}
            <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

            {/* Шапка модального окна */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      Backend Engine & Platform
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE 200 OK
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Интерактивная среда бэкенд-разработки на Python & FastAPI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 transition hover:bg-[var(--bg-hover)] text-lg"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {/* Контент модального окна */}
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-6">
              {/* Блок живой телеметрии сервера */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Сервер
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-emerald-500">
                    FastAPI + Uvicorn
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    ASGI 0.115
                  </div>
                </div>

                <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Задержка (Ping)
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-indigo-400">
                    {pingLatency} мс
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    {lastPingTime}
                  </div>
                </div>

                <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Движок
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Python 3.12
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    AsyncIO Runtime
                  </div>
                </div>

                <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    База данных
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-cyan-400">
                    PostgreSQL 16
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    Pool: Ready
                  </div>
                </div>
              </div>

              {/* Интерактивный эмулятор запроса к API */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      📡 Симулятор HTTP-запроса к бэкенду
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-500">
                      GET /api/v1/health
                    </span>
                  </div>

                  <button
                    onClick={handleTestPing}
                    disabled={pinging}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{pinging ? '🔄' : '⚡'}</span>
                    <span>{pinging ? 'Отправка...' : 'Отправить Ping'}</span>
                  </button>
                </div>

                <div
                  className="rounded-lg p-3 font-mono text-xs overflow-x-auto"
                  style={{ background: 'var(--code-bg)', color: 'var(--text-secondary)' }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-emerald-400 font-semibold">HTTP/1.1 200 OK</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Запрос #{pingCount} · Задержка: {pingLatency}ms
                    </span>
                  </div>
                  <pre className="mt-2 text-[11px] leading-relaxed text-emerald-300">
{`{
  "status": "online",
  "backend": "Python FastAPI",
  "environment": "interactive_learning_platform",
  "latency_ms": ${pingLatency},
  "database": "PostgreSQL connected",
  "cache": "Redis in-memory active",
  "ai_mentor": "available"
}`}
                  </pre>
                </div>
              </div>

              {/* Быстрый доступ к ключевым Backend-разделам курса */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  🎯 Ключевые разделы Backend-программы
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    to="/module/fastapi"
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-emerald-500/50 hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-2xl">⚡</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        Модуль 6: FastAPI и REST API
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Эндпоинты, Swagger, Pydantic, JSON
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/module/databases"
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-cyan-500/50 hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-2xl">🗄️</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        Модуль 7: Базы данных & SQL
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        PostgreSQL, SQLAlchemy, миграции
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/module/auth"
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-amber-500/50 hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-2xl">🔐</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        Модуль 8: Аутентификация
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        JWT, bcrypt, роли и безопасность
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/module/docker"
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-blue-500/50 hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-2xl">🐳</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        Модуль 9: Docker & Деплой
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Dockerfile, docker-compose, деплой на сервер
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/system-design"
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-purple-500/50 hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-2xl">🏗️</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        System Design
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Интерактивный конструктор архитектур
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/resume-builder"
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-rose-500/50 hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                  >
                    <span className="text-2xl">📄</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        Резюме разработчика
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        Генерация резюме на базе пройденных тем
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Подвал модального окна */}
            <div className="flex items-center justify-between border-t px-6 py-3.5" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                💡 Нажми <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]" style={{ borderColor: 'var(--border)' }}>Esc</kbd> для закрытия
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 cursor-pointer"
              >
                Понятно, продолжить обучение
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
