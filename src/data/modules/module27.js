export const module27 = {
  id: 'redis-caching-deep-dive',
  order: 27,
  title: 'Продвинутое кэширование с Redis',
  icon: '⚡',
  description: 'Как ускорить бэкенд в 50 раз: Cache-Aside паттерн, TTL, структуры данных Redis (Hashes/ZSets), Rate Limiting и распределённые блокировки.',
  lessons: [
    {
      id: 'caching-strategies',
      title: 'Стратегии кэширования: Cache-Aside vs Write-Through',
      summary: 'Как не перегружать PostgreSQL повторными запросами, настраивать время жизни кэша (TTL) и инвалидировать устаревшие данные',
      theory: [
        {
          type: 'p',
          text: 'База данных PostgreSQL хранит информацию на жестком диске. Запрос к базе занимает 15–50 миллисекунд. Если 10 000 посетителей одновременно заходят на главную страницу каталога — база данных задохнётся от 10 000 одинаковых тяжелых SQL-запросов. Решение — КЭШИРОВАНИЕ (Caching) в оперативной памяти Redis, которое отвечает за 0.2 миллисекунды (в 100 раз быстрее)!',
        },
        {
          type: 'analogy',
          text: 'Представь библиотекаря. Каждый раз, когда читатель спрашивает: "Какая столица Франции?", библиотекарь может идти 15 минут в архив в подвал (PostgreSQL) за пыльной энциклопедией. Либо он может один раз сходить в подвал, приклеить стикер на монитор: "Париж" (REDIS) и следующие 1000 раз отвечать посетителям за 1 секунду, просто глядя на стикер перед глазами!',
        },
        {
          type: 'steps',
          title: 'Паттерн Cache-Aside (Кэширование по требованию)',
          items: [
            { code: '1. Проверяем Redis: cached = redis.get("catalog:top")', note: 'Смотрим, есть ли готовый ответ в кэше' },
            { code: '2. Cache Hit (Попадание в кэш):', note: 'Если данные есть — МГНОВЕННО отдаём их клиенту за 0.2 мс без запроса в БД' },
            { code: '3. Cache Miss (Промах кэша):', note: 'Если данных нет — делаем SQL-запрос в PostgreSQL, сохраняем результат в Redis с TTL=300 (на 5 минут) и отдаём клиенту' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Что такое Инвалидация кэша (Cache Invalidation)?',
          text: 'Если администратор изменил цену товара в админке, а в кэше Redis ещё 5 минут висит старая цена — покупатель увидит устаревшие данные. При любом изменении (UPDATE/DELETE) товара бэкенд обязан сразу удалить ключ из кэша: redis.delete("product:42")!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Реализация паттерна Cache-Aside в FastAPI',
          lang: 'python',
          code: `import json
import redis

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def get_product_details(product_id: int, db_session) -> dict:
    cache_key = f"product:{product_id}"
    
    # 1. Проверяем кэш Redis:
    cached_data = r.get(cache_key)
    if cached_data:
        print(f"⚡ [CACHE HIT]: Товар #{product_id} отдан из оперативной памяти Redis!")
        return json.loads(cached_data)
        
    # 2. [CACHE MISS] — идём в медленную базу PostgreSQL:
    print(f"🐢 [CACHE MISS]: Читаем товар #{product_id} из PostgreSQL...")
    product = {"id": product_id, "name": "Ноутбук Pro", "price": 89900} # имитация БД
    
    # 3. Сохраняем в Redis на 10 минут (TTL = 600 секунд):
    r.setex(cache_key, 600, json.dumps(product))
    
    return product`,
          explanation: 'Метод r.setex(key, ttl_seconds, value) атомарно записывает значение и выставляет таймер самоуничтожения (TTL).',
        },
        {
          title: 'Пример 2: Декоратор для автоматического кэширования функций',
          lang: 'python',
          code: `import functools
import json

def redis_cache(ttl_seconds: int = 300):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = f"cache:{func.__name__}:{args}:{kwargs}"
            # if cached := r.get(key): return json.loads(cached)
            result = func(*args, **kwargs)
            # r.setex(key, ttl_seconds, json.dumps(result))
            return result
        return wrapper
    return decorator

@redis_cache(ttl_seconds=60)
def compute_expensive_analytics():
    return {"active_users": 1420, "revenue_today": 450000}`,
          explanation: 'Декоратор позволяет одной строчкой кэшировать результаты любых тяжелых функций.',
        },
        {
          title: 'Пример 3: Инвалидация группы ключей по шаблону (Keys / Scan)',
          lang: 'python',
          code: `def invalidate_category_cache(category_id: int):
    """Сбрасывает кэш всех страниц категории при добавлении нового товара"""
    pattern = f"catalog:category:{category_id}:*"
    # for key in r.scan_iter(pattern):
    #     r.delete(key)
    print(f"✓ Кэш категории #{category_id} успешно сброшен!")`,
          explanation: 'scan_iter безопасно перебирает ключи порциями, не блокируя однопоточный сервер Redis.',
        },
      ],
      terminal: {
        title: 'Работа с Redis через консольный клиент redis-cli',
        description: 'Команды записи, чтения и проверки TTL в терминале:',
        lessonCommands: {
          'redis-cli setex my_key 60 "Hello Redis"': {
            output: ['OK'],
            type: 'success',
          },
        },
        suggestions: ['redis-cli setex my_key 60 "Hello Redis"', 'redis-cli ttl my_key', 'redis-cli get my_key'],
        script: [
          { command: 'redis-cli setex my_key 60 "Hello Redis"' },
          { command: 'redis-cli ttl my_key' },
          { command: 'redis-cli get my_key' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор кэша Cache-Aside с таймером TTL. Запусти код!',
        initialCode: `class MockRedisCache:
    def __init__(self):
        self.store = {}
        self.hits = 0
        self.misses = 0

    def get(self, key: str):
        if key in self.store:
            self.hits += 1
            return self.store[key]
        self.misses += 1
        return None

    def setex(self, key: str, ttl: int, val: str):
        self.store[key] = val

    def delete(self, key: str):
        self.store.pop(key, None)

cache = MockRedisCache()

def fetch_user_stats(user_id: int):
    cached = cache.get(f"stats:{user_id}")
    if cached:
        return f"[HIT]: {cached}"
    # Имитация тяжелого запроса в БД:
    res = f"User #{user_id} Balance: 1500$"
    cache.setex(f"stats:{user_id}", 300, res)
    return f"[MISS -> SAVED]: {res}"

print("1-й запрос (в БД):", fetch_user_stats(42))
print("2-й запрос (из кэша):", fetch_user_stats(42))
print("3-й запрос (из кэша):", fetch_user_stats(42))

print(f"\\nСтатистика: Попаданий (Hits)={cache.hits}, Промахов (Misses)={cache.misses}")
assert cache.hits == 2 and cache.misses == 1`,
      },
      tasks: [
        {
          title: 'Задание 1: инвалидация кэша пользователя',
          difficulty: 'easy',
          description: 'Вызови cache.delete("stats:42"). Затем сделай 4-й запрос fetch_user_stats(42) и убедись, что произошёл промах кэша [MISS].',
          hints: ['cache.delete("stats:42")\nprint(fetch_user_stats(42))'],
        },
        {
          title: 'Задание 2: расчёт процента попаданий (Cache Hit Ratio)',
          difficulty: 'medium',
          description: 'Напиши функцию get_hit_ratio(hits: int, misses: int) -> float: возвращает процент попаданий от 0 до 100%. Для 80 hits и 20 misses должна вернуть 80.0%.',
          hints: ['total = hits + misses\nreturn round((hits / total) * 100, 2) if total else 0.0'],
          solution: `def get_hit_ratio(hits: int, misses: int) -> float:
    total = hits + misses
    return round((hits / total) * 100, 2) if total > 0 else 0.0

assert get_hit_ratio(80, 20) == 80.0
print("✓ Hit Ratio успешно рассчитан:", get_hit_ratio(80, 20), "%")`,
        },
        {
          title: 'Задание 3: проблема Cache Stampede (Dog-piling)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: что такое проблема Cache Stampede (когда у кэша популярного товара с 100 000 запросов/сек истекает TTL, и все 100 000 запросов одновременно бьют в PostgreSQL) и как распределённые мьютексы (Mutex Lock) спасают базу от падения.',
          hints: ['Первый запрос захватывает блокировку в Redis и идёт в БД обновлять кэш, а остальные ждут готовности результата'],
        },
      ],
      mistakes: [
        {
          wrong: 'Кэшировать всё подряд без установки времени жизни (TTL)',
          right: 'Кэш без TTL будет бесконечно разрастаться и забьёт всю оперативную память сервера. Всегда указывай разумный TTL (от 60 секунд до 24 часов)',
        },
        {
          wrong: 'Забыть удалить кэш при обновлении данных в базе',
          right: 'Если обновил профиль или цену в БД — сразу вызывай redis.delete() для соответствующего ключа, иначе пользователи будут видеть устаревшую информацию',
        },
      ],
      checklist: [
        'Понимаю архитектуру и преимущества кэширования в оперативной памяти',
        'Знаю работу паттерна Cache-Aside (Hit / Miss)',
        'Умею задавать время жизни ключей TTL через setex',
        'Знаю правила инвалидации устаревших данных',
      ],
    },

    {
      id: 'redis-data-structures',
      title: 'Структуры данных Redis: Hashes, Sets и Sorted Sets',
      summary: 'Redis — это не просто ключ-значение: хранение профилей в Hashes, тегов в Sets и списков лидеров (Leaderboard) в Sorted Sets',
      theory: [
        {
          type: 'p',
          text: 'Многие начинающие разработчики используют Redis исключительно как простое хранилище `key: string_value`. Но Redis — это полноценная база данных структур данных в памяти. Использование специализированных структур (Hashes, Sets, Sorted Sets) позволяет выполнять сложнейшие операции за доли миллисекунды прямо на стороне сервера Redis!',
        },
        {
          type: 'list',
          title: 'Топ-4 структуры данных Redis',
          items: [
            '1. Strings (Строки): обычный текст или сериализованный JSON (GET, SET, INCR)',
            '2. Hashes (Хэш-таблицы): хранение объектов с полями, например профиль пользователя (HSET user:10 name "Alex" age "25", HGET, HGETALL)',
            '3. Sets (Множества): уникальные неупорядоченные элементы (SADD tags "python", SINTER — мгновенное пересечение тегов)',
            '4. Sorted Sets / ZSet (Сортированные множества): элементы с числовым рейтингом/очками (ZADD leaderboard 1500 "user_1", ZREVRANGE — топ-10 игроков за 0.1 мс!)',
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Хранение профиля пользователя в Redis Hashes (HSET / HGETALL)',
          lang: 'python',
          code: `import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def save_user_session_hash(user_id: int, username: str, role: str):
    key = f"user:session:{user_id}"
    # Сохраняем поля объекта напрямую без сериализации в JSON:
    r.hset(key, mapping={"username": username, "role": role, "login_count": 1})
    r.hincrby(key, "login_count", 1)  # атомарно увеличиваем счётчик на 1!
    r.expire(key, 3600)               # TTL 1 час
    
    # Получаем весь профиль обратно:
    return r.hgetall(key)`,
          explanation: 'В Hashes можно точечно менять одно поле (HSET) или атомарно инкрементировать число (HINCRBY) без перезаписи всего объекта.',
        },
        {
          title: 'Пример 2: Таблица лидеров и рейтинг товаров через Sorted Sets (ZSET)',
          lang: 'python',
          code: `def update_product_sales_rating(product_id: str, sold_quantity: int):
    # Добавляем или увеличиваем рейтинг популярности товара:
    r.zincrby("leaderboard:products:top_sales", sold_quantity, product_id)

def get_top_5_popular_products():
    # Мгновенно достаём топ-5 самых продаваемых товаров с их очками:
    top_items = r.zrevrange("leaderboard:products:top_sales", 0, 4, withscores=True)
    return top_items  # [('product_99', 450.0), ('product_12', 320.0), ...]`,
          explanation: 'Sorted Sets поддерживают сортировку элементов в памяти с алгоритмической сложностью O(log N).',
        },
        {
          title: 'Пример 3: Поиск общих друзей и тегов через Sets (SINTER)',
          lang: 'python',
          code: `def find_common_interests(user_a_id: int, user_b_id: int):
    # Множества интересов пользователей:
    r.sadd(f"interests:{user_a_id}", "python", "fastapi", "gaming")
    r.sadd(f"interests:{user_b_id}", "python", "fastapi", "cooking")
    
    # Мгновенное пересечение множеств на стороне Redis:
    common = r.sinter(f"interests:{user_a_id}", f"interests:{user_b_id}")
    return common  # {'python', 'fastapi'}`,
          explanation: 'Команда SINTER выполняет математическое пересечение множеств прямо в ядре Redis.',
        },
      ],
      terminal: {
        title: 'Тестирование ZSet и Hashes в терминале Redis',
        description: 'Попробуй команды HSET и ZADD:',
        lessonCommands: {
          'redis-cli zadd scores 100 "Alex" 200 "Maria"': {
            output: ['(integer) 2'],
            type: 'success',
          },
        },
        suggestions: ['redis-cli zadd scores 100 "Alex" 200 "Maria"', 'redis-cli zrevrange scores 0 -1 withscores'],
        script: [
          { command: 'redis-cli zadd scores 100 "Alex" 200 "Maria"' },
          { command: 'redis-cli zrevrange scores 0 -1 withscores' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор структур данных Redis управляет Leaderboard и Hashes. Запусти код!',
        initialCode: `class MockRedisStructures:
    def __init__(self):
        self.hashes = {}
        self.zsets = {}

    def hset(self, key: str, mapping: dict):
        if key not in self.hashes: self.hashes[key] = {}
        self.hashes[key].update(mapping)

    def hget(self, key: str, field: str):
        return self.hashes.get(key, {}).get(field)

    def zadd(self, key: str, member: str, score: float):
        if key not in self.zsets: self.zsets[key] = {}
        self.zsets[key][member] = score

    def zrevrange_top(self, key: str, limit: int = 3):
        items = sorted(self.zsets.get(key, {}).items(), key=lambda x: x[1], reverse=True)
        return items[:limit]

r_mock = MockRedisStructures()

# 1. Работа с Hashes:
r_mock.hset("user:101", {"name": "Alex", "role": "admin"})
print("1. Поле role из Hash user:101:", r_mock.hget("user:101", "role"))

# 2. Таблица лидеров ZSet:
r_mock.zadd("game_top", "Player_One", 1500)
r_mock.zadd("game_top", "Cyber_King", 2800)
r_mock.zadd("game_top", "Noob_Master", 450)

print("2. Топ игроков по очкам:", r_mock.zrevrange_top("game_top", limit=2))
assert r_mock.zrevrange_top("game_top", limit=1)[0][0] == "Cyber_King"`,
      },
      tasks: [
        {
          title: 'Задание 1: добавление нового игрока в лидерборд',
          difficulty: 'easy',
          description: 'Добавь игрока "GrandMaster" с 3500 очками. Убедись, что он занял первое место в топе.',
          hints: ['r_mock.zadd("game_top", "GrandMaster", 3500)'],
        },
        {
          title: 'Задание 2: проверка наличия элемента во множестве (SISMEMBER)',
          difficulty: 'medium',
          description: 'Напиши функцию is_user_online(online_set: set, user_id: int) -> bool: проверяет, входит ли user_id во множество активных сессий.',
          hints: ['return user_id in online_set'],
          solution: `def is_user_online(online_users: set, uid: int) -> bool:
    return uid in online_users

active = {10, 20, 30}
assert is_user_online(active, 20) is True
assert is_user_online(active, 99) is False
print("✓ Проверка присутствия пользователя во множестве работает!")`,
        },
        {
          title: 'Задание 3: проектирование системы счетчиков просмотров',
          difficulty: 'hard',
          description: 'Объясни, почему инкрементировать счётчик просмотров статьи `INCR article:42:views` в Redis в 1000 раз эффективнее, чем делать `UPDATE articles SET views = views + 1 WHERE id = 42` в PostgreSQL на каждый просмотр страницы.',
          hints: ['Атомарный INCR в памяти не вызывает дисковых блокировок строк в реляционной БД'],
        },
      ],
      mistakes: [
        {
          wrong: 'Хранить гигантские списки на 1 000 000 элементов в одном ключе без пагинации',
          right: 'Большие коллекции замедляют операции чтения. Всегда ограничивай выборку (ZREVRANGE с лимитами)',
        },
        {
          wrong: 'Использовать команду KEYS * на боевом сервере Redis с миллионами ключей',
          right: 'KEYS * блокирует весь сервер Redis для всех клиентов. В продакшене ВСЕГДА используй команду SCAN / scan_iter',
        },
      ],
      checklist: [
        'Знаю назначение Hashes (HSET/HGET) для хранения объектов',
        'Понимаю устройство Sorted Sets (ZSET) для создания лидербордов',
        'Знаю операции над множествами Sets (SADD, SINTER)',
        'Знаю, почему нельзя запускать KEYS * на продакшене',
      ],
    },

    {
      id: 'redis-rate-limiting',
      title: 'Rate Limiting и распределённые блокировки на Redis',
      summary: 'Как защитить свой API от DDoS атак и спама через Rate Limiting (лимит запросов в минуту) и предотвратить Race Conditions',
      theory: [
        {
          type: 'p',
          text: 'Если не ограничить количество запросов к API — любой школьник с простым Python-скриптом на `while True` может отправить 100 000 запросов в минуту на эндпоинт авторизации или отправки СМС, уронив сервер или разорив компанию на отправке СМС. Защита от этого называется RATE LIMITING (Ограничение частоты запросов).',
        },
        {
          type: 'analogy',
          text: 'Rate Limiting — это турникет в метро или фейсконтроль в клубе. Турникет пропускает тебя один раз по билету. Если ты попытаешься пробежать через турникет 20 раз за 1 секунду — створки захлопнутся, и турникет скажет: "Подожди 60 секунд перед следующей попыткой!" (HTTP статус 429 Too Many Requests).',
        },
        {
          type: 'steps',
          title: 'Алгоритм Rate Limiter на Redis (Fixed Window)',
          items: [
            { code: '1. Формируем ключ по IP: key = f"rate:{client_ip}"', note: 'Привязываем лимит к IP-адресу или ID пользователя' },
            { code: '2. current = r.incr(key)', note: 'Атомарно увеличиваем счётчик запросов на 1' },
            { code: '3. if current == 1: r.expire(key, 60)', note: 'При первом запросе выставляем окно в 60 секунд' },
            { code: '4. if current > 10: raise HTTPException(429)', note: 'Если за 60 секунд сделано больше 10 запросов — блокируем с кодом 429!' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Готовый Rate Limiter Middleware для FastAPI на Redis',
          lang: 'python',
          code: `import redis
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
r = redis.Redis(host="localhost", port=6379, decode_responses=True)

RATE_LIMIT_MAX = 5     # максимум 5 запросов
RATE_LIMIT_WINDOW = 60 # в течение 60 секунд

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    key = f"rate_limit:{client_ip}"
    
    current_requests = r.incr(key)
    if current_requests == 1:
        r.expire(key, RATE_LIMIT_WINDOW)
        
    if current_requests > RATE_LIMIT_MAX:
        ttl_left = r.ttl(key)
        raise HTTPException(
            status_code=429,
            detail=f"Слишком много запросов! Лимит {RATE_LIMIT_MAX}/мин. Попробуйте через {ttl_left}с."
        )
        
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_MAX)
    response.headers["X-RateLimit-Remaining"] = str(max(0, RATE_LIMIT_MAX - current_requests))
    return response`,
          explanation: 'Заголовки X-RateLimit сообщают клиенту, сколько запросов у него осталось до блокировки.',
        },
        {
          title: 'Пример 2: Распределённая блокировка (Distributed Lock / Redlock)',
          lang: 'python',
          code: `import time

def process_single_payout_with_lock(user_id: int):
    lock_key = f"lock:payout:user:{user_id}"
    
    # Пытаемся захватить эксклюзивный замок на 10 секунд (nx=True означает Set if Not Exists):
    acquired = r.set(lock_key, "locked", nx=True, ex=10)
    if not acquired:
        print(f"⚠️ Параллельная выплата для пользователя #{user_id} уже выполняется! Отклоняем дубликат.")
        return False
        
    try:
        print(f"🔒 Замок захвачен. Начинаем перевод денег для #{user_id}...")
        time.sleep(1) # перевод средств
        return True
    finally:
        # Обязательно освобождаем замок:
        r.delete(lock_key)`,
          explanation: 'Флаг nx=True гарантирует, что две параллельные кнопки "Списать деньги" не спишут сумму дважды (защита от Race Condition).',
        },
        {
          title: 'Пример 3: Скользящее окно (Sliding Window Rate Limiter через ZSET)',
          lang: 'python',
          code: `def is_allowed_sliding_window(client_id: str, limit=10, window_sec=60) -> bool:
    now = time.time()
    key = f"sliding_rate:{client_id}"
    
    # 1. Удаляем устаревшие запросы старше 60 секунд:
    r.zremrangebyscore(key, 0, now - window_sec)
    
    # 2. Считаем количество запросов за текущее окно:
    req_count = r.zcard(key)
    if req_count >= limit:
        return False
        
    # 3. Записываем текущий запрос:
    r.zadd(key, {str(now): now})
    r.expire(key, window_sec)
    return True`,
          explanation: 'Скользящее окно предотвращает спам-всплески на границе минут.',
        },
      ],
      terminal: {
        title: 'Проверка заголовков Rate Limiter через curl -i',
        description: 'Флаг -i показывает HTTP заголовки ответа и статус 429:',
        lessonCommands: {
          'curl -i http://localhost:8000/api/items': {
            output: [
              'HTTP/1.1 200 OK',
              'X-RateLimit-Limit: 5',
              'X-RateLimit-Remaining: 4',
              'content-type: application/json',
              '{"items":[]}',
            ],
            type: 'default',
          },
        },
        suggestions: ['curl -i http://localhost:8000/api/items'],
        script: [
          { command: 'curl -i http://localhost:8000/api/items' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор Rate Limiter блокирует спам-запросы со статусом 429. Запусти код!',
        initialCode: `class MockRateLimiter:
    def __init__(self, max_requests=3):
        self.max = max_requests
        self.counts = {}

    def check(self, ip: str) -> dict:
        curr = self.counts.get(ip, 0) + 1
        self.counts[ip] = curr
        if curr > self.max:
            return {"status": 429, "error": "Too Many Requests (Превышен лимит!)"}
        return {"status": 200, "remaining": self.max - curr}

limiter = MockRateLimiter(max_requests=3)
client_ip = "192.168.1.50"

for req_num in range(1, 6):
    res = limiter.check(client_ip)
    if res["status"] == 200:
        print(f"Запрос #{req_num}: 200 OK (осталось: {res['remaining']})")
    else:
        print(f"Запрос #{req_num}: ❌ {res['status']} {res['error']}")

assert limiter.check(client_ip)["status"] == 429`,
      },
      tasks: [
        {
          title: 'Задание 1: сброс счетчика лимитера',
          difficulty: 'easy',
          description: 'Добавь в MockRateLimiter метод reset(self, ip: str), который сбрасывает счётчик self.counts[ip] = 0. Проверь успешный запрос после сброса.',
          hints: ['self.counts[ip] = 0'],
        },
        {
          title: 'Задание 2: раздельные лимиты для авторизованных и гостей',
          difficulty: 'medium',
          description: 'Напиши функцию get_client_limit(is_authenticated: bool) -> int: гостям разрешено 10 запросов в минуту, а авторизованным премиум-пользователям — 100 запросов в минуту.',
          hints: ['return 100 if is_authenticated else 10'],
          solution: `def get_client_limit(is_auth: bool) -> int:
    return 100 if is_auth else 10

assert get_client_limit(True) == 100
assert get_client_limit(False) == 10
print("✓ Динамические лимиты для пользователей работают корректно!")`,
        },
        {
          title: 'Задание 3: практическая защита роута входа от перебора паролей',
          difficulty: 'hard',
          description: 'Добавь Rate Limiting на эндпоинт POST /auth/login (проект 3): не более 5 попыток ввода пароля за 1 минуту на один email. Это полностью защитит пользователей от Bruteforce атак!',
          hints: ['Поздравляем! Твой бэкенд защищён промышленным слоем безопасности и кэширования!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Хранить счётчики Rate Limiter в обычном словаре Python в памяти процесса',
          right: 'Если у сервера 4 воркера Uvicorn, у каждого будет свой независимый словарь. Rate Limiter ОБЯЗАН храниться в общем Redis',
        },
        {
          wrong: 'Не выставлять TTL на ключ блокировки lock:user:id',
          right: 'Если сервер упадет в процессе работы с заблокированным замком без TTL — замок останется висеть вечно. Всегда указывай параметр ex=10 (таймаут)',
        },
      ],
      checklist: [
        'Понимаю назначение Rate Limiting и код ответа 429 Too Many Requests',
        'Умею реализовывать атомарный счётчик INCR + EXPIRE в Redis',
        'Знаю концепцию распределённых блокировок (Distributed Locks)',
        'Знаю структуру заголовков X-RateLimit-*',
      ],
    },
  ],
};
