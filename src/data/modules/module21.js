export const module21 = {
  id: 'logging',
  order: 21,
  title: 'Логирование',
  icon: '📋',
  description: 'Профессиональное логирование: почему print() — зло, уровни DEBUG/INFO/ERROR, настройка в FastAPI и ротация логов.',
  lessons: [
    {
      id: 'why-logging-not-print',
      title: 'Почему print() — это зло в реальных проектах',
      summary: 'Чем бортовой журнал с уровнями важности лучше хаотичных принтов в консоль и как устроен модуль logging',
      theory: [
        {
          type: 'p',
          text: 'Когда новичок пишет свой первый код, он отлаживает всё вызовами: `print("тут работает")`, `print("x =", x)`, `print("111111")`. Но когда приложение уходит на реальный сервер в продакшен, где происходят 10 000 запросов в минуту — консоль превращается в неуправляемую кашу из бессмысленных строк. Непонятно, когда это произошло, в каком файле, критично это или нет, и как отфильтровать только настоящие ошибки.',
        },
        {
          type: 'analogy',
          text: 'Вызов print() — это как бессвязный крик в пустоту на шумной площади: ты выкрикнул слово "ОШИБКА!", но никто не знает, в какое точное время ты это сказал, насколько это опасно и кто именно виноват. ЛОГИРОВАНИЕ (Logging) — это ЧЁРНЫЙ ЯЩИК или БОРТОВОЙ ЖУРНАЛ корабля. Каждая запись содержит: точную дату и миллисекунду, имя модуля, уровень опасности (цветовую маркировку) и контекст происшествия.',
        },
        {
          type: 'list',
          title: '5 стандартных уровней важности логов (Severity Levels)',
          items: [
            '1. DEBUG (10): подробная отладочная информация для разработчика (значения переменных, сырые SQL-запросы). В проде отключается!',
            '2. INFO (20): подтверждение штатной работы системы ("Сервер запущен", "Пользователь user_42 успешно оформил заказ").',
            '3. WARNING (30): предупреждение о потенциальной проблеме, но программа продолжает работать ("Осталось мало места на диске", "Устаревший API метод").',
            '4. ERROR (40): ошибка при выполнении операции ("Не удалось провести оплату", "База данных вернула ошибку").',
            '5. CRITICAL (50): катастрофический сбой, приложение не может продолжать работу ("Кончилась память", "Невозможно прочитать конфиг").',
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Базовое использование стандартного модуля logging в Python',
          lang: 'python',
          code: `import logging

# Настройка формата логов с датой, уровнем и сообщением:
logging.basicConfig(
    level=logging.INFO,  # игнорировать DEBUG сообщения ниже уровня INFO
    format="%(asctime)s [%(levelname)s] (%(name)s): %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger("payment_service")

logger.debug("Сырые данные карты: token_abc123")   # НЕ напечатается, так как уровень INFO!
logger.info("Начата обработка платежа на 1500 руб") # 2026-09-02 14:00:00 [INFO] (payment_service): ...
logger.warning("Время ответа шлюза превысило 1.5с") # [WARNING] ...
logger.error("Платёж отклонён: недостаточно средств") # [ERROR] ...`,
          explanation: 'Уровень level=logging.INFO позволяет одной настройкой скрыть миллионы строк DEBUG-сообщений на продакшене.',
        },
        {
          title: 'Пример 2: Было (print) vs Стало (logger.exception)',
          lang: 'python',
          code: `import logging

logger = logging.getLogger("order_processor")

def process_order(order_id: int):
    try:
        result = 100 / 0  # ошибка
    except ZeroDivisionError:
        # ❌ БЫЛО:
        # print("Ошибка заказа", order_id)
        
        # ✅ СТАЛО (автоматически сохраняет полный стектрейс ошибки с номером строки!):
        logger.exception(f"Критический сбой при обработке заказа №{order_id}")`,
          explanation: 'Метод logger.exception() внутри блока except автоматически записывает полный стек вызовов ошибки (Traceback) в лог.',
        },
        {
          title: 'Пример 3: Логирование в JSON формате для систем аналитики (ELK / Grafana Loki)',
          lang: 'python',
          code: `import json
import time

def log_json_event(level: str, event_name: str, **kwargs):
    log_record = {
        "timestamp": time.time(),
        "level": level,
        "event": event_name,
        "payload": kwargs
    }
    # JSON-логи легко парсятся автоматическими системами сбора логов:
    return json.dumps(log_record)

print(log_json_event("INFO", "user_login", user_id=42, ip="192.168.1.1", success=True))`,
          explanation: 'В крупных компаниях логи выводятся в виде JSON-строк для автоматического анализа в Grafana и Elasticsearch.',
        },
      ],
      terminal: {
        title: 'Вывод логов с цветной маркировкой уровней',
        description: 'Посмотри, как логи отображаются в терминале сервера:',
        lessonCommands: {
          'python server.py': {
            output: [
              '2026-09-02 14:00:01 [INFO] (app): Server initialized on port 8000',
              '2026-09-02 14:00:03 [WARNING] (db): High connection pool usage (8/10)',
              '2026-09-02 14:00:05 [ERROR] (auth): Invalid token signature from IP 198.51.100.2',
            ],
            type: 'default',
          },
        },
        suggestions: ['python server.py'],
        script: [
          { command: 'python server.py' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор логгера фильтрует сообщения по уровню важности. Запусти код!',
        initialCode: `LEVELS = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40, "CRITICAL": 50}

class SimpleLogger:
    def __init__(self, name: str, min_level: str = "INFO"):
        self.name = name
        self.min_level_value = LEVELS[min_level]
        self.history = []

    def _log(self, level: str, msg: str):
        if LEVELS[level] >= self.min_level_value:
            entry = f"[{level}] ({self.name}): {msg}"
            self.history.append(entry)
            print(entry)

    def debug(self, msg): self._log("DEBUG", msg)
    def info(self, msg): self._log("INFO", msg)
    def warning(self, msg): self._log("WARNING", msg)
    def error(self, msg): self._log("ERROR", msg)

logger = SimpleLogger("FastAPI_Core", min_level="INFO")

logger.debug("Это отладочная информация (не должна появиться)")
logger.info("Пользователь #10 вошёл в систему")
logger.warning("Пароль пользователя устарел")
logger.error("База данных временно недоступна")

assert len(logger.history) == 3
print("\\n✓ Уровень INFO успешно отфильтровал лишний DEBUG спам!")`,
      },
      tasks: [
        {
          title: 'Задание 1: переключение уровня логов в режим DEBUG',
          difficulty: 'easy',
          description: 'Создай логгер dev_logger с min_level="DEBUG". Отправь все 4 типа сообщений и убедись, что сообщение debug теперь тоже отображается.',
          hints: ['dev_logger = SimpleLogger("DevApp", min_level="DEBUG")'],
        },
        {
          title: 'Задание 2: форматирование даты и времени в логах',
          difficulty: 'medium',
          description: 'Добавь в SimpleLogger вывод текущего времени time.strftime("%H:%M:%S"). Проверь, что в логе выводится "[14:00:00] [INFO] (FastAPI_Core): сообщение".',
          hints: ['entry = f"[{time.strftime(\'%H:%M:%S\')}] [{level}] ({self.name}): {msg}"'],
          solution: `import time

def format_entry(name: str, level: str, msg: str) -> str:
    t = time.strftime("%H:%M:%S")
    return f"[{t}] [{level}] ({name}): {msg}"

entry = format_entry("API", "INFO", "Запрос обработан")
print("Форматированная запись:", entry)
assert "[INFO]" in entry and "(API)" in entry`,
        },
        {
          title: 'Задание 3: аудит безопасности в логах',
          difficulty: 'hard',
          description: 'Объясни в комментарии: какую информацию КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать в логи (пароли пользователей, CVV-коды карт, секретные ключи JWT) и почему логирование чувствительных данных нарушает закон о персональных данных (152-ФЗ / GDPR).',
          hints: ['Логи доступны многим администраторам и могут быть скомпрометированы, поэтому конфиденциальные данные маскируют'],
        },
      ],
      mistakes: [
        {
          wrong: 'Оставлять print() в продакшен коде бэкенда',
          right: 'print() не имеет временных меток, не фильтруется по уровням и сильно замедляет синхронный ввод-вывод. Всегда используй logging.getLogger()',
        },
        {
          wrong: 'Логировать пароли пользователей в открытом виде: logger.info(f"Вход: {login}, {password}")',
          right: 'Никогда не логируй пароли, токены и платежные данные. Логируй только ID и статус операции: logger.info(f"Успешный вход пользователя ID={user.id}")',
        },
      ],
      checklist: [
        'Понимаю разницу между print() и профессиональным логированием',
        'Знаю 5 уровней важности: DEBUG, INFO, WARNING, ERROR, CRITICAL',
        'Умею настраивать формат логов (дата, имя логгера, уровень)',
        'Знаю правила безопасности при логировании (сокрытие паролей)',
      ],
    },

    {
      id: 'fastapi-logging-setup',
      title: 'Настройка модуля logging в FastAPI',
      summary: 'Как организовать красивое структурированное логирование запросов, времени ответа и ошибок в FastAPI приложении',
      theory: [
        {
          type: 'p',
          text: 'В реальном FastAPI проекте логирование настраивается на уровне Middleware (промежуточного слоя). Это позволяет автоматически логировать КАЖДЫЙ входящий HTTP-запрос, замерять время его выполнения в миллисекундах и фиксировать итоговый статус-код без добавления лишнего кода в каждый отдельный роут.',
        },
        {
          type: 'steps',
          title: 'Как настроить логирование запросов через Middleware',
          items: [
            { code: 'logger = logging.getLogger("api")', note: '1. Создаём именованный логгер для сервиса' },
            { code: '@app.middleware("http")', note: '2. Декоратор перехватывает все входящие HTTP-запросы' },
            { code: 'start_time = time.time()', note: '3. Засекаем точное время начала обработки' },
            { code: 'response = await call_next(request)', note: '4. Передаём запрос в роут FastAPI' },
            { code: 'logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration:.2f}ms)")', note: '5. Записываем аккуратную строчку в лог' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Готовый лог-middleware для FastAPI сервера',
          lang: 'python',
          code: `import time
import logging
from fastapi import FastAPI, Request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("http_access")

app = FastAPI()

@app.middleware("http")
async def log_http_requests(request: Request, call_next):
    start_time = time.time()
    
    # Обрабатываем запрос:
    response = await call_next(request)
    
    # Рассчитываем время в миллисекундах:
    duration_ms = (time.time() - start_time) * 1000
    
    # Логируем результат:
    log_msg = f"{request.method} {request.url.path} -> Status: {response.status_code} [{duration_ms:.1f}ms]"
    if response.status_code >= 400:
        logger.warning(log_msg)
    else:
        logger.info(log_msg)
        
    return response`,
          explanation: 'Этот middleware автоматически выводит информационную строчку для успешных запросов и предупреждение WARNING для кодов ошибок 4xx/5xx.',
        },
        {
          title: 'Пример 2: Использование логгера внутри бизнес-логики сервиса',
          lang: 'python',
          code: `logger = logging.getLogger("order_service")

def place_order(user_id: int, total_amount: float):
    logger.info(f"Пользователь {user_id} начал оформление заказа на сумму {total_amount} руб")
    
    if total_amount <= 0:
        logger.warning(f"Попытка создания заказа с некорректной суммой {total_amount} (user_id={user_id})")
        raise ValueError("Сумма заказа должна быть больше 0")
        
    # сохранение в БД...
    logger.info(f"Заказ успешно создан в БД (user_id={user_id})")
    return {"order_id": 42, "status": "created"}`,
          explanation: 'Логи внутри сервиса позволяют восстановить всю хронологию действий пользователя при возникновении спорных ситуаций.',
        },
        {
          title: 'Пример 3: Correlation ID (Trace ID) — сквозной идентификатор запроса',
          lang: 'python',
          code: `import uuid

# Каждому входящему запросу выдаётся уникальный ID:
def generate_trace_id() -> str:
    return str(uuid.uuid4())[:8]

# Лог с привязкой к запросу:
# 2026-09-02 [INFO] [req-a1b2c3d4] Начата обработка платежа
# 2026-09-02 [INFO] [req-a1b2c3d4] Запрос к банку отправлен
# 2026-09-02 [INFO] [req-a1b2c3d4] Платёж завершён успешно`,
          explanation: 'Correlation ID позволяет найти ВСЕ логи одного конкретного запроса среди миллиона чужих логов.',
        },
      ],
      terminal: {
        title: 'Проверка логов middleware в терминале Uvicorn',
        description: 'Посмотри на строчки доступа (Access Logs):',
        lessonCommands: {
          'curl http://localhost:8000/api/users': {
            output: [
              'INFO:     --> GET /api/users',
              'INFO:     <-- GET /api/users -> Status: 200 [14.2ms]',
            ],
            type: 'default',
          },
        },
        suggestions: ['curl http://localhost:8000/api/users'],
        script: [
          { command: 'curl http://localhost:8000/api/users' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице работает симулятор логов FastAPI с Correlation ID. Запусти код!',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
logs_history = []

def record_log(trace_id: str, level: str, msg: str):
    logs_history.append(f"[{trace_id}] [{level}] {msg}")

@app.get("/items/{item_id}")
def get_item(item_id: int):
    trace_id = "req-101"
    record_log(trace_id, "INFO", f"Запрос карточки товара #{item_id}")
    
    if item_id <= 0:
        record_log(trace_id, "WARN", f"Некорректный item_id={item_id}")
        raise HTTPException(400, "ID должен быть больше 0")
        
    return {"id": item_id, "title": "Учебник Python"}

client = TestClient(app)

client.get("/items/5")
client.get("/items/-1")

print("Зафиксированная хронология логов:")
for l in logs_history:
    print(" ->", l)

assert len(logs_history) == 3
print("\\n✓ Логи с контекстом запроса успешно сформированы!")`,
      },
      tasks: [
        {
          title: 'Задание 1: логирование времени выполнения',
          difficulty: 'easy',
          description: 'Добавь в функцию get_item расчёт времени duration_ms и логирование: record_log(trace_id, "INFO", f"Товар #{item_id} найден за {duration_ms}мс").',
          hints: ['start = time.time()\n# логика\nrecord_log(trace_id, "INFO", f"Завершено за {(time.time()-start)*1000:.1f}мс")'],
        },
        {
          title: 'Задание 2: генерация Trace ID через uuid',
          difficulty: 'medium',
          description: 'Используй модуль uuid для генерации случайного trace_id = uuid.uuid4().hex[:6] на каждый вызов эндпоинта. Проверь, что у разных запросов разные идентификаторы.',
          hints: ['import uuid\ntrace_id = f"req-{uuid.uuid4().hex[:6]}"'],
          solution: `import uuid

def make_trace_id() -> str:
    return f"trace-{uuid.uuid4().hex[:6]}"

id1 = make_trace_id()
id2 = make_trace_id()
assert id1 != id2
print("Сгенерированные Trace ID:", id1, id2)`,
        },
        {
          title: 'Задание 3: маскирование персональных данных в middleware',
          difficulty: 'hard',
          description: 'Напиши функцию-санитайзер sanitize_log_params(params: dict) -> dict, которая находит ключи "password", "token", "secret" и заменяет их значения на "[FILTERED]".',
          hints: ['return {k: ("[FILTERED]" if k.lower() in ("password", "token", "secret") else v) for k, v in params.items()}'],
        },
      ],
      mistakes: [
        {
          wrong: 'Создавать новый logging.basicConfig внутри функций роутов',
          right: 'basicConfig настраивается ОДИН раз при запуске приложения в main.py, а в файлах модулей вызывается logging.getLogger(__name__)',
        },
        {
          wrong: 'Использовать print() для отладки роутов во время разработки и забывать его удалять',
          right: 'Используй logger.debug() — на локальной машине он будет виден, а в продакшене автоматически скроется без необходимости чистить код',
        },
      ],
      checklist: [
        'Умею настраивать HTTP Middleware для автоматического логирования запросов',
        'Понимаю концепцию Correlation ID (Trace ID) для отслеживания запросов',
        'Знаю, как логировать ошибки со статусом 4xx и 5xx',
        'Умею использовать логгеры внутри сервисных слоёв приложения',
      ],
    },

    {
      id: 'file-logging-and-rotation',
      title: 'Логирование в файл и ротация логов',
      summary: 'Как сохранять логи на диск сервера, защитить его от переполнения с помощью RotatingFileHandler и структурировать логи',
      theory: [
        {
          type: 'p',
          text: 'Консольные логи исчезают при перезапуске сервера или закрытии терминала. Чтобы сохранить историю для расследования инцидентов, логи записывают в ФАЙЛЫ на диске (`app.log`, `errors.log`). Но если сервер работает 6 месяцев — размер одного файла вырастет до 100 Гигабайт и заполнит весь жёсткий диск сервера! Решение — РОТАЦИЯ ЛОГОВ (Log Rotation).',
        },
        {
          type: 'analogy',
          text: 'Ротация логов — это как архив бумажных папок в бухгалтерии. Ты не пишешь отчёты за 10 лет в одну гигантскую тетрадь толщиной с дом. Ты заводишь папку "Логи за понедельник". Когда она заполняется (достигает 10 Мегабайт) — ты закрываешь её, архивируешь (`app.log.1`) и начинаешь писать в свежую новую тетрадь. А самые старые папки старше 30 дней — автоматически отправляются в шредер (удаляются).',
        },
        {
          type: 'steps',
          title: 'Виды ротации логов в Python',
          items: [
            { code: 'RotatingFileHandler(maxBytes=10*1024*1024, backupCount=5)', note: 'Ротация по размеру: как только файл достигает 10 МБ, создаётся новый. Хранятся максимум 5 последних файлов' },
            { code: 'TimedRotatingFileHandler(when="midnight", backupCount=30)', note: 'Ротация по времени: каждый день в полночь создаётся новый лог-файл. Хранятся логи за последние 30 дней' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Настройка ротации логов по размеру файла через RotatingFileHandler',
          lang: 'python',
          code: `import logging
from logging.handlers import RotatingFileHandler

# Создаём обработчик для записи в файл:
file_handler = RotatingFileHandler(
    filename="app.log",
    maxBytes=5 * 1024 * 1024,  # максимальный размер файла: 5 Мегабайт
    backupCount=3,             # хранить максимум 3 старых архива (app.log.1, app.log.2, app.log.3)
    encoding="utf-8"
)

# Форматирование для файла:
formatter = logging.Formatter("%(asctime)s [%(levelname)s] (%(name)s): %(message)s")
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# Подключаем к корневому логгеру:
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(file_handler)

logger = logging.getLogger("production_app")
logger.info("Сервер успешно настроен с ротацией лог-файлов!")`,
          explanation: 'При достижении 5 МБ файл app.log переименовывается в app.log.1, а запись продолжается в чистый app.log.',
        },
        {
          title: 'Пример 2: Разделение логов: консоль + отдельный файл только для ERROR',
          lang: 'python',
          code: `import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("dual_logger")
logger.setLevel(logging.DEBUG)

# 1. Поток в консоль (всё от INFO и выше):
console_h = logging.StreamHandler()
console_h.setLevel(logging.INFO)

# 2. Файл только для критических ошибок (только ERROR и CRITICAL):
error_file_h = RotatingFileHandler("errors.log", maxBytes=10*1024*1024, backupCount=5)
error_file_h.setLevel(logging.ERROR)

logger.addHandler(console_h)
logger.addHandler(error_file_h)

logger.info("Обычное действие (только в консоли)")
logger.error("Критическая ошибка (запишется И в консоль, И в errors.log!)")`,
          explanation: 'Разделение потоков позволяет иметь отдельный чистый файл errors.log, где собраны исключительно ошибки.',
        },
        {
          title: 'Пример 3: Автоматический парсер и поиск ошибок в лог-файле',
          lang: 'python',
          code: `def find_errors_in_log(log_filepath: str) -> list[str]:
    """Сканирует файл логов и собирает все строки с ошибками"""
    errors_found = []
    # with open(log_filepath, "r", encoding="utf-8") as f:
    #     for line in f:
    #         if "[ERROR]" in line or "[CRITICAL]" in line:
    #             errors_found.append(line.strip())
    return errors_found`,
          explanation: 'Парсер логов позволяет автоматически слать алерты в Telegram при обнаружении критических записей.',
        },
      ],
      terminal: {
        title: 'Просмотр файлов архива ротации логов',
        description: 'Посмотри, как выглядят архивы ротации в каталоге сервера:',
        lessonCommands: {
          'ls -lh *.log*': {
            output: [
              '-rw-r--r-- 1 user user 1.2M Sep  2 14:00 app.log',
              '-rw-r--r-- 1 user user 5.0M Sep  2 12:00 app.log.1',
              '-rw-r--r-- 1 user user 5.0M Sep  2 10:00 app.log.2',
              '-rw-r--r-- 1 user user 320K Sep  2 14:00 errors.log',
            ],
            type: 'default',
          },
        },
        suggestions: ['ls -lh *.log*'],
        script: [
          { command: 'ls -lh *.log*' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор ротации файлов ограничивает объём хранимых записей. Запусти код!',
        initialCode: `class MockRotatingLogStorage:
    def __init__(self, max_records=3, backup_files=2):
        self.max_records = max_records
        self.backup_files = backup_files
        self.active_log = []
        self.backups = {}

    def log(self, msg: str):
        if len(self.active_log) >= self.max_records:
            # Ротация: сдвигаем архивы
            print(f"🔄 Лимит активного файла ({self.max_records} записей) превышен! Выполняем ротацию...")
            for i in range(self.backup_files, 1, -1):
                if f"app.log.{i-1}" in self.backups:
                    self.backups[f"app.log.{i}"] = self.backups[f"app.log.{i-1}"]
            self.backups["app.log.1"] = list(self.active_log)
            self.active_log = []
            
        self.active_log.append(msg)
        print(f"Записано в app.log: {msg}")

storage = MockRotatingLogStorage(max_records=3, backup_files=2)

for i in range(1, 8):
    storage.log(f"Событие #{i}")

print("\\nТекущее состояние файлов на диске:")
print(" -> app.log (активный):", storage.active_log)
for name, content in storage.backups.items():
    print(f" -> {name} (архив):", content)`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка лимита размера файла в байтах',
          difficulty: 'easy',
          description: 'Напиши функцию is_file_rotation_needed(current_bytes: int, max_bytes: int = 5*1024*1024) -> bool: возвращает True, если текущий размер файла превышает лимит.',
          hints: ['return current_bytes >= max_bytes'],
        },
        {
          title: 'Задание 2: очистка устаревших логов (Clean-up)',
          difficulty: 'medium',
          description: 'Напиши функцию clean_old_logs(file_list: list[str], max_keep: int = 3) -> list[str]: если список лог-файлов длиннее max_keep, возвращает список файлов, которые необходимо удалить.',
          hints: ['return file_list[max_keep:] if len(file_list) > max_keep else []'],
          solution: `def clean_old_logs(files: list[str], max_keep: int = 3) -> list[str]:
    # Сортируем от новых к старым и удаляем всё, что превышает max_keep
    if len(files) > max_keep:
        return files[max_keep:]
    return []

all_logs = ["app.log.1", "app.log.2", "app.log.3", "app.log.4", "app.log.5"]
to_delete = clean_old_logs(all_logs, max_keep=3)
print("Файлы для удаления с диска:", to_delete)
assert to_delete == ["app.log.4", "app.log.5"]`,
        },
        {
          title: 'Задание 3: логирование исключений с ротацией',
          difficulty: 'hard',
          description: 'Объясни, почему одновременная запись логов в один и тот же файл из 8 независимых процессов Uvicorn (workers) без блокировки может повредить файл логов, и почему для мульти-процессорных серверов логи выводят в stdout (консоль), а ротацию доверяют Docker/Logrotate на уровне ОС.',
          hints: ['Несколько процессов одновременно пишут в файл, перетирая байты друг друга (Race Condition / File Locking)'],
        },
      ],
      mistakes: [
        {
          wrong: 'Записывать логи в файл без ротации (RotatingFileHandler)',
          right: 'Рано или поздно файл без ротации вырастет до сотен гигабайт и парализует весь сервер из-за ошибки "No space left on device"',
        },
        {
          wrong: 'Хардкодить абсолютные пути к файлам логов (например, "C:\\Users\\User\\app.log")',
          right: 'Используй относительные пути или переменные окружения (например, os.getenv("LOG_DIR", "./logs")) для переносимости между Windows, Mac и Linux серверами',
        },
      ],
      checklist: [
        'Понимаю необходимость записи логов в постоянные файлы на диске',
        'Знаю, как работает ротация логов по размеру (RotatingFileHandler)',
        'Умею разделять потоки логов (консоль + отдельный файл errors.log)',
        'Знаю, как предотвратить переполнение диска сервера старыми логами',
      ],
    },
  ],
};
