export const module20 = {
  id: 'external-apis',
  order: 20,
  title: 'Работа с внешними API',
  icon: '🔌',
  description: 'Как делать запросы к сторонним сервисам: requests, httpx, API-ключи, заголовки и обработка сетевых сбоев.',
  lessons: [
    {
      id: 'what-is-external-api',
      title: 'Что значит «дёргать чужой API» простыми словами',
      summary: 'Как твой сервер может обращаться к другим сервисам в интернете и получать данные через библиотеку requests',
      theory: [
        {
          type: 'p',
          text: 'До сих пор мы создавали сервер, который сам принимал запросы от клиентов. Но современный бэкенд редко живёт в изоляции: чтобы узнать погоду — сервер спрашивает сервис OpenWeather, чтобы принять оплату — обращается к API Сбера или ЮKassa, чтобы отправить SMS — делает запрос к SMS-шлюзу. Этот процесс программисты на сленге называют "дёргать чужой API" (Consuming external APIs).',
        },
        {
          type: 'analogy',
          text: 'Представь, что твой сервер — это менеджер в офисе. Клиент спрашивает менеджера: "Какой сейчас курс доллара?". У менеджера нет собственного валютного хранилища. Менеджер снимает телефонную трубку (делает HTTP-запрос через библиотеку requests), звонит в Центральный Банк (внешний API), спрашивает курс, получает ответ на понятном языке (JSON), кладёт трубку и красиво отвечает своему клиенту!',
        },
        {
          type: 'steps',
          title: 'Как сделать GET-запрос через библиотеку requests',
          items: [
            { code: 'import requests', note: 'Самая популярная и удобная библиотека для синхронных HTTP-запросов в Python' },
            { code: 'response = requests.get("https://api.github.com/users/octocat")', note: 'Отправляем GET-запрос по указанному URL' },
            { code: 'if response.status_code == 200:', note: 'Проверяем, что удалённый сервер ответил успехом (код 200 OK)' },
            { code: 'data = response.json()', note: 'Превращаем сырую строку JSON ответа в удобный словарь Python!' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Получение курса валют из публичного API',
          lang: 'python',
          code: `import requests

def get_crypto_price(coin_id: str = "bitcoin") -> dict:
    """Запрашивает актуальную цену криптовалюты из бесплатного API CoinGecko"""
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd,rub"
    
    try:
        response = requests.get(url, timeout=5)  # таймаут 5 секунд
        if response.status_code == 200:
            data = response.json()
            return {
                "coin": coin_id,
                "price_usd": data[coin_id]["usd"],
                "price_rub": data[coin_id]["rub"]
            }
        return {"error": f"Сервис вернул статус {response.status_code}"}
    except requests.exceptions.RequestException as exc:
        return {"error": f"Сетевой сбой: {exc}"}

# print(get_crypto_price("bitcoin"))
# -> {'coin': 'bitcoin', 'price_usd': 96500, 'price_rub': 9200000}`,
          explanation: 'Метод response.json() автоматически парсит тело ответа в словарь Python, а timeout=5 защищает от зависания.',
        },
        {
          title: 'Пример 2: Передача параметров запроса (Query Params) через словарь',
          lang: 'python',
          code: `import requests

# Вместо ручной конкатенации строк передавай словарь params:
params = {
    "q": "FastAPI backend",
    "limit": 5,
    "sort": "stars"
}

# requests сам склеит URL: https://api.example.com/search?q=FastAPI+backend&limit=5&sort=stars
# response = requests.get("https://api.example.com/search", params=params)`,
          explanation: 'Словарь params автоматически экранирует пробелы и специальные символы по стандарту URL Encoding.',
        },
        {
          title: 'Пример 3: Безопасный парсинг с проверкой формата JSON',
          lang: 'python',
          code: `import requests

def safe_fetch_json(url: str):
    response = requests.get(url, timeout=3)
    response.raise_for_status()  # выбрасывает исключение при кодах 4xx и 5xx!
    try:
        return response.json()
    except ValueError:
        print("❌ Сервер вернул не JSON (например, HTML с ошибкой)!")
        return None`,
          explanation: 'Метод response.raise_for_status() — профессиональный способ проверки HTTP статуса перед чтением данных.',
        },
      ],
      terminal: {
        title: 'Установка библиотеки requests',
        description: 'Установи requests в виртуальное окружение:',
        lessonCommands: {
          'pip install requests': {
            output: [
              'Collecting requests',
              '  Downloading requests-2.32.3-py3-none-any.whl (64 kB)',
              'Installing collected packages: requests',
              'Successfully installed requests-2.32.3',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install requests', 'curl https://api.github.com'],
        script: [
          { command: 'pip install requests' },
          { command: 'curl https://api.github.com' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор HTTP-клиента запрашивает внешний сервис погоды. Запусти код!',
        initialCode: `import json

class MockHttpClient:
    def get(self, url, params=None):
        # Имитируем ответ внешнего API погоды:
        city = params.get("city", "Москва") if params else "Москва"
        fake_response_data = {
            "city": city,
            "temperature": 22.5,
            "condition": "Солнечно",
            "humidity": 45
        }
        return MockResponse(200, json.dumps(fake_response_data))

class MockResponse:
    def __init__(self, status_code, raw_text):
        self.status_code = status_code
        self.text = raw_text

    def json(self):
        return json.loads(self.text)

client = MockHttpClient()

res = client.get("https://api.weather.com/v1", params={"city": "Санкт-Петербург"})
print("Статус ответа:", res.status_code)

data = res.json()
print(f"Погода в г. {data['city']}: {data['temperature']}°C, {data['condition']}")
assert data["city"] == "Санкт-Петербург"`,
      },
      tasks: [
        {
          title: 'Задание 1: функция конвертации валют',
          difficulty: 'easy',
          description: 'Напиши функцию convert_usd_to_rub(amount_usd: float, rate_rub: float = 95.5) -> float, возвращающую сумму в рублях с округлением до 2 знаков.',
          hints: ['return round(amount_usd * rate_rub, 2)'],
        },
        {
          title: 'Задание 2: парсер списка постов из JSONPlaceholder',
          difficulty: 'medium',
          description: 'Дан список постов raw_json = \'[{"id": 1, "title": "Post 1", "userId": 10}, {"id": 2, "title": "Post 2", "userId": 20}]\'. Напиши функцию, которая парсит JSON и возвращает список названий постов (title) для пользователя с userId == 10.',
          hints: ['data = json.loads(raw_json)\nreturn [p["title"] for p in data if p["userId"] == 10]'],
          solution: `import json

def get_user_post_titles(raw_json: str, user_id: int) -> list[str]:
    data = json.loads(raw_json)
    return [p["title"] for p in data if p.get("userId") == user_id]

raw = '[{"id": 1, "title": "Post 1", "userId": 10}, {"id": 2, "title": "Post 2", "userId": 20}]'
assert get_user_post_titles(raw, 10) == ["Post 1"]
print("✓ Фильтрация постов из внешнего API работает верно!")`,
        },
        {
          title: 'Задание 3: обработка недоступности сервиса',
          difficulty: 'hard',
          description: 'Если внешний сервис упал со статусом 503 Service Unavailable, напиши логику возврата кэшированных резервных данных (Fallback cache).',
          hints: ['if res.status_code != 200: return backup_cache.get(key)'],
        },
      ],
      mistakes: [
        {
          wrong: 'Никогда не указывать timeout в requests.get("https://...")',
          right: 'Без таймаута, если внешний сервис зависнет, твой сервер зависнет навсегда вместе с ним, заблокировав всех пользователей. Всегда пиши timeout=5',
        },
        {
          wrong: 'Склеивать параметры запроса вручную через плюс: url + "?city=" + city + "&key=" + key',
          right: 'Используй словарь params={"city": city, "key": key} — это защитит от ошибок с пробелами, спецсимволами и русскими буквами',
        },
      ],
      checklist: [
        'Понимаю назначение внешних HTTP-запросов из бэкенда',
        'Знаю синтаксис библиотеки requests (requests.get, params, timeout)',
        'Умею парсить JSON ответы через response.json()',
        'Понимаю важность проверки статуса ответа и установки таймаутов',
      ],
    },

    {
      id: 'post-headers-and-api-keys',
      title: 'POST-запросы, заголовки (Headers) и секретные API-ключи',
      summary: 'Как отправлять данные во внешние сервисы, передавать Bearer токены и безопасно хранить API-ключи',
      theory: [
        {
          type: 'p',
          text: 'Большинство серьёзных внешних сервисов (OpenAI, Stripe, SMS-шлюзы, Telegram Bot API) требуют авторизации. Для этого они выдают разработчику уникальный секретный API-КЛЮЧ (API Key или Bearer Token). Давай разберём, как отправлять данные через POST и передавать ключи в заголовках запроса.',
        },
        {
          type: 'steps',
          title: 'Анатомия авторизованного POST-запроса',
          items: [
            { code: 'headers = {"Authorization": f"Bearer {API_KEY}"}', note: '1. Заголовки (Headers): передаём секретный токен для подтверждения личности' },
            { code: 'payload = {"chat_id": 12345, "text": "Привет!"}', note: '2. Тело запроса (Body/JSON): данные, которые мы отправляем' },
            { code: 'res = requests.post(url, json=payload, headers=headers)', note: '3. Вызов requests.post: параметр json= автоматически сериализует словарь и выставляет заголовок Content-Type: application/json' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Никогда не храни API-ключи в коде проекта!',
          text: 'Внешние API-ключи привязаны к твоей кредитной карте или платному аккаунту. Если случайно запушить ключ от OpenAI в GitHub — боты украдут его за 10 секунд и потратят весь твой баланс. Всегда считывай ключи из .env через os.getenv("OPENAI_API_KEY")!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Отправка уведомления в Telegram-бота через requests.post',
          lang: 'python',
          code: `import os
import requests

def send_telegram_alert(message: str) -> bool:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "123456:ABC-FAKE-TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "987654321")
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": f"🚨 [Внимание]: {message}",
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False`,
          explanation: 'Параметр json=payload автоматически преобразует Python-словарь в валидный JSON и отправляет его в теле POST-запроса.',
        },
        {
          title: 'Пример 2: Запрос к защищённому API с Bearer-токеном в Headers',
          lang: 'python',
          code: `import requests

def create_payment_charge(amount_rub: int, order_id: str, api_secret: str):
    url = "https://api.payments.com/v1/charges"
    
    headers = {
        "Authorization": f"Bearer {api_secret}",
        "Content-Type": "application/json",
        "X-Idempotency-Key": f"order-{order_id}"  # защита от двойного списания
    }
    
    body = {
        "amount": amount_rub * 100,  # в копейках
        "currency": "RUB",
        "description": f"Оплата заказа №{order_id}"
    }
    
    # response = requests.post(url, json=body, headers=headers, timeout=10)
    return {"status": "prepared", "headers": headers, "body": body}`,
          explanation: 'Заголовок Authorization с префиксом Bearer — общемировой стандарт авторизации в REST API.',
        },
        {
          title: 'Пример 3: Валидация наличия всех секретных ключей при старте сервера',
          lang: 'python',
          code: `import os

REQUIRED_SECRETS = ["DATABASE_URL", "PAYMENT_API_KEY", "TELEGRAM_BOT_TOKEN"]

def validate_environment():
    missing = [key for key in REQUIRED_SECRETS if not os.getenv(key)]
    if missing:
        raise RuntimeError(f"❌ КРИТИЧЕСКАЯ ОШИБКА: Не заданы обязательные ключи в .env: {missing}")
    print("✓ Все необходимые API-ключи успешно загружены из .env!")`,
          explanation: 'Проверка окружения на старте приложения позволяет обнаружить отсутствующие ключи до того, как клиенты начнут совершать платежи.',
        },
      ],
      terminal: {
        title: 'Тестирование отправки POST-запроса через curl',
        description: 'Отправка тестового POST-запроса с JSON телом:',
        lessonCommands: {
          'curl -X POST http://localhost:8000/api/orders -H "Content-Type: application/json" -d \'{"item":"Book"}\'': {
            output: [
              'HTTP/1.1 201 Created',
              '{"order_id": 101, "status": "created"}',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl -X POST http://localhost:8000/api/orders -H "Content-Type: application/json" -d \'{"item":"Book"}\''],
        script: [
          { command: 'curl -X POST http://localhost:8000/api/orders -H "Content-Type: application/json" -d \'{"item":"Book"}\'' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице эмулятор платёжного шлюза проверяет Bearer токен в Headers. Запусти код!',
        initialCode: `class MockPaymentGateway:
    def post(self, url, json_body, headers):
        auth_header = headers.get("Authorization", "")
        if not auth_header.startswith("Bearer sec_"):
            return {"status_code": 401, "error": "Неверный или отсутствующий API-ключ!"}
        
        amount = json_body.get("amount", 0)
        return {
            "status_code": 200,
            "transaction_id": "tx_998877",
            "amount_paid": amount,
            "status": "SUCCESS"
        }

gateway = MockPaymentGateway()

# 1. Запрос с правильным API-ключом:
valid_headers = {"Authorization": "Bearer sec_live_9999"}
res1 = gateway.post("https://pay.com/api", {"amount": 2500}, headers=valid_headers)
print("1. Успешный платёж:", res1)

# 2. Запрос без авторизации:
res2 = gateway.post("https://pay.com/api", {"amount": 2500}, headers={})
print("2. Ошибка авторизации:", res2)`,
      },
      tasks: [
        {
          title: 'Задание 1: генератор заголовков авторизации',
          difficulty: 'easy',
          description: 'Напиши функцию get_auth_headers(token: str) -> dict: возвращает словарь {"Authorization": f"Bearer {token}", "User-Agent": "FastAPI-Backend/1.0"}.',
          hints: ['return {"Authorization": f"Bearer {token}", "User-Agent": "FastAPI-Backend/1.0"}'],
        },
        {
          title: 'Задание 2: сокрытие секретного ключа при логировании',
          difficulty: 'medium',
          description: 'Напиши функцию mask_api_key(key: str) -> str: если длина ключа > 8, оставляет первые 4 символа и последние 4, а середину заменяет на "..." (например: "sec_...1234").',
          hints: ['return f"{key[:4]}...{key[-4:]}" if len(key) > 8 else "***"'],
          solution: `def mask_api_key(key: str) -> str:
    if len(key) > 8:
        return f"{key[:4]}...{key[-4:]}"
    return "***"

secret = "sk_live_51Nz8abc12345xyz9988"
masked = mask_api_key(secret)
print("Замаскированный ключ для логов:", masked)
assert masked.startswith("sk_l") and masked.endswith("9988")`,
        },
        {
          title: 'Задание 3: идемпотентность платежей (Idempotency Key)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: зачем в платёжных API передают уникальный заголовок X-Idempotency-Key (UUID заказа) и как это спасает покупателя от двойного списания денег, если интернет оборвался в момент подтверждения оплаты.',
          hints: ['При повторном запросе с тем же ключом шлюз не списывает деньги второй раз, а возвращает уже созданную транзакцию'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать requests.post(url, data=payload) вместо requests.post(url, json=payload)',
          right: 'Параметр data= отправляет form-urlencoded данные, а современным REST API нужен чистый JSON. Всегда используй json=payload',
        },
        {
          wrong: 'Забыть пробел после слова Bearer в заголовке ("Bearer12345" вместо "Bearer 12345")',
          right: 'Стандарт RFC 6750 строго требует пробел между словом Bearer и самим токеном: "Bearer <token>"',
        },
      ],
      checklist: [
        'Умею отправлять POST-запросы с телом JSON через requests.post',
        'Знаю, как передавать Bearer токены и кастомные заголовки в headers',
        'Понимаю, почему API-ключи обязательно хранить в .env файлах',
        'Знаю концепцию идемпотентности запросов (Idempotency Key)',
      ],
    },

    {
      id: 'httpx-and-async-apis',
      title: 'Асинхронный HTTPX в FastAPI и обработка сбоев',
      summary: 'Почему синхронный requests убивает производительность FastAPI и как использовать асинхронный httpx.AsyncClient',
      theory: [
        {
          type: 'p',
          text: 'В модуле 12 мы изучили, что FastAPI построен на асинхронности (async/await). Но вот главная ловушка для новичков: если внутри async def роута в FastAPI ты вызовешь синхронный requests.get(), он ЗАБЛОКИРУЕТ ВЕСЬ EVENT LOOP! Пока твой сервер 3 секунды ждёт ответа от внешнего сервиса — ВСЕ остальные пользователи сайта будут стоять в мёртвой очереди. Для асинхронного FastAPI нужен современный асинхронный HTTP-клиент — HTTPX.',
        },
        {
          type: 'analogy',
          text: 'Синхронный requests в асинхронном FastAPI — это как уснуть прямо в дверном проёме магазина. Ты заблокировал вход для всех остальных 500 покупателей. Асинхронный httpx.AsyncClient — это как взять электронный номерок: ты отправил запрос, освободил проход (await), занялся другими клиентами, а когда ответ пришёл — мгновенно забрал его!',
        },
        {
          type: 'steps',
          title: 'Сравнение: requests против httpx',
          items: [
            { code: 'res = requests.get(url)', note: 'requests (Синхронно): блокирует поток, нельзя писать await' },
            { code: 'async with httpx.AsyncClient() as client:\n    res = await client.get(url)', note: 'httpx (Асинхронно): освобождает Event Loop, поддерживает await и идеально подходит для FastAPI' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Правильный асинхронный роут в FastAPI с использованием HTTPX',
          lang: 'python',
          code: `import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Переиспользуемый асинхронный клиент:
@app.get("/api/weather/{city}")
async def get_city_weather(city: str):
    url = f"https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.61&current_weather=true"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            return {
                "city": city,
                "current": data.get("current_weather", {})
            }
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Сервер погоды не ответил вовремя (Таймаут)")
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=502, detail=f"Внешний сервис вернул ошибку {exc.response.status_code}")`,
          explanation: 'Использование await client.get() не блокирует Uvicorn, позволяя серверу обрабатывать тысячи других запросов параллельно.',
        },
        {
          title: 'Пример 2: Параллельный опрос 3 сторонних API через asyncio.gather',
          lang: 'python',
          code: `import asyncio
import httpx

async def fetch_service_status(client: httpx.AsyncClient, name: str, url: str) -> dict:
    try:
        res = await client.get(url, timeout=3.0)
        return {"service": name, "status": "UP" if res.status_code == 200 else "DEGRADED"}
    except httpx.RequestError:
        return {"service": name, "status": "DOWN"}

async def check_all_external_services():
    async with httpx.AsyncClient() as client:
        # Запускаем опрос 3 сервисов одновременно:
        results = await asyncio.gather(
            fetch_service_status(client, "Payments", "https://api.payments.com/health"),
            fetch_service_status(client, "SMS", "https://api.sms.com/health"),
            fetch_service_status(client, "Delivery", "https://api.delivery.com/health"),
        )
        return results`,
          explanation: '3 сетевых запроса выполняются параллельно и суммарно занимают время самого долгого из них (~1 секунда вместо 3).',
        },
        {
          title: 'Пример 3: Автоматический повтор запроса с задержкой (Retry Pattern)',
          lang: 'python',
          code: `import asyncio
import httpx

async def fetch_with_retry(url: str, retries: int = 3, delay: float = 1.0):
    async with httpx.AsyncClient() as client:
        for attempt in range(1, retries + 1):
            try:
                res = await client.get(url, timeout=2.0)
                if res.status_code == 200:
                    return res.json()
            except (httpx.TimeoutException, httpx.NetworkError) as err:
                print(f"Попытка {attempt}/{retries} не удалась: {err}")
                if attempt == retries:
                    raise err
                await asyncio.sleep(delay * attempt)  # экспоненциальная задержка`,
          explanation: 'Экспоненциальная задержка (exponential backoff) даёт внешнему сервису время восстановиться при кратковременном сбое.',
        },
      ],
      terminal: {
        title: 'Установка библиотеки httpx',
        description: 'Установи асинхронный HTTPX клиент:',
        lessonCommands: {
          'pip install httpx': {
            output: [
              'Collecting httpx',
              '  Downloading httpx-0.28.1-py3-none-any.whl (73 kB)',
              'Installing collected packages: httpx',
              'Successfully installed httpx-0.28.1',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install httpx'],
        script: [
          { command: 'pip install httpx' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирован асинхронный клиент с параллельным опросом внешних источников. Запусти скрипт!',
        initialCode: `import asyncio

class MockAsyncHttpClient:
    async def get(self, url: str, delay: float = 0.05):
        await asyncio.sleep(delay)  # неблокирующее ожидание!
        if "broken" in url:
            raise ConnectionError("Внешний сервер лежит")
        return {"url": url, "status": 200, "data": {"rate": 95.5}}

async def fetch_rate(client, currency):
    url = f"https://rates.api/{currency}"
    try:
        res = await client.get(url, delay=0.05)
        print(f"✓ Курс {currency} успешно получен!")
        return {currency: res["data"]["rate"]}
    except Exception as exc:
        print(f"❌ Сбой при запросе {currency}: {exc}")
        return {currency: None}

async def run_parallel_rates():
    client = MockAsyncHttpClient()
    print("-> Начинаем параллельный опрос 3 курсов валют...")
    results = await asyncio.gather(
        fetch_rate(client, "USD"),
        fetch_rate(client, "EUR"),
        fetch_rate(client, "CNY")
    )
    print("Итоговые полученные курсы:", results)

await run_parallel_rates()`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь обработку валюты с ошибкой',
          difficulty: 'easy',
          description: 'Добавь в asyncio.gather четвёртый запрос fetch_rate(client, "broken_currency"). Убедись, что программа не падает, а корректно выводит сообщение о сбое в блоке except.',
          hints: ['fetch_rate(client, "broken_coin")'],
        },
        {
          title: 'Задание 2: расчёт времени выполнения параллельных запросов',
          difficulty: 'medium',
          description: 'Замерь точное время выполнения через start = time.time(). Если каждый из 3 запросов длится 0.1 секунды, почему суммарное время asyncio.gather составляет ~0.1с, а не 0.3с?',
          hints: ['Параллельное неблокирующее ожидание I/O'],
          solution: `import time

start_t = time.time()
await run_parallel_rates()
duration = time.time() - start_t
print(f"Все запросы завершились за: {duration:.3f}с")
assert duration < 0.2
print("✓ Параллельность HTTPX подтверждена экспериментально!")`,
        },
        {
          title: 'Задание 3: паттерн Circuit Breaker (Предохранитель)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: что такое паттерн Circuit Breaker и почему после 5 подряд упавших запросов к внешнему API сервер должен временно ПЕРЕСТАТЬ слать новые запросы на 1 минуту, чтобы не перегружать лежащий сервис и мгновенно отдавать кэш клиентам.',
          hints: ['Circuit Breaker размыкает цепь при частых сбоях, экономя сетевые ресурсы и защищая систему от каскадного падения'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать import requests внутри асинхронных роутов async def в FastAPI',
          right: 'Синхронный requests замораживает весь Event Loop Uvicorn. Всегда используй асинхронный httpx.AsyncClient с await',
        },
        {
          wrong: 'Создавать новый httpx.AsyncClient() заново на каждый входящий запрос без закрытия',
          right: 'Используй контекстный менеджер async with httpx.AsyncClient() as client или создавай один глобальный клиент на уровне жизненного цикла FastAPI (Lifespan)',
        },
      ],
      checklist: [
        'Понимаю, почему синхронный requests опасен внутри асинхронных роутов FastAPI',
        'Умею отправлять асинхронные запросы через httpx.AsyncClient',
        'Умею параллелить запросы к нескольким API через asyncio.gather',
        'Знаю правила обработки сетевых сбоев, таймаутов и реализации повторов (Retry)',
      ],
    },
  ],
};
