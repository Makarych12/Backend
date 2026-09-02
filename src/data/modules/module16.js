export const module16 = {
  id: 'full-deploy',
  order: 16,
  title: 'От кода до реального сайта в интернете',
  icon: '🌐',
  description: 'Пошаговый деплой: хостинг, облачная PostgreSQL на Neon, Render/Railway, Vercel, HTTPS и мониторинг.',
  lessons: [
    {
      id: 'hosting-domains-servers',
      title: 'Хостинг, домен, сервер и DNS на пальцах',
      summary: 'Что нужно для публикации сайта в интернете, как браузер находит твой сервер и что такое DNS-справочник',
      theory: [
        {
          type: 'p',
          text: 'Ты написал замечательное backend-приложение на FastAPI. Но сейчас оно живёт только на твоём ноутбуке по адресу http://localhost:8000. Ни твои друзья, ни клиенты не могут открыть его в своём браузере. Чтобы сайт стал доступен всему миру, нужны 3 фундаментальные вещи: Сервер (Хостинг), IP-адрес и Доменное имя.',
        },
        {
          type: 'analogy',
          text: 'Представь, что ты открываешь реальный магазин в городе. ХОСТИНГ (Сервер) — это аренда помещения под магазин (компьютер в дата-центре, который включён 24 часа в сутки и подключён к скоростному интернету). IP-АДРЕС — это точные географические GPS-координаты здания (например, 185.199.108.153) — компьютеры понимают их идеально, но людям их неудобно запоминать. ДОМЕН (например, myshop.com) — это красивая вывеска и привычный адрес: "ул. Ленина, дом 10". А DNS (Domain Name System) — это всемирная адресная книга интернета, которая мгновенно переводит название вывески в GPS-координаты сервера.',
        },
        {
          type: 'steps',
          title: 'Как браузер открывает твой сайт за 50 миллисекунд',
          items: [
            { code: '1. Пользователь вводит: https://my-api.com/users', note: 'Браузер пока не знает, куда отправлять сетевые пакеты' },
            { code: '2. Запрос к DNS-серверу', note: 'Браузер спрашивает: "Какой IP-адрес у my-api.com?". DNS отвечает: "216.24.57.1"' },
            { code: '3. TCP + TLS Handshake', note: 'Браузер подключается к серверу по IP 216.24.57.1 и устанавливает защищённое шифрованное соединение' },
            { code: '4. HTTP-запрос передаётся в FastAPI', note: 'Uvicorn на сервере принимает GET /users, генерирует JSON-ответ и отсылает обратно в браузер' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Виды хостингов: VPS против PaaS (Platform as a Service)',
          text: 'VPS (Virtual Private Server — например, Timeweb, Hetzner, DigitalOcean) — аренда "голого" Linux-сервера, где ты сам ставишь Python, настраиваешь firewall и обновляешь пакеты. PaaS (Render, Railway, Fly.io) — современный облачный хостинг, который берёт всю настройку ОС на себя: ты просто даёшь ссылку на репозиторий GitHub, а сервис сам собирает и запускает твой код.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Узнаём реальный IP-адрес любого домена через socket в Python',
          lang: 'python',
          code: `import socket

def resolve_domain(domain_name: str) -> str:
    """Имитация работы DNS-клиента: преобразует имя домена в IP-адрес сервера"""
    try:
        ip_address = socket.gethostbyname(domain_name)
        return f"Домен {domain_name} находится на сервере с IP: {ip_address}"
    except socket.gaierror:
        return f"Ошибка: Домен {domain_name} не найден в базе DNS!"

# В реальном коде на компьютере:
# print(resolve_domain("google.com"))  # -> 142.250.74.110
# print(resolve_domain("github.com"))  # -> 140.82.121.4`,
          explanation: 'Функция gethostbyname отправляет запрос в системный DNS-резолвер операционной системы и получает публичный IP-адрес сервера.',
        },
        {
          title: 'Пример 2: Разбор структуры полного веб-адреса (URL) в Python',
          lang: 'python',
          code: `from urllib.parse import urlparse

url = "https://api.my-awesome-shop.com:8000/v1/products?category=books#top"
parsed = urlparse(url)

print("Протокол (scheme):", parsed.scheme)       # https
print("Домен (hostname):", parsed.hostname)       # api.my-awesome-shop.com
print("Порт (port):", parsed.port)                # 8000
print("Путь (path):", parsed.path)                # /v1/products
print("Параметры (query):", parsed.query)         # category=books`,
          explanation: 'Каждый веб-запрос состоит из схемы (протокол), имени хоста, порта, пути и параметров запроса.',
        },
        {
          title: 'Пример 3: Логика выбора хостинга для проекта',
          lang: 'python',
          code: `def recommend_hosting(project_type: str, monthly_budget_usd: float) -> str:
    if project_type == "pet_project" and monthly_budget_usd == 0:
        return "Render Free Tier или Railway Free (PaaS) — идеальный бесплатный старт!"
    elif project_type == "commercial_mvp" and monthly_budget_usd <= 20:
        return "Render / Railway / Fly.io (Paid Tier) — автодеплой из Git без возни с Linux."
    else:
        return "Аренда VPS (Ubuntu Linux) + Docker Compose — полный контроль и максимум мощности."

print(recommend_hosting("pet_project", 0))`,
          explanation: 'Для учебных проектов и портфолио бесплатные PaaS-платформы идеальны: они не требуют настройки Linux и привязки кредитной карты.',
        },
      ],
      terminal: {
        title: 'Проверка доступности хоста в терминале',
        description: 'Попробуй проверить, как утилита ping определяет IP-адрес сервера:',
        lessonCommands: {
          'ping -c 2 google.com': {
            output: [
              'PING google.com (142.250.74.110) 56(84) bytes of data.',
              '64 bytes from fra24s08-in-f14.1e100.net (142.250.74.110): icmp_seq=1 ttl=116 time=14.2 ms',
              '64 bytes from fra24s08-in-f14.1e100.net (142.250.74.110): icmp_seq=2 ttl=116 time=14.5 ms',
              '',
              '--- google.com ping statistics ---',
              '2 packets transmitted, 2 received, 0% packet loss, time 1001ms',
            ],
            type: 'success',
          },
        },
        suggestions: ['ping -c 2 google.com'],
        script: [
          { command: 'ping -c 2 google.com' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирована работа DNS-таблицы. Запусти скрипт и проверь преобразование доменов в IP-адреса.',
        initialCode: `dns_records = {
    "my-shop.com": "198.51.100.24",
    "api.my-shop.com": "198.51.100.25",
    "auth.my-shop.com": "198.51.100.26"
}

def dns_lookup(domain: str) -> str:
    if domain in dns_records:
        return f"[DNS SUCCESS] Домен '{domain}' -> IP {dns_records[domain]}"
    return f"[DNS ERROR] Домен '{domain}' не зарегистрирован!"

print(dns_lookup("my-shop.com"))
print(dns_lookup("api.my-shop.com"))
print(dns_lookup("unknown-fake-site.org"))`,
      },
      tasks: [
        {
          title: 'Задание 1: регистрация поддомена',
          difficulty: 'easy',
          description: 'Добавь в таблицу dns_records новый поддомен "admin.my-shop.com" с IP "198.51.100.99". Проверь успешный поиск через вызов dns_lookup("admin.my-shop.com").',
          hints: ['dns_records["admin.my-shop.com"] = "198.51.100.99"'],
        },
        {
          title: 'Задание 2: валидатор корректности доменного имени',
          difficulty: 'medium',
          description: 'Напиши функцию is_valid_domain(domain: str) -> bool: проверяет, что в домене нет пробелов, есть хотя бы одна точка, и он заканчивается на разрешённую зону (.com, .ru, .org, .net).',
          hints: ['return "." in domain and not " " in domain and domain.endswith((".com", ".ru", ".org", ".net"))'],
          solution: `def is_valid_domain(domain: str) -> bool:
    if " " in domain or not "." in domain:
        return False
    valid_tlds = (".com", ".ru", ".org", ".net", ".io")
    return domain.endswith(valid_tlds)

assert is_valid_domain("fastapi-app.com") is True
assert is_valid_domain("bad domain .com") is False
print("✓ Валидатор доменов работает верно!")`,
        },
        {
          title: 'Задание 3: симулятор DNS Round-Robin балансировки',
          difficulty: 'hard',
          description: 'Когда у сайта миллионы посетителей, один домен привязывают к СПИСКУ из нескольких IP-серверов. Напиши функцию get_server_round_robin(domain), которая при каждом вызове по очереди возвращает следующий сервер из списка (балансирует нагрузку).',
          hints: ['Используй счётчик и остаток от деления (index % len(servers))'],
        },
      ],
      mistakes: [
        {
          wrong: 'Считать, что для работы сайта достаточно только купить домен',
          right: 'Домен — это просто имя (вывеска). Чтобы сайт открывался, домен обязательно должен быть привязан к реальному серверу (хостингу) с работающим бэкендом',
        },
        {
          wrong: 'Указывать в коде фронтенда адрес http://localhost:8000 при деплое в интернет',
          right: 'localhost указывает на компьютер того человека, который открыл браузер! В продакшене фронтенд должен обращаться к публичному домену бэкенда (например, https://api.myshop.com)',
        },
      ],
      checklist: [
        'Понимаю разницу между сервером (хостингом), IP-адресом и доменным именем',
        'Знаю, какую роль выполняет DNS (Domain Name System)',
        'Понимаю преимущества PaaS-платформ (Render/Railway) для быстрого старта',
      ],
    },

    {
      id: 'cloud-database-neon',
      title: 'Создание базы данных PostgreSQL в облаке (Neon / Render)',
      summary: 'Пошаговое создание бесплатной облачной БД PostgreSQL, получение строки подключения и безопасный SSL-доступ',
      theory: [
        {
          type: 'p',
          text: 'В модуле 7 мы подключались к локальной базе данных на своём компьютере. Но когда твой FastAPI сервер переедет в облако (на Render или Railway), ему понадобится НАСТОЯЩАЯ ОБЛАЧНАЯ БАЗА ДАННЫХ, доступная из любой точки мира 24/7. Самый удобный и современный сервис для бесплатного старта — это Neon (neon.tech) или управляемая база на Render.',
        },
        {
          type: 'steps',
          title: 'ATM-Инструкция: Создание PostgreSQL на Neon.tech за 2 минуты',
          items: [
            { code: '1. Зайди на neon.tech и нажми "Sign Up"', note: 'Авторизуйся в 1 клик через свой аккаунт GitHub' },
            { code: '2. Нажми "Create Project"', note: 'Введи имя проекта (например, my-backend-db), выбери версию PostgreSQL 16 и ближайший регион (Frankfurt/Europe)' },
            { code: '3. Скопируй Connection String', note: 'Neon моментально покажет строку подключения: postgresql://alex:SecretPass@ep-cool-123.eu-central-1.aws.neon.tech/neondb?sslmode=require' },
            { code: '4. Вставь в локальный .env файл', note: 'DATABASE_URL=postgresql://alex:SecretPass@ep-cool-123.eu-central-1.aws.neon.tech/neondb?sslmode=require' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Обязательный параметр sslmode=require',
          text: 'Облачные базы данных работают через открытый интернет. Чтобы логины, пароли и данные не могли перехватить злоумышленники, ВСЕ облачные БД требуют обязательного SSL-шифрования трафика. В конце строки подключения ВСЕГДА должен присутствовать параметр ?sslmode=require.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Особенность SQLAlchemy: postgresql+psycopg2://',
          text: 'В Python для работы с PostgreSQL через драйвер psycopg2 в SQLAlchemy префикс строки подключения часто записывают как postgresql+psycopg2://... или postgresql://.... Если облако дало строку postgres://..., просто замени в коде "postgres://" на "postgresql://".',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Безопасная инициализация подключения к облачной БД в FastAPI',
          lang: 'python',
          code: `import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Получаем строку из переменной окружения .env:
raw_db_url = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:pass@ep-cool-123.neon.tech/neondb?sslmode=require"
)

# Исправляем старый префикс postgres:// на совместимый postgresql://:
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# Создаём пул подключений к облачной базе:
engine = create_engine(
    raw_db_url,
    pool_size=5,          # ограничение количества одновременных подключений (для free tier)
    max_overflow=10,
    pool_recycle=300       # переподключение каждые 5 минут (защита от разрыва облачного сокета)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)`,
          explanation: 'Параметры pool_size и pool_recycle критически важны для бесплатных облачных баз, чтобы сервер не упирался в лимит соединений.',
        },
        {
          title: 'Пример 2: Проверка "живости" подключения к облачной базе при старте сервера',
          lang: 'python',
          code: `from sqlalchemy import text

def check_database_connection(engine):
    """Быстрая проверка соединения с базой при запуске приложения"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1;"))
            print("✓ Успешное подключение к облачной PostgreSQL базе данных!")
            return True
    except Exception as exc:
        print("❌ ОШИБКА: Не удалось подключиться к облачной БД!")
        print("Детали ошибки:", exc)
        return False`,
          explanation: 'Вызов SELECT 1 позволяет мгновенно убедиться, что пароль верен и база доступна по сети до того, как клиенты начнут слать запросы.',
        },
        {
          title: 'Пример 3: Автоматическое создание таблиц в облачной базе данных',
          lang: 'python',
          code: `from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)

def init_cloud_tables(engine):
    # Создаёт все недостающие таблицы прямо в облачной PostgreSQL:
    Base.metadata.create_all(bind=engine)
    print("✓ Таблицы успешно инициализированы в облаке Neon!")`,
          explanation: 'Вызов Base.metadata.create_all создаст все схемы в облаке без необходимости вручную кликать по интерфейсам СУБД.',
        },
      ],
      terminal: {
        title: 'Установка драйвера PostgreSQL для работы с облаком',
        description: 'Установи библиотеку psycopg2-binary для подключения к PostgreSQL:',
        lessonCommands: {
          'pip install psycopg2-binary': {
            output: [
              'Collecting psycopg2-binary',
              '  Downloading psycopg2_binary-2.9.10-cp312-cp312-manylinux_2_17_x86_64.whl (3.0 MB)',
              'Installing collected packages: psycopg2-binary',
              'Successfully installed psycopg2-binary-2.9.10',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install psycopg2-binary'],
        script: [
          { command: 'pip install psycopg2-binary' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице парсер Connection String проверяет структуру облачного URL. Запусти код!',
        initialCode: `from urllib.parse import urlparse

def parse_and_validate_db_url(url: str) -> dict:
    # Заменяем старый префикс если есть
    normalized = url.replace("postgres://", "postgresql://")
    parsed = urlparse(normalized)
    
    is_ssl = "sslmode=require" in parsed.query or "ssl=true" in parsed.query
    
    return {
        "engine": parsed.scheme,
        "user": parsed.username,
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/"),
        "ssl_secured": is_ssl
    }

neon_url = "postgresql://alex:Secr3t@ep-cool-123.neon.tech/neondb?sslmode=require"
info = parse_and_validate_db_url(neon_url)

print("Разбор строки облачной БД:")
for k, v in info.items():
    print(f" -> {k}: {v}")

assert info["ssl_secured"] is True
print("\\n✓ Строка подключения полностью готова для продакшена!")`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка наличия SSL режима',
          difficulty: 'easy',
          description: 'Напиши функцию ensure_ssl_in_url(url: str) -> str: если в конце строки подключения нет "sslmode=require", она автоматически добавляет "?sslmode=require" (или "&sslmode=require", если query-параметры уже есть).',
          hints: ['if "sslmode" not in url:\n    sep = "&" if "?" in url else "?"\n    return url + sep + "sslmode=require"'],
        },
        {
          title: 'Задание 2: сокрытие пароля при логировании',
          difficulty: 'medium',
          description: 'Никогда нельзя выводить пароль от облачной БД в логи! Напиши функцию mask_db_password(url: str) -> str, которая заменяет пароль на "***" (например: postgresql://user:***@host:5432/db).',
          hints: ['Используй urlparse или регулярное выражение / замену подстроки'],
          solution: `import re

def mask_db_password(url: str) -> str:
    # Заменяет :пароль@ на :***@
    return re.sub(r":([^@/]+)@", ":***@", url)

secret_url = "postgresql://admin:super_secret_pass_2026@ep-cool.neon.tech/db"
masked = mask_db_password(secret_url)
print("Безопасный вывод в лог:", masked)
assert "super_secret_pass_2026" not in masked`,
        },
        {
          title: 'Задание 3: переключение локальной и облачной БД',
          difficulty: 'hard',
          description: 'Напиши фабрику движка get_engine_for_env(): если ENV=="production" — берёт DATABASE_URL из окружения (с проверкой SSL), а если ENV=="development" и переменная не задана — возвращает локальный sqlite:///./dev.db.',
          hints: ['Проверяй os.getenv("ENV") == "production"'],
        },
      ],
      mistakes: [
        {
          wrong: 'Забыть добавить ?sslmode=require к строке подключения Neon',
          right: 'Облачные провайдеры запрещают незашифрованные подключения. Без sslmode=require подключение упадёт с ошибкой SSL connection required',
        },
        {
          wrong: 'Хардкодить пароль от облачной базы прямо в коде main.py',
          right: 'Всегда используй os.getenv("DATABASE_URL") и храни строку только в файле .env или в настройках сервиса на Render',
        },
      ],
      checklist: [
        'Умею создавать бесплатную облачную базу данных на Neon или Render',
        'Понимаю структуру Connection String (user, password, host, port, database)',
        'Знаю, зачем нужен параметр sslmode=require',
        'Умею безопасно инициализировать подключение через SQLAlchemy',
      ],
    },

    {
      id: 'backend-cloud-deploy',
      title: 'Деплой FastAPI бэкенда на Render и Railway',
      summary: 'Пошаговый деплой из репозитория GitHub на облачную платформу: build command, start command и переменные окружения',
      theory: [
        {
          type: 'p',
          text: 'Теперь у нас есть готовый код в репозитории на GitHub и облачная база данных PostgreSQL. Осталось самое главное — запустить наш FastAPI сервер в облаке (на платформе Render.com или Railway.app), чтобы получить живую ссылку https://my-backend-app.onrender.com/docs.',
        },
        {
          type: 'steps',
          title: 'ATM-Инструкция: Пошаговый деплой FastAPI на Render.com',
          items: [
            { code: '1. Зайди на render.com и нажми "New +" -> "Web Service"', note: 'Авторизуйся через аккаунт GitHub' },
            { code: '2. Выбери репозиторий со своим бэкендом', note: 'Render получит доступ к коду и будет автоматически пересобирать сайт при каждом git push' },
            { code: '3. Выбери Runtime: Python 3', note: 'Укажи имя сервиса (например, my-api-production)' },
            { code: '4. Build Command: pip install -r requirements.txt', note: 'Команда, которая скачает и установит все твои библиотеки' },
            { code: '5. Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT', note: 'Команда запуска сервера на динамическом порту облака' },
            { code: '6. Вкладка "Environment Variables": добавь переменные', note: 'Вставь DATABASE_URL (из урока 2) и SECRET_KEY' },
            { code: '7. Нажми "Deploy Web Service"', note: 'Через 60 секунд сайт собран и доступен по выданному публичному URL!' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Что такое переменная $PORT в облаке?',
          text: 'Облачный хостинг сам решает, на каком внутреннем порту запустить твой контейнер (например, 10000 или 8080). Он передаёт этот номер в переменной окружения $PORT. Поэтому команда uvicorn main:app --host 0.0.0.0 --port $PORT обязательна!',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Бесплатный тариф Render и "холодный старт" (Sleep mode)',
          text: 'На бесплатном тарифе Render, если к сайту никто не обращался 15 минут, сервис "засыпает" для экономии ресурсов. Первый запрос после сна может открываться 30-40 секунд (пока сервер просыпается). Это абсолютно нормально для бесплатного тарифа и портфолио!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Минимальный production-ready файл main.py для облака',
          lang: 'python',
          code: `import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Shop API Production",
    version="1.0.0",
    docs_url="/docs",      # Swagger документация будет доступна онлайн!
    redoc_url="/redoc"
)

# Разрешаем CORS для будущего фронтенда:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # на этапе первого деплоя разрешаем все домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "FastAPI сервер успешно запущен в облаке Render!",
        "docs": "/docs"
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy", "environment": os.getenv("ENVIRONMENT", "production")}`,
          explanation: 'Этот файл содержит всё необходимое для успешного первого деплоя: корень /, healthcheck и автодокументацию Swagger на /docs.',
        },
        {
          title: 'Пример 2: Эталонный файл requirements.txt с зафиксированными версиями',
          lang: 'bash',
          code: `# requirements.txt (должен лежать строго в корне проекта рядом с main.py!)
fastapi==0.115.6
uvicorn[standard]==0.34.0
pydantic==2.10.4
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
python-dotenv==1.0.1
passlib==1.7.4
bcrypt==4.2.1
python-jose==3.3.0`,
          explanation: 'Фиксация точных версий через == гарантирует, что на сервере установятся ровно те же пакеты, на которых ты писал код дома.',
        },
        {
          title: 'Пример 3: Скрипт проверки готовности проекта к деплою (Pre-flight Check)',
          lang: 'python',
          code: `import os

def check_deploy_readiness() -> list[str]:
    errors = []
    # Проверка обязательных файлов
    for filename in ["main.py", "requirements.txt", ".gitignore"]:
        if not os.path.exists(filename):
            errors.append(f"Отсутствует обязательный файл: {filename}")
    
    # Проверка, что .env скрыт в .gitignore
    if os.path.exists(".gitignore"):
        with open(".gitignore") as f:
            if ".env" not in f.read():
                errors.append("Внимание: .env не добавлен в .gitignore!")
    return errors`,
          explanation: 'Проверка проекта перед отправкой в репозиторий экономит часы отладки упавших билдов.',
        },
      ],
      terminal: {
        title: 'Логи деплоя на сервере Render',
        description: 'Посмотри, как выглядит реальный успешный лог сборки в веб-консоли Render:',
        lessonCommands: {
          'render deploy logs': {
            output: [
              '==> Cloning from https://github.com/alex/my-shop-api...',
              '==> Checking out commit 4f2a1b9 in branch main',
              '==> Running build command \'pip install -r requirements.txt\'...',
              'Successfully installed fastapi-0.115.6 uvicorn-0.34.0 sqlalchemy-2.0.36',
              '==> Uploading build...',
              '==> Build successful 🎉',
              '==> Deploying...',
              '==> Starting service with \'uvicorn main:app --host 0.0.0.0 --port 10000\'',
              'INFO:     Started server process [42]',
              'INFO:     Waiting for application startup.',
              'INFO:     Application startup complete.',
              'INFO:     Uvicorn running on http://0.0.0.0:10000 (Press CTRL+C to quit)',
              '==> Your service is live 🚀 https://my-shop-api.onrender.com',
            ],
            type: 'success',
          },
        },
        suggestions: ['render deploy logs'],
        script: [
          { command: 'render deploy logs' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице работает production-роут с чтением динамического порта и информации об окружении.',
        initialCode: `import os
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Имитируем переменные облачной платформы Render:
os.environ["PORT"] = "10000"
os.environ["RENDER_SERVICE_ID"] = "srv-cool123"
os.environ["ENVIRONMENT"] = "production"

app = FastAPI(title="Cloud API")

@app.get("/")
def root():
    return {
        "status": "online",
        "port": os.getenv("PORT"),
        "service_id": os.getenv("RENDER_SERVICE_ID"),
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

client = TestClient(app)

res = client.get("/")
print("Ответ облачного сервера:", res.json())
assert res.status_code == 200
assert res.json()["status"] == "online"
print("✓ Продакшен-эндпоинт успешно проверен!")`,
      },
      tasks: [
        {
          title: 'Задание 1: автогенерация start-команды',
          difficulty: 'easy',
          description: 'Напиши функцию get_start_command(app_module: str, app_name: str, workers: int) -> str. Для get_start_command("main", "app", 2) должна вернуть "uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2".',
          hints: ['return f"uvicorn {app_module}:{app_name} --host 0.0.0.0 --port $PORT --workers {workers}"'],
        },
        {
          title: 'Задание 2: парсер переменных окружения Render',
          difficulty: 'medium',
          description: 'Render предоставляет полезные переменные: RENDER_GIT_COMMIT (хеш коммита) и RENDER_SERVICE_NAME. Добавь эндпоинт @app.get("/version"), который возвращает эти параметры в JSON-ответе.',
          hints: ['return {"commit": os.getenv("RENDER_GIT_COMMIT", "local-dev"), "service": os.getenv("RENDER_SERVICE_NAME", "my-app")}'],
          solution: `@app.get("/version")
def get_version():
    return {
        "commit": os.getenv("RENDER_GIT_COMMIT", "local-dev"),
        "service": os.getenv("RENDER_SERVICE_NAME", "my-app")
    }

print(client.get("/version").json())`,
        },
        {
          title: 'Задание 3: обработка ошибки отсутствия библиотеки',
          difficulty: 'hard',
          description: 'Если ты забыл добавить библиотеку в requirements.txt, Render упадёт с ModuleNotFoundError при старте. Напиши в комментарии, какие 3 шага нужно сделать для исправления.',
          hints: ['1. pip freeze > requirements.txt (или дописать руками); 2. git add + commit; 3. git push origin main'],
        },
      ],
      mistakes: [
        {
          wrong: 'Указать жесткий порт --port 8000 в Start Command на Render',
          right: 'Облако выделяет случайный свободный порт через $PORT. Всегда пиши --port $PORT',
        },
        {
          wrong: 'Забыть положить requirements.txt в Git-репозиторий',
          right: 'Без requirements.txt облачный сервер не сможет установить FastAPI и Uvicorn, и сборка завершится с ошибкой Build Failed',
        },
      ],
      checklist: [
        'Умею подключать GitHub-репозиторий к сервису Render или Railway',
        'Знаю точные Build Command и Start Command для FastAPI',
        'Умею задавать Environment Variables в веб-панели облака',
        'Знаю, где смотреть онлайн-документацию /docs после деплоя',
      ],
    },

    {
      id: 'frontend-cloud-deploy',
      title: 'Деплой frontend (Vercel/Netlify) и связка с backend',
      summary: 'Как опубликовать SPA-фронтенд, настроить CORS для продакшена и заменить localhost на реальный URL',
      theory: [
        {
          type: 'p',
          text: 'В современной архитектуре Frontend (React, Vue или чистый HTML/JS) и Backend (FastAPI) деплоятся РАЗДЕЛЬНО на разные специализированные платформы. Фронтенд — на сверхбыстрые CDN-хостинги (Vercel или Netlify), а бэкенд — на серверные платформы (Render/Railway). Как заставить их слаженно общаться по сети?',
        },
        {
          type: 'steps',
          title: 'ATM-Инструкция: Деплой React-фронтенда на Vercel',
          items: [
            { code: '1. Зайди на vercel.com и нажми "Add New Project"', note: 'Авторизуйся через GitHub и выбери репозиторий с фронтендом' },
            { code: '2. Framework Preset: Vite (или React)', note: 'Vercel автоматически определит команду сборки npm run build и папку dist/' },
            { code: '3. Environment Variables: VITE_API_URL', note: 'Вставь реальный публичный адрес бэкенда: https://my-shop-api.onrender.com' },
            { code: '4. Нажми "Deploy"', note: 'Через 20 секунд сайт готов на адресе https://my-shop-front.vercel.app' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Связка через CORS: разреши Vercel в FastAPI!',
          text: 'Когда фронтенд с https://my-shop-front.vercel.app отправит запрос на https://my-shop-api.onrender.com, браузер выполнит проверку CORS. Если ты не добавишь домен Vercel в allow_origins в FastAPI, браузер заблокирует все запросы!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Правильная настройка CORSMiddleware для продакшен-доменов',
          lang: 'python',
          code: `import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Список разрешённых адресов фронтенда:
origins = [
    "http://localhost:5173",                 # локальная разработка (Vite)
    "http://localhost:3000",                 # локальная разработка (React)
    "https://my-shop-front.vercel.app",      # боевой домен фронтенда на Vercel
    "https://my-custom-domain.com",          # персональный домен (если есть)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,                   # кого пускать
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)`,
          explanation: 'В allow_origins указываются как локальные адреса разработчика, так и боевой домен на Vercel.',
        },
        {
          title: 'Пример 2: Динамический API-клиент во фронтенде (JS / React)',
          lang: 'bash',
          code: `// api.js на фронтенде:
// В Vite переменные окружения начинаются с VITE_
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchProducts() {
  const response = await fetch(\`\${API_URL}/api/products\`);
  if (!response.ok) {
    throw new Error(\`Ошибка сервера: \${response.status}\`);
  }
  return await response.json();
}`,
          explanation: 'На компьютере клиента код берёт http://localhost:8000, а на сервере Vercel автоматически использует https://my-shop-api.onrender.com.',
        },
        {
          title: 'Пример 3: Проверка совпадения протоколов (Mixed Content Error)',
          lang: 'python',
          code: `def validate_api_url_protocol(front_url: str, back_url: str) -> bool:
    """Браузер блокирует запросы с HTTPS сайта на незащищенный HTTP API (Mixed Content)"""
    if front_url.startswith("https://") and back_url.startswith("http://"):
        print("❌ ОШИБКА: Браузер заблокирует запрос (Mixed Content)! Оба URL обязаны быть HTTPS.")
        return False
    print("✓ Протоколы согласованы (HTTPS -> HTTPS)")
    return True

validate_api_url_protocol("https://my-front.vercel.app", "https://my-api.onrender.com")`,
          explanation: 'Если фронтенд открыт по HTTPS, бэкенд тоже обязан быть по HTTPS, иначе браузер заблокирует запрос из соображений безопасности.',
        },
      ],
      terminal: {
        title: 'Локальная сборка фронтенда перед деплоем',
        description: 'Проверь команду сборки прод-бандла фронтенда:',
        lessonCommands: {
          'npm run build': {
            output: [
              'vite v8.2.2 building client environment for production...',
              '✓ 76 modules transformed.',
              'dist/index.html                   1.02 kB',
              'dist/assets/index.js           873.47 kB',
              '✓ built in 445ms',
            ],
            type: 'success',
          },
        },
        suggestions: ['npm run build'],
        script: [
          { command: 'npm run build' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице настроен CORS-роут с поддержкой нескольких доменов фронтенда. Проверь запросы с разными Origin!',
        initialCode: `from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

allowed_frontends = {
    "http://localhost:5173",
    "https://my-shop.vercel.app"
}

@app.get("/api/catalog")
def get_catalog(origin: str = Header(None)):
    if origin and origin not in allowed_frontends:
        raise HTTPException(status_code=403, detail="CORS: Домен не разрешён!")
    return [{"id": 1, "name": "Кроссовки", "price": 4500}]

client = TestClient(app)

# Запрос с разрешённого Vercel-домена:
res1 = client.get("/api/catalog", headers={"Origin": "https://my-shop.vercel.app"})
print("Запрос с Vercel:", res1.status_code, res1.json())

# Запрос со стороннего чужого сайта:
res2 = client.get("/api/catalog", headers={"Origin": "https://evil-hacker.com"})
print("Запрос с чужого сайта:", res2.status_code, res2.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь домен Netlify в список разрешённых',
          difficulty: 'easy',
          description: 'Добавь в allowed_frontends домен "https://my-cool-shop.netlify.app". Убедись, что запрос с этого Origin возвращает статус 200.',
          hints: ['allowed_frontends.add("https://my-cool-shop.netlify.app")'],
        },
        {
          title: 'Задание 2: конфигурация окружения .env.production',
          difficulty: 'medium',
          description: 'Напиши содержимое файла .env.production для фронтенда с переменной VITE_API_URL=https://my-shop-api.onrender.com и переменной VITE_APP_TITLE="Мой Магазин".',
          hints: ['VITE_API_URL=https://my-shop-api.onrender.com\nVITE_APP_TITLE="Мой Магазин"'],
          solution: `# Файл .env.production для фронтенда на Vite:
# VITE_API_URL=https://my-shop-api.onrender.com
# VITE_APP_TITLE=Мой Магазин`,
        },
        {
          title: 'Задание 3: обработка ошибки сетевого сбоя на клиенте',
          difficulty: 'hard',
          description: 'Что увидит пользователь, если сервер на Render спит (холодный старт 30 секунд)? Напиши в JS-примере блок try/catch с выводом дружелюбного сообщения "Сервер просыпается, подождите несколько секунд...".',
          hints: ['В блоке catch установи состояние loadingMessage = "Сервер просыпается..."'],
        },
      ],
      mistakes: [
        {
          wrong: 'Оставить http://localhost:8000 в коде фронтенда, задеплоенного на Vercel',
          right: 'На Vercel localhost не существует. Обязательно используй переменные окружения VITE_API_URL с адресом бэкенда в облаке',
        },
        {
          wrong: 'Забыть указать протокол https:// в списке allow_origins в FastAPI (написать "my-shop.vercel.app" вместо "https://my-shop.vercel.app")',
          right: 'CORS требует полного совпадения источника с протоколом: https://my-shop.vercel.app',
        },
      ],
      checklist: [
        'Понимаю архитектуру раздельного деплоя Frontend (Vercel) и Backend (Render)',
        'Умею настраивать переменную VITE_API_URL для сборки фронтенда',
        'Знаю, как связать домен фронтенда с CORSMiddleware на бэкенде',
        'Понимаю проблему Mixed Content (HTTP vs HTTPS)',
      ],
    },

    {
      id: 'domains-https-monitoring',
      title: 'Свой домен, HTTPS и поиск ошибок в логах',
      summary: 'Подключение своего домена, автоматический HTTPS через Let\'s Encrypt и чтение серверных логов при сбоях 502/504',
      theory: [
        {
          type: 'p',
          text: 'Твой сайт работает в интернете. Но бесплатное имя вида my-app.onrender.com выглядит длинно. Как привязать красивый персональный домен (например, https://super-api.ru), как автоматически получить зелёный замочек HTTPS и что делать, если сайт неожиданно перестал открываться?',
        },
        {
          type: 'steps',
          title: 'Подключение своего домена: записи A и CNAME',
          items: [
            { code: '1. Покупка домена', note: 'Покупаешь домен на reg.ru, nic.ru, Namecheap или GoDaddy' },
            { code: '2. CNAME-запись для бэкенда', note: 'В DNS настройках домена создаёшь запись: api.mysite.ru -> CNAME -> my-shop-api.onrender.com' },
            { code: '3. A-запись для основного сайта', note: 'Указываешь IP-адрес хостинга (например, 76.76.21.21 для Vercel)' },
            { code: '4. Автоматический SSL (HTTPS)', note: 'Render и Vercel автоматически бесплатно выписывают сертификат Let\'s Encrypt за 2 минуты' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Что означают коды ошибок 502, 503 и 504?',
          text: '502 Bad Gateway: твой Python-код упал с критической ошибкой при старте (например, SyntaxError, ошибка импорта или неверный пароль к БД). 504 Gateway Timeout: роут работал слишком долго (дольше 60 секунд) и был оборван балансировщиком. 503 Service Unavailable: сервер перезагружается или спит.',
        },
        {
          type: 'steps',
          title: 'Алгоритм спасения сайта: где искать логи',
          items: [
            { code: '1. Открой панель хостинга (Render/Railway)', note: 'Перейди во вкладку "Logs"' },
            { code: '2. Найди строку "Traceback (most recent call last)"', note: 'В логах всегда записана точная строка файла и причина падения' },
            { code: '3. Проверь переменные окружения', note: 'В 80% случаев причина 502 ошибки — забытая переменная DATABASE_URL или опечатка в пароле' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Middleware логирования запросов и времени ответа в FastAPI',
          lang: 'python',
          code: `import time
import logging
from fastapi import FastAPI, Request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_monitor")

app = FastAPI()

@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Логируем входящий запрос:
    logger.info(f"--> Входящий запрос: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    logger.info(f"<-- Ответ: {response.status_code} (заняло {process_time:.1f}мс)")
    
    # Добавляем заголовок со временем обработки:
    response.headers["X-Process-Time-Ms"] = f"{process_time:.1f}"
    return response`,
          explanation: 'Этот middleware автоматически выводит в консоль облака Render каждый входящий запрос и время его обработки в миллисекундах.',
        },
        {
          title: 'Пример 2: Парсер логов и автоматическое определение кода ошибки',
          lang: 'python',
          code: `def diagnose_server_log(log_text: str) -> str:
    if "ModuleNotFoundError" in log_text:
        return "Диагноз: Забыли добавить библиотеку в requirements.txt!"
    elif "password authentication failed" in log_text or "Connection refused" in log_text:
        return "Диагноз: Ошибка подключения к базе данных! Проверьте DATABASE_URL."
    elif "Address already in use" in log_text:
        return "Диагноз: Порт занят другим процессом."
    elif "Uvicorn running on" in log_text:
        return "Диагноз: Сервер работает штатно без ошибок."
    return "Диагноз: Неизвестная ошибка, требуется ручной анализ стектрейса."`,
          explanation: 'Быстрая диагностика по ключевым словам в логах позволяет локализовать проблему за 5 секунд.',
        },
        {
          title: 'Пример 3: Глобальный перехватчик необработанных исключений (500 Error Handler)',
          lang: 'python',
          code: `from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Логируем критическую ошибку в консоль сервера:
    logger.error(f"КРИТИЧЕСКИЙ СБОЙ на {request.url.path}: {exc}", exc_info=True)
    
    # Отдаём клиенту понятный JSON вместо пустого экрана:
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "На сервере произошла непредвиденная ошибка. Мы уже разбираемся!"
        }
    )`,
          explanation: 'Глобальный обработчик сохраняет полный стектрейс в логах облака и возвращает клиенту аккуратный ответ 500.',
        },
      ],
      terminal: {
        title: 'Просмотр серверных логов в реальном времени',
        description: 'Команда просмотра потоковых логов сервиса:',
        lessonCommands: {
          'render logs -f': {
            output: [
              '[2026-09-02 13:30:01] INFO: --> Входящий запрос: GET /api/products',
              '[2026-09-02 13:30:01] INFO: <-- Ответ: 200 (заняло 12.4мс)',
              '[2026-09-02 13:30:05] INFO: --> Входящий запрос: POST /api/orders',
              '[2026-09-02 13:30:05] INFO: <-- Ответ: 201 (заняло 45.1мс)',
            ],
            type: 'default',
          },
        },
        suggestions: ['render logs -f'],
        script: [
          { command: 'render logs -f' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице работает симулятор мониторинга логов и перехвата ошибок сервера. Запусти код!',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
server_logs = []

def log_event(level: str, msg: str):
    server_logs.append(f"[{level}] {msg}")

@app.get("/items/{item_id}")
def get_item(item_id: int):
    log_event("INFO", f"Запрос товара {item_id}")
    if item_id == 0:
        log_event("ERROR", "Попытка запроса с id=0!")
        raise HTTPException(400, "ID не может быть нулевым")
    return {"item_id": item_id, "status": "active"}

client = TestClient(app)

client.get("/items/10")
client.get("/items/0")

print("Собранные логи сервера:")
for entry in server_logs:
    print(" ->", entry)

assert len(server_logs) == 3
print("\\n✓ Система мониторинга и логирования зафиксировала все события!")`,
      },
      tasks: [
        {
          title: 'Задание 1: диагностика ошибки из лога',
          difficulty: 'easy',
          description: 'В логе сервера появилась запись: `ModuleNotFoundError: No module named \'jose\'`. Какая команда исправит эту ошибку?',
          hints: ['pip install python-jose и добавить python-jose==3.3.0 в requirements.txt'],
        },
        {
          title: 'Задание 2: добавление эндпоинта проверки БД в мониторинг',
          difficulty: 'medium',
          description: 'Напиши эндпоинт @app.get("/health/db"), который выполняет быстрый тест БД. Если база отвечает — возвращает {"db": "connected", "latency_ms": 15}, если падает — поднимает HTTPException(503, "БД недоступна").',
          hints: ['try: db.execute(...) return {"db": "connected"} except: raise HTTPException(503)'],
          solution: `@app.get("/health/db")
def health_db():
    try:
        # имитация проверки соединения
        return {"db": "connected", "latency_ms": 12}
    except Exception:
        raise HTTPException(503, "База данных временно недоступна")

print(client.get("/health/db").json())`,
        },
        {
          title: 'Задание 3: финальное практическое задание модуля',
          difficulty: 'hard',
          description: 'Ты прошёл все шаги деплоя! Задеплой свой Todo API из проекта 1: 1) Создай БД на neon.tech; 2) Запушь код на GitHub; 3) Создай Web Service на render.com; 4) Проверь Swagger документацию по своей публичной ссылке https://...onrender.com/docs.',
          hints: ['Поздравляем! Твой первый бэкенд официально работает в глобальном интернете 24/7!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Игнорировать вкладку Logs и пытаться угадать причину падения сайта вслепую',
          right: 'Логи — это главный инструмент разработчика. 99% ответов на вопрос "почему упал сайт" написаны в последних 10 строчках логов сервера',
        },
        {
          wrong: 'Пытаться вручную покупать SSL-сертификаты за деньги для пет-проектов',
          right: 'Современные облачные платформы (Render, Vercel, Railway, Cloudflare) выписывают SSL-сертификаты Let\'s Encrypt абсолютно бесплатно и автоматически',
        },
      ],
      checklist: [
        'Понимаю, как работают CNAME и A-записи для подключения своего домена',
        'Знаю, что HTTPS сертификаты Let\'s Encrypt настраиваются автоматически',
        'Понимаю значение HTTP кодов ошибок 502, 503 и 504',
        'Умею читать логи сервера на Render и быстро находить причину сбоя',
      ],
    },
  ],
};
