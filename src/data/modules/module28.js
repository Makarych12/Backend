export const module28 = {
  id: 'websockets-realtime',
  order: 28,
  title: 'WebSockets и real-time события',
  icon: '💬',
  description: 'Двусторонняя связь в реальном времени: WebSockets протокол в FastAPI, менеджер комнат, групповые чаты и масштабирование с Redis Pub/Sub.',
  lessons: [
    {
      id: 'websockets-vs-polling',
      title: 'Телефонный разговор против почтовых писем',
      summary: 'Почему HTTP поллинг каждую секунду перегружает сервер и как постоянное WebSocket соединение обеспечивает мгновенный обмен сообщениями',
      theory: [
        {
          type: 'p',
          text: 'Обычный HTTP протокол работает строго по схеме "Запрос -> Ответ". Клиент обязан сам спросить сервер: "Есть ли новые сообщения?". Сервер никогда не может сам первым отправить данные клиенту. Чтобы сделать онлайн-чат, новички запускают бесконечный опрос (HTTP Polling) каждые 500 миллисекунд. При 10 000 онлайн пользователей это создаёт 20 000 бессмысленных HTTP запросов в секунду и кладёт любой сервер!',
        },
        {
          type: 'analogy',
          text: 'HTTP Polling — это как отправлять почтальона на почту каждые 30 секунд с вопросом: "Мне пришло письмо? Нет? А сейчас? Нет? А сейчас?". WEBSOCKET — это ПОСТОЯННО ОТКРЫТАЯ ТЕЛЕФОННАЯ ЛИНИЯ. Ты один раз поднял трубку (WebSocket Handshake), связь установлена, и любая сторона (хоть сервер, хоть клиент) может в любую миллисекунду сказать фразу, которая мгновенно долетит до собеседника без накладных расходов!',
        },
        {
          type: 'steps',
          title: 'Как происходит переход с HTTP на WebSocket (Handshake)',
          items: [
            { code: '1. Клиент шлёт GET с заголовком:', note: 'Upgrade: websocket, Connection: Upgrade' },
            { code: '2. Сервер отвечает статусом 101:', note: '101 Switching Protocols (Переключение протоколов)' },
            { code: '3. Протокол переключается на ws:// или wss:// (TLS):', note: 'TCP-соединение остаётся открытым часами, данные передаются минимальными легковесными фреймами' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Простейший WebSocket эхо-сервер в FastAPI',
          lang: 'python',
          code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws/echo")
async def websocket_echo_endpoint(websocket: WebSocket):
    # 1. Принимаем входящее соединение (Handshake):
    await websocket.accept()
    print("🟢 Клиент успешно подключился к WebSocket!")
    
    try:
        while True:
            # 2. Ждём сообщение от клиента:
            data = await websocket.receive_text()
            print(f"Получено от клиента: {data}")
            
            # 3. Мгновенно отправляем ответ назад:
            await websocket.send_text(f"Эхо от сервера: {data}")
    except WebSocketDisconnect:
        print("🔴 Клиент отключился от WebSocket.")`,
          explanation: 'Цикл while True внутри асинхронной корутины слушает входящие сообщения без блокировки других клиентов.',
        },
        {
          title: 'Пример 2: Парсер WebSocket URL схемы (ws:// vs wss://)',
          lang: 'python',
          code: `def get_secure_websocket_url(http_url: str) -> str:
    """Преобразует HTTP адрес сайта в соответствующий безопасный WebSocket адрес"""
    if http_url.startswith("https://"):
        return http_url.replace("https://", "wss://", 1)
    elif http_url.startswith("http://"):
        return http_url.replace("http://", "ws://", 1)
    return http_url

print(get_secure_websocket_url("https://api.myshop.com/chat"))
# -> wss://api.myshop.com/chat`,
          explanation: 'wss:// обеспечивает сквозное шифрование трафика сокетов по протоколу TLS (HTTPS).',
        },
        {
          title: 'Пример 3: Отправка структурированного JSON через WebSocket',
          lang: 'python',
          code: `# async def send_notification(websocket: WebSocket, event: str, payload: dict):
#     # Метод send_json автоматически сериализует словарь:
#     await websocket.send_json({
#         "event": event,
#         "data": payload,
#         "timestamp": 1725280000
#     })`,
          explanation: 'Методы receive_json и send_json упрощают обмен типизированными событиями.',
        },
      ],
      terminal: {
        title: 'Тестирование WebSockets через консольную утилиту wscat',
        description: 'wscat позволяет интерактивно общаться с WebSocket сервером из консоли:',
        lessonCommands: {
          'wscat -c ws://localhost:8000/ws/echo': {
            output: [
              'Connected (press CTRL+C to quit)',
              '> Привет, сервер!',
              '< Эхо от сервера: Привет, сервер!',
            ],
            type: 'success',
          },
        },
        suggestions: ['wscat -c ws://localhost:8000/ws/echo'],
        script: [
          { command: 'wscat -c ws://localhost:8000/ws/echo' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор WebSocket обменивается сообщениями по открытому каналу. Запусти код!',
        initialCode: `import asyncio

class MockWebSocket:
    def __init__(self, client_id: str):
        self.id = client_id
        self.is_connected = False
        self.inbox = []

    async def accept(self):
        self.is_connected = True
        print(f"🟢 [WebSocket]: Соединение #{self.id} принято (101 Switching Protocols)")

    async def send_text(self, text: str):
        if not self.is_connected: raise ConnectionError("Сокет закрыт")
        self.inbox.append(text)
        print(f"  --> [Сервер -> Клиент {self.id}]: '{text}'")

    async def close(self):
        self.is_connected = False
        print(f"🔴 [WebSocket]: Клиент #{self.id} закрыл соединение")

async def test_ws_session():
    ws = MockWebSocket("client_42")
    await ws.accept()
    await ws.send_text("Добро пожаловать в живой чат!")
    await ws.send_text("У вас 1 новое уведомление")
    await ws.close()

await test_ws_session()`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка ошибки отправки в закрытый сокет',
          difficulty: 'easy',
          description: 'Попробуй вызвать ws.send_text("тест") после вызова ws.close(). Оберни в try/except и убедись, что выбрасывается ConnectionError.',
          hints: ['try: await ws.send_text("тест")\nexcept ConnectionError: print("Поймана ошибка!")'],
        },
        {
          title: 'Задание 2: валидатор формата WebSocket сообщений',
          difficulty: 'medium',
          description: 'Напиши функцию is_valid_ws_event(msg_dict: dict) -> bool: проверяет, что словарь содержит строковые ключи "event" и "payload".',
          hints: ['return isinstance(msg_dict, dict) and "event" in msg_dict and "payload" in msg_dict'],
          solution: `def is_valid_ws_event(event: dict) -> bool:
    return isinstance(event, dict) and "event" in event and "payload" in event

assert is_valid_ws_event({"event": "NEW_MESSAGE", "payload": {"text": "Привет"}}) is True
assert is_valid_ws_event({"text": "Привет"}) is False
print("✓ Валидатор событий сокетов работает корректно!")`,
        },
        {
          title: 'Задание 3: Heartbeat пинги (Ping / Pong)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: зачем WebSocket сервер каждые 30 секунд отправляет невидимый пинг (Ping Frame) клиенту и почему, если клиент не ответил Pong за 10 секунд, сервер принудительно закрывает сокет (защита от "зомби-соединений").',
          hints: ['При обрыве Wi-Fi или зависании роутера TCP-сокет может часами висеть открытым без пингов, расходуя память'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать HTTP Polling для чатов в реальном времени',
          right: 'Поллинг создаёт колоссальную бесполезную нагрузку. Для чатов, котировок и уведомлений всегда используй WebSockets',
        },
        {
          wrong: 'Забыть обработать исключение WebSocketDisconnect при отключении пользователя',
          right: 'Если клиент закрыл вкладку браузера, вызов receive_text выбросит WebSocketDisconnect. Обязательно удаляй сокет из списка активных в блоке except',
        },
      ],
      checklist: [
        'Понимаю разницу между HTTP запросами и постоянным WebSocket каналом',
        'Знаю, как происходит WebSocket Handshake (статус 101)',
        'Умею принимать сокеты в FastAPI через websocket.accept()',
        'Понимаю механизм Heartbeat (Ping/Pong)',
      ],
    },

    {
      id: 'fastapi-rooms-manager',
      title: 'Менеджер комнат и каналов в FastAPI',
      summary: 'Архитектура групповых чатов: класс ConnectionManager, рассылка broadcast и изоляция комнат',
      theory: [
        {
          type: 'p',
          text: 'В реальном приложении сокеты не существуют по отдельности: в чате поддержки участвуют 2 человека, в общем канале вебинара — 1000 человек, а в приватном диалоге — только покупатель и продавец. Чтобы управлять тысячами подключений, создаётся специальный класс — `ConnectionManager`.',
        },
        {
          type: 'steps',
          title: 'Обязанности ConnectionManager',
          items: [
            { code: 'connect(websocket, room_id):', note: '1. Принимает сокет и добавляет его в список участников комнаты `rooms[room_id].append(websocket)`' },
            { code: 'disconnect(websocket, room_id):', note: '2. Удаляет сокет из комнаты при закрытии вкладки' },
            { code: 'broadcast(message, room_id):', note: '3. В цикле рассылает сообщение ВСЕМ подключенным участникам указанной комнаты' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полноценный ConnectionManager для комнат чатов в FastAPI',
          lang: 'python',
          code: `from fastapi import FastAPI, WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        # Словарь комнат: {room_id: [websocket_1, websocket_2, ...]}
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)
        print(f"Клиент вошёл в комнату '{room_id}' (всего участников: {len(self.rooms[room_id])})")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.rooms:
            self.rooms[room_id].remove(websocket)
            if not self.rooms[room_id]:
                del self.rooms[room_id]

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.rooms:
            for connection in self.rooms[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()
app = FastAPI()

@app.websocket("/ws/chat/{room_id}/{user_name}")
async def chat_room_endpoint(websocket: WebSocket, room_id: str, user_name: str):
    await manager.connect(websocket, room_id)
    await manager.broadcast_to_room(f"👋 {user_name} присоединился к чату!", room_id)
    try:
        while True:
            text = await websocket.receive_text()
            await manager.broadcast_to_room(f"{user_name}: {text}", room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast_to_room(f"🚶 {user_name} покинул чат.", room_id)`,
          explanation: 'Сообщения отправляются только участникам соответствующей комнаты room_id.',
        },
        {
          title: 'Пример 2: Персональные личные уведомления конкретному пользователю',
          lang: 'python',
          code: `class PrivateNotificationManager:
    def __init__(self):
        # {user_id: websocket}
        self.user_sockets: dict[int, WebSocket] = {}

    async def send_personal_alert(self, user_id: int, alert_text: str):
        ws = self.user_sockets.get(user_id)
        if ws:
            await ws.send_json({"type": "ALERT", "message": alert_text})`,
          explanation: 'Позволяет слать push-уведомления (например, "Ваш заказ собран") прямо в браузер конкретного пользователя.',
        },
        {
          title: 'Пример 3: Безопасная аутентификация в WebSocket через JWT токен',
          lang: 'python',
          code: `async def get_current_user_ws(websocket: WebSocket, token: str):
    # При подключении сокета передаётся токен в query params: ws://localhost:8000/ws?token=jwt_token
    # if not is_valid_jwt(token):
    #     await websocket.close(code=1008) # 1008 Policy Violation
    #     return None
    return {"user_id": 42, "role": "buyer"}`,
          explanation: 'Код закрытия 1008 Policy Violation используется для отклонения неавторизованных подключений.',
        },
      ],
      terminal: {
        title: 'Подключение к комнате чата через wscat',
        description: 'Подключение к комнате room_123 под именем Alex:',
        lessonCommands: {
          'wscat -c ws://localhost:8000/ws/chat/room_123/Alex': {
            output: [
              'Connected (press CTRL+C to quit)',
              '< 👋 Alex присоединился к чату!',
              '> Всем привет!',
              '< Alex: Всем привет!',
            ],
            type: 'success',
          },
        },
        suggestions: ['wscat -c ws://localhost:8000/ws/chat/room_123/Alex'],
        script: [
          { command: 'wscat -c ws://localhost:8000/ws/chat/room_123/Alex' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор ConnectionManager рассылает сообщения по комнатам. Запусти код!',
        initialCode: `import asyncio

class MockRoomManager:
    def __init__(self):
        self.rooms = {}

    def join(self, room: str, user: str):
        if room not in self.rooms: self.rooms[room] = set()
        self.rooms[room].add(user)
        print(f"-> {user} вошёл в комнату '{room}'")

    def leave(self, room: str, user: str):
        if room in self.rooms:
            self.rooms[room].discard(user)
            print(f"<- {user} вышел из комнаты '{room}'")

    def broadcast(self, room: str, sender: str, msg: str):
        recipients = [u for u in self.rooms.get(room, set()) if u != sender]
        print(f"📢 [{room}] {sender}: '{msg}' -> Доставлено {len(recipients)} участникам: {recipients}")

mgr = MockRoomManager()
mgr.join("general", "Alex")
mgr.join("general", "Maria")
mgr.join("general", "John")
mgr.join("vip_room", "SecretAgent")

print("\\n--- Рассылка в general ---")
mgr.broadcast("general", "Alex", "Коллеги, митинг через 5 минут!")

print("\\n--- Рассылка в vip_room ---")
mgr.broadcast("vip_room", "SecretAgent", "Операция началась.")`,
      },
      tasks: [
        {
          title: 'Задание 1: выход участника из комнаты',
          difficulty: 'easy',
          description: 'Вызови mgr.leave("general", "John"). Сделай повторный broadcast в комнату "general" от Maria и убедись, что John больше не получает сообщение.',
          hints: ['mgr.leave("general", "John")\nmgr.broadcast("general", "Maria", "Поняла!")'],
        },
        {
          title: 'Задание 2: счетчик активных пользователей в комнатах',
          difficulty: 'medium',
          description: 'Напиши метод get_room_stats(self) -> dict: возвращает словарь с количеством участников в каждой комнате, например `{"general": 2, "vip_room": 1}`.',
          hints: ['return {room: len(users) for room, users in self.rooms.items()}'],
          solution: `def get_room_stats(self) -> dict:
    return {room: len(users) for room, users in self.rooms.items()}

MockRoomManager.get_room_stats = get_room_stats
stats = mgr.get_room_stats()
print("Статистика комнат:", stats)
assert stats["general"] >= 2`,
        },
        {
          title: 'Задание 3: обработка закрытия сокетов при сбое сервера (Graceful Shutdown)',
          difficulty: 'hard',
          description: 'Объясни, почему при остановке сервера в событии lifespan shutdown необходимо разослать всем сокетам код закрытия 1001 (Going Away) и дождаться закрытия, чтобы браузерные клиенты автоматически начали попытки переподключения (Auto-reconnect).',
          hints: ['Код 1001 сообщает клиенту, что сервер перезагружается и нужно переподключиться через 3 секунды'],
        },
      ],
      mistakes: [
        {
          wrong: 'Не удалять сокет из списка комнат при дисконнекте',
          right: 'Попытка отправить сообщение в закрытый сокет вызовет падение broadcast цикла. Всегда удаляй отключившийся сокет',
        },
        {
          wrong: 'Хранить список сокетов в базе данных PostgreSQL',
          right: 'Сокет — это живой дескриптор в памяти процесса операционной системы. Сокеты хранятся исключительно в памяти менеджера',
        },
      ],
      checklist: [
        'Понимаю архитектуру класса ConnectionManager для сокетов',
        'Умею изолировать чаты по комнатам room_id',
        'Знаю, как делать широковещательную рассылку (broadcast)',
        'Понимаю аутентификацию в сокетах через JWT',
      ],
    },

    {
      id: 'redis-pubsub-scaling',
      title: 'Масштабирование сокетов через Redis Pub/Sub',
      summary: 'Что делать, когда у тебя 5 серверов бэкенда: шина сообщений Redis Pub/Sub для синхронизации сокетов между процессами',
      theory: [
        {
          type: 'p',
          text: 'Представь, что твой проект вырос: ты запустил 3 контейнера бэкенда (Сервер А, Сервер Б, Сервер В) за Nginx балансировщиком. Пользователь Alex подключен по WebSocket к Серверу А, а пользователь Maria подключена к Серверу Б. Когда Alex пишет сообщение в чат — Сервер А знает только про сокет Алекса! Сервер А не имеет прямого доступа к оперативной памяти Сервера Б. Как доставить сообщение Марии? Ответ — REDIS PUB/SUB.',
        },
        {
          type: 'analogy',
          text: 'Redis Pub/Sub — это РАДИОСТАНЦИЯ между серверами. Сервер А (Издатель / Publisher) выкрикивает в радиоэфир Redis: "Новое сообщение в комнате #123!". Все остальные серверы (Подписчики / Subscribers) слушают эту волну, мгновенно ловят сигнал и пересылают сообщение своим локально подключенным пользователям!',
        },
        {
          type: 'steps',
          title: '3 этапа работы Redis Pub/Sub',
          items: [
            { code: '1. SUBSCRIBE chat_room_123', note: 'Каждый сервер слушает каналы комнат, в которых есть его пользователи' },
            { code: '2. PUBLISH chat_room_123 "Привет"', note: 'Любой сервер публикует сообщение в Redis канал' },
            { code: '3. Redis мгновенно дублирует сообщение:', note: 'Сообщение долетает до всех серверов за 0.001 секунды и отдаётся клиентам' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Подписка и публикация в Redis Pub/Sub на Python',
          lang: 'python',
          code: `import asyncio
import json
import redis.asyncio as aioredis

redis_client = aioredis.from_url("redis://localhost:6379", decode_responses=True)

# 1. Фоновый слушатель радиоволны Redis (Subscriber):
async def redis_listener_task(channel_name: str, local_manager):
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel_name)
    print(f"📻 Сервер подписался на канал Redis '{channel_name}'")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            raw_data = message["data"]
            # Рассылаем всем локальным сокетам этого инстанса:
            # await local_manager.broadcast_local(raw_data)
            print(f"Получено из Redis Pub/Sub: {raw_data}")

# 2. Публикация нового сообщения (Publisher):
async def publish_chat_message(channel_name: str, user: str, text: str):
    payload = json.dumps({"user": user, "text": text})
    await redis_client.publish(channel_name, payload)`,
          explanation: 'Redis Pub/Sub связывает бесконечное количество экземпляров бэкенда в единую real-time сеть.',
        },
        {
          title: 'Пример 2: Парсер сообщений из Pub/Sub шины',
          lang: 'python',
          code: `def parse_pubsub_message(raw_msg_data: str) -> dict:
    try:
        return json.loads(raw_msg_data)
    except json.JSONDecodeError:
        return {"raw": raw_msg_data}`,
          explanation: 'Сериализация в JSON гарантирует целостность типов при передаче через Redis.',
        },
        {
          title: 'Пример 3: Автоматическая отписка от неиспользуемых каналов',
          lang: 'python',
          code: `async def cleanup_empty_channels(pubsub, channel_name: str, local_users_count: int):
    # Если в комнате на этом сервере не осталось ни одного пользователя:
    if local_users_count == 0:
        await pubsub.unsubscribe(channel_name)
        print(f"Отписались от пустого канала {channel_name}")`,
          explanation: 'Отписка экономит сетевой трафик между серверами приложения и Redis.',
        },
      ],
      terminal: {
        title: 'Тестирование Redis Pub/Sub в двух терминалах',
        description: 'В первом терминале подписываемся на канал, во втором публикуем сообщение:',
        lessonCommands: {
          'redis-cli publish chat_room_1 "Привет всем инстансам!"': {
            output: ['(integer) 3'],
            type: 'success',
          },
        },
        suggestions: ['redis-cli publish chat_room_1 "Привет всем инстансам!"'],
        script: [
          { command: 'redis-cli publish chat_room_1 "Привет всем инстансам!"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор 2 независимых серверов синхронизируется через Pub/Sub шину. Запусти код!',
        initialCode: `class MockRedisPubSubBus:
    def __init__(self):
        self.subscribers = {}

    def subscribe(self, channel: str, server_callback):
        if channel not in self.subscribers: self.subscribers[channel] = []
        self.subscribers[channel].append(server_callback)

    def publish(self, channel: str, message: str):
        print(f"📡 [REDIS PUB/SUB]: В канал '{channel}' отправлено: '{message}'")
        for cb in self.subscribers.get(channel, []):
            cb(message)

bus = MockRedisPubSubBus()

# Два независимых инстанса сервера:
class ServerInstance:
    def __init__(self, name):
        self.name = name
        self.local_clients = []

    def on_redis_message(self, msg):
        print(f"  🏢 [{self.name}] получил сигнал из Redis и переслал клиентам {self.local_clients}: '{msg}'")

server_A = ServerInstance("Сервер-A (Москва)")
server_A.local_clients = ["Alex"]

server_B = ServerInstance("Сервер-B (Франкфурт)")
server_B.local_clients = ["Maria", "John"]

# Оба сервера слушают один канал:
bus.subscribe("room_global", server_A.on_redis_message)
bus.subscribe("room_global", server_B.on_redis_message)

# Alex пишет со своего сервера А:
bus.publish("room_global", "Alex: Привет из Москвы!")`,
      },
      tasks: [
        {
          title: 'Задание 1: добавление третьего сервера',
          difficulty: 'easy',
          description: 'Создай server_C = ServerInstance("Сервер-C (Токио)") с клиентом "Kenji". Подпиши его на "room_global" и отправь новое сообщение.',
          hints: ['server_C = ServerInstance("Сервер-C")\nbus.subscribe("room_global", server_C.on_redis_message)'],
        },
        {
          title: 'Задание 2: фильтрация каналов по префиксу',
          difficulty: 'medium',
          description: 'Напиши функцию make_channel_name(room_id: str) -> str: формирует стандартное имя канала `f"pubsub:chat:{room_id}"`.',
          hints: ['return f"pubsub:chat:{room_id}"'],
          solution: `def make_channel_name(room_id: str) -> str:
    return f"pubsub:chat:{room_id}"

assert make_channel_name("42") == "pubsub:chat:42"
print("✓ Имя канала сгенерировано по стандарту:", make_channel_name("42"))`,
        },
        {
          title: 'Задание 3: практическое внедрение чата в реальном времени',
          difficulty: 'hard',
          description: 'Возьми свой проект Todo API или Shop API и добавь WebSocket эндпоинт /ws/live-orders: уведомляет менеджеров в реальном времени при создании нового заказа!',
          hints: ['Поздравляем! Твой бэкенд умеет работать в режиме Real-Time с масштабированием на десятки серверов!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Думать, что WebSockets масштабируются сами собой без центральной шины',
          right: 'Без Redis Pub/Sub пользователи на разных серверах не увидят сообщения друг друга. Всегда используй Pub/Sub для горизонтального масштабирования',
        },
        {
          wrong: 'Использовать Redis Pub/Sub для долгосрочного хранения истории сообщений',
          right: 'Pub/Sub — это "выстрелил и забыл" (Fire-and-Forget). Если пользователь был офлайн в момент отправки, он не получит сообщение из Pub/Sub. Историю чата сохраняй в PostgreSQL',
        },
      ],
      checklist: [
        'Понимаю проблему масштабирования WebSockets на несколько серверов',
        'Знаю концепцию Publisher и Subscriber в Redis',
        'Умею связывать локальный менеджер сокетов с шиной Redis',
        'Знаю разницу между мгновенной доставкой Pub/Sub и хранением истории в БД',
      ],
    },
  ],
};
