export const module23 = {
  id: 'celery-redis-deep-dive',
  order: 23,
  title: 'Очереди задач: Celery и Redis',
  icon: '⚡',
  description: 'Фоновые задачи в бэкенде: архитектура очередей, брокер Redis, Celery воркеры, мониторинг и автоповторы.',
  lessons: [
    {
      id: 'why-task-queues-restaurant',
      title: 'Зачем нужны фоновые задачи: аналогия с чеком в ресторане',
      summary: 'Почему нельзя заставлять пользователя ждать отправки писем в HTTP-запросе и как очереди задач ускоряют API в 100 раз',
      theory: [
        {
          type: 'p',
          text: 'Представь типичный сценарий: пользователь регистрируется в твоём сервисе или нажимает "Оформить заказ". Твой сервер должен: записать пользователя в базу данных (10 мс), сгенерировать сложный PDF-чек на 100 страниц (4 секунды), сжать и обрезать аватарку (2 секунды) и отправить письмо с подтверждением через внешний SMTP-сервер (3 секунды). Если делать всё это прямо в теле HTTP-запроса — пользователь будет 10 секунд смотреть на зависший экран, а если почтовый сервер временно зависнет — весь заказ упадёт с ошибкой!',
        },
        {
          type: 'analogy',
          text: 'Представь ресторан быстрой еды (кафе). Кассир принимает твой заказ за 5 секунд, выдаёт чек с номерком (#42) и говорит: "Ваш заказ принят, присаживайтесь, мы принесём его, когда он будет готов!". Кассир НЕ бежит сам жарить мясо на кухню — он сразу готов обслужить следующего клиента. А на кухне работают отдельные повара (ВОРКЕРЫ CELERY), которые берут чеки из общей стопки заказов (ОЧЕРЕДЬ REDIS) и спокойно готовят блюда в фоновом режиме.',
        },
        {
          type: 'steps',
          title: 'Как устроена архитектура очередей задач',
          items: [
            { code: '1. Клиент делает POST /register', note: 'FastAPI быстро сохраняет запись в БД за 5 мс' },
            { code: '2. send_welcome_email.delay(user.id)', note: 'FastAPI упаковывает задачу в JSON, кладёт в очередь Redis и МГНОВЕННО возвращает ответ 201 Created клиенту' },
            { code: '3. Брокер сообщений (Redis)', note: 'Хранит список ожидающих задач в сверхбыстрой оперативной памяти' },
            { code: '4. Celery Worker (отдельный процесс)', note: 'Забирает задачу из очереди и спокойно отправляет письмо, не нагружая веб-сервер' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Было (тяжёлый синхронный роут) vs Стало (фоновая задача .delay)',
          lang: 'python',
          code: `import time
# ❌ БЫЛО (пользователь ждёт 5 секунд в браузере!):
# @app.post("/register")
# def register_slow(user: UserSchema):
#     save_to_db(user)
#     send_email_smtp(user.email)  # 5 секунд ожидания!
#     return {"status": "ok"}

# ✅ СТАЛО (ответ за 0.005 секунды!):
# @app.post("/register", status_code=201)
# def register_fast(user: UserSchema):
#     new_user = save_to_db(user)
#     # Ставим задачу в очередь и мгновенно отдаём ответ клиенту:
#     send_welcome_email_task.delay(new_user.id)
#     return {"status": "created", "user_id": new_user.id}`,
          explanation: 'Вызов .delay() передаёт параметры задачи в Redis и мгновенно возвращает управление дальше.',
        },
        {
          title: 'Пример 2: Сравнение времени ответа сервера (RPS Benchmark)',
          lang: 'python',
          code: `def simulate_request_flow(is_async_task: bool) -> float:
    db_save_time = 0.01   # 10 мс
    email_send_time = 3.0 # 3000 мс
    
    if not is_async_task:
        # Синхронная обработка
        return db_save_time + email_send_time  # 3.01 секунды
    else:
        # С фоновой очередью Celery
        queue_push_time = 0.002 # 2 мс
        return db_save_time + queue_push_time  # 0.012 секунды (в 250 раз быстрее!)

print(f"Синхронно: {simulate_request_flow(False):.3f}с")
print(f"С очередью: {simulate_request_flow(True):.3f}с")`,
          explanation: 'Перенос тяжёлых операций в фоновую очередь увеличивает пропускную способность сервера в сотни раз.',
        },
        {
          title: 'Пример 3: Какие операции ОБЯЗАТЕЛЬНО выносить в фон',
          lang: 'python',
          code: `HEAVY_BACKGROUND_TASKS = [
    "Отправка Email / SMS / Push-уведомлений",
    "Генерация PDF отчётов и выгрузка Excel таблиц",
    "Сжатие и конвертация картинок и видео (FFmpeg)",
    "Импорт прайс-листов из 500 000 строк",
    "Синхронизация остатков со складом через 1С",
    "Обучение и инференс ML-моделей"
]

for i, task in enumerate(HEAVY_BACKGROUND_TASKS, 1):
    print(f"{i}. [✓ Фоновая задача]: {task}")`,
          explanation: 'Любое действие, занимающее дольше ~200 миллисекунд или зависящее от сторонних сетевых сервисов, выносится в фоновую очередь.',
        },
      ],
      terminal: {
        title: 'Установка Celery и Redis для Python',
        description: 'Команда установки необходимых библиотек:',
        lessonCommands: {
          'pip install celery redis': {
            output: [
              'Collecting celery',
              '  Downloading celery-5.4.0-py3-none-any.whl (405 kB)',
              'Collecting redis',
              '  Downloading redis-5.2.1-py3-none-any.whl (261 kB)',
              'Successfully installed celery-5.4.0 redis-5.2.1',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install celery redis'],
        script: [
          { command: 'pip install celery redis' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор очереди фоновых задач моделирует работу кассира и воркера. Запусти код!',
        initialCode: `import time

class TaskQueueSimulator:
    def __init__(self):
        self.queue = []
        self.completed = []

    def delay(self, task_name: str, *args):
        task_id = f"task_{len(self.queue) + len(self.completed) + 1}"
        task_payload = {"id": task_id, "name": task_name, "args": args}
        self.queue.append(task_payload)
        print(f"⚡ [FastAPI]: Задача {task_id} ('{task_name}') мгновенно поставлена в очередь Redis!")
        return task_id

    def worker_process_next(self):
        if not self.queue:
            print("Кухня свободна: задач в очереди нет.")
            return
        task = self.queue.pop(0)
        print(f"👨‍🍳 [Celery Worker]: Начинаем выполнение задачи {task['id']} ({task['name']})...")
        time.sleep(0.05) # имитация тяжелой работы
        self.completed.append(task["id"])
        print(f"✓ [Celery Worker]: Задача {task['id']} успешно завершена в фоне!")

# Моделируем работу сервера:
broker = TaskQueueSimulator()

# Быстрый приём 3 заказов от клиентов:
t1 = broker.delay("send_welcome_email", "user_1@mail.ru")
t2 = broker.delay("generate_pdf_invoice", 42)

print("\\n--- Фоновый воркер разгребает задачи из очереди ---")
broker.worker_process_next()
broker.worker_process_next()`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь третью задачу в очередь',
          difficulty: 'easy',
          description: 'Поставь в очередь задачу "resize_avatar" с аргументом "avatar.png" через broker.delay() и обработай её воркером.',
          hints: ['broker.delay("resize_avatar", "avatar.png")\nbroker.worker_process_next()'],
        },
        {
          title: 'Задание 2: проверка оставшихся задач в очереди',
          difficulty: 'medium',
          description: 'Напиши метод get_queue_size(self) -> int, который возвращает текущую длину очереди. Убедись, что после добавления двух задач размер равен 2, а после одной обработки — 1.',
          hints: ['def get_queue_size(self): return len(self.queue)'],
          solution: `def get_queue_size(self) -> int:
    return len(self.queue)

TaskQueueSimulator.get_queue_size = get_queue_size
b = TaskQueueSimulator()
b.delay("task_1")
b.delay("task_2")
assert b.get_queue_size() == 2
b.worker_process_next()
assert b.get_queue_size() == 1
print("✓ Метод get_queue_size работает корректно!")`,
        },
        {
          title: 'Задание 3: горизонтальное масштабирование воркеров',
          difficulty: 'hard',
          description: 'Объясни в комментарии: если в очереди скопилось 50 000 неотправленных писем, почему мы можем просто запустить 10 параллельных процессов воркеров (Celery Workers) на разных серверах, и они будут разбирать одну и ту же общую очередь в 10 раз быстрее без конфликтов.',
          hints: ['Redis обеспечивает атомарную выдачу задач (BRPOP/BLPOP), поэтому одну задачу никогда не возьмут два воркера одновременно'],
        },
      ],
      mistakes: [
        {
          wrong: 'Передавать сложные ORM-объекты SQLAlchemy напрямую в аргументы task.delay(user_orm_model)',
          right: 'Аргументы задачи сериализуются в JSON в Redis. Передавай только простые типы: ID записи task.delay(user.id), а внутри воркера доставай свежие данные из базы по ID',
        },
        {
          wrong: 'Заставлять пользователя ждать отправки писем или генерации тяжелых файлов в синхронном роуте',
          right: 'Все операции, которые длятся дольше нескольких сотен миллисекунд, всегда выноси в фоновые задачи Celery',
        },
      ],
      checklist: [
        'Понимаю назначение фоновых задач и очередей (Celery + брокер Redis)',
        'Знаю разницу между прямым вызовом функции и неблокирующим .delay()',
        'Понимаю архитектуру: Сервер (FastAPI) -> Брокер (Redis) -> Воркер (Celery)',
        'Знаю, почему в задачи нужно передавать только ID сущностей',
      ],
    },

    {
      id: 'redis-broker-and-celery',
      title: 'Redis как брокер сообщений и настройка Celery в FastAPI',
      summary: 'Что такое Redis простыми словами, инициализация Celery, декоратор @task и запуск воркера в терминале',
      theory: [
        {
          type: 'p',
          text: 'Для работы Celery необходим БРОКЕР СООБЩЕНИЙ (Message Broker) — сверхбыстрое промежуточное хранилище, через которое FastAPI передаёт задачи воркерам. Самый популярный в мире брокер для Celery — это REDIS.',
        },
        {
          type: 'analogy',
          text: 'REDIS — это как доска со стикерами или ультра-быстрая записная книжка в оперативной памяти (RAM). Когда ты кладёшь туда задачу, Redis делает это за 0.0001 секунды, потому что не тратит время на медленный диск. А Celery Worker постоянно заглядывает на эту доску со стикерами: как только появился новый стикер — воркер срывает его и бежит выполнять!',
        },
        {
          type: 'steps',
          title: '3 шага настройки Celery в проекте',
          items: [
            { code: 'celery_app = Celery("tasks", broker="redis://localhost:6379/0")', note: '1. Инициализируем Celery и указываем URL брокера Redis' },
            { code: '@celery_app.task\ndef send_email(user_id: int):', note: '2. Декоратор @celery_app.task превращает обычную функцию в фоновую задачу' },
            { code: 'celery -A main.celery_app worker --loglevel=info', note: '3. В отдельном окне терминала запускаем процесс воркера' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полный рабочий код модуля tasks.py с Celery',
          lang: 'python',
          code: `import time
from celery import Celery

# Создаём приложение Celery с подключением к Redis:
celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"  # для сохранения результатов задач
)

@celery_app.task
def send_welcome_email(user_email: str, username: str):
    print(f"--> [Worker] Начинаем отправку приветственного письма для {user_email}...")
    time.sleep(3)  # имитация сетевой отправки письма через SMTP
    print(f"<-- [Worker] Письмо успешно доставлено {user_email}!")
    return f"Email sent to {username}"

@celery_app.task
def generate_monthly_report(user_id: int):
    print(f"--> [Worker] Генерация сложного PDF отчёта для пользователя {user_id}...")
    time.sleep(5)
    return f"report_user_{user_id}.pdf"`,
          explanation: 'Функции send_welcome_email и generate_monthly_report выполняются в отдельном процессе воркера.',
        },
        {
          title: 'Пример 2: Вызов фоновой задачи из роута FastAPI',
          lang: 'python',
          code: `from fastapi import FastAPI
# from tasks import send_welcome_email

app = FastAPI()

@app.post("/api/users/register")
def register_user(email: str, username: str):
    # 1. Сохраняем в БД:
    new_user_id = 42
    
    # 2. Ставим задачу в фоновую очередь Celery через .delay():
    # task = send_welcome_email.delay(email, username)
    
    # 3. Мгновенно отдаём ответ:
    return {
        "status": "success",
        "user_id": new_user_id,
        "message": "Пользователь создан, письмо отправляется в фоне!"
    }`,
          explanation: 'FastAPI завершает запрос за считанные миллисекунды, пока письмо отправляется в фоне.',
        },
        {
          title: 'Пример 3: Конфигурация Celery через словарь настроек',
          lang: 'python',
          code: `celery_config = {
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "timezone": "Europe/Moscow",
    "enable_utc": True,
    "task_track_started": True,  # отслеживать статус STARTED
    "task_time_limit": 300       # принудительно убить задачу, если она зависла дольше 5 минут
}

# celery_app.conf.update(celery_config)`,
          explanation: 'Параметр task_time_limit критически важен, чтобы зависшая задача не занимала воркер бесконечно.',
        },
      ],
      terminal: {
        title: 'Запуск воркера Celery в терминале',
        description: 'Посмотри, как выглядит запуск воркера Celery в отдельном терминале:',
        lessonCommands: {
          'celery -A tasks.celery_app worker --loglevel=info': {
            output: [
              ' -------------- celery@worker-node v5.4.0 (opalescent)',
              '--- ***** ----- ',
              '-- ******* ---- Linux-6.6.0-x86_64-with-glibc2.38 2026-09-02',
              '- *** --- * --- [config]',
              '- ** ---------- .> app:         worker:0x7f...',
              '- ** ---------- .> transport:   redis://localhost:6379/0',
              '- ** ---------- .> results:     redis://localhost:6379/1',
              '- *** --- * --- [queues]',
              '-- ******* ---- .> celery           exchange=celery(direct) key=celery',
              '',
              '[tasks]',
              '  . tasks.send_welcome_email',
              '  . tasks.generate_monthly_report',
              '',
              '[INFO/MainProcess] Connected to redis://localhost:6379/0',
              '[INFO/MainProcess] celery@worker-node ready.',
            ],
            type: 'success',
          },
        },
        suggestions: ['celery -A tasks.celery_app worker --loglevel=info'],
        script: [
          { command: 'celery -A tasks.celery_app worker --loglevel=info' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор Celery декорирует функцию и выполняет её в фоновом пайплайне. Запусти код!',
        initialCode: `import time

class MockCeleryApp:
    def __init__(self, broker_url):
        self.broker = broker_url
        self.registered_tasks = {}

    def task(self, func):
        def delay(*args, **kwargs):
            task_id = f"celery-uid-{func.__name__}-{int(time.time()*1000)%10000}"
            print(f"📤 [BROKER {self.broker}]: Задача {func.__name__} поставлена в очередь (ID: {task_id})")
            return MockAsyncResult(task_id, func, args, kwargs)
        
        func.delay = delay
        self.registered_tasks[func.__name__] = func
        return func

class MockAsyncResult:
    def __init__(self, task_id, func, args, kwargs):
        self.id = task_id
        self._func = func
        self._args = args
        self._kwargs = kwargs

    def execute_in_worker(self):
        print(f"⚙️ [WORKER]: Выполняем задачу {self.id}...")
        res = self._func(*self._args, **self._kwargs)
        print(f"✓ [WORKER]: Результат задачи {self.id}: {res}")
        return res

app = MockCeleryApp("redis://localhost:6379/0")

@app.task
def send_sms_alert(phone: str, text: str):
    return f"SMS '{text}' отправлено на {phone}"

# Имитируем вызов из FastAPI роута:
task_handle = send_sms_alert.delay("+79991234567", "Ваш код: 7788")

# Имитируем выполнение воркером:
task_handle.execute_in_worker()`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь вторую фоновую задачу',
          difficulty: 'easy',
          description: 'Оберни функцию def export_csv(user_id: int): return f"export_{user_id}.csv" декоратором @app.task. Вызови её через export_csv.delay(10) и выполни воркером.',
          hints: ['@app.task\ndef export_csv(user_id):\n    return f"export_{user_id}.csv"'],
        },
        {
          title: 'Задание 2: валидатор строки подключения к Redis',
          difficulty: 'medium',
          description: 'Напиши функцию is_valid_redis_url(url: str) -> bool: проверяет, что URL начинается с "redis://" или "rediss://" (SSL) и содержит указание порта (например, ":6379").',
          hints: ['return url.startswith(("redis://", "rediss://")) and ":6379" in url'],
          solution: `def is_valid_redis_url(url: str) -> bool:
    return url.startswith(("redis://", "rediss://")) and ":6379" in url

assert is_valid_redis_url("redis://localhost:6379/0") is True
assert is_valid_redis_url("http://localhost:8000") is False
print("✓ Валидатор Redis URL работает верно!")`,
        },
        {
          title: 'Задание 3: отдельная база данных Redis для результатов (Backend vs Broker)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему в строках подключения к Redis часто указывают /0 для брокера (redis://localhost:6379/0) и /1 для хранения результатов (redis://localhost:6379/1). Что означают эти цифры баз данных в Redis?',
          hints: ['В Redis по умолчанию доступно 16 изолированных баз данных с индексами от 0 до 15'],
        },
      ],
      mistakes: [
        {
          wrong: 'Забыть запустить воркер Celery в терминале',
          right: 'Если запустить только FastAPI, задачи будут копиться в Redis, но никто их не выполнит. Воркер Celery обязательно должен быть запущен параллельно',
        },
        {
          wrong: 'Импортировать тяжелые модели или зависимости прямо в глобальную область видимости задач без необходимости',
          right: 'Структурируй задачи в отдельном модуле tasks.py для чистого разделения слоёв ответственности',
        },
      ],
      checklist: [
        'Понимаю роль Redis как брокера сообщений для Celery',
        'Умею объявлять задачи через декоратор @celery_app.task',
        'Умею ставить задачи в очередь через вызов .delay()',
        'Знаю команду запуска воркера Celery в терминале',
      ],
    },

    {
      id: 'task-monitoring-and-retries',
      title: 'Мониторинг задач, обработка сбоев и периодические задачи',
      summary: 'Как отслеживать статус задач через AsyncResult, настраивать автоповторы (retry) при сбоях и запускать задачи по расписанию',
      theory: [
        {
          type: 'p',
          text: 'Фоновые задачи выполняются асинхронно в отдельном процессе. Как клиент в браузере может узнать: "Мой PDF-отчёт уже готов или ещё генерируется?". И что делать, если во время отправки SMS упал внешний провайдер? Разберём получение статуса через AsyncResult и автоповторы при сбоях.',
        },
        {
          type: 'steps',
          title: 'Жизненный цикл статусов задачи (Task States)',
          items: [
            { code: 'PENDING', note: '1. Задача ожидает в очереди Redis (воркер ещё не взял её)' },
            { code: 'STARTED', note: '2. Воркер взял задачу в работу и выполняет её прямо сейчас' },
            { code: 'SUCCESS', note: '3. Задача успешно выполнена, результат сохранён' },
            { code: 'FAILURE / RETRY', note: '4. Произошла ошибка (или задача поставлена на повтор через 10 секунд)' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Автоповторы при сбоях: autoretry_for',
          text: 'Декоратор Celery умеет автоматически повторять задачу при возникновении сетевых ошибок: @celery_app.task(autoretry_for=(ConnectionError,), retry_backoff=5, max_retries=3). Если сторонний сервис упал — Celery повторит попытку через 5 секунд, затем через 10, затем через 20 секунд!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Эндпоинт проверки статуса задачи в FastAPI',
          lang: 'python',
          code: `from fastapi import FastAPI
from celery.result import AsyncResult
# from tasks import celery_app

app = FastAPI()

@app.get("/api/tasks/{task_id}")
def get_task_status(task_id: str):
    # Получаем объект результата по ID задачи:
    # result = AsyncResult(task_id, app=celery_app)
    
    # Имитация ответа:
    return {
        "task_id": task_id,
        "status": "SUCCESS",       # PENDING, STARTED, SUCCESS, FAILURE
        "ready": True,             # выполнена ли задача
        "result": "report_42.pdf"  # возвращаемое значение функции
    }`,
          explanation: 'Фронтенд может опрашивать эндпоинт /api/tasks/{task_id} раз в 2 секунды (поллинг) до тех пор, пока ready не станет True.',
        },
        {
          title: 'Пример 2: Задача с автоматическим повтором при ошибках (Retry Pattern)',
          lang: 'python',
          code: `from celery import Celery
import requests

celery_app = Celery("tasks", broker="redis://localhost:6379/0")

@celery_app.task(
    bind=True,
    autoretry_for=(requests.RequestException, ConnectionError),
    retry_backoff=True,     # экспоненциальное увеличение задержки (1с, 2с, 4с...)
    retry_kwargs={'max_retries': 5}
)
def send_webhook_notification(self, target_url: str, event_data: dict):
    print(f"Попытка #{self.request.retries + 1} отправки вебхука на {target_url}...")
    response = requests.post(target_url, json=event_data, timeout=5)
    response.raise_for_status()
    return {"delivered": True}`,
          explanation: 'Параметр retry_backoff=True защищает от спама запросами к временно недоступному сервису.',
        },
        {
          title: 'Пример 3: Периодические задачи по расписанию (Celery Beat / Cron)',
          lang: 'python',
          code: `from celery.schedules import crontab

# Настройка планировщика периодических задач (Celery Beat):
celery_app.conf.beat_schedule = {
    # Запуск каждую ночь в 03:00:
    "cleanup-old-sessions-every-night": {
        "task": "tasks.cleanup_expired_tokens",
        "schedule": crontab(hour=3, minute=0),
    },
    # Запуск каждые 10 минут:
    "sync-currency-rates-every-10-mins": {
        "task": "tasks.update_exchange_rates",
        "schedule": 600.0,  # каждые 600 секунд
    },
}`,
          explanation: 'Celery Beat заменяет системный Linux cron, позволяя запускать задачи по расписанию на чистом Python.',
        },
      ],
      terminal: {
        title: 'Мониторинг задач Celery через веб-дашборд Flower',
        description: 'Flower — официальный веб-интерфейс реального времени для мониторинга Celery:',
        lessonCommands: {
          'celery -A tasks.celery_app flower --port=5555': {
            output: [
              '[I 2026-09-02 14:00:00 server:182] Visit me at http://localhost:5555',
              '[I 2026-09-02 14:00:00 server:183] Broker: redis://localhost:6379/0',
              '[I 2026-09-02 14:00:00 events:124] Connected to broker',
            ],
            type: 'success',
          },
        },
        suggestions: ['celery -A tasks.celery_app flower --port=5555'],
        script: [
          { command: 'celery -A tasks.celery_app flower --port=5555' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор отслеживания статусов фоновых задач. Запусти код!',
        initialCode: `class MockTaskResultTracker:
    def __init__(self):
        self.tasks = {}

    def create_task(self, name: str) -> str:
        tid = f"task-uuid-{len(self.tasks)+1}"
        self.tasks[tid] = {"status": "PENDING", "result": None}
        return tid

    def set_started(self, tid: str):
        self.tasks[tid]["status"] = "STARTED"

    def set_success(self, tid: str, result_data):
        self.tasks[tid]["status"] = "SUCCESS"
        self.tasks[tid]["result"] = result_data

    def get_status(self, tid: str) -> dict:
        info = self.tasks.get(tid, {"status": "UNKNOWN", "result": None})
        return {
            "task_id": tid,
            "status": info["status"],
            "is_ready": info["status"] in ("SUCCESS", "FAILURE"),
            "result": info["result"]
        }

tracker = MockTaskResultTracker()
tid = tracker.create_task("generate_excel_export")

print("1. Сразу после создания:", tracker.get_status(tid))

tracker.set_started(tid)
print("2. В процессе работы:", tracker.get_status(tid))

tracker.set_success(tid, "https://storage.cloud/exports/users_2026.xlsx")
print("3. После завершения:", tracker.get_status(tid))`,
      },
      tasks: [
        {
          title: 'Задание 1: обработка статуса FAILURE',
          difficulty: 'easy',
          description: 'Добавь в MockTaskResultTracker метод set_failure(self, tid: str, error_msg: str). Проверь, что get_status(tid) возвращает is_ready == True и status == "FAILURE".',
          hints: ['self.tasks[tid]["status"] = "FAILURE"\nself.tasks[tid]["result"] = error_msg'],
        },
        {
          title: 'Задание 2: симулятор поллинга (опроса статуса)',
          difficulty: 'medium',
          description: 'Напиши функцию poll_until_ready(tracker, tid, max_attempts=5): в цикле опрашивает get_status(tid). Если is_ready==True — возвращает результат, иначе ждёт и пробует снова.',
          hints: ['for _ in range(max_attempts):\n    st = tracker.get_status(tid)\n    if st["is_ready"]: return st["result"]'],
          solution: `def poll_until_ready(tracker, tid: str):
    for attempt in range(5):
        st = tracker.get_status(tid)
        if st["is_ready"]:
            return st["result"]
    return None

res = poll_until_ready(tracker, tid)
assert res == "https://storage.cloud/exports/users_2026.xlsx"
print("✓ Поллинг успешно получил готовый результат задачи:", res)`,
        },
        {
          title: 'Задание 3: практическое внедрение фоновой задачи',
          difficulty: 'hard',
          description: 'Возьми свой проект Auth API (проект 3): добавь фоновую задачу Celery send_welcome_email.delay(user.email), которая срабатывает при успешной регистрации пользователя.',
          hints: ['Поздравляем! Твой бэкенд использует полноценную асинхронную архитектуру очередей промышленного уровня!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Опрашивать статус задачи 100 раз в секунду без пауз в бесконечном цикле while True',
          right: 'Фронтенд должен опрашивать статус с разумным интервалом (раз в 1-2 секунды), чтобы не создавать бесполезную нагрузку на сервер',
        },
        {
          wrong: 'Не настраивать max_retries для задач, обращающихся к внешним API',
          right: 'Без ограничения max_retries упавшая задача может бесконечно забивать очередь повторными попытками при перманентной смерти внешнего сервиса',
        },
      ],
      checklist: [
        'Понимаю жизненный цикл статусов задач: PENDING -> STARTED -> SUCCESS / FAILURE',
        'Умею проверять результат задачи через AsyncResult',
        'Знаю, как настраивать автоповторы (autoretry_for, retry_backoff)',
        'Знаю назначение Celery Beat для запуска периодических задач по расписанию',
      ],
    },
  ],
};
