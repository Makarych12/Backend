export const module14 = {
  id: 'advanced',
  order: 14,
  title: 'Продвинутый backend',
  icon: '🧠',
  description: 'Очереди задач (Celery/Redis), кэширование и WebSockets в FastAPI.',
  lessons: [
    {
      id: 'background-tasks-celery',
      title: 'Очереди задач: Celery и Redis',
      summary: 'Зачем откладывать тяжёлую работу «на потом» и как не заставлять пользователя ждать в HTTP-запросе',
      theory: [
        {
          type: 'p',
          text: 'Представь, что пользователь нажимает кнопку "Зарегистрироваться" или "Оформить заказ". Твой сервер должен сохранить пользователя в базу, сгенерировать сложный PDF-документ на 50 страниц, отправить письмо с подтверждением через внешний SMTP-сервер и сжать аватарку. Если делать всё это прямо внутри одного HTTP-запроса — пользователь будет смотреть на крутящийся спиннер 10-15 секунд! А если почтовый сервис временно зависнет — весь запрос упадёт с ошибкой.',
        },
        {
          type: 'analogy',
          text: 'Представь ресторан быстрой еды (кафе). Кассир принимает твой заказ за 5 секунд, выдаёт тебе чек с номерком и говорит: "Ваш заказ №42 принят, присаживайтесь, мы позовём вас, когда он будет готов!". Кассир не бежит сам жарить бургеры — он сразу принимает заказ у следующего человека. А на кухне работают отдельные сотрудники (воркеры Celery), которые берут заказы из очереди (Redis) и готовят их.',
        },
        {
          type: 'steps',
          title: 'Как устроена очередь задач Celery',
          items: [
            { code: '1. Клиент делает POST /register', note: 'FastAPI быстро создаёт пользователя в БД за 10 миллисекунд' },
            { code: '2. send_welcome_email.delay(user.id)', note: 'FastAPI отправляет задачу в очередь (Redis) и МГНОВЕННО возвращает ответ 201 клиенту' },
            { code: '3. Брокер сообщений (Redis)', note: 'Хранит список ожидающих задач в памяти' },
            { code: '4. Celery Worker (отдельный процесс)', note: 'Забирает задачу из очереди и спокойно отправляет письмо в фоне, не нагружая веб-сервер' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Что такое .delay() в Celery?',
          text: 'Вызов функции send_email() выполнит её прямо здесь и сейчас, заблокировав выполнение. Вызов send_email.delay() упакует аргументы в JSON, положит в очередь Redis и мгновенно вернёт управление дальше.',
        },
      ],
      example: {
        title: 'Объявление и постановка задачи в Celery',
        lang: 'python',
        code: `from celery import Celery
import time

# Инициализация Celery с брокером Redis:
celery_app = Celery('tasks', broker='redis://localhost:6379/0')

# Декоратор @celery_app.task превращает функцию в фоновую задачу:
@celery_app.task
def generate_pdf_report(user_id: int):
    print(f"[Worker] Начинаем генерацию отчёта для пользователя {user_id}...")
    time.sleep(5)  # долгая генерация PDF
    print(f"[Worker] Отчёт готов и отправлен!")
    return f"report_{user_id}.pdf"

# В коде FastAPI роута:
# @app.post("/reports")
# def create_report(user_id: int):
#     # Ставим задачу в очередь и мгновенно отдаём 202 Accepted:
#     task = generate_pdf_report.delay(user_id)
#     return {"status": "processing", "task_id": task.id}`,
        explanation: 'FastAPI отдаёт ответ за 5 миллисекунд, а тяжёлая 5-секундная генерация PDF происходит в отдельном процессе воркера.',
      },
      terminal: {
        title: 'Установка и запуск воркера Celery',
        description: 'В реальном проекте Celery запускается как отдельный параллельный процесс в терминале:',
        lessonCommands: {
          'celery -A main.celery_app worker --loglevel=info': {
            output: [
              ' -------------- celery@worker-node v5.4.0 (opalescent)',
              '--- ***** ----- ',
              '-- ******* ---- Linux-6.6.0-x86_64-with-glibc2.38 2026-09-02',
              '- *** --- * --- ',
              '- ** ---------- [config]',
              '- ** ---------- .> app:         tasks:0x7f...',
              '- ** ---------- .> transport:   redis://localhost:6379/0',
              '- ** ---------- .> results:     disabled://',
              '- *** --- * --- [queues]',
              '-- ******* ---- .> celery           exchange=celery(direct) key=celery',
              '',
              '[tasks]',
              '  . tasks.generate_pdf_report',
              '',
              '[INFO/MainProcess] Connected to redis://localhost:6379/0',
              '[INFO/MainProcess] celery@worker-node ready.',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install celery redis', 'celery -A main.celery_app worker --loglevel=info'],
        script: [
          { command: 'pip install celery redis' },
          { command: 'celery -A main.celery_app worker --loglevel=info' },
        ],
      },
      tasks: [
        {
          title: 'Задание 1: какие задачи нужно выносить в Celery',
          difficulty: 'easy',
          description: 'Из предложенного списка выбери задачи, которые ОБЯЗАТЕЛЬНО нужно выносить в фоновую очередь Celery, а не делать в синхронном роуте: 1) Получение профиля пользователя по ID; 2) Отправка SMS с кодом подтверждения; 3) Экспорт 1 000 000 строк из БД в Excel файл; 4) Проверка валидности email через Pydantic.',
          hints: ['Долгие внешние операции (SMS через сеть, генерация тяжелых Excel файлов) выносятся в фон. Быстрые проверки делаются прямо в роуте.'],
        },
        {
          title: 'Задание 2: статус выполнения задачи',
          difficulty: 'medium',
          description: 'Когда мы ставим задачу через task = my_func.delay(), Celery возвращает уникальный task.id (UUID). Опиши, как клиент может проверять готовность отчёта (поллинг эндпоинта @app.get("/tasks/{task_id}")).',
          hints: ['AsyncResult(task_id).status возвращает PENDING, STARTED, SUCCESS или FAILURE'],
          solution: `# Эндпоинт проверки статуса:
# @app.get("/tasks/{task_id}")
# def get_status(task_id: str):
#     result = AsyncResult(task_id, app=celery_app)
#     return {"task_id": task_id, "status": result.status, "result": result.result if result.ready() else None}`,
        },
        {
          title: 'Задание 3: периодические задачи (Celery Beat)',
          difficulty: 'hard',
          description: 'Celery умеет запускать задачи по расписанию (как cron). Приведи 2 примера задач в бэкенд-проекте, которые должны выполняться автоматически каждую ночь.',
          hints: ['Примеры: удаление устаревших сессий/токенов, расчёт суточной аналитики, отправка дайджеста новостей'],
        },
      ],
      mistakes: [
        {
          wrong: 'Передавать сложные объекты SQLAlchemy моделей напрямую в аргументы task.delay(user_model)',
          right: 'Аргументы задачи сериализуются в JSON для передачи в Redis. Передавай только простые типы: ID записи (task.delay(user.id)), а внутри воркера доставай свежие данные из базы по ID',
        },
        {
          wrong: 'Заставлять пользователя ждать отправки писем и генерации файлов прямо в HTTP-запросе',
          right: 'Все операции дольше ~200 миллисекунд или зависящие от внешних сервисов следует отправлять в фоновую очередь задач',
        },
      ],
      checklist: [
        'Понимаю назначение очередей фоновых задач (Celery + брокер Redis)',
        'Знаю разницу между прямым вызовом функции и вызовом через .delay()',
        'Понимаю архитектуру: Веб-сервер -> Брокер сообщений -> Воркеры',
        'Знаю, почему в задачи нужно передавать только ID сущностей, а не целые ORM-объекты',
      ],
    },

    {
      id: 'caching-redis',
      title: 'Кэширование с Redis',
      summary: 'Как ускорить повторные запросы в 100 раз с помощью кэша в оперативной памяти и что такое TTL',
      theory: [
        {
          type: 'p',
          text: 'Представь главную страницу крупного интернет-магазина или топ-10 популярных статей. Этот список запрашивают 10 000 пользователей в минуту. Если на каждый запрос выполнять тяжёлый SQL-запрос с объединением 5 таблиц — база данных быстро перегреется и ляжет. Но ведь список товаров меняется не каждую секунду! Зачем считать один и тот же результат 10 000 раз?',
        },
        {
          type: 'analogy',
          text: 'Кэширование — это как шпаргалка или стикер с ответом на мониторе. Если тебя каждый день по 100 раз спрашивают: "Сколько будет 487 × 693?", ты не перемножаешь числа в столбик каждый раз заново на листочке. Ты один раз посчитал ответ (337 491), записал на стикер (в кэш) и при каждом следующем вопросе мгновенно считываешь готовый ответ за полсекунды!',
        },
        {
          type: 'list',
          title: 'Ключевые понятия кэширования',
          items: [
            'Кэш (Cache): сверхбыстрое хранилище в оперативной памяти (RAM) по принципу КЛЮЧ-ЗНАЧЕНИЕ. Самый популярный в мире кэш-сервер — REDIS.',
            'Cache Hit (попадание в кэш): данные нашлись в памяти — мгновенный ответ клиенту за 0.5 миллисекунды без обращения к медленной базе данных на диске.',
            'Cache Miss (промах кэша): данных в памяти ещё нет (первый запрос) — достаём из БД, сохраняем копию в Redis и отдаём клиенту.',
            'TTL (Time To Live — время жизни): срок, через который запись в кэше автоматически удаляется (например, через 60 секунд), чтобы данные не устаревали навсегда.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Инвалидация кэша — «самая сложная задача в IT»',
          text: 'В программировании есть знаменитая шутка: "Есть только две сложные вещи: инвалидация кэша и придумывание названий переменных". Если админ изменил цену товара в базе данных, а в кэше старая цена будет висеть ещё час — покупатели увидят неверную цену. Инвалидация кэша — это своевременное принудительное удаление старого значения из Redis при обновлении данных.',
        },
      ],
      example: {
        title: 'Паттерн Cache-Aside (чтение с кэшированием в Redis)',
        lang: 'python',
        code: `import json
# Имитация работы с клиентом Redis:
# import redis
# r = redis.Redis(host='localhost', port=6379, db=0)

fake_redis_cache = {}

def get_top_products_with_cache():
    cache_key = "catalog:top_products"
    
    # 1. Сначала проверяем кэш (Cache Hit):
    if cache_key in fake_redis_cache:
        print("⚡ Cache Hit! Данные моментально взяты из оперативной памяти Redis")
        return json.loads(fake_redis_cache[cache_key])
    
    # 2. Если в кэше нет (Cache Miss) — делаем тяжёлый запрос к БД:
    print("🐢 Cache Miss. Выполняем тяжёлый SQL-запрос к базе данных...")
    data_from_db = [{"id": 1, "name": "iPhone 16", "price": 99990}]
    
    # 3. Сохраняем в кэш с временем жизни (например, 60 секунд):
    fake_redis_cache[cache_key] = json.dumps(data_from_db)
    return data_from_db`,
        explanation: 'Первый пользователь подождёт 100 мс (запрос к БД), а все следующие 10 000 пользователей получат ответ из Redis за 1 мс.',
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирован паттерн Cache-Aside. Запусти код и посмотри разницу во времени между первым и вторым вызовом!',
        initialCode: `import time
import json

redis_memory = {}

def heavy_database_query():
    # Имитация тяжелого запроса к БД
    time.sleep(0.1)
    return [{"id": 1, "title": "Ноутбук Pro", "rating": 4.9}]

def get_products():
    key = "products:popular"
    
    # Шаг 1: Проверяем память
    if key in redis_memory:
        return {"source": "REDIS_CACHE", "data": json.loads(redis_memory[key])}
    
    # Шаг 2: Промах — идём в базу данных
    data = heavy_database_query()
    
    # Шаг 3: Сохраняем в Redis
    redis_memory[key] = json.dumps(data)
    return {"source": "DATABASE", "data": data}

# Запрос 1 (Cache Miss):
t0 = time.time()
res1 = get_products()
print(f"1-й запрос: источник={res1['source']}, время={time.time()-t0:.3f}с")

# Запрос 2 (Cache Hit):
t0 = time.time()
res2 = get_products()
print(f"2-й запрос: источник={res2['source']}, время={time.time()-t0:.3f}с")`,
      },
      tasks: [
        {
          title: 'Задание 1: инвалидация кэша при обновлении',
          difficulty: 'easy',
          description: 'Напиши функцию update_product_price(product_id: int, new_price: float), которая обновляет товар и удаляет ключ "products:popular" из словаря redis_memory (инвалидирует кэш). Убедись, что следующий вызов get_products() снова идёт в БД.',
          hints: ['redis_memory.pop("products:popular", None)'],
        },
        {
          title: 'Задание 2: имитация TTL (времени жизни)',
          difficulty: 'medium',
          description: 'Добавь словарь redis_ttl = {}. При сохранении в кэш записывай время экспирации expire_at = time.time() + ttl. В get_products проверяй: если текущее время time.time() > expire_at — считай, что запись протухла, и удаляй её.',
          hints: ['if key in redis_memory and time.time() < redis_ttl.get(key, 0): ...'],
          solution: `redis_ttl = {}

def set_with_ttl(key: str, value: str, ttl_seconds: float):
    redis_memory[key] = value
    redis_ttl[key] = time.time() + ttl_seconds

def get_with_ttl(key: str):
    if key in redis_memory:
        if time.time() < redis_ttl.get(key, 0):
            return redis_memory[key]
        del redis_memory[key] # протухло!
    return None

set_with_ttl("test_key", "123", ttl_seconds=1.0)
print("Сразу после записи:", get_with_ttl("test_key"))`,
        },
        {
          title: 'Задание 3: опасность «кэш-лавины» (Cache Avalanche)',
          difficulty: 'hard',
          description: 'Что произойдёт, если у 1 000 000 ключей в кэше будет выставлен абсолютно одинаковый TTL ровно 60 секунд, и в секунду 60 они ВСЕ одновременно исчезнут под нагрузкой 50 000 RPS? Как добавление случайного разброса (jitter: ttl = 60 + random(1, 10)) спасает базу данных от падения?',
          hints: ['Одновременное истечение всех ключей перенаправит всю лавину запросов в базу данных, перегрузив её (Cache Stampede/Avalanche)'],
        },
      ],
      mistakes: [
        {
          wrong: 'Кэшировать абсолютно всё без разбора (включая личные профили пользователей с частыми изменениями)',
          right: 'Кэшируют то, что часто читается и редко меняется (каталоги, справочники, списки популярных товаров). Личные динамические данные обычно не кэшируют глобально',
        },
        {
          wrong: 'Забыть указать TTL или инвалидацию при создании записи в Redis',
          right: 'Без TTL кэш превратится в вечное хранилище устаревших данных, а оперативная память сервера переполнится',
        },
      ],
      checklist: [
        'Понимаю разницу между хранением в оперативной памяти (Redis) и на диске (БД)',
        'Знаю понятия Cache Hit и Cache Miss',
        'Понимаю назначение TTL (Time To Live)',
        'Знаю, что такое инвалидация кэша и почему она важна',
      ],
    },

    {
      id: 'websockets-fastapi',
      title: 'WebSockets в FastAPI: живая двусторонняя связь',
      summary: 'Как создать постоянное соединение между клиентом и сервером для чатов, уведомлений и игр в реальном времени',
      theory: [
        {
          type: 'p',
          text: 'До сих пор все наши запросы работали по классической схеме HTTP: клиент спросил -> сервер ответил -> соединение разорвано (Request-Response). Но что делать, если ты пишешь онлайн-чат, биржевой терминал с котировками или мультиплеерную игру? Сервер должен САМ присылать новые сообщения клиенту в ту же миллисекунду, как они появились, без постоянных повторных вопросов от браузера!',
        },
        {
          type: 'analogy',
          text: 'Обычный HTTP — это как отправка бумажных писем или SMS: ты отправил вопрос, дождался ответа и повесил трубку. Если новостей нет — чтобы узнать, не появилось ли что-то новое, тебе нужно снова и снова отправлять письма (поллинг). WebSockets — это как НАСТОЯЩИЙ ТЕЛЕФОННЫЙ РАЗГОВОР: вы один раз сняли трубку, установили постоянную связь и можете непрерывно говорить и слушать друг друга одновременно в обе стороны!',
        },
        {
          type: 'steps',
          title: 'Как работают WebSockets в FastAPI',
          items: [
            { code: '@app.websocket("/ws")', note: '1. Декоратор объявляет эндпоинт WebSocket вместо обычного HTTP' },
            { code: 'await websocket.accept()', note: '2. Сервер принимает рукопожатие (Handshake) и оставляет постоянный канал связи открытым' },
            { code: 'data = await websocket.receive_text()', note: '3. Сервер слушает входящие сообщения от клиента' },
            { code: 'await websocket.send_text("Ответ")', note: '4. Сервер в любой момент может отправить сообщение клиенту без запроса' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Это основа для итогового проекта №4 курса!',
          text: 'В четвёртом проекте нашего портфолио (Чат в реальном времени) ты будешь строить WebSocket-комнаты и менеджер подключений ConnectionManager именно на этих принципах.',
        },
      ],
      example: {
        title: 'Простейший эхо-сервер на WebSocket в FastAPI',
        lang: 'python',
        code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# Менеджер активных подключений чата:
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # Рассылаем сообщение ВСЕМ подключенным участникам:
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_name}")
async def websocket_endpoint(websocket: WebSocket, client_name: str):
    await manager.connect(websocket)
    await manager.broadcast(f"🎉 {client_name} вошёл в чат!")
    try:
        while True:
            # Ждём новых сообщений от этого клиента:
            data = await websocket.receive_text()
            await manager.broadcast(f"{client_name}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"👋 {client_name} покинул чат.")`,
        explanation: 'ConnectionManager сохраняет открытые сокеты и умеет рассылать сообщения (broadcast) всем активным пользователям сразу.',
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирован WebSocket ConnectionManager. Запусти код и посмотри, как сообщение одного пользователя мгновенно видят все участники чата!',
        initialCode: `class MockWebSocket:
    def __init__(self, username):
        self.username = username
        self.inbox = []

    def receive_from_server(self, msg):
        self.inbox.append(msg)

class ChatRoom:
    def __init__(self):
        self.members = []

    def join(self, ws):
        self.members.append(ws)
        self.broadcast(f"[Сервер]: {ws.username} присоединился к чату!")

    def leave(self, ws):
        self.members.remove(ws)
        self.broadcast(f"[Сервер]: {ws.username} вышел.")

    def broadcast(self, msg):
        for member in self.members:
            member.receive_from_server(msg)

# Моделируем 2 пользователей в чате:
chat = ChatRoom()
user1 = MockWebSocket("Аня")
user2 = MockWebSocket("Борис")

chat.join(user1)
chat.join(user2)

# Аня отправляет сообщение в комнату:
chat.broadcast("Аня: Привет всем участникам бэкенд-курса!")

print("Входящие сообщения у Бориса:")
for msg in user2.inbox:
    print(" ->", msg)`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь третьего участника',
          difficulty: 'easy',
          description: 'Создай пользователя user3 = MockWebSocket("Виктор"), подключи его к чату chat.join(user3) и отправь от его имени сообщение. Проверь inbox Ани.',
          hints: ['chat.join(user3)\nchat.broadcast("Виктор: Всем привет!")'],
        },
        {
          title: 'Задание 2: личные сообщения (Private Message)',
          difficulty: 'medium',
          description: 'Добавь в класс ChatRoom метод send_personal(to_username: str, msg: str), который находит нужного пользователя в self.members по имени и отправляет сообщение ТОЛЬКО ему.',
          hints: [
            'for m in self.members:\n    if m.username == to_username:\n        m.receive_from_server(f"[Личное] {msg}")',
          ],
          solution: `def send_personal(self, from_user: str, to_user: str, msg: str):
    for m in self.members:
        if m.username == to_user:
            m.receive_from_server(f"[Лично от {from_user}]: {msg}")

ChatRoom.send_personal = send_personal
chat.send_personal("Аня", "Борис", "Секретный вопрос по FastAPI")
print("Личные у Бориса:", user2.inbox[-1])`,
        },
        {
          title: 'Задание 3: горизонтальное масштабирование чата',
          difficulty: 'hard',
          description: 'Объясни проблему: если у нас 2 сервера бэкенда (Сервер А и Сервер Б), и Аня подключена к Серверу А, а Борис — к Серверу Б, почему менеджер в оперативной памяти Сервера А не сможет доставить сообщение Борису? Как Redis Pub/Sub решает эту проблему?',
          hints: [
            'Сервер А публикует сообщение в канал Redis Pub/Sub, а Сервер Б слушает этот канал и пересылает сообщение подключенному к нему Борису',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать постоянный HTTP-опрос (polling раз в 1 секунду) вместо WebSockets для real-time чата',
          right: 'HTTP-поллинг перегружает сервер тысячами пустых запросов и создаёт задержку. WebSockets поддерживают одно постоянное открытое соединение с нулевой задержкой',
        },
        {
          wrong: 'Забыть обработать исключение WebSocketDisconnect при закрытии вкладки браузера',
          right: 'Если клиент закрыл вкладку или потерял интернет, сервер должен поймать WebSocketDisconnect и удалить соединение из списка активных, иначе при следующей рассылке возникнет ошибка',
        },
      ],
      checklist: [
        'Понимаю разницу между Request-Response (HTTP) и постоянным дуплексным каналом (WebSockets)',
        'Знаю синтаксис эндпоинтов @app.websocket в FastAPI',
        'Понимаю роль ConnectionManager для рассылки сообщений (broadcast)',
        'Знаю, как обрабатывать отключение клиентов через WebSocketDisconnect',
      ],
    },
  ],
};
