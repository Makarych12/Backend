export const module11 = {
  id: 'security',
  order: 11,
  title: 'Безопасность',
  icon: '🛡️',
  description: 'CORS, защита от SQL-инъекций, rate limiting и переменные окружения (.env).',
  lessons: [
    {
      id: 'cors-basics',
      title: 'CORS: кто имеет право обращаться к твоему API',
      summary: 'Что такое политика одного источника (SOP), почему браузер блокирует чужие запросы и как настроить CORSMiddleware в FastAPI',
      theory: [
        {
          type: 'p',
          text: 'Представь, что ты создал красивый frontend-сайт на React (например, на адресе http://mysite.com) и отдельный FastAPI-сервер для данных (на http://api.mysite.com или http://localhost:8000). Когда твой сайт в браузере пытается отправить запрос на сервер, браузер неожиданно блокирует ответ и выдаёт красную ошибку в консоли: "CORS error / Access-Control-Allow-Origin missing". Почему браузер так делает и как разрешить доступ?',
        },
        {
          type: 'analogy',
          text: 'CORS (Cross-Origin Resource Sharing) — это как охранник со списком приглашённых гостей на входе в закрытый клуб (API). По умолчанию браузер никому не разрешает ходить в гости на чужой домен из соображений безопасности (Same-Origin Policy). Но если владелец клуба (сервер) заранее передаёт охраннику белый список: "Сайту http://mysite.com вход разрешён!", то охранник (браузер) спокойно пропускает ответ внутрь.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Критически важный факт: CORS защищает пользователя в браузере, а не сам сервер',
          text: 'Многие новички думают, что CORS запрещает запросы хакерам. Это не так! Хакер с помощью скрипта на Python или утилиты curl может отправить к твоему серверу любой запрос напрямую в обход браузера. CORS работает ИСКЛЮЧИТЕЛЬНО внутри браузеров обычных пользователей, чтобы вредоносный сайт evil-site.com не мог тайно отправить запрос в твой интернет-банк от твоего имени.',
        },
        {
          type: 'steps',
          title: 'Как настроить CORSMiddleware в FastAPI',
          items: [
            { code: 'from fastapi.middleware.cors import CORSMiddleware', note: 'Импортируем встроенную в FastAPI промежуточную обработку (middleware) для CORS' },
            { code: 'origins = ["http://localhost:3000", "https://mysite.com"]', note: 'Составляем "белый список" доверенных сайтов, которым разрешено делать запросы' },
            { code: 'app.add_middleware(CORSMiddleware, allow_origins=origins, ...)', note: 'Подключаем middleware к приложению. Сервер сам начнёт добавлять нужные HTTP-заголовки' },
          ],
        },
        {
          type: 'p',
          text: 'Параметр allow_origins=["*"] разрешает запросы абсолютно с любых сайтов. Это удобно во время начальной локальной разработки, но в продакшене с авторизацией по cookies или приватными данными всегда указывай только конкретные домены!',
        },
      ],
      example: {
        title: 'Подключение CORSMiddleware в реальном приложении FastAPI',
        lang: 'python',
        code: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Список сайтов (источников), которым разрешён доступ к нашему API:
origins = [
    "http://localhost:3000",        # локальный фронтенд на React
    "https://my-awesome-shop.ru",   # боевой домен сайта
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # кого пускать
    allow_credentials=True,         # разрешать ли передавать cookies и заголовки авторизации
    allow_methods=["GET", "POST", "PUT", "DELETE"], # какие HTTP-методы разрешены
    allow_headers=["*"],            # какие заголовки разрешено присылать клиенту
)

@app.get("/api/products")
def get_products():
    return [{"id": 1, "title": "Футболка", "price": 1200}]`,
        explanation: 'Когда браузер с адреса http://localhost:3000 запросит /api/products, FastAPI автоматически вернёт заголовок Access-Control-Allow-Origin: http://localhost:3000, и браузер покажет данные.',
      },
      sandbox: {
        bootstrap: null,
        description: 'Попробуй себя в роли алгоритма CORS: проверь, как сервер проверяет заголовок Origin и решает, выдавать ли доступ.',
        initialCode: `allowed_origins = {
    "http://localhost:3000",
    "https://mysite.com"
}

def handle_cors_request(origin_header: str | None, path: str):
    """Имитация логики CORS на сервере"""
    if origin_header is None:
        # Запрос пришёл не из браузера (например, curl или мобильное приложение)
        return {"status": 200, "headers": {}, "body": f"Данные {path}"}
    
    if origin_header in allowed_origins or "*" in allowed_origins:
        # Домен есть в белом списке — разрешаем!
        return {
            "status": 200,
            "headers": {"Access-Control-Allow-Origin": origin_header},
            "body": f"Данные {path}"
        }
    else:
        # Домен не разрешён — сервер не вернёт заголовок CORS, и браузер заблокирует ответ
        return {
            "status": 200,
            "headers": {}, # нет Access-Control-Allow-Origin
            "body": "Браузер заблокирует чтение этого ответа на клиенте!"
        }

# 1. Запрос с нашего доверенного React-фронтенда:
res1 = handle_cors_request("http://localhost:3000", "/users")
print("Запрос с localhost:3000 -> Заголовок CORS:", res1["headers"].get("Access-Control-Allow-Origin"))

# 2. Запрос со стороннего подозрительного сайта:
res2 = handle_cors_request("http://hacker-site.ru", "/users")
print("Запрос с hacker-site.ru  -> Заголовок CORS:", res2["headers"].get("Access-Control-Allow-Origin"))`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь новый доверенный домен',
          difficulty: 'easy',
          description: 'Добавь мобильный веб-клиент "https://m.mysite.com" в множество allowed_origins. Проверь, что вызов handle_cors_request("https://m.mysite.com", "/catalog") теперь возвращает заголовок Access-Control-Allow-Origin.',
          hints: [
            'allowed_origins.add("https://m.mysite.com")',
            'assert res["headers"]["Access-Control-Allow-Origin"] == "https://m.mysite.com"',
          ],
        },
        {
          title: 'Задание 2: проверка разрешённых HTTP-методов (CORS Preflight)',
          difficulty: 'medium',
          description: 'Напиши функцию handle_preflight(origin: str, method: str, allowed_methods: list), которая возвращает статус 200 и заголовок "Access-Control-Allow-Methods", если метод разрешён, или статус 403, если метод (например, DELETE) запрещён для чужих сайтов.',
          hints: [
            'if origin in allowed_origins and method in allowed_methods:\n    return {"status": 200, "headers": {"Access-Control-Allow-Methods": ", ".join(allowed_methods)}}',
          ],
          solution: `def handle_preflight(origin: str, method: str, allowed_methods: list):
    if origin in allowed_origins:
        if method in allowed_methods:
            return {
                "status": 200,
                "headers": {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": ", ".join(allowed_methods)
                }
            }
        return {"status": 403, "error": "Method not allowed by CORS"}
    return {"status": 403, "error": "Origin not allowed"}

res = handle_preflight("http://localhost:3000", "GET", ["GET", "POST"])
print("Preflight результат:", res["status"])`,
        },
        {
          title: 'Задание 3: wildcard (*) с приватными данными',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему нельзя ставить allow_origins=["*"] одновременно с allow_credentials=True в реальном FastAPI приложении? Напиши валидатор настроек, который проверяет этот конфликт и поднимает ValueError при опасной комбинации.',
          hints: [
            'Стандарт CORS в браузерах строго запрещает комбинацию "*" и Credentials из соображений безопасности',
            'def validate_cors_config(origins, allow_credentials):\n    if "*" in origins and allow_credentials:\n        raise ValueError("Опасная конфигурация!")',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Думать, что CORS — это файрвол для защиты сервера от хакеров и DDoS-атак',
          right: 'CORS — это механизм безопасности исключительно для браузеров пользователей. Любой скрипт на Python, curl или Postman отправляет запросы мимо браузера и полностью игнорирует CORS',
        },
        {
          wrong: 'Оставлять allow_origins=["*"] в продакшен-коде для удобства',
          right: 'Звёздочка разрешает любому фишинговому сайту отправлять запросы в твой API от имени зашедшего на него пользователя. В продакшене всегда явно перечисляй только свои доверенные домены',
        },
      ],
      checklist: [
        'Понимаю, что такое Same-Origin Policy и почему браузер блокирует запросы на другой домен',
        'Знаю, что CORS выполняется на стороне браузера с помощью заголовков Access-Control-Allow-Origin',
        'Умею подключать CORSMiddleware в FastAPI и задавать список allow_origins',
        'Понимаю, почему "*" не стоит оставлять в продакшен-окружении',
      ],
    },

    {
      id: 'sql-injections',
      title: 'SQL-инъекции: как они работают и как защищает ORM',
      summary: 'Как неосторожная склейка строк ломает базу данных и почему параметризованные запросы в ORM делают инъекции невозможными',
      theory: [
        {
          type: 'p',
          text: 'В модуле 7 мы познакомились с базами данных и ORM SQLAlchemy. Теперь пришло время разобрать одну из самых старых, известных и опасных уязвимостей в истории веб-разработки — SQL-ИНЪЕКЦИЮ (SQL Injection).',
        },
        {
          type: 'analogy',
          text: 'Представь, что ты приходишь на почту и заполняешь бланк: "Выдать посылку гражданину: [Имя]". Если почтальон просто читает бланк, а хитрый мошенник в графе "Имя" напишет: "Иванову. А также немедленно отдайте мне все деньги из сейфа и сожгите архив!", и доверчивый почтальон выполнит ВЕСЬ текст бланка как одну инструкцию — сейф будет опустошён. В коде "почтальон" — это база данных, а "бланк с допиской" — это SQL-инъекция.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Главный источник зла — обычная конкатенация и f-строки в SQL',
          text: 'Если ты собираешь SQL-запрос склейкой строк: f"SELECT * FROM users WHERE login = \'{user_input}\'", то передав вместо логина строку "admin\' --", злоумышленник превратит запрос в SELECT * FROM users WHERE login = \'admin\' --\'. Два дефиса -- в SQL означают комментарий — проверка пароля просто отрежется, и хакер мгновенно войдёт под админом без пароля!',
        },
        {
          type: 'steps',
          title: 'Как параметризация (Prepared Statements) спасает мир',
          items: [
            { code: 'cursor.execute("SELECT * FROM users WHERE login = ?", (user_input,))', note: '1. Мы передаём структуру SQL-команды отдельно, а данные пользователя — отдельно в кортеже' },
            { code: 'База данных заранее компилирует структуру команды', note: '2. СУБД чётко знает: здесь команда SELECT, а на месте знака ? будет ТОЛЬКО текстовое значение' },
            { code: 'Даже если в user_input передать \' OR 1=1 --', note: '3. База данных будет искать пользователя с буквальным дурацким логином "\' OR 1=1 --", а не выполнять его как SQL-код!' },
          ],
        },
        {
          type: 'p',
          text: 'В SQLAlchemy ORM все стандартные методы запросов (такие как session.query(User).filter_by(login=user_input)) АВТОМАТИЧЕСКИ используют параметризацию. Но будь осторожен: если ты напишешь text(f"SELECT ... {user_input}") внутри SQLAlchemy — уязвимость вернётся!',
        },
      ],
      example: {
        title: 'Сравнение: уязвимый vs безопасный запрос в Python',
        lang: 'python',
        code: `import sqlite3

conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE users (id INT, login TEXT, secret TEXT)")
cursor.execute("INSERT INTO users VALUES (1, 'admin', 'супер-секрет-банка')")

# ❌ ОПАСНО: f-строка склеивает ввод пользователя прямо в тело SQL-запроса!
def vulnerable_login(user_input: str):
    query = f"SELECT secret FROM users WHERE login = '{user_input}'"
    return cursor.execute(query).fetchall()

# ✅ БЕЗОПАСНО: параметризованный запрос через знак "?"
def secure_login(user_input: str):
    query = "SELECT secret FROM users WHERE login = ?"
    return cursor.execute(query, (user_input,)).fetchall()

# Хакерская строка для взлома:
hack = "' OR '1'='1"

# Уязвимая функция отдаст все секреты:
print("Взлом уязвимой функции:", vulnerable_login(hack))

# Безопасная функция вернёт пустой список []:
print("Безопасная функция:", secure_login(hack))`,
        explanation: 'Параметризованный запрос превращает вредоносную строку в обычный поиск по точному тексту, предотвращая выполнение чужого SQL-кода.',
      },
      sandbox: {
        bootstrap: 'sqlite3',
        description: 'В песочнице подключен настоящий модуль sqlite3. Попробуй взломать базу данных через SQL-инъекцию и посмотри, как параметризация блокирует атаку!',
        initialCode: `import sqlite3

conn = sqlite3.connect(":memory:")
cursor = conn.cursor()

cursor.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance INTEGER)")
cursor.execute("INSERT INTO accounts VALUES (1, 'Алиса', 5000)")
cursor.execute("INSERT INTO accounts VALUES (2, 'Боб', 12000)")
cursor.execute("INSERT INTO accounts VALUES (3, 'Злодей', 10)")
conn.commit()

def find_account_unsafe(search_name: str):
    # Опасная функция со склейкой строк
    sql = f"SELECT * FROM accounts WHERE name = '{search_name}'"
    return cursor.execute(sql).fetchall()

def find_account_safe(search_name: str):
    # Безопасная функция с параметризацией
    sql = "SELECT * FROM accounts WHERE name = ?"
    return cursor.execute(sql, (search_name,)).fetchall()

# 1. Обычный честный поиск:
print("Честный поиск Алисы:", find_account_unsafe("Алиса"))

# 2. Атака SQL-инъекцией:
attack_payload = "' OR 1=1 --"
print("\\nРезультат атаки на опасную функцию (утечка всех данных!):")
print(find_account_unsafe(attack_payload))

print("\\nРезультат той же атаки на безопасную функцию (ничего не найдено, атака отбита):")
print(find_account_safe(attack_payload))`,
      },
      tasks: [
        {
          title: 'Задание 1: почини уязвимый поиск по email',
          difficulty: 'easy',
          description: 'Дана функция def search_by_email(email: str): return cursor.execute(f"SELECT * FROM accounts WHERE name=\'{email}\'"). Перепиши её так, чтобы использовался знак вопроса ? и кортеж параметров (email,). Проверь, что инъекция "\' OR \'1\'=\'1" больше не срабатывает.',
          hints: [
            'cursor.execute("SELECT * FROM accounts WHERE name = ?", (email,))',
          ],
        },
        {
          title: 'Задание 2: атака с удалением таблицы (DROP TABLE)',
          difficulty: 'medium',
          description: 'Представь худший кошмар администратора: злоумышленник передаёт строку "Злодей\'; DROP TABLE accounts; --". Объясни, почему множественные команды опасны и проверь, как параметризация защищает структуру таблиц от удаления.',
          hints: [
            'При параметризации весь текст передаётся как единый литерал строки, и команда DROP TABLE внутри значения никогда не выполнится',
          ],
          solution: `def delete_protection_test():
    dangerous_input = "Злодей'; DROP TABLE accounts; --"
    # Безопасный запрос:
    res = find_account_safe(dangerous_input)
    assert res == []
    # Проверяем, что таблица accounts цела и невредима:
    remaining = cursor.execute("SELECT COUNT(*) FROM accounts").fetchone()[0]
    assert remaining == 3

delete_protection_test()
print("✓ Таблица в безопасности!")`,
        },
        {
          title: 'Задание 3: уязвимость в сортировке ORDER BY',
          difficulty: 'hard',
          description: 'Параметризация через ? работает только для ЗНАЧЕНИЙ колонок, но не для названий таблиц или полей в ORDER BY! Напиши безопасную функцию sort_accounts(sort_by: str), которая использует белый список (whitelist) разрешённых полей ["id", "name", "balance"] и отвергает любые другие строки.',
          hints: [
            'allowed_fields = {"id", "name", "balance"}\nif sort_by not in allowed_fields:\n    raise ValueError("Недопустимое поле для сортировки")',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")  # "это же число, f-строка безопасна!"',
          right: 'Никогда не делай исключений: любая f-строка в SQL — это потенциальная дыра в безопасности. Всегда передавай параметры через execute(query, params) независимо от типа данных',
        },
        {
          wrong: 'Пытаться писать собственные регулярные выражения для "очистки" кавычек из SQL-строк',
          right: 'Ручная фильтрация почти всегда содержит лазейки (экранирование, кодировки, Unicode). Единственный надёжный способ — встроенные в базу данных параметризованные запросы или ORM',
        },
      ],
      checklist: [
        'Понимаю, что такое SQL-инъекция и как она возникает при склейке строк',
        'Знаю, как знак комментария -- в SQL отрезает оставшуюся часть условия',
        'Умею использовать параметризованные запросы со знаком ? в Python',
        'Знаю, что SQLAlchemy ORM автоматически параметризует запросы при использовании filter_by и filter',
      ],
    },

    {
      id: 'rate-limiting',
      title: 'Rate Limiting: защита от перегрузки и перебора',
      summary: 'Зачем ограничивать количество запросов к API, как спасти сервер от атак и написать простой ограничитель запросов',
      theory: [
        {
          type: 'p',
          text: 'Представь, что к твоему эндпоинту входа /login подключился бот-злоумышленник и отправляет 5000 запросов в секунду, подбирая пароли к аккаунтам пользователей (брутфорс). А другой скрипт зациклился и завалил сервер миллионом тяжёлых запросов, из-за чего сайт перестал открываться у всех остальных клиентов (DDoS). Как защититься от такого поведения?',
        },
        {
          type: 'analogy',
          text: 'Rate Limiting (ограничение частоты запросов) — это как турникет на входе в метро или электронная очередь в банке. Если впустить сразу толпу из 1000 человек в узкую дверь — возникнет давка, и кассиры не справятся. Турникет пропускает людей строго порциями: не больше определённого числа человек за минуту. Если кто-то пытается лезть слишком часто — перед ним опускается шлагбаум с надписью "Подождите немного".',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'HTTP-код 429: Too Many Requests',
          text: 'Когда клиент превышает установленный лимит запросов (например, "не более 5 попыток входа в минуту"), сервер обязан вернуть стандартный HTTP статус-код 429 Too Many Requests ("Слишком много запросов"). В заголовке Retry-After сервер может подсказать, через сколько секунд клиенту разрешено повторить попытку.',
        },
        {
          type: 'steps',
          title: 'Как устроен простой Rate Limiter в памяти сервера',
          items: [
            { code: 'requests_history = { "client_ip": [1700000000.1, 1700000002.5] }', note: '1. Храним список меток времени последних запросов для каждого клиента (по IP или токену)' },
            { code: 'recent = [t for t in requests_history[ip] if current_time - t < 60]', note: '2. При новом запросе отбрасываем старые метки (старше 60 секунд)' },
            { code: 'if len(recent) >= 5: raise HTTPException(429, "Лимит превышен")', note: '3. Если количество запросов за минуту превысило лимит — возвращаем 429' },
          ],
        },
        {
          type: 'p',
          text: 'В больших продакшен-системах с несколькими серверами счётчики запросов хранят не в оперативной памяти одного процесса, а в сверхбыстрой общей базе данных Redis (её мы подробно разберём в модуле 14).',
        },
      ],
      example: {
        title: 'Простой Rate Limiter для эндпоинта авторизации',
        lang: 'python',
        code: `import time
from fastapi import FastAPI, HTTPException, Header
from fastapi.testclient import TestClient

app = FastAPI()

# Словарь: {client_id: [время_запроса_1, время_запроса_2, ...]}
rate_limits = {}

def check_rate_limit(client_id: str, max_requests: int = 3, window_seconds: int = 60):
    now = time.time()
    history = rate_limits.get(client_id, [])
    # Оставляем только запросы за последнее окно:
    recent_requests = [t for t in history if now - t < window_seconds]
    
    if len(recent_requests) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail=f"Слишком много запросов. Лимит: {max_requests} в минуту."
        )
    
    recent_requests.append(now)
    rate_limits[client_id] = recent_requests

@app.post("/login")
def login(client_ip: str = Header("127.0.0.1")):
    check_rate_limit(client_ip, max_requests=3)
    return {"status": "ok", "message": "Добро пожаловать"}`
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице настроен лимит: не более 3 запросов входа. Запусти код и посмотри, как 4-й запрос моментально блокируется статусом 429!',
        initialCode: `import time
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

attempts_log = {}

def rate_limiter(client_ip: str, max_attempts: int = 3, window_seconds: int = 10):
    now = time.time()
    timestamps = attempts_log.get(client_ip, [])
    # Очищаем запросы старше 10 секунд
    valid_timestamps = [t for t in timestamps if now - t < window_seconds]
    
    if len(valid_timestamps) >= max_attempts:
        raise HTTPException(status_code=429, detail="Слишком много попыток входа! Подождите.")
    
    valid_timestamps.append(now)
    attempts_log[client_ip] = valid_timestamps

@app.post("/login")
def login_endpoint(username: str, ip: str = "192.168.1.1"):
    rate_limiter(ip, max_attempts=3)
    return {"status": "success", "user": username}

client = TestClient(app)

print("Запрос 1:", client.post("/login?username=ivan").status_code)
print("Запрос 2:", client.post("/login?username=ivan").status_code)
print("Запрос 3:", client.post("/login?username=ivan").status_code)
# 4-й запрос превышает лимит 3 попытки:
res4 = client.post("/login?username=ivan")
print("Запрос 4:", res4.status_code, res4.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: настройка лимита для разных клиентов',
          difficulty: 'easy',
          description: 'Проверь, что блокировка по IP изолирована: отправь 3 запроса с ip="192.168.1.1" (до исчерпания лимита), а затем отправь запрос с другого IP: ip="10.0.0.1". Убедись, что второй клиент успешно получает статус 200.',
          hints: [
            'client.post("/login?username=elena&ip=10.0.0.1")',
            'Лимит считается отдельно для каждого уникального IP',
          ],
        },
        {
          title: 'Задание 2: добавление информации об остатке попыток',
          difficulty: 'medium',
          description: 'Измени эндпоинт так, чтобы в ответе возвращалось поле "remaining_attempts" — сколько попыток из 3 ещё осталось у пользователя.',
          hints: [
            'remaining = max_attempts - len(valid_timestamps)',
            'return {"status": "success", "remaining_attempts": remaining}',
          ],
          solution: `@app.post("/login-with-info")
def login_with_info(username: str, ip: str = "192.168.1.100"):
    rate_limiter(ip, max_attempts=3)
    remaining = 3 - len(attempts_log[ip])
    return {"status": "success", "user": username, "remaining": remaining}

print(client.post("/login-with-info?username=test").json())`,
        },
        {
          title: 'Задание 3: алгоритм скользящего окна (Sliding Window)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему простой счётчик "обнулять в начале каждой минуты" плох тем, что злоумышленник может отправить 100 запросов на 59-й секунде и ещё 100 на 1-й секунде новой минуты (всплеск 200 запросов за 2 секунды)? Как сохранение точных временных меток решает эту проблему?',
          hints: [
            'Скользящее окно (sliding window) учитывает интервал ровно за последние 60 секунд от текущего мгновения',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Возвращать 500 Internal Server Error или 400 Bad Request при превышении лимита запросов',
          right: 'Стандартный HTTP-код для превышения лимитов частоты запросов — строго 429 Too Many Requests. Клиенты и библиотеки ориентируются именно на код 429',
        },
        {
          wrong: 'Блокировать пользователя навсегда при превышении частоты запросов вместо временного ограничения',
          right: 'Rate Limiting предназначен для регулирования темпа запросов, а не для вечного бана. Лимит должен автоматически восстанавливаться по прошествии временного окна',
        },
      ],
      checklist: [
        'Понимаю, зачем нужен Rate Limiting (защита от брутфорса паролей, спама и перегрузки)',
        'Знаю стандартный HTTP статус-код 429 Too Many Requests',
        'Понимаю алгоритм ограничения запросов на основе скользящего окна времени',
        'Знаю, что в распределённых системах счётчики хранятся в Redis',
      ],
    },

    {
      id: 'environment-variables',
      title: 'Переменные окружения (.env) и секреты',
      summary: 'Почему пароли и секретные ключи нельзя коммитить в git, как работает .env и библиотека python-dotenv',
      theory: [
        {
          type: 'p',
          text: 'В модуле 8 мы генерировали SECRET_KEY для подписи JWT-токенов, а в модуле 7 подключались к базе данных по паролю. В учебных примерах мы писали секреты прямо в коде Python. Но в реальной разработке это СМЕРТЕЛЬНЫЙ ГРЕХ: код попадает в git-репозиторий (GitHub, GitLab), его видят другие разработчики, а если репозиторий публичный — специальные поисковые боты хакеров найдут твои ключи за 30 секунд после нажатия git push!',
        },
        {
          type: 'analogy',
          text: 'Переменные окружения — это как сейф с ключами от квартиры. Чертёж дома (исходный код приложения) можно показывать архитекторам, строителям и друзьям — в нём нет ничего секретного. Но сам ключ от входной двери (пароль к базе данных или секретный ключ) ты хранишь в кармане / сейфе у себя дома, а не приклеиваешь скотчем на чертёж!',
        },
        {
          type: 'steps',
          title: 'Как устроено хранение секретов в проекте',
          items: [
            { code: '.env файл', note: '1. Локальный текстовый файл с парами КЛЮЧ=ЗНАЧЕНИЕ (например: SECRET_KEY=my-super-secret-key-123)' },
            { code: '.gitignore', note: '2. Файл со списком того, что Git обязан ИГНОРИРОВАТЬ. Строка ".env" внутри .gitignore гарантирует, что файл с паролями никогда не улетит на GitHub' },
            { code: '.env.example', note: '3. Шаблон без секретов (например: SECRET_KEY=your_secret_here), который коммитится в Git как образец для других разработчиков' },
            { code: 'os.getenv("SECRET_KEY")', note: '4. Стандартная функция Python для чтения значения переменной из операционной системы' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Библиотека python-dotenv',
          text: 'В Python для автоматической загрузки переменных из файла .env в окружение используют популярную библиотеку python-dotenv: from dotenv import load_dotenv; load_dotenv(). Она находит файл .env в папке проекта и делает все переменные доступными через os.getenv().',
        },
      ],
      example: {
        title: 'Чтение конфигурации приложения из переменных окружения',
        lang: 'python',
        code: `import os
from dotenv import load_dotenv

# Загружаем переменные из локального файла .env:
load_dotenv()

# Читаем секреты с помощью os.getenv:
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG_MODE = os.getenv("DEBUG", "False").lower() == "true"

if not SECRET_KEY:
    raise RuntimeError("КРИТИЧЕСКАЯ ОШИБКА: Переменная SECRET_KEY не задана в окружении!")

print("База данных:", DATABASE_URL)
print("Секретный ключ успешно загружен из окружения (длина:", len(SECRET_KEY), "символов)")`,
        explanation: 'os.getenv("KEY", "default") позволяет задать безопасное значение по умолчанию для разработки, а для критичных секретов поднимает ошибку, если они не заданы.',
      },
      terminal: {
        title: 'Работа с .env и .gitignore в терминале',
        description: 'Посмотри, как создаётся .env файл и как .gitignore защищает его от попадания в Git:',
        lessonCommands: {
          'cat .gitignore': {
            output: [
              '# Виртуальное окружение',
              'venv/',
              '__pycache__/',
              '',
              '# Секреты и переменные окружения (НИКОГДА НЕ КОММИТИТЬ!)',
              '.env',
              '*.secret',
            ],
            type: 'default',
          },
          'git status': {
            output: [
              'On branch main',
              'Untracked files:',
              '  (use "git add <file>..." to include in what will be committed)',
              '	.env.example',
              '	main.py',
              '',
              'nothing added to commit but untracked files present (use "git add" to track)',
              '# Обрати внимание: файла .env нет в списке — .gitignore надёжно скрыл его!',
            ],
            type: 'success',
          },
        },
        suggestions: ['cat .gitignore', 'git status'],
        script: [
          { command: 'cat .gitignore' },
          { command: 'git status' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице используется реальный модуль os. Попробуй запустить безопасную инициализацию настроек сервера через переменные окружения.',
        initialCode: `import os
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

# Имитируем переменные, которые передала операционная система:
os.environ["APP_ENV"] = "production"
os.environ["SECRET_KEY"] = "super-secret-jwt-key-2026"
os.environ["DATABASE_URL"] = "sqlite:///./production.db"

app = FastAPI()

class Config:
    ENV = os.getenv("APP_ENV", "development")
    SECRET_KEY = os.getenv("SECRET_KEY")
    DB_URL = os.getenv("DATABASE_URL", "sqlite:///./default.db")

# Проверяем обязательные секреты при старте приложения:
if not Config.SECRET_KEY:
    raise RuntimeError("SECRET_KEY обязателен для запуска!")

@app.get("/info")
def get_info():
    return {
        "environment": Config.ENV,
        "database": Config.DB_URL,
        # Сам SECRET_KEY мы НИКОГДА не отдаём в API, только подтверждаем его наличие:
        "has_secret_key": bool(Config.SECRET_KEY)
    }

client = TestClient(app)
res = client.get("/info")
print("Ответ сервера:", res.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: чтение порта сервера с дефолтным значением',
          difficulty: 'easy',
          description: 'Добавь в класс Config поле PORT, которое читает переменную окружения "PORT" как целое число (int), а если её нет — использует значение по умолчанию 8000. Проверь работу с установленным os.environ["PORT"] = "9000".',
          hints: [
            'PORT = int(os.getenv("PORT", "8000"))',
          ],
        },
        {
          title: 'Задание 2: валидация обязательных секретов',
          difficulty: 'medium',
          description: 'Напиши функцию validate_required_env(keys: list), которая проверяет наличие всех указанных ключей в os.environ. Если хотя бы одного ключа нет — поднимает ValueError с перечислением отсутствующих переменных.',
          hints: [
            'missing = [k for k in keys if k not in os.environ]\nif missing:\n    raise ValueError(f"Отсутствуют переменные: {missing}")',
          ],
          solution: `def validate_required_env(keys: list):
    missing = [k for k in keys if not os.getenv(k)]
    if missing:
        raise ValueError(f"Отсутствуют обязательные переменные: {missing}")

validate_required_env(["SECRET_KEY", "DATABASE_URL"])
print("✓ Все обязательные переменные на месте!")`,
        },
        {
          title: 'Задание 3: разделение окружений DEV и PROD',
          difficulty: 'hard',
          description: 'Создай логику: если Config.ENV == "production", то параметр DEBUG_MODE обязан быть False. Если кто-то случайно установил os.environ["DEBUG"] = "True" в продакшене — вызови аварийную остановку (raise RuntimeError("DEBUG режим запрещён в продакшене!")). Проверь работу обеих ситуаций.',
          hints: [
            'В продакшене включенный DEBUG режим может показывать пользователям внутренний код ошибок и пути к файлам сервера',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Закоммитить файл .env в git-репозиторий со словами "потом удалю"',
          right: 'Git сохраняет всю историю изменений навсегда! Даже если ты удалишь .env в следующем коммите, секреты останутся в истории коммитов. Добавляй .env в .gitignore ДО первого коммита',
        },
        {
          wrong: 'Использовать os.environ["SECRET_KEY"] без значения по умолчанию там, где переменная не является строго обязательной',
          right: 'Прямое обращение по ключу os.environ["KEY"] вызывает падение с ошибкой KeyError, если переменная не установлена. Используй os.getenv("KEY", "default") для безопасного чтения',
        },
      ],
      checklist: [
        'Понимаю, почему секреты, пароли и ключи нельзя коммитить в git',
        'Знаю назначение файлов .env, .gitignore и .env.example',
        'Умею читать переменные окружения через os.getenv("KEY", default)',
        'Знаю, как библиотека python-dotenv помогает локальной разработке',
      ],
    },
  ],
};
