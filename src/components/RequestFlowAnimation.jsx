import { useState, useEffect, useRef } from 'react';

const SCENARIOS = {
  get_200: {
    name: 'GET /api/products',
    desc: 'Успешный запрос списка товаров (200 OK)',
    status: 200,
    statusText: '200 OK',
    statusColor: '#22c55e',
    reqPayload: 'GET /api/products HTTP/1.1\nHost: api.shop.ru',
    resPayload: '[\n  {"id": 1, "title": "MacBook Pro"},\n  {"id": 2, "title": "Keychron K2"}\n]',
    dbNeeded: true,
    dbQuery: 'SELECT * FROM products LIMIT 20;',
    steps: [
      '1. Клиент формирует HTTP GET запрос к /api/products',
      '2. Пакет летит по сети Интернет к серверу FastAPI',
      '3. Сервер валидирует запрос и делает SQL запрос в PostgreSQL',
      '4. База возвращает строки, FastAPI сериализует их в JSON',
      '5. Ответ 200 OK с JSON полезной нагрузкой возвращается клиенту',
    ],
  },
  post_201: {
    name: 'POST /api/orders',
    desc: 'Создание нового заказа (201 Created)',
    status: 201,
    statusText: '201 Created',
    statusColor: '#22c55e',
    reqPayload: 'POST /api/orders\n{"item_id": 1, "quantity": 1}',
    resPayload: '{"order_id": 884, "status": "CONFIRMED"}',
    dbNeeded: true,
    dbQuery: 'INSERT INTO orders (item_id, qty) VALUES (1, 1);',
    steps: [
      '1. Клиент отправляет POST запрос с JSON телом в заголовках',
      '2. Пакет с телом заказа поступает на сервер FastAPI',
      '3. Pydantic валидирует тело, SQLAlchemy сохраняет запись в БД',
      '4. База подтверждает вставку строки (COMMIT)',
      '5. Сервер возвращает статус 201 Created с ID созданного заказа',
    ],
  },
  auth_401: {
    name: 'GET /api/admin (Без токена)',
    desc: 'Ошибка авторизации (401 Unauthorized)',
    status: 401,
    statusText: '401 Unauthorized',
    statusColor: '#eab308',
    reqPayload: 'GET /api/admin/users\nAuthorization: (пусто)',
    resPayload: '{"detail": "Not authenticated"}',
    dbNeeded: false,
    dbQuery: null,
    steps: [
      '1. Клиент делает запрос к закрытому роуту без JWT токена',
      '2. Запрос долетает до бэкенда',
      '3. FastAPI Dependency (OAuth2) видит отсутствие токена и СРАЗУ блокирует запрос',
      '4. Сервер не нагружает базу данных и формирует ошибку 401',
      '5. Клиент получает 401 Unauthorized и показывает окно входа',
    ],
  },
  rate_429: {
    name: 'GET /api/search (Спам запросов)',
    desc: 'Превышение лимита запросов (429 Too Many Requests)',
    status: 429,
    statusText: '429 Too Many Requests',
    statusColor: '#f97316',
    reqPayload: 'GET /api/search?q=phone\n(100-й запрос за секунду)',
    resPayload: '{"detail": "Rate limit exceeded. Retry in 5s"}',
    dbNeeded: false,
    dbQuery: null,
    steps: [
      '1. Бот шлёт 100 запросов в секунду',
      '2. Запрос поступает на шлюз / Redis Rate Limiter',
      '3. Redis счётчик показывает превышение лимита (100 > 10 req/s)',
      '4. Сервер мгновенно сбрасывает соединение с кодом 429',
      '5. База данных защищена от перегрузки и зависания!',
    ],
  },
  error_500: {
    name: 'GET /api/bug (Падение сервера)',
    desc: 'Внутренняя ошибка сервера (500 Internal Server Error)',
    status: 500,
    statusText: '500 Server Error',
    statusColor: '#ef4444',
    reqPayload: 'GET /api/calculate-price',
    resPayload: '{"detail": "Internal Server Error"}',
    dbNeeded: true,
    dbQuery: 'ZeroDivisionError in business logic',
    steps: [
      '1. Клиент вызывает эндпоинт',
      '2. Пакет доставлен на сервер',
      '3. В коде Python падает необработанное исключение ZeroDivisionError',
      '4. Sentry фотографирует ошибку, FastAPI отдаёт 500',
      '5. Клиент получает 500 Server Error вместо зависания',
    ],
  },
};

export default function RequestFlowAnimation({ initialScenario = 'get_200', title = 'Интерактивная схема: путь HTTP-запроса' }) {
  const [scenario, setScenario] = useState(initialScenario);
  const [step, setStep] = useState(0); // 0: idle, 1: client_sending, 2: server_processing, 3: db_query, 4: server_responding, 5: client_received
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const containerRef = useRef(null);

  const current = SCENARIOS[scenario] || SCENARIOS.get_200;

  const startAnimation = () => {
    setStep(1);
    setIsPlaying(true);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setStep(0);
  };

  // Автозапуск при скролле в зону видимости
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !autoStarted) {
          setAutoStarted(true);
          setStep(1);
          setIsPlaying(true);
        }
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [autoStarted]);

  // Таймер шагов анимации
  useEffect(() => {
    if (!isPlaying) return;
    if (step >= 5) {
      const finishTimer = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 1100);
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  // Вычисление позиции пакета (0..100% по X)
  let packetPos = 0;
  const packetVisible = step > 0;
  let packetColor = 'var(--accent)';
  let packetLabel = 'Request';

  if (step === 1) {
    packetPos = 45; // Летит к серверу
    packetLabel = 'HTTP Request';
  } else if (step === 2) {
    packetPos = 50; // На сервере
    packetLabel = 'FastAPI';
  } else if (step === 3) {
    packetPos = current.dbNeeded ? 85 : 50; // В базе
    packetLabel = current.dbNeeded ? 'SQL Query' : 'FastAPI';
    packetColor = '#8b5cf6';
  } else if (step === 4) {
    packetPos = 50; // Возврат на сервер
    packetLabel = 'HTTP Response';
    packetColor = current.statusColor;
  } else if (step === 5) {
    packetPos = 12; // Вернулся к клиенту
    packetLabel = current.statusText;
    packetColor = current.statusColor;
  }

  return (
    <div
      ref={containerRef}
      className="my-6 rounded-2xl border p-5 transition sm:p-6"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold sm:text-lg" style={{ color: 'var(--text-primary)' }}>
          <span>🌐</span> {title}
        </h3>

        {/* Переключатель сценариев */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(SCENARIOS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setScenario(key);
                setStep(0);
                setIsPlaying(false);
              }}
              className="rounded-lg px-2.5 py-1 text-xs font-medium transition"
              style={{
                background: scenario === key ? 'var(--accent)' : 'var(--bg-hover)',
                color: scenario === key ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
        {current.desc}
      </p>

      {/* SVG / Графический холст анимации */}
      <div
        className="relative overflow-hidden rounded-xl border p-4 sm:p-6"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="grid grid-cols-3 items-center gap-2 sm:gap-4">
          {/* УЗЕЛ 1: КЛИЕНТ */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl border p-3 transition duration-300 ${
              step === 1 || step === 5 ? 'ring-2 ring-[var(--accent)]' : ''
            }`}
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <span className="text-2xl sm:text-3xl">💻</span>
            <span className="mt-1 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Клиент
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Browser / Mobile
            </span>
          </div>

          {/* УЗЕЛ 2: СЕРВЕР FASTAPI */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl border p-3 transition duration-300 ${
              step === 2 || step === 4 ? 'ring-2 ring-[var(--accent)] animate-pulse' : ''
            }`}
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <span className="text-2xl sm:text-3xl">⚡</span>
            <span className="mt-1 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              FastAPI Сервер
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Uvicorn :8000
            </span>
          </div>

          {/* УЗЕЛ 3: БАЗА ДАННЫХ */}
          <div
            className={`flex flex-col items-center justify-center rounded-xl border p-3 transition duration-300 ${
              step === 3 && current.dbNeeded ? 'ring-2 ring-purple-500 animate-pulse' : ''
            }`}
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              opacity: current.dbNeeded ? 1 : 0.4,
            }}
          >
            <span className="text-2xl sm:text-3xl">🗄️</span>
            <span className="mt-1 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              PostgreSQL
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {current.dbNeeded ? 'БД / Хранилище' : 'Не вызывается'}
            </span>
          </div>
        </div>

        {/* Линия соединения и движущийся пакет */}
        <div className="relative my-6 h-6 w-full">
          {/* Фоновая линия */}
          <div
            className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full"
            style={{ background: 'var(--border)' }}
          />

          {/* Анимированный летящий пакет данных */}
          {packetVisible && (
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out"
              style={{
                left: `${packetPos}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md"
                style={{
                  background: packetColor,
                  color: '#ffffff',
                }}
              >
                <span>📦</span>
                <span>{packetLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Текущий статус выполнения шага */}
        <div
          className="rounded-lg p-3 text-xs leading-relaxed"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
        >
          <span className="font-bold" style={{ color: 'var(--accent)' }}>
            Текущий шаг ({step}/5):{' '}
          </span>
          {step === 0 ? 'Нажмите "Отправить запрос", чтобы запустить поток данных.' : current.steps[step - 1]}
        </div>
      </div>

      {/* Панели полезной нагрузки (Запрос и Ответ) */}
      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div className="rounded-xl border p-3 font-mono" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div className="mb-1 font-bold text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            📤 HTTP Request Payload:
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {current.reqPayload}
          </pre>
        </div>

        <div className="rounded-xl border p-3 font-mono" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div className="mb-1 flex items-center justify-between font-bold text-[11px] uppercase tracking-wider">
            <span style={{ color: 'var(--text-muted)' }}>📥 HTTP Response:</span>
            <span style={{ color: current.statusColor }}>{current.statusText}</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {step >= 4 ? current.resPayload : '(ожидание завершения обработки...)'}
          </pre>
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={startAnimation}
          disabled={isPlaying}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          <span>▶</span>
          <span>{step === 5 ? 'Повторить запрос' : 'Отправить запрос'}</span>
        </button>

        <button
          onClick={resetAnimation}
          className="rounded-xl border px-3 py-2 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Сброс
        </button>
      </div>
    </div>
  );
}
