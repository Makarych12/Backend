export const module22 = {
  id: 'docker-deep-dive',
  order: 22,
  title: 'Docker для Python-разработчика',
  icon: '🐳',
  description: 'Глубокое погружение в Docker: образы, контейнеры, построчный разбор Dockerfile, команды управления и Docker Compose.',
  lessons: [
    {
      id: 'docker-shipping-analogy',
      title: 'Что такое Docker: аналогия с морским контейнером',
      summary: 'Почему программы ломаются при переносе на чужой компьютер и как изоляция Docker делает запуск предсказуемым на 100%',
      theory: [
        {
          type: 'p',
          text: 'Каждый разработчик хоть раз сталкивался с ситуацией: ты написал идеальный код на Python 3.12 на своём MacBook или Windows, скидываешь проект коллеге или загружаешь на сервер Linux — и всё сыпется с ошибками: "библиотека psycopg2 не скомпилировалась", "версия Python 3.8 не поддерживает match/case", "нет системного пакета libpq". DOCKER был создан, чтобы навсегда покончить с этим кошмаром.',
        },
        {
          type: 'analogy',
          text: 'Представь, что ты хочешь перевезти целый зоопарк в другую страну. Если просто загнать львов, пингвинов и обезьян в общий трюм самолёта — львы съедят пингвинов, а обезьяны перегрызут провода. DOCKER — это специальный стандартный климатический контейнер. Внутри контейнера для пингвинов — ровно та температура льда и та рыба (версия Python, библиотеки, настройки), которая им нужна. Снаружи контейнер абсолютно герметичен и стандартизирован: его можно погрузить на ЛЮБОЙ корабль, поезд или грузовик в любой точке планеты, и пингвины даже не заметят переезда!',
        },
        {
          type: 'list',
          title: 'Два фундаментальных понятия Docker',
          items: [
            '1. Образ (Docker Image): неизменяемый "чертёж" или запечатанный диск с операционной системой Linux, установленным Python и твоим кодом. Образ нельзя изменить на лету — его можно только собрать заново.',
            '2. Контейнер (Docker Container): живой, запущенный изолированный экземпляр образа. Из одного образа можно одновременно запустить 10 одинаковых контейнеров на разных портах.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему контейнер стартует за 0.2 секунды?',
          text: 'Виртуальная машина (VirtualBox/VMware) загружает целую отдельную тяжелую операционную систему со своим ядром. Контейнер Docker использует ядро хостовой системы Linux напрямую через механизмы cgroups и namespaces, поэтому он запускается мгновенно и не тратит гигабайты лишней памяти.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Жизненный цикл Docker в 3 простых командах',
          lang: 'bash',
          code: `# 1. Собираем образ с тегом my-fastapi-app из текущей папки:
docker build -t my-fastapi-app:1.0 .

# 2. Запускаем контейнер в фоновом режиме (-d) с пробросом порта 8000 (-p 8000:8000):
docker run -d -p 8000:8000 --name backend-server my-fastapi-app:1.0

# 3. Смотрим статус запущенного контейнера:
docker ps`,
          explanation: 'Флаг -p 8000:8000 связывает внешний порт твоего компьютера (localhost:8000) с внутренним портом контейнера.',
        },
        {
          title: 'Пример 2: Парсер информации о контейнерах на Python (docker ps CLI)',
          lang: 'python',
          code: `def parse_container_status(container_info: dict) -> str:
    """Форматирует статус запущенного контейнера"""
    name = container_info["name"]
    image = container_info["image"]
    ports = container_info.get("ports", "8000/tcp")
    status = container_info.get("status", "running")
    return f"🐳 Контейнер '{name}' [{image}] | Статус: {status} | Порты: {ports}"

demo_container = {
    "name": "shop-api-prod",
    "image": "python-fastapi:3.12",
    "ports": "0.0.0.0:8000->8000/tcp",
    "status": "Up 4 hours"
}

print(parse_container_status(demo_container))`,
          explanation: 'Этот формат вывода аналогичен информации, которую возвращает официальная CLI-утилита docker ps.',
        },
        {
          title: 'Пример 3: Ограничение ресурсов контейнера (Memory & CPU Limits)',
          lang: 'bash',
          code: `# Запуск контейнера с ограничением памяти 512 МБ и максимум 1 ядром процессора:
docker run -d -p 8000:8000 --memory="512m" --cpus="1.0" --name limited-app my-fastapi-app:1.0`,
          explanation: 'Ограничения ресурсов гарантируют, что контейнер не сможет занять всю память компьютера при возникновении утечки памяти в коде.',
        },
      ],
      terminal: {
        title: 'Первые команды Docker в терминале',
        description: 'Проверь версию Docker и список запущенных процессов:',
        lessonCommands: {
          'docker --version': {
            output: ['Docker version 27.3.1, build ce12230'],
            type: 'success',
          },
        },
        suggestions: ['docker --version', 'docker ps'],
        script: [
          { command: 'docker --version' },
          { command: 'docker ps' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор реестра Docker управляет жизненным циклом контейнеров. Запусти код!',
        initialCode: `class DockerEngineSimulator:
    def __init__(self):
        self.images = {}
        self.containers = {}

    def build(self, image_name: str, files_count: int):
        self.images[image_name] = {"files": files_count, "size_mb": 145}
        print(f"✓ Образ '{image_name}' успешно собран ({files_count} файлов, 145 МБ)")

    def run(self, image_name: str, container_name: str, port_map: str):
        if image_name not in self.images:
            raise ValueError(f"Образ {image_name} не найден!")
        self.containers[container_name] = {
            "image": image_name,
            "port": port_map,
            "status": "running"
        }
        print(f"🚀 Контейнер '{container_name}' запущен! Доступен по адресу: http://localhost:{port_map.split(':')[0]}")

    def ps(self):
        print("\\nСПИСОК ЗАПУЩЕННЫХ КОНТЕЙНЕРОВ:")
        for name, info in self.containers.items():
            print(f" -> {name} | Image: {info['image']} | Port: {info['port']} | Status: {info['status']}")

docker = DockerEngineSimulator()
docker.build("fastapi-backend:v1", files_count=12)
docker.run("fastapi-backend:v1", "my-api-server", "8000:8000")
docker.ps()`,
      },
      tasks: [
        {
          title: 'Задание 1: остановка контейнера (docker stop)',
          difficulty: 'easy',
          description: 'Добавь в DockerEngineSimulator метод stop(self, container_name: str), который меняет статус контейнера на "exited" и выводит сообщение.',
          hints: ['self.containers[container_name]["status"] = "exited"'],
        },
        {
          title: 'Задание 2: валидатор строки проброса портов',
          difficulty: 'medium',
          description: 'Напиши функцию parse_port_mapping(port_str: str) -> tuple[int, int]: разбирает строку "8080:8000" на внешний_порт=8080 и внутренний_порт=8000 с проверкой диапазона от 1 до 65535.',
          hints: ['host, container = map(int, port_str.split(":"))\nassert 1 <= host <= 65535 and 1 <= container <= 65535'],
          solution: `def parse_port_mapping(port_str: str) -> tuple[int, int]:
    host_p, cont_p = map(int, port_str.split(":"))
    if not (1 <= host_p <= 65535 and 1 <= cont_p <= 65535):
        raise ValueError("Порт должен быть в диапазоне 1..65535")
    return host_p, cont_p

h, c = parse_port_mapping("8080:8000")
assert h == 8080 and c == 8000
print(f"✓ Порты успешно разобраны: Хост={h}, Контейнер={c}")`,
        },
        {
          title: 'Задание 3: удаление остановленного контейнера (docker rm)',
          difficulty: 'hard',
          description: 'Объясни, почему перед удалением контейнера командой docker rm его обязательно нужно сначала остановить командой docker stop (или использовать флаг принудительного удаления -f).',
          hints: ['Процессы внутри работающего контейнера держат открытые файловые дескрипторы и сокеты, которые ОС должна корректно завершить сигналом SIGTERM'],
        },
      ],
      mistakes: [
        {
          wrong: 'Думать, что образ (Image) и контейнер (Container) — это одно и то же',
          right: 'Образ — это файл-чертёж на диске (как класс в ООП). Контейнер — это живой запущенный процесс (как объект/экземпляр класса в памяти)',
        },
        {
          wrong: 'Хранить базу данных внутри контейнера без подключения тома (Volume)',
          right: 'Контейнеры эфемерны: при перезапуске или удалении контейнера все файлы внутри стираются. Данные БД всегда сохраняют в Docker Volumes',
        },
      ],
      checklist: [
        'Понимаю разницу между Docker Image (образом) и Docker Container (контейнером)',
        'Знаю, почему контейнеры легковесны и изолированы',
        'Умею собирать образ (docker build) и запускать контейнер (docker run)',
        'Знаю синтаксис проброса портов -p 8000:8000',
      ],
    },

    {
      id: 'dockerfile-line-by-line',
      title: 'Dockerfile с нуля: построчный разбор каждой инструкции',
      summary: 'Как написать идеальный Dockerfile для FastAPI, понять кэширование слоёв и избежать раздувания размера образа',
      theory: [
        {
          type: 'p',
          text: 'Dockerfile — это текстовый файл без расширения в корне проекта. Это пошаговый кулинарный рецепт для сборщика Docker: какую операционную систему взять, какие команды выполнить и как запустить приложение.',
        },
        {
          type: 'steps',
          title: 'Построчный анатомический разбор эталонного Dockerfile для FastAPI',
          items: [
            { code: 'FROM python:3.12-slim', note: '1. Базовый образ: берём чистый Linux Debian с уже установленным Python 3.12 (slim означает компактный размер ~150 МБ вместо 1 ГБ)' },
            { code: 'WORKDIR /app', note: '2. Рабочая папка: создаём и переходим в папку /app внутри контейнера' },
            { code: 'COPY requirements.txt .', note: '3. Копируем файл зависимостей ОТДЕЛЬНО для эффективного кэширования слоёв' },
            { code: 'RUN pip install --no-cache-dir -r requirements.txt', note: '4. Устанавливаем библиотеки без сохранения временных .whl файлов' },
            { code: 'COPY . .', note: '5. Копируем остальной исходный код приложения (main.py, routers, models)' },
            { code: 'EXPOSE 8000', note: '6. Документируем порт, который слушает сервер' },
            { code: 'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]', note: '7. Команда запуска сервера при старте контейнера' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Почему COPY requirements.txt идёт ДО COPY . . ?',
          text: 'Docker собирает образ слоями (Layers) и кэширует каждый шаг. Если ты изменишь одну строчку в main.py, Docker увидит, что requirements.txt не менялся, и НЕ будет заново скачивать библиотеки из интернета — повторная сборка займет 0.5 секунды вместо 2 минут!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Готовый эталонный Dockerfile для FastAPI проекта',
          lang: 'docker',
          code: `FROM python:3.12-slim

WORKDIR /app

# 1. Сначала только зависимости (для кэширования слоёв):
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Затем весь остальной код:
COPY . .

# 3. Слушаем на всех интерфейсах (0.0.0.0):
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          explanation: 'Этот файл гарантирует быструю сборку и компактный размер итогового контейнера.',
        },
        {
          title: 'Пример 2: Эталонный файл .dockerignore',
          lang: 'bash',
          code: `# .dockerignore (исключает лишние файлы из контекста сборки Docker):
venv/
.venv/
__pycache__/
*.pyc
.git/
.env
*.db
.DS_Store`,
          explanation: 'Файл .dockerignore ускоряет сборку и предотвращает случайное попадание локального venv и секретов .env внутрь образа.',
        },
        {
          title: 'Пример 3: Анализатор структуры слоёв Dockerfile на Python',
          lang: 'python',
          code: `def analyze_dockerfile_layers(dockerfile_text: str) -> list[str]:
    valid_instructions = ("FROM", "WORKDIR", "COPY", "RUN", "CMD", "EXPOSE", "ENV")
    layers = []
    for line in dockerfile_text.strip().split("\\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        instruction = line.split()[0]
        if instruction in valid_instructions:
            layers.append(f"Слой [{instruction}]: {line}")
    return layers`,
          explanation: 'Каждая инструкция RUN, COPY и FROM в Dockerfile создаёт отдельный неизменяемый слой файловой системы.',
        },
      ],
      terminal: {
        title: 'Сборка образа Dockerfile в терминале',
        description: 'Попробуй команду сборки образа:',
        lessonCommands: {
          'docker build -t myapp:latest .': {
            output: [
              '[+] Building 1.2s (8/8) FINISHED',
              ' => [internal] load build definition from Dockerfile',
              ' => [1/4] FROM docker.io/library/python:3.12-slim',
              ' => [2/4] WORKDIR /app',
              ' => [3/4] COPY requirements.txt .',
              ' => [4/4] RUN pip install -r requirements.txt',
              'Successfully built image myapp:latest',
            ],
            type: 'success',
          },
        },
        suggestions: ['docker build -t myapp:latest .'],
        script: [
          { command: 'docker build -t myapp:latest .' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице валидатор Dockerfile проверяет безопасность и оптимизацию слоёв. Запусти код!',
        initialCode: `def validate_dockerfile(content: str) -> list[str]:
    issues = []
    lines = content.strip().split("\\n")
    
    has_from = any(l.strip().startswith("FROM") for l in lines)
    has_cmd = any(l.strip().startswith("CMD") for l in lines)
    
    if not has_from:
        issues.append("❌ Ошибка: Отсутствует обязательная инструкция FROM!")
    if not has_cmd:
        issues.append("❌ Ошибка: Отсутствует инструкция запуска CMD!")
        
    for l in lines:
        if l.strip().startswith("CMD") and "127.0.0.1" in l:
            issues.append("⚠️ Предупреждение: Внутри контейнера host должен быть 0.0.0.0, а не 127.0.0.1!")
            
    return issues

test_dockerfile = """
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

errors = validate_dockerfile(test_dockerfile)
if not errors:
    print("✓ Dockerfile написан идеально по всем стандартам лучших практик!")
else:
    for e in errors:
        print(e)`,
      },
      tasks: [
        {
          title: 'Задание 1: обнаружение ошибки хоста 127.0.0.1',
          difficulty: 'easy',
          description: 'Проверь валидатором Dockerfile, в котором в CMD указан --host 127.0.0.1. Убедись, что валидатор выдаёт предупреждение.',
          hints: ['CMD ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]'],
        },
        {
          title: 'Задание 2: парсер переменных окружения ENV в Dockerfile',
          difficulty: 'medium',
          description: 'Добавь в валидатор поддержку поиска инструкции `ENV PYTHONUNBUFFERED=1` (гарантирует немедленный вывод логов Python в терминал без задержек буфера).',
          hints: ['has_unbuffered = any("PYTHONUNBUFFERED=1" in l for l in lines)'],
          solution: `def check_python_unbuffered(dockerfile_text: str) -> bool:
    return any("PYTHONUNBUFFERED=1" in line for line in dockerfile_text.split("\\n"))

good_df = "FROM python:3.12\\nENV PYTHONUNBUFFERED=1\\nCMD [...]"
assert check_python_unbuffered(good_df) is True
print("✓ Проверка переменной PYTHONUNBUFFERED=1 пройдена!")`,
        },
        {
          title: 'Задание 3: Multi-stage сборка (Многоэтапные билды)',
          difficulty: 'hard',
          description: 'Объясни концепцию Multi-stage Dockerfile: зачем на первом этапе (builder) собирать тяжелые библиотеки с компилятором C/C++, а на финальный этап копировать только готовые бинарники, уменьшая итоговый образ с 1.5 ГБ до 80 МБ.',
          hints: ['На продакшене не нужны gcc, g++ и заголовочные файлы .h, нужен только чистый скомпилированный рантайм'],
        },
      ],
      mistakes: [
        {
          wrong: 'Указывать --host 127.0.0.1 в команде запуска Uvicorn в Dockerfile',
          right: '127.0.0.1 слушает только внутри самого замкнутого контейнера. Чтобы принимать запросы снаружи через проброшенный порт, ВСЕГДА указывай --host 0.0.0.0',
        },
        {
          wrong: 'Копировать всё сразу COPY . . ДО команды RUN pip install',
          right: 'Всегда копируй сначала requirements.txt и делай pip install, и только потом копируй весь код — это сохраняет кэш слоёв и ускоряет сборку в десятки раз',
        },
      ],
      checklist: [
        'Знаю назначение всех базовых инструкций: FROM, WORKDIR, COPY, RUN, CMD, EXPOSE, ENV',
        'Понимаю, как работает кэширование слоёв в Docker',
        'Знаю, почему host должен быть строго 0.0.0.0',
        'Умею настраивать файл .dockerignore',
      ],
    },

    {
      id: 'docker-commands-and-compose',
      title: 'Команды управления и Docker Compose с PostgreSQL',
      summary: 'Управление жизненным циклом контейнеров, docker-compose.yml и запуск полноценного стека FastAPI + PostgreSQL одной кнопкой',
      theory: [
        {
          type: 'p',
          text: 'В реальном мире бэкенд почти никогда не работает в одиночку: ему нужна настоящая база данных PostgreSQL, кэш Redis и другие сервисы. Запускать каждый сервис вручную отдельными длинными командами с кучей параметров сети неудобно. Для этого используется инструмент оркестрации — DOCKER COMPOSE.',
        },
        {
          type: 'analogy',
          text: 'Если обычный `docker run` — это заказ отдельных блюд в ресторане (ты отдельно просишь принести воду, отдельно хлеб, отдельно суп, каждый раз настраивая тарелки), то DOCKER COMPOSE — это праздничный комбо-сет (бизнес-ланч). В одном файле `docker-compose.yml` описано всё меню (веб-сервер, база данных, том для хранения данных), и одной командой `docker compose up` на стол подаются ВСЕ готовые сервисы, уже соединённые между собой общей сетью!',
        },
        {
          type: 'steps',
          title: 'Анатомия файла docker-compose.yml',
          items: [
            { code: 'services:', note: 'Главный блок со списком контейнеров' },
            { code: '  db:\n    image: postgres:16-alpine', note: 'Сервис базы данных (готовый официальный образ)' },
            { code: '  web:\n    build: .', note: 'Сервис бэкенда (собирается из нашего Dockerfile)' },
            { code: '    depends_on: [db]', note: 'Веб-сервер ждёт запуска базы данных' },
            { code: 'volumes:\n  pg_data:', note: 'Постоянный том на диске для сохранения записей в БД' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полный боевой файл docker-compose.yml (FastAPI + PostgreSQL)',
          lang: 'bash',
          code: `services:
  db:
    image: postgres:16-alpine
    container_name: postgres_database
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: supersecretpassword
      POSTGRES_DB: backend_db
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  web:
    build: .
    container_name: fastapi_server
    ports:
      - "8000:8000"
    environment:
      # Хостом для подключения является имя сервиса db (не localhost!):
      DATABASE_URL: postgresql://postgres:supersecretpassword@db:5432/backend_db
    depends_on:
      - db

volumes:
  pg_data:`,
          explanation: 'Команда docker compose up поднимает оба сервиса в единой локальной сети, где веб-сервер обращается к базе по имени db:5432.',
        },
        {
          title: 'Пример 2: Топ-5 команд управления контейнерами на каждый день',
          lang: 'bash',
          code: `# 1. Запуск всех сервисов в фоновом режиме:
docker compose up -d --build

# 2. Просмотр потоковых логов бэкенда в реальном времени:
docker compose logs -f web

# 3. Выполнение команды внутри работающего контейнера (например, миграции Alembic):
docker compose exec web alembic upgrade head

# 4. Просмотр списка работающих сервисов:
docker compose ps

# 5. Полная остановка и удаление контейнеров проекта:
docker compose down`,
          explanation: 'Эти 5 команд покрывают 99% ежедневных потребностей backend-разработчика при работе с Docker.',
        },
        {
          title: 'Пример 3: Безопасное подключение через переменные окружения (.env в Compose)',
          lang: 'bash',
          code: `# docker-compose.yml автоматически считывает переменные из локального файла .env:
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_NAME}`,
          explanation: 'Синтаксис ${VAR} позволяет не хранить пароли в docker-compose.yml, а передавать их из защищенного файла .env.',
        },
      ],
      terminal: {
        title: 'Управление Docker Compose в терминале',
        description: 'Попробуй команды запуска, просмотра статуса и остановки Compose:',
        lessonCommands: {
          'docker compose up': {
            output: [
              '[+] Running 2/2',
              ' ✔ Container project-db-1   Started',
              ' ✔ Container project-web-1  Started',
              'project-db-1   | PostgreSQL Database directory ready to accept connections',
              'project-web-1  | INFO:     Uvicorn running on http://0.0.0.0:8000',
            ],
            type: 'success',
          },
        },
        suggestions: ['docker compose up', 'docker compose ps', 'docker compose down'],
        script: [
          { command: 'docker compose up' },
          { command: 'docker compose ps' },
          { command: 'docker compose down' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор Compose оркестратора управляет связкой сервисов. Запусти код!',
        initialCode: `class ComposeOrchestrator:
    def __init__(self):
        self.stack = {}

    def add_service(self, name: str, image: str, depends_on=None):
        self.stack[name] = {"image": image, "depends_on": depends_on or [], "state": "STOPPED"}

    def up(self):
        print("--- [DOCKER COMPOSE UP] Запуск стека сервисов ---")
        # Сначала стартуют зависимости:
        for name, conf in self.stack.items():
            for dep in conf["depends_on"]:
                if self.stack[dep]["state"] != "RUNNING":
                    self.stack[dep]["state"] = "RUNNING"
                    print(f" ✔ Сервис зависимости '{dep}' запущен первым!")
            if conf["state"] != "RUNNING":
                conf["state"] = "RUNNING"
                print(f" ✔ Основной сервис '{name}' успешно запущен!")

compose = ComposeOrchestrator()
compose.add_service("db", "postgres:16")
compose.add_service("redis", "redis:7-alpine")
compose.add_service("web", "fastapi-backend:latest", depends_on=["db", "redis"])

compose.up()`,
      },
      tasks: [
        {
          title: 'Задание 1: остановка сервисов (compose down)',
          difficulty: 'easy',
          description: 'Добавь в ComposeOrchestrator метод down(self), который переводит все сервисы в состояние "STOPPED" и печатает подтверждение.',
          hints: ['for s in self.stack.values(): s["state"] = "STOPPED"'],
        },
        {
          title: 'Задание 2: формирование URL подключения внутри сети Docker',
          difficulty: 'medium',
          description: 'Напиши функцию get_docker_db_url(user, password, service_name, port, db_name) -> str. Для get_docker_db_url("postgres", "pass", "db", 5432, "shop_db") должна вернуть "postgresql://postgres:pass@db:5432/shop_db".',
          hints: ['return f"postgresql://{user}:{password}@{service_name}:{port}/{db_name}"'],
          solution: `def get_docker_db_url(user, pwd, service, port, db):
    return f"postgresql://{user}:{pwd}@{service}:{port}/{db}"

url = get_docker_db_url("postgres", "secret", "db", 5432, "appdb")
assert "@db:5432" in url
print("✓ Внутренний URL для Docker Compose:", url)`,
        },
        {
          title: 'Задание 3: практический запуск проекта в Docker',
          difficulty: 'hard',
          description: 'Возьми свой проект Todo API (или Shop API): 1) Создай Dockerfile; 2) Создай docker-compose.yml со связкой PostgreSQL; 3) Запусти docker compose up -d; 4) Открой http://localhost:8000/docs.',
          hints: ['Поздравляем! Твой проект упакован в промышленный контейнер по всем канонам DevOps!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Указывать DATABASE_URL="postgresql://user:pass@localhost:5432/db" внутри контейнера FastAPI при работе в Compose',
          right: 'Внутри сети Docker Compose у каждого контейнера свой localhost. Хостом для подключения к базе является имя сервиса (@db:5432), а не localhost',
        },
        {
          wrong: 'Забыть объявить volume под PostgreSQL в блоке volumes:',
          right: 'Без тома при каждом docker compose down и последующем запуске вся база данных будет создаваться заново с нуля',
        },
      ],
      checklist: [
        'Понимаю назначение Docker Compose для мульти-сервисных проектов',
        'Умею описывать сервисы, переменные окружения и тома в docker-compose.yml',
        'Знаю главные команды: docker compose up, down, logs, ps, exec',
        'Понимаю, как контейнеры обращаются друг к другу по имени сервиса в сети',
      ],
    },
  ],
};
