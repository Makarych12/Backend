export const module31 = {
  id: 'monitoring-sentry',
  order: 31,
  title: 'Мониторинг и трекинг ошибок: Sentry и Prometheus',
  icon: '📊',
  description: 'Как следить за здоровьем сервиса 24/7: автоматический сбор ошибок в Sentry, сбор метрик Prometheus/Grafana и Healthcheck-эндпоинты.',
  lessons: [
    {
      id: 'sentry-error-tracking',
      title: 'Sentry: как узнавать об ошибках раньше пользователей',
      summary: 'Почему ждать гневных отзывов пользователей — худший путь и как Sentry мгновенно присылает детальный снимок каждой упавшей ошибки',
      theory: [
        {
          type: 'p',
          text: 'Когда на сервере происходит непредвиденная ошибка (500 Internal Server Error), 99% пользователей молча закроют сайт и уйдут к конкурентам. Если не настроен мониторинг — программисты могут неделями не знать, что кнопка "Купить" сломана на смартфонах iPhone! Для мгновенного отлова всех необработанных исключений используется SENTRY.',
        },
        {
          type: 'analogy',
          text: 'Sentry — это круглосуточная СИГНАЛИЗАЦИЯ И КАМЕРА ВИДЕОНАБЛЮДЕНИЯ в твоем магазине. Как только в коде падает ошибка, Sentry за 0.1 секунды: 1) Фотографирует точное место аварии (файл, номер строки, значения всех локальных переменных); 2) Записывает данные пользователя (IP, браузер, URL запроса); 3) Мгновенно шлёт уведомление в Telegram/Slack дежурному инженеру: "В функции calculate_discount деление на ноль!". Ты исправляешь баг за 5 минут до того, как его заметят клиенты!',
        },
        {
          type: 'steps',
          title: '3 шага подключения Sentry к FastAPI',
          items: [
            { code: '1. pip install sentry-sdk', note: 'Устанавливаем официальный SDK' },
            { code: '2. DSN ключ в .env: SENTRY_DSN=https://...@sentry.io/...', note: 'DSN — уникальный адрес проекта в панели Sentry' },
            { code: '3. sentry_sdk.init(dsn=..., traces_sample_rate=1.0)', note: 'Инициализируем Sentry при старте FastAPI сервера' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Подключение Sentry к FastAPI приложению',
          lang: 'python',
          code: `import os
import sentry_sdk
from fastapi import FastAPI

# Инициализируем Sentry до создания экземпляра FastAPI:
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", "https://mock_public_key@o0.ingest.sentry.io/0"),
    traces_sample_rate=1.0, # сбор 100% трейсов производительности для поиска медленных SQL-запросов
    environment="production"
)

app = FastAPI()

@app.get("/api/buggy-endpoint")
def trigger_unhandled_error():
    # Намеренная ошибка:
    result = 100 / 0
    return {"result": result}
    # Sentry АВТОМАТИЧЕСКИ перехватит ZeroDivisionError и отправит полный отчет в дашборд!`,
          explanation: 'Sentry интегрируется в FastAPI как middleware и перехватывает любые необработанные исключения.',
        },
        {
          title: 'Пример 2: Добавление пользовательского контекста (User Context) в отчёт об ошибке',
          lang: 'python',
          code: `def capture_custom_error(user_id: int, user_email: str, order_id: str):
    # Привязываем ID пользователя к сессии Sentry:
    sentry_sdk.set_user({"id": user_id, "email": user_email})
    sentry_sdk.set_tag("order_id", order_id)
    
    try:
        raise ValueError("Платёжный шлюз вернул некорректный ответ")
    except Exception as exc:
        # Ручная отправка пойманной ошибки:
        sentry_sdk.capture_exception(exc)`,
          explanation: 'set_user и set_tag позволяют в панели Sentry фильтровать ошибки по конкретным клиентам и заказам.',
        },
        {
          title: 'Пример 3: Игнорирование ожидаемых HTTP ошибок (404 Not Found)',
          lang: 'python',
          code: `# Sentry автоматически игнорирует стандартные HTTPException со статусами 400, 401, 404, 
# потому что это штатное поведение валидации, а не программная авария бэкенда!`,
          explanation: 'В Sentry попадают только реальные необработанные 5xx сбои, исключая лишний информационный шум.',
        },
      ],
      terminal: {
        title: 'Установка Sentry SDK для FastAPI',
        description: 'Установка SDK с поддержкой ASGI:',
        lessonCommands: {
          'pip install sentry-sdk[fastapi]': {
            output: [
              'Collecting sentry-sdk',
              'Installing collected packages: sentry-sdk',
              'Successfully installed sentry-sdk-2.19.2',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install sentry-sdk[fastapi]'],
        script: [
          { command: 'pip install sentry-sdk[fastapi]' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор Sentry перехватывает сбои с контекстом пользователя. Запусти код!',
        initialCode: `class MockSentryCollector:
    def __init__(self):
        self.captured_events = []

    def capture_exception(self, exc: Exception, user_info=None, tags=None):
        event = {
            "error_type": type(exc).__name__,
            "message": str(exc),
            "user": user_info or {},
            "tags": tags or {},
            "status": "RECORDED"
        }
        self.captured_events.append(event)
        print(f"🚨 [SENTRY ALERT]: Поймана авария '{event['error_type']}': '{event['message']}'")
        print(f"   Пользователь: {event['user']} | Теги: {event['tags']}")

sentry = MockSentryCollector()

# Имитируем падение заказа:
try:
    current_user = {"id": 42, "email": "alex@dev.ru"}
    total_price = 100 / 0 # сбой
except Exception as err:
    sentry.capture_exception(err, user_info=current_user, tags={"service": "checkout_api"})

assert len(sentry.captured_events) == 1
assert sentry.captured_events[0]["error_type"] == "ZeroDivisionError"`,
      },
      tasks: [
        {
          title: 'Задание 1: перехват ошибки IndexError',
          difficulty: 'easy',
          description: 'Спровоцируй ошибку IndexError (обращение к несуществующему элементу списка) и отправь её в sentry.capture_exception с тегом {"page": "profile"}.',
          hints: ['try:\n    lst = []\n    x = lst[5]\nexcept Exception as e:\n    sentry.capture_exception(e, tags={"page": "profile"})'],
        },
        {
          title: 'Задание 2: фильтрация тестовых ошибок по окружению',
          difficulty: 'medium',
          description: 'Напиши функцию is_reporting_enabled(env: str) -> bool: ошибки должны отправляться в Sentry только в окружениях "production" и "staging", но отключаться в "local" и "test".',
          hints: ['return env in ("production", "staging")'],
          solution: `def is_reporting_enabled(env: str) -> bool:
    return env in ("production", "staging")

assert is_reporting_enabled("production") is True
assert is_reporting_enabled("local") is False
print("✓ Фильтрация окружений для Sentry работает корректно!")`,
        },
        {
          title: 'Задание 3: трейсинг производительности (Sentry Performance / Spans)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: что такое Tracing и Spans в Sentry (замер времени выполнения каждого отдельного SQL-запроса и внешнего HTTP-вызова) и как это помогает найти строчку, которая тормозит эндпоинт на 3 секунды.',
          hints: ['Spans визуализируют таймлайн обработки запроса в виде понятной диаграммы Ганта'],
        },
      ],
      mistakes: [
        {
          wrong: 'Глушить все ошибки пустым except: pass, не передавая их в Sentry',
          right: 'Пустой except скрывает баги, делая систему нестабильной. Всегда логируй или вызывай sentry_sdk.capture_exception()',
        },
        {
          wrong: 'Отправлять в Sentry пароли пользователей или данные кредитных карт',
          right: 'Используй опцию before_send для автоматической очистки конфиденциальных полей (PII Scrubbing)',
        },
      ],
      checklist: [
        'Понимаю назначение системы трекинга ошибок Sentry',
        'Знаю, как подключить Sentry к FastAPI через sentry_sdk.init',
        'Умею привязывать контекст пользователя и теги к ошибкам',
        'Понимаю разницу между штатными 4xx ошибками и авариями 5xx',
      ],
    },

    {
      id: 'prometheus-metrics-grafana',
      title: 'Метрики приложения: Prometheus и Grafana',
      summary: 'Разница между логами и числовыми метриками: счётчики Counter, гистограммы задержек Histogram, эндпоинт /metrics и расчёт RPS',
      theory: [
        {
          type: 'p',
          text: 'Логи рассказывают, ЧТО конкретно произошло с одним пользователем. МЕТРИКИ показывают ОБЩУЮ КАРТИНУ здоровья всей системы в цифрах и графиках: "Сколько запросов в секунду (RPS) сейчас держит сервер?", "Сколько памяти занято?", "За сколько миллисекунд отвечает 95% пользователей (p95 latency)?". Стандартом сбора метрик является PROMETHEUS, а для их красивой визуализации используется GRAFANA.',
        },
        {
          type: 'list',
          title: '4 типа метрик в Prometheus',
          items: [
            '1. Counter (Счётчик): число, которое только растёт (например, общее количество обработанных HTTP запросов: 1, 2, 1000, 50000).',
            '2. Gauge (Датчик / Спидометр): число, которое может расти и падать (текущее количество активных пользователей онлайн, процент занятой памяти RAM).',
            '3. Histogram (Гистограмма): замер длительности операций по корзинам (например, сколько запросов заняло <50мс, <100мс, <500мс).',
            '4. Summary (Сводка): расчёт квантилей и перцентилей задержки.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Эндпоинт /metrics',
          text: 'Приложение открывает служебный технический эндпоинт GET /metrics. Сервер Prometheus раз в 15 секунд опрашивает (Scrape) этот эндпоинт и строит красивые графики в Grafana!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Подключение Prometheus метрик к FastAPI через prometheus-fastapi-instrumentator',
          lang: 'python',
          code: `from fastapi import FastAPI
# from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# Автоматически собирает RPS, статус-коды и время ответа всех роутов:
# Instrumentator().instrument(app).expose(app, endpoint="/metrics")

@app.get("/api/orders")
def get_orders():
    return [{"id": 1, "status": "delivered"}]
# Доступен эндпоинт /metrics со всеми числовыми данными!`,
          explanation: 'Библиотека Instrumentator одной строчкой подключает автоматический сбор метрик ко всем роутам.',
        },
        {
          title: 'Пример 2: Создание пользовательского счётчика заказов (Custom Counter)',
          lang: 'python',
          code: `from prometheus_client import Counter, Histogram

# Счётчик успешно оплаченных заказов:
ORDERS_TOTAL = Counter("shop_orders_total", "Общее количество оплаченных заказов", ["category"])

# Гистограмма времени генерации PDF:
PDF_GEN_TIME = Histogram("pdf_generation_seconds", "Время генерации PDF отчётов", buckets=[0.1, 0.5, 1.0, 5.0])

def record_order_metric(category: str):
    ORDERS_TOTAL.labels(category=category).inc() # увеличиваем счётчик на 1!`,
          explanation: 'Лейблы (labels) позволяют в Grafana строить раздельные графики по категориям товаров.',
        },
        {
          title: 'Пример 3: Что такое перцентили (p50, p95, p99)?',
          lang: 'python',
          code: `def calculate_p95_latency(response_times: list[float]) -> float:
    """p95 означает: 95% пользователей получили ответ быстрее этого времени"""
    sorted_times = sorted(response_times)
    index = int(len(sorted_times) * 0.95)
    return sorted_times[index]

times = [0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1.2, 3.5] # 3.5с — выброс
print("p95 время ответа:", calculate_p95_latency(times), "с")`,
          explanation: 'Перцентиль p95 показывает реальный пользовательский опыт без искажения редкими случайными выбросами.',
        },
      ],
      terminal: {
        title: 'Просмотр эндпоинта /metrics через curl',
        description: 'Формат текстовых метрик Prometheus:',
        lessonCommands: {
          'curl http://localhost:8000/metrics': {
            output: [
              '# HELP http_requests_total Total HTTP Requests',
              '# TYPE http_requests_total counter',
              'http_requests_total{method="GET",status="200"} 1420',
              'http_requests_total{method="POST",status="201"} 380',
              '# HELP process_resident_memory_bytes Resident memory size in bytes.',
              'process_resident_memory_bytes 45800000',
            ],
            type: 'default',
          },
        },
        suggestions: ['curl http://localhost:8000/metrics'],
        script: [
          { command: 'curl http://localhost:8000/metrics' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор метрик Prometheus агрегирует запросы и рассчитывает RPS. Запусти код!',
        initialCode: `class MockPrometheusRegistry:
    def __init__(self):
        self.counters = {}
        self.gauges = {}

    def inc_counter(self, name: str, labels_str: str):
        key = f"{name}{{{labels_str}}}"
        self.counters[key] = self.counters.get(key, 0) + 1

    def set_gauge(self, name: str, value: float):
        self.gauges[name] = value

    def scrape_metrics_text(self) -> str:
        lines = []
        for k, v in self.counters.items():
            lines.append(f"{k} {v}")
        for k, v in self.gauges.items():
            lines.append(f"{k} {v}")
        return "\\n".join(lines)

prom = MockPrometheusRegistry()

# Регистрируем успешные запросы и активных пользователей:
prom.inc_counter("http_requests_total", 'method="GET",status="200"')
prom.inc_counter("http_requests_total", 'method="GET",status="200"')
prom.inc_counter("http_requests_total", 'method="POST",status="201"')
prom.set_gauge("active_users_online", 42)

print("--- [PROMETHEUS SCRAPE /metrics] ---")
print(prom.scrape_metrics_text())
assert "active_users_online 42" in prom.scrape_metrics_text()`,
      },
      tasks: [
        {
          title: 'Задание 1: регистрация ошибки 500 в счетчике',
          difficulty: 'easy',
          description: 'Увеличь счетчик prom.inc_counter("http_requests_total", \'method="POST",status="500"\'). Проверь вывод /metrics.',
          hints: ['prom.inc_counter("http_requests_total", \'method="POST",status="500"\')'],
        },
        {
          title: 'Задание 2: расчёт количества запросов в секунду (RPS)',
          difficulty: 'medium',
          description: 'Напиши функцию calculate_rps(total_requests: int, window_seconds: float = 60.0) -> float: возвращает средний RPS с округлением до 1 знака.',
          hints: ['return round(total_requests / window_seconds, 1)'],
          solution: `def calculate_rps(requests: int, window_sec: float = 60.0) -> float:
    return round(requests / window_sec, 1)

assert calculate_rps(600, 60.0) == 10.0
assert calculate_rps(1500, 10.0) == 150.0
print("✓ RPS рассчитан корректно!")`,
        },
        {
          title: 'Задание 3: настройка алертинга в Grafana (Alerting Rules)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: какое пороговое правило алерта (например: `rate(http_requests_total{status=~"5.."}[5m]) > 0.05` — более 5% ошибок за последние 5 минут) нужно настроить, чтобы дежурный инженер получил звонок ночью только при реальном сбое.',
          hints: ['Алерты на основе процентного соотношения ошибок (Error Budget) предотвращают ложные срабатывания от одиночных ошибок'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать уникальные ID пользователей в лейблах Prometheus: labels(user_id=12345)',
          right: 'Это вызывает проблему Cardinality Explosion (миллионы уникальных временных рядов переполнят память Prometheus). В лейблах используй только перечисления с низкой вариативностью (status, method, category)',
        },
        {
          wrong: 'Пытаться писать логи в Prometheus',
          right: 'Prometheus предназначен только для числовых метрик во времени. Для текстовых логов используется Grafana Loki или Elasticsearch',
        },
      ],
      checklist: [
        'Понимаю разницу между логами и числовыми метриками',
        'Знаю 4 типа метрик: Counter, Gauge, Histogram, Summary',
        'Знаю назначение эндпоинта /metrics для сбора данных',
        'Понимаю концепцию перцентилей p95 и p99',
      ],
    },

    {
      id: 'healthchecks-and-uptime',
      title: 'Healthcheck эндпоинты и мониторинг доступности 24/7',
      summary: 'Как Docker, Kubernetes и облачные платформы проверяют живость сервиса: эндпоинты /health/live и /health/ready с проверкой БД и Redis',
      theory: [
        {
          type: 'p',
          text: 'Бывает так: процесс Uvicorn работает и порт 8000 открыт, но внутри произошёл Deadlock базы данных или пропала связь с PostgreSQL. Для операционной системы процесс "жив", но пользователям сайт отдаёт бесконечные ошибки. Чтобы облачные балансировщики могли автоматически перезапускать зависшие серверы, на бэкенде создаются HEALTHCHECK-эндпоинты (Проверки здоровья).',
        },
        {
          type: 'steps',
          title: 'Два типа Healthcheck проверок',
          items: [
            { code: '1. Liveness Probe (/health/live):', note: 'Проверяет: жив ли сам веб-процесс Python (отвечает 200 OK за 1 мс). Если завис — Docker перезапустит контейнер' },
            { code: '2. Readiness Probe (/health/ready):', note: 'Проверяет: готов ли сервис принимать боевой трафик (делает тестовый SELECT 1 в PostgreSQL и PING в Redis). Если база лежит — балансировщик временно уберёт этот сервер из ротации' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Профессиональные Healthcheck эндпоинты в FastAPI',
          lang: 'python',
          code: `from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.get("/health/live", status_code=status.HTTP_200_OK)
def liveness_check():
    """Liveness: процесс Python жив и слушает порт"""
    return {"status": "alive"}

@app.get("/health/ready")
def readiness_check(db_session=None, redis_client=None):
    """Readiness: проверяем связь с БД и Redis"""
    checks = {}
    
    # 1. Проверяем PostgreSQL:
    try:
        # db_session.execute("SELECT 1")
        checks["database"] = "UP"
    except Exception:
        checks["database"] = "DOWN"

    # 2. Проверяем Redis:
    try:
        # redis_client.ping()
        checks["redis"] = "UP"
    except Exception:
        checks["redis"] = "DOWN"

    # Если хотя бы один критический сервис лежит — отдаём 503 Service Unavailable:
    if any(status == "DOWN" for status in checks.values()):
        raise HTTPException(status_code=503, detail={"status": "unhealthy", "checks": checks})

    return {"status": "ready", "checks": checks}`,
          explanation: 'Статус 503 сигнализирует балансировщику Nginx или Kubernetes, что сервис временно не готов принимать пользователей.',
        },
        {
          title: 'Пример 2: Настройка HEALTHCHECK инструкции в Dockerfile',
          lang: 'docker',
          code: `# Dockerfile:
# HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
#   CMD curl -f http://localhost:8000/health/live || exit 1`,
          explanation: 'Docker будет каждые 30 секунд проверять эндпоинт и присвоит контейнеру статус healthy.',
        },
        {
          title: 'Пример 3: Бесплатный внешний мониторинг Uptime (UptimeRobot / BetterStack)',
          lang: 'python',
          code: `def get_uptime_sla_percentage(total_minutes_in_month=43200, downtime_minutes=5) -> float:
    """Рассчитывает процент доступности сервиса (SLA Uptime)"""
    uptime = total_minutes_in_month - downtime_minutes
    return round((uptime / total_minutes_in_month) * 100, 3)

print("SLA за месяц при 5 минутах простоя:", get_uptime_sla_percentage(), "%")
# -> 99.988% (Три девятки!)`,
          explanation: 'Внешние сервисы опрашивают /health/live раз в 60 секунд со всего мира и будят инженера по звонку при падении.',
        },
      ],
      terminal: {
        title: 'Проверка статуса здоровья через curl',
        description: 'Тестирование эндпоинта готовности /health/ready:',
        lessonCommands: {
          'curl http://localhost:8000/health/ready': {
            output: [
              '{"status":"ready","checks":{"database":"UP","redis":"UP"}}',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl http://localhost:8000/health/ready'],
        script: [
          { command: 'curl http://localhost:8000/health/ready' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице симулятор Healthcheck проверяет состояние сервисов. Запусти код!',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

services_state = {"db": True, "redis": True}

@app.get("/health/ready")
def health():
    checks = {
        "db": "UP" if services_state["db"] else "DOWN",
        "redis": "UP" if services_state["redis"] else "DOWN"
    }
    if not all(services_state.values()):
        raise HTTPException(status_code=503, detail=checks)
    return {"status": "HEALTHY", "checks": checks}

client = TestClient(app)

# 1. Все сервисы работают:
res1 = client.get("/health/ready")
print("1. Статус когда всё работает (200 OK):", res1.json())
assert res1.status_code == 200

# 2. Имитируем падение БД:
services_state["db"] = False
res2 = client.get("/health/ready")
print("2. Статус при падении базы данных (503):", res2.json())
assert res2.status_code == 503`,
      },
      tasks: [
        {
          title: 'Задание 1: восстановление базы данных',
          difficulty: 'easy',
          description: 'Установи services_state["db"] = True. Повтори запрос и убедись, что статус снова вернулся в 200 OK.',
          hints: ['services_state["db"] = True\nres = client.get("/health/ready")'],
        },
        {
          title: 'Задание 2: добавление проверки доступности стороннего API',
          difficulty: 'medium',
          description: 'Добавь в словарь checks проверку "payment_gateway": "UP". Если платёжный шлюз недоступен, возвращай статус 503.',
          hints: ['checks["payment_gateway"] = "UP" if is_gateway_online else "DOWN"'],
          solution: `def is_system_healthy(db_ok: bool, redis_ok: bool, api_ok: bool) -> int:
    return 200 if (db_ok and redis_ok and api_ok) else 503

assert is_system_healthy(True, True, True) == 200
assert is_system_healthy(True, True, False) == 503
print("✓ Проверка комплексного здоровья системы работает верно!")`,
        },
        {
          title: 'Задание 3: финальное внедрение полного мониторинга в проект портфолио',
          difficulty: 'hard',
          description: 'Возьми свой итоговый проект (Auth API или Shop API) и добавь: 1) Sentry SDK для перехвата 500 ошибок; 2) Эндпоинты /health/live и /health/ready; 3) Эндпоинт /metrics для сбора Prometheus метрик. Твой проект готов к любым промышленным нагрузкам!',
          hints: ['Поздравляем с завершением полного 31-модульного курса современного Backend-разработчика! 🎉'],
        },
      ],
      mistakes: [
        {
          wrong: 'Делать тяжелые медленные запросы внутри /health/live эндпоинта',
          right: '/health/live опрашивается каждые 10 секунд и должен отвечать за 1 миллисекунду. Тяжелые проверки БД выноси строго в /health/ready',
        },
        {
          wrong: 'Возвращать 200 OK в /health/ready, когда база данных PostgreSQL упала',
          right: 'Если база упала — эндпоинт ОБЯЗАН вернуть 503 Service Unavailable, чтобы балансировщик прекратил направлять запросы клиентов на сломанный инстанс',
        },
      ],
      checklist: [
        'Понимаю разницу между Liveness и Readiness проверками',
        'Умею создавать эндпоинты /health/live и /health/ready в FastAPI',
        'Знаю, почему при сбое зависимостей возвращается код 503 Service Unavailable',
        'Понимаю, как настроить HEALTHCHECK в Docker и внешних сервисах Uptime',
      ],
    },
  ],
};
