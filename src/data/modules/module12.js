export const module12 = {
  id: 'async',
  order: 12,
  title: 'Асинхронность',
  icon: '⚡',
  description: 'async/await, асинхронные роуты в FastAPI и почему async важен для веб-серверов.',
  lessons: [
    {
      id: 'why-async',
      title: 'Зачем нужна асинхронность: аналогия с поваром',
      summary: 'Почему классические программы тратят 99% времени на пустое ожидание и как async ускоряет веб-серверы в разы',
      theory: [
        {
          type: 'p',
          text: 'Веб-сервер — это программа, к которой одновременно обращаются сотни и тысячи пользователей. Большую часть времени при обработке запроса сервер на самом деле НЕ вычисляет сложные формулы, а просто ЖДЁТ: ждёт ответа от базы данных PostgreSQL, ждёт ответа от стороннего платёжного шлюза или ждёт, пока файл запишется на диск. В классическом синхронном коде во время этого ожидания сервер буквально замирает и не может обслуживать других людей.',
        },
        {
          type: 'analogy',
          text: 'Представь повара на кухне ресторана. Синхронный повар поставил вариться суп на 20 минут и ВСЕ 20 минут стоит неподвижно у кастрюли, глядя на воду. Все остальные гости в зале сидят голодными и ждут. Асинхронный повар поставил суп вариться (запустил долгое I/O действие), завёл таймер (await) и сразу же пошёл резать салат и жарить стейк для других столиков! Когда таймер супа звенит — повар возвращается и снимает кастрюлю.',
        },
        {
          type: 'list',
          title: 'Два типа задач: I/O-bound против CPU-bound',
          items: [
            'I/O-bound (Input/Output — ввод/вывод): задачи, где узкое место — это ожидание внешних ресурсов (запрос к базе данных, запрос к стороннему API по сети, чтение файла с диска). Именно здесь асинхронность даёт огромный прирост скорости!',
            'CPU-bound (Central Processing Unit — расчёты процессора): задачи, где процессор непрерывно считает (рендеринг 3D-видео, машинное обучение, архивация гигантского файла). Здесь асинхронность НЕ поможет, потому что процессор и так занят на 100% — для таких задач используют параллельные процессы (multiprocessing).',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'FastAPI спроектирован для асинхронности с самого первого дня',
          text: 'FastAPI построен поверх ASGI-сервера (Uvicorn) и библиотеки Starlette. Это значит, что один рабочий процесс FastAPI может одновременно держать тысячи открытых соединений и быстро переключаться между ними, пока они ждут ответов от базы данных.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Разница между последовательным и асинхронным ожиданием',
          lang: 'python',
          code: `import asyncio
import time

# Синхронная имитация (ждём по очереди):
# 3 запроса по 1 секунде займут 3 секунды суммарно!

# Асинхронная имитация (ждём параллельно):
async def fetch_data(source_id: int):
    print(f"Начали опрос источника {source_id}...")
    await asyncio.sleep(1)  # имитация ожидания ответа по сети
    print(f"✓ Источник {source_id} ответил!")
    return f"Данные {source_id}"

async def main():
    # Запускаем все 3 запроса одновременно через asyncio.gather:
    results = await asyncio.gather(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3)
    )
    print("Все данные получены:", results)

# Все 3 запроса выполнятся суммарно всего за ~1 секунду вместо 3!`,
          explanation: 'asyncio.gather запускает несколько асинхронных задач параллельно. Пока каждая задача ожидает таймер await asyncio.sleep, Python переключается на другие задачи.',
        },
        {
          title: 'Пример 2: Замер времени: синхронно vs асинхронно',
          lang: 'python',
          code: `import asyncio
import time

def sync_task(name: str):
    time.sleep(0.5)
    return f"{name} готов"

async def async_task(name: str):
    await asyncio.sleep(0.5)
    return f"{name} готов"

# Синхронно (3 * 0.5с = 1.5 секунды):
# res_sync = [sync_task("А"), sync_task("Б"), sync_task("В")]

# Асинхронно (всего 0.5 секунды!):
# res_async = await asyncio.gather(async_task("А"), async_task("Б"), async_task("В"))`,
          explanation: 'При 100 одновременных сетевых запросах асинхронный код работает в 100 раз быстрее синхронного.',
        },
        {
          title: 'Пример 3: Обработка ошибок в asyncio.gather с return_exceptions=True',
          lang: 'python',
          code: `import asyncio

async def safe_fetch(api_name: str):
    if api_name == "broken_api":
        raise ConnectionError("Сервис временно недоступен!")
    await asyncio.sleep(0.1)
    return {"status": "ok", "api": api_name}

async def fetch_all():
    # return_exceptions=True предотвращает падение всего списка при сбое одного API:
    results = await asyncio.gather(
        safe_fetch("users_api"),
        safe_fetch("broken_api"),
        safe_fetch("orders_api"),
        return_exceptions=True
    )
    return results`,
          explanation: 'Флаг return_exceptions=True возвращает объект ошибки как элемент списка вместо прерывания всей программы.',
        },
      ],
      sandbox: {
        bootstrap: null,
        description: 'Запусти код в песочнице и посмотри, как 3 асинхронных запроса завершаются почти одновременно!',
        initialCode: `import asyncio

async def fetch_user_balance(user_id: int):
    print(f"-> Запрашиваем баланс пользователя {user_id}...")
    await asyncio.sleep(0.1) # имитация сетевого запроса
    print(f"<- Получен баланс пользователя {user_id}")
    return {"user_id": user_id, "balance": user_id * 100}

async def run_dashboard():
    # Запускаем сбор данных для 3 пользователей одновременно:
    results = await asyncio.gather(
        fetch_user_balance(1),
        fetch_user_balance(2),
        fetch_user_balance(3)
    )
    print("Итоговые данные дашборда:", results)

await run_dashboard()`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь четвёртый источник данных',
          difficulty: 'easy',
          description: 'Добавь в asyncio.gather запрос баланса для пользователя с user_id = 4. Убедись, что все 4 запроса успешно выполняются параллельно.',
          hints: ['Добавь fetch_user_balance(4) внутрь вызова asyncio.gather(...)'],
        },
        {
          title: 'Задание 2: асинхронная загрузка с разной задержкой',
          difficulty: 'medium',
          description: 'Напиши функцию async def fetch_weather(city: str, delay: float). Пусть она ждёт await asyncio.sleep(delay) и возвращает f"{city}: +20°C". Запусти параллельно города "Москва" (0.1с), "Токио" (0.3с) и "Лондон" (0.2с). Посмотри, в каком порядке придут ответы.',
          hints: [
            'async def fetch_weather(city: str, delay: float):\n    await asyncio.sleep(delay)\n    return f"{city}: +20°C"',
            'Город с наименьшей задержкой ответит первым!',
          ],
          solution: `async def fetch_weather(city: str, delay: float):
    print(f"Запрос погоды: {city}...")
    await asyncio.sleep(delay)
    print(f"Погода в {city} готова!")
    return f"{city}: +20°C"

async def test_weather():
    res = await asyncio.gather(
        fetch_weather("Москва", 0.1),
        fetch_weather("Токио", 0.3),
        fetch_weather("Лондон", 0.2)
    )
    print("Результаты:", res)

await test_weather()`,
        },
        {
          title: 'Задание 3: обработка ошибок в асинхронных задачах',
          difficulty: 'hard',
          description: 'Внедри в одну из функций ошибку: если city == "Ошибочный", подними ValueError("Сервер погоды недоступен"). Оберни вызов в try/except и посмотри, как asyncio.gather реагирует на исключения в одной из параллельных задач.',
          hints: [
            'По умолчанию asyncio.gather прерывается при первом возникшем исключении, если не передан параметр return_exceptions=True',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать async/await для тяжелых математических расчётов или кодирования видео в надежде ускорить их',
          right: 'Асинхронность ускоряет только I/O операции (ожидание сети, БД, диска). Для CPU-bound вычислений async не даёт прироста скорости — для них нужны отдельные процессы или воркеры (Celery)',
        },
        {
          wrong: 'Забыть написать ключевое слово await перед вызовом асинхронной функции',
          right: 'Если вызвать fetch_data() без await, Python не выполнит функцию, а просто вернёт объект корутины (<coroutine object ...>) и выдаст предупреждение "coroutine was never awaited"',
        },
      ],
      checklist: [
        'Понимаю разницу между I/O-bound (ожидание) и CPU-bound (расчёты) задачами',
        'Понимаю аналогию с асинхронным поваром на кухне',
        'Знаю, что async позволяет не блокировать процессор во время ожидания сети или базы данных',
        'Понимаю, почему веб-серверы получают огромную выгоду от асинхронности',
      ],
    },

    {
      id: 'async-await-basics',
      title: 'Синтаксис async def и await',
      summary: 'Как устроены корутины в Python, как работает цикл событий (Event Loop) и как запускать асинхронный код',
      theory: [
        {
          type: 'p',
          text: 'В языке Python асинхронность строится вокруг двух ключевых слов: async def (объявление асинхронной функции) и await (точка ожидания). Разберём, как они взаимодействуют.',
        },
        {
          type: 'analogy',
          text: 'Ключевое слово await — это как закладка в книге или кнопка "пауза". Когда выполнение доходит до await something(), текущая функция говорит главному диспетчеру (Event Loop): "Я жду ответа. Поставь меня на паузу, сохрани закладку на этой строке и иди пока позанимайся другими задачами. Когда мой ответ придёт — сними меня с паузы и продолжи со следующей строчки".',
        },
        {
          type: 'steps',
          title: 'Правила работы с async и await',
          items: [
            { code: 'async def get_user():', note: '1. Функция, объявленная с async def, называется КОРУТИНОЙ (coroutine)' },
            { code: 'await asyncio.sleep(1)', note: '2. await можно писать ТОЛЬКО внутри функций, объявленных с async def. В обычной def функции await вызовет синтаксическую ошибку' },
            { code: 'user = await get_user()', note: '3. Вызов асинхронной функции обязательно должен сопровождаться await, иначе она не начнёт выполняться' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Event Loop (Цикл событий) — сердце асинхронного Python',
          text: 'Event Loop — это бесконечный диспетчер внутри Python, который крутится по кругу и проверяет: "У кого из задач готово сетевое событие? Чей таймер истёк?". Uvicorn запускает Event Loop при старте сервера и передаёт ему входящие HTTP-запросы.',
        },
      ],
      example: {
        title: 'Цепочка асинхронных вызовов',
        lang: 'python',
        code: `import asyncio

async def fetch_db_user(user_id: int) -> dict:
    await asyncio.sleep(0.05)  # имитация запроса к БД
    return {"id": user_id, "name": "Алексей"}

async def fetch_user_orders(user_id: int) -> list:
    await asyncio.sleep(0.05)  # ещё один запрос
    return [{"order_id": 101, "item": "Книга"}]

async def get_user_profile(user_id: int) -> dict:
    # Запускаем два запроса параллельно:
    user, orders = await asyncio.gather(
        fetch_db_user(user_id),
        fetch_user_orders(user_id)
    )
    return {"user": user, "orders": orders}

# В обычном скрипте запуск осуществляется через:
# asyncio.run(get_user_profile(1))`,
        explanation: 'get_user_profile вызывает две асинхронные функции одновременно через asyncio.gather и дожидается их выполнения одной строкой await.',
      },
      sandbox: {
        bootstrap: null,
        description: 'Попробуй цепочку асинхронных функций в песочнице и убедись, как await распаковывает результаты.',
        initialCode: `import asyncio

async def validate_token(token: str) -> str:
    await asyncio.sleep(0.05)
    if token == "secret-123":
        return "admin_user"
    raise ValueError("Неверный токен")

async def load_settings(username: str) -> dict:
    await asyncio.sleep(0.05)
    return {"theme": "dark", "notifications": True}

async def authenticate_and_load(token: str):
    print("1. Проверяем токен...")
    username = await validate_token(token)
    print(f"2. Токен верный! Пользователь: {username}")
    
    print("3. Загружаем настройки...")
    settings = await load_settings(username)
    print("4. Готово! Настройки:", settings)
    return {"user": username, "settings": settings}

res = await authenticate_and_load("secret-123")`,
      },
      tasks: [
        {
          title: 'Задание 1: асинхронная проверка пароля',
          difficulty: 'easy',
          description: 'Напиши корутину async def verify_pin(pin: str) -> bool. Если pin == "7777", подожди await asyncio.sleep(0.05) и верни True, иначе False. Вызови её с await и распечатай результат.',
          hints: ['async def verify_pin(pin: str) -> bool:\n    await asyncio.sleep(0.05)\n    return pin == "7777"'],
        },
        {
          title: 'Задание 2: параллельный опрос сервисов через gather',
          difficulty: 'medium',
          description: 'Напиши две асинхронные функции: fetch_rates() (возвращает {"USD": 90}) и fetch_stocks() (возвращает {"AAPL": 220}). Напиши третью функцию get_market_summary(), которая через await asyncio.gather запрашивает оба сервиса одновременно и объединяет словари.',
          hints: [
            'rates, stocks = await asyncio.gather(fetch_rates(), fetch_stocks())',
            'return {**rates, **stocks}',
          ],
          solution: `async def fetch_rates():
    await asyncio.sleep(0.05)
    return {"USD": 90}

async def fetch_stocks():
    await asyncio.sleep(0.05)
    return {"AAPL": 220}

async def get_market_summary():
    rates, stocks = await asyncio.gather(fetch_rates(), fetch_stocks())
    return {"rates": rates, "stocks": stocks}

summary = await get_market_summary()
print("Сводка рынков:", summary)`,
        },
        {
          title: 'Задание 3: тайм-аут ожидания (asyncio.wait_for)',
          difficulty: 'hard',
          description: 'Иногда внешний сервер зависает. Для защиты используют asyncio.wait_for(coro, timeout=секунды). Напиши функцию async def slow_service(): await asyncio.sleep(0.5). Оберни её в asyncio.wait_for(slow_service(), timeout=0.1) внутри блока try/except TimeoutError и выведи сообщение "Сервер не ответил вовремя!".',
          hints: [
            'try:\n    await asyncio.wait_for(slow_service(), timeout=0.1)\nexcept (TimeoutError, asyncio.TimeoutError):\n    print("Тайм-аут!")',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'def calculate():\n    await asyncio.sleep(1)  # SyntaxError: "await" outside async function',
          right: 'await можно использовать только внутри функций с префиксом async def. В обычной def функции await писать нельзя',
        },
        {
          wrong: 'task = fetch_data()  # забыли await\nprint("Данные:", task["name"])  # TypeError: \'coroutine\' object is not subscriptable',
          right: 'Без await вызов асинхронной функции не возвращает данные, а возвращает объект корутины. Обязательно пиши: data = await fetch_data()',
        },
      ],
      checklist: [
        'Знаю, что async def объявляет корутину',
        'Понимаю, что await ставит выполнение корутины на паузу до получения результата',
        'Знаю роль Event Loop как главного диспетчера событий',
        'Умею параллелить независимые корутины через asyncio.gather',
      ],
    },

    {
      id: 'async-fastapi-routes',
      title: 'Асинхронные роуты в FastAPI',
      summary: 'Когда объявлять эндпоинты через async def, а когда использовать обычный def, и как FastAPI работает с потоками',
      theory: [
        {
          type: 'p',
          text: 'В документации FastAPI ты увидишь эндпоинты, объявленные как @app.get("/") async def root(): ..., и эндпоинты, объявленные просто как @app.get("/") def root(): .... В чём между ними разница и когда что выбирать?',
        },
        {
          type: 'analogy',
          text: 'Представь парк аттракционов. async def — это экспресс-линия с прямым доступом к главному диспетчеру (Event Loop). Обычный def — это отправка задачи во внешний вспомогательный цех (ThreadPool — пул отдельных потоков операционной системы). FastAPI настолько умён, что сам заботится об обычных def-роутах, чтобы они не подвесили главный цикл событий.',
        },
        {
          type: 'list',
          title: 'Золотое правило выбора: async def или def?',
          items: [
            'Пиши async def — если внутри эндпоинта ты используешь асинхронные библиотеки с await (например: асинхронная сессия SQLAlchemy AsyncSession, асинхронный HTTP-клиент httpx.AsyncClient, асинхронный драйвер asyncpg или redis-py)',
            'Пиши обычный def — если ты используешь СИНХРОННЫЕ библиотеки, которые НЕ поддерживают await (например: классический синхронный SQLAlchemy session.query, стандартный модуль sqlite3, библиотека requests или синхронный time.sleep). FastAPI автоматически запустит такой роут в отдельном потоке (Thread Pool) и не заблокирует сервер!',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Частый вопрос на собеседовании: что сделает FastAPI с обычной def функцией?',
          text: 'Ответ: FastAPI не запускает обычный def в главном Event Loop. Он отправляет его во внутренний пул потоков (anyio / starlette ThreadPoolExecutor). Это защищает сервер от зависания, но создание потоков требует больше памяти, чем лёгкие асинхронные корутины.',
        },
      ],
      example: {
        title: 'Сравнение async def и def роутов в одном приложении',
        lang: 'python',
        code: `from fastapi import FastAPI
import asyncio

app = FastAPI()

# 1. Асинхронный роут: используем await с неблокирующим кодом
@app.get("/async-data")
async def get_async_data():
    await asyncio.sleep(0.05)  # неблокирующее асинхронное ожидание
    return {"type": "async", "status": "ok"}

# 2. Синхронный роут: FastAPI выполнит его в отдельном потоке (ThreadPool)
@app.get("/sync-data")
def get_sync_data():
    # Если здесь классический синхронный код (например, sqlite3) — это безопасно
    return {"type": "sync", "status": "ok"}`,
        explanation: 'FastAPI одинаково поддерживает оба подхода, позволяя плавно переходить от синхронных библиотек к асинхронным.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице работают оба типа эндпоинтов: синхронные и асинхронные. Проверь ответы через TestClient!',
        initialCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# Синхронный эндпоинт (выполняется через пул потоков):
@app.get("/sync-hello")
def sync_hello(name: str = "Гость"):
    return {"message": f"Привет синхронно, {name}!"}

# Асинхронный эндпоинт:
@app.get("/async-hello")
def async_hello(name: str = "Гость"):
    return {"message": f"Привет асинхронно, {name}!"}

client = TestClient(app)

res_sync = client.get("/sync-hello?name=Аня")
print("Синхронный ответ:", res_sync.status_code, res_sync.json())

res_async = client.get("/async-hello?name=Борис")
print("Асинхронный ответ:", res_async.status_code, res_async.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: асинхронный роут расчёта стоимости',
          difficulty: 'easy',
          description: 'Создай эндпоинт @app.post("/calculate-tax"), принимающий amount: float. Если amount < 0, подними HTTPException(400, "Сумма не может быть отрицательной"). Верни {"tax": amount * 0.2}. Проверь вызов через client.post.',
          hints: ['status_code=200, return {"tax": amount * 0.2}'],
        },
        {
          title: 'Задание 2: комбинированный эндпоинт статистики',
          difficulty: 'medium',
          description: 'Создай синхронный эндпоинт @app.get("/stats") и асинхронный эндпоинт @app.get("/async-stats"). Пусть оба возвращают одинаковую структуру: {"uptime_seconds": 120, "active_users": 15}. Напиши тесты для обоих.',
          hints: ['Сравни status_code и json() у обоих эндпоинтов'],
          solution: `@app.get("/stats")
def get_stats():
    return {"uptime_seconds": 120, "active_users": 15}

@app.get("/async-stats")
def get_async_stats():
    return {"uptime_seconds": 120, "active_users": 15}

assert client.get("/stats").json() == client.get("/async-stats").json()
print("✓ Эндпоинты статистики работают идентично")`,
        },
        {
          title: 'Задание 3: когда переходить на Async SQLAlchemy',
          difficulty: 'hard',
          description: 'Объясни в комментарии: если твой проект использует классический синхронный SQLAlchemy (из модуля 7), какой тип функций роутов (def или async def) следует использовать и почему объявление async def с синхронным session.query приведет к замедлению сервера?',
          hints: [
            'Если объявить async def и вызвать синхронный запрос к БД, код выполнится в главном Event Loop и заблокирует всех остальных пользователей',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Объявлять ВСЕ роуты как async def по привычке, даже если внутри вызывается синхронный код (time.sleep, requests.get, классический SQLAlchemy)',
          right: 'Если внутри роута нет await, а вызываются блокирующие синхронные функции, объявление async def заставит их выполниться в главном потоке Event Loop и парализует весь сервер. Для синхронного кода пиши обычный def!',
        },
        {
          wrong: 'Считать, что FastAPI не умеет работать с обычными синхронными функциями def',
          right: 'FastAPI полноценно поддерживает и синхронные def, автоматически оборачивая их в ThreadPoolExecutor',
        },
      ],
      checklist: [
        'Знаю, когда объявлять роут как async def, а когда как обычный def',
        'Понимаю, как FastAPI обрабатывает синхронные def функции через пул потоков',
        'Знаю, почему нельзя вызывать синхронные блокирующие библиотеки внутри async def',
      ],
    },

    {
      id: 'blocking-pitfall',
      title: 'Главная ошибка: блокирующий вызов внутри async',
      summary: 'Почему time.sleep или синхронные запросы внутри async def замораживают весь сервер и как этого избежать',
      theory: [
        {
          type: 'p',
          text: 'Это САМАЯ коварная и опасная ошибка, которую совершают 90% новичков при знакомстве с асинхронностью. Один неверный вызов внутри async def роута способен намертво заморозить веб-сервер для ВСЕХ подключенных пользователей одновременно!',
        },
        {
          type: 'analogy',
          text: 'Представь, что в банке работает один очень быстрый и вежливый консультант (Event Loop), который быстро принимает заявки у длинной очереди людей. И вдруг один посетитель просит: "Постойте 10 секунд молча, ничего не делая!" (time.sleep). Если консультант послушно замирает и стоит столбом — ВСЯ очередь из 100 человек останавливается и ждёт. Вместо этого консультант должен был сказать: "Я запускаю таймер ожидания (await asyncio.sleep), а пока он идёт — следующий в очереди, подходите!".',
        },
        {
          type: 'steps',
          title: 'Сравнение блокирующего и неблокирующего ожидания',
          items: [
            { code: 'time.sleep(5)  # ❌ ОШИБКА ВНУТРИ ASYNC DEF', note: 'Блокирует весь поток операционной системы. Главный цикл событий замирает. Ни один другой запрос не может обработаться!' },
            { code: 'await asyncio.sleep(5)  # ✅ ПРАВИЛЬНО', note: 'Освобождает цикл событий. Сервер успевает обработать сотни чужих запросов, пока длится эта пауза' },
            { code: 'requests.get("https://api.com")  # ❌ БЛОКИРУЮЩИЙ HTTP-КЛИЕНТ', note: 'Синхронная библиотека requests останавливает поток до прихода ответа по сети' },
            { code: 'await client.get("https://api.com")  # ✅ ASYNC HTTP (HTTPX / AIOHTTP)', note: 'Асинхронный клиент корректно отдаёт управление Event Loop во время ожидания пакетов' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Как исправить, если библиотеку нельзя сделать асинхронной?',
          text: 'Если тебе обязательно нужно вызвать тяжёлую синхронную функцию (или стороннюю синхронную библиотеку), у тебя есть два пути: 1) Объяви роут через обычный def (FastAPI сам отправит его в ThreadPool); 2) Либо внутри async def используй asyncio.to_thread(sync_func, arg1).',
        },
      ],
      example: {
        title: 'Правильный и неправильный способ работы с паузами и синхронными функциями',
        lang: 'python',
        code: `import asyncio
import time

# ❌ ПЛОХО: блокирует цикл событий
async def bad_handler():
    time.sleep(2)  # весь сервер заморожен на 2 секунды!
    return "ok"

# ✅ ХОРОШО: асинхронная пауза
async def good_async_handler():
    await asyncio.sleep(2)  # сервер продолжает отвечать другим клиентам
    return "ok"

# ✅ ХОРОШО: запуск тяжелой синхронной функции в отдельном потоке
def heavy_sync_calculation(n: int):
    # тяжелая синхронная работа
    return sum(i * i for i in range(n))

async def good_sync_bridge():
    # asyncio.to_thread отправляет вызов в отдельный поток:
    result = await asyncio.to_thread(heavy_sync_calculation, 1000000)
    return result`,
        explanation: 'asyncio.to_thread позволяет безопасно вызывать синхронные функции внутри async def без риска заморозить Event Loop.',
      },
      sandbox: {
        bootstrap: null,
        description: 'Попробуй безопасный мост asyncio.to_thread для синхронных вычислений внутри асинхронного кода.',
        initialCode: `import asyncio

def sync_work(task_name: str) -> str:
    # Обычная синхронная функция
    print(f"[Поток] Начинаем работу: {task_name}")
    total = sum(range(10000))
    print(f"[Поток] Завершена: {task_name} (сумма: {total})")
    return f"Готово: {task_name}"

async def main():
    print("-> Запускаем две синхронные задачи через asyncio.to_thread параллельно...")
    
    # Запускаем две синхронные функции в отдельных потоках без блокировки:
    res1, res2 = await asyncio.gather(
        asyncio.to_thread(sync_work, "Отчёт 1"),
        asyncio.to_thread(sync_work, "Отчёт 2")
    )
    
    print("<- Результаты получены:", [res1, res2])

await main()`,
      },
      tasks: [
        {
          title: 'Задание 1: замени time.sleep на asyncio.sleep',
          difficulty: 'easy',
          description: 'Дана функция async def pause(): time.sleep(0.1). Исправь ошибку, заменив блокирующий вызов на неблокирующий await asyncio.sleep(0.1).',
          hints: ['Удали time.sleep и напиши await asyncio.sleep(0.1)'],
        },
        {
          title: 'Задание 2: асинхронная обработка списка файлов',
          difficulty: 'medium',
          description: 'Напиши синхронную функцию parse_file(filename: str) -> int (возвращает len(filename)). Напиши асинхронную функцию process_files(files: list), которая для каждого файла вызывает asyncio.to_thread(parse_file, f) и собирает результаты через asyncio.gather.',
          hints: [
            'tasks = [asyncio.to_thread(parse_file, f) for f in files]',
            'return await asyncio.gather(*tasks)',
          ],
          solution: `def parse_file(filename: str) -> int:
    return len(filename)

async def process_files(files: list):
    tasks = [asyncio.to_thread(parse_file, f) for f in files]
    return await asyncio.gather(*tasks)

res = await process_files(["file1.txt", "document_super_long.pdf", "data.json"])
print("Длины имен файлов:", res)`,
        },
        {
          title: 'Задание 3: обнаружение антипаттерна',
          difficulty: 'hard',
          description: 'Объясни, что произойдет с сервером Uvicorn при нагрузке 100 RPS, если в роут @app.get("/avatar") async def get_avatar(): вставить синхронный вызов requests.get("https://avatar-service.com/img") с задержкой ответа 1 секунда. Напиши правильный вариант исправления.',
          hints: [
            'При 100 RPS и задержке 1 сек очередь запросов моментально переполнится, и сервер перестанет отвечать новым клиентам (504 Gateway Timeout)',
            'Исправление: использовать httpx.AsyncClient с await client.get(...) или объявить роут как def',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать time.sleep() внутри асинхронного роута @app.get("/") async def ...',
          right: 'time.sleep() замораживает весь рабочий процесс и Event Loop. Используй await asyncio.sleep() для пауз внутри async функций',
        },
        {
          wrong: 'Использовать синхронную библиотеку requests внутри async def',
          right: 'Библиотека requests синхронна и блокирует поток. Для async def используй современную библиотеку httpx (httpx.AsyncClient) или aiohttp',
        },
      ],
      checklist: [
        'Понимаю, почему time.sleep внутри async def — это катастрофа для веб-сервера',
        'Знаю разницу между библиотеками requests (синхронная) и httpx (асинхронная)',
        'Умею использовать asyncio.to_thread для безопасного выполнения синхронного кода',
        'Знаю, как исправить блокирующий код в роутах FastAPI',
      ],
    },
  ],
};
