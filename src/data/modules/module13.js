export const module13 = {
  id: 'deploy',
  order: 13,
  title: 'Деплой',
  icon: '🚀',
  description: 'Docker, Docker Compose и деплой приложения на реальные облачные платформы.',
  lessons: [
    {
      id: 'why-docker',
      title: 'Зачем нужен Docker: аналогия с контейнеровозом',
      summary: 'Почему программы ломаются при переносе на другой компьютер и как Docker решает проблему «у меня всё работало»',
      theory: [
        {
          type: 'p',
          text: 'Ты написал замечательный сервер на своём ноутбуке: всё запускается и тесты зелёные. Но когда ты передаёшь код коллеге или загружаешь его на арендованный сервер в облаке — всё неожиданно падает: "другая версия Python", "не установлена библиотека C", "нет системного пакета libpq для PostgreSQL". Знаменитая фраза "У меня на компьютере всё работало!" стала главным мемом программистов.',
        },
        {
          type: 'analogy',
          text: 'Представь грузовые перевозки до появления стандартных морских контейнеров. В трюм корабля пытались уложить бочки, ящики разного размера, мешки и тюки — всё каталось, билось и требовало часов ручной разгрузки. Затем люди придумали СТАНДАРТНЫЙ МОРСКОЙ КОНТЕЙНЕР (ISO-контейнер). Неважно, что внутри — станки, бананы или мебель — контейнер идеально встаёт на ЛЮБОЙ корабль, поезд или грузовик в любой стране мира. Docker делает ровно то же самое для программ: упаковывает твой Python, твои библиотеки и твой код в стандартный цифровой контейнер, который одинаково запускается на Windows, Mac, Linux и в любом облаке!',
        },
        {
          type: 'list',
          title: 'Главные понятия Docker',
          items: [
            'Образ (Image): неизменяемый "чертёж" или слепок системы (как установочный диск с операционной системой, Python и твоим кодом).',
            'Контейнер (Container): запущенный живой экземпляр образа (как запущенная изолированная программа из чертежа). Из одного образа можно запустить 10 одинаковых контейнеров.',
            'Dockerfile: текстовая пошаговая инструкция (рецепт) для сборки образа.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'В чём разница между Docker и виртуальной машиной (VirtualBox)?',
          text: 'Виртуальная машина эмулирует целый отдельный физический компьютер со своим тяжелым ядром ОС и требует гигабайты памяти. Контейнер Docker использует ядро хостовой системы напрямую — поэтому он запускается за доли секунды и практически не тратит лишней оперативной памяти.',
        },
      ],
      example: {
        title: 'Схема жизненного цикла Docker',
        lang: 'bash',
        code: `# 1. Пишем рецепт (Dockerfile) в папке проекта
# 2. Собираем образ (Image):
docker build -t my-backend:1.0 .

# 3. Запускаем изолированный контейнер (Container):
docker run -d -p 8000:8000 --name my-app my-backend:1.0

# 4. Проверяем список запущенных контейнеров:
docker ps`,
        explanation: 'Флаг -p 8000:8000 пробрасывает порт 8000 наружу, чтобы ты мог открыть http://localhost:8000 в своём браузере.',
      },
      terminal: {
        title: 'Первое знакомство с Docker в терминале',
        description: 'Попробуй проверить версию Docker и просмотреть список запущенных контейнеров:',
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
      tasks: [
        {
          title: 'Задание 1: разбери аналогию образа и класса',
          difficulty: 'easy',
          description: 'Вспомни ООП из модуля 3. Объясни в комментарии: почему отношение "Docker Image -> Docker Container" точно такое же, как отношение "Класс -> Объект (экземпляр класса)" в Python?',
          hints: ['Образ (Image) — это описание/шаблон, а Контейнер (Container) — живой экземпляр, созданный по этому шаблону'],
        },
        {
          title: 'Задание 2: почему контейнеры безопаснее запуска напрямую',
          difficulty: 'medium',
          description: 'Подумай, что произойдёт, если вредоносный скрипт попытается выполнить команду rm -rf / внутри контейнера Docker. Пострадают ли файлы на твоём основном компьютере? Запиши ответ в виде комментария.',
          hints: ['Контейнер изолирован: удаление файлов внутри контейнера никак не затрагивает операционную систему хоста'],
          solution: `# Ответ: Файлы на основном компьютере НЕ пострадают, 
# потому что контейнер работает в изолированном пространстве имён 
# и файловой системе (filesystem isolation). Погибнет только сам контейнер.`,
        },
        {
          title: 'Задание 3: проброс портов (Port Forwarding)',
          difficulty: 'hard',
          description: 'Если в команде docker run указать флаг -p 3000:8000, на каком порту твоего компьютера (localhost) откроется API, и на какой внутренний порт контейнера будет перенаправлен запрос?',
          hints: ['Синтаксис флага -p: ВНЕШНИЙ_ПОРТ_ХОСТА : ВНУТРЕННИЙ_ПОРТ_КОНТЕЙНЕРА'],
        },
      ],
      mistakes: [
        {
          wrong: 'Думать, что Docker — это только для системных администраторов, а разработчик может обойтись без него',
          right: 'Любой современный бэкенд-разработчик использует Docker ежедневно: для запуска локальной PostgreSQL, для сборки и для деплоя на прод',
        },
        {
          wrong: 'Забыть пробросить порт (-p 8000:8000) при запуске docker run',
          right: 'Без флага -p сервер внутри контейнера будет работать, но браузер с твоего компьютера не сможет до него достучаться',
        },
      ],
      checklist: [
        'Понимаю проблему "у меня на компьютере всё работало" и как Docker её решает',
        'Знаю разницу между Image (образ-слепок) и Container (запущенный контейнер)',
        'Понимаю, чем Docker легче и быстрее виртуальных машин',
        'Знаю, зачем нужен проброс портов (-p)',
      ],
    },

    {
      id: 'dockerfile-basics',
      title: 'Пишем Dockerfile с нуля',
      summary: 'Пошаговый разбор инструкций FROM, WORKDIR, COPY, RUN и CMD для упаковки FastAPI приложения',
      theory: [
        {
          type: 'p',
          text: 'Dockerfile — это текстовый файл без расширения, который лежит в корне твоего проекта. Это точный пошаговый кулинарный рецепт: какую операционную систему взять за основу, какие пакеты установить и какой командой запустить сервер.',
        },
        {
          type: 'steps',
          title: 'Пошаговый разбор стандартного Dockerfile для FastAPI',
          items: [
            { code: 'FROM python:3.12-slim', note: '1. Базовый образ: берём официальный легковесный Linux с уже установленным Python 3.12' },
            { code: 'WORKDIR /app', note: '2. Рабочая папка: переходим в каталог /app внутри контейнера (все дальнейшие команды выполняются в ней)' },
            { code: 'COPY requirements.txt .', note: '3. Копируем файл зависимостей с твоего компьютера в контейнер' },
            { code: 'RUN pip install --no-cache-dir -r requirements.txt', note: '4. Устанавливаем все библиотеки (FastAPI, Uvicorn, SQLAlchemy) на этапе сборки' },
            { code: 'COPY . .', note: '5. Копируем весь остальной исходный код проекта' },
            { code: 'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]', note: '6. Финальная команда: инструкция, которая выполняется при ЗАПУСКЕ контейнера' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Почему мы копируем requirements.txt отдельно от остального кода?',
          text: 'Это трюк с кэшированием слоёв Docker! Docker кэширует каждый шаг сборки. Если ты изменишь только строчку в main.py, Docker увидит, что requirements.txt не менялся, и НЕ будет заново перекачивать все библиотеки из интернета — сборка займёт 0.5 секунды вместо минуты!',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему host должен быть строго 0.0.0.0, а не 127.0.0.1',
          text: '127.0.0.1 (localhost) внутри контейнера слушает только внутри самого изолированного контейнера. Чтобы сервер принимал запросы, пришедшие снаружи (через проброшенный порт с твоего компьютера), он обязан слушать на 0.0.0.0 (все сетевые интерфейсы).',
        },
      ],
      example: {
        title: 'Готовый Dockerfile для FastAPI проекта',
        lang: 'docker',
        code: `FROM python:3.12-slim

WORKDIR /app

# Отдельно копируем зависимости для использования кэша Docker:
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем остальной код:
COPY . .

# Запуск Uvicorn на всех сетевых интерфейсах:
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
        explanation: 'Файл сохраняется с точным именем Dockerfile (с большой буквы, без расширения) в корне проекта рядом с main.py.',
      },
      terminal: {
        title: 'Сборка и запуск образа Docker в терминале',
        description: 'Попробуй собрать образ командой docker build и запустить его:',
        lessonCommands: {
          'docker build -t myapp .': {
            output: [
              '[+] Building 1.2s (8/8) FINISHED',
              ' => [internal] load build definition from Dockerfile',
              ' => [1/4] FROM docker.io/library/python:3.12-slim',
              ' => [2/4] WORKDIR /app',
              ' => [3/4] COPY requirements.txt .',
              ' => [4/4] RUN pip install -r requirements.txt',
              ' => exporting to image',
              'Successfully built image myapp:latest',
            ],
            type: 'success',
          },
          'docker run -p 8000:8000 myapp': {
            output: [
              'INFO:     Started server process [1]',
              'INFO:     Waiting for application startup.',
              'INFO:     Application startup complete.',
              'INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)',
            ],
            type: 'success',
          },
        },
        suggestions: ['docker build -t myapp .', 'docker run -p 8000:8000 myapp'],
        script: [
          { command: 'docker build -t myapp .' },
          { command: 'docker run -p 8000:8000 myapp' },
        ],
      },
      tasks: [
        {
          title: 'Задание 1: файл .dockerignore',
          difficulty: 'easy',
          description: 'Как и для Git (.gitignore), для Docker существует файл .dockerignore. Напиши список файлов, которые НЕ должны попадать в образ контейнера (подсказка: локальный venv/, .git/, кэш __pycache__/).',
          hints: ['__pycache__/\nvenv/\n.env\n.git/'],
        },
        {
          title: 'Задание 2: разница между RUN и CMD',
          difficulty: 'medium',
          description: 'Объясни своими словами: в чём принципиальная разница между инструкцией RUN (выполняется во время сборки образа) и инструкцией CMD (выполняется при запуске контейнера)?',
          hints: [
            'RUN pip install выполняется ОДИН раз при создании образа на диске',
            'CMD uvicorn ... выполняется КАЖДЫЙ РАЗ, когда контейнер оживает',
          ],
          solution: `# RUN выполняется на этапе сборки (build-time) для установки пакетов и подготовки образа.
# CMD задаёт команду по умолчанию, которая стартует при запуске контейнера (run-time).`,
        },
        {
          title: 'Задание 3: запуск на нестандартном порту',
          difficulty: 'hard',
          description: 'Если твоё приложение должно слушать порт 8080 вместо 8000, какие две строки нужно изменить: в Dockerfile (параметр --port в CMD) и в команде docker run (параметр -p)?',
          hints: ['CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"] и docker run -p 8080:8080 myapp'],
        },
      ],
      mistakes: [
        {
          wrong: 'Указать --host 127.0.0.1 в CMD инструкции Dockerfile',
          right: 'Внутри Docker обязательно указывать --host 0.0.0.0, иначе сервер будет недоступен снаружи контейнера',
        },
        {
          wrong: 'Копировать всё сразу COPY . . ДО установки pip install',
          right: 'Всегда копируй сначала requirements.txt и запускай RUN pip install, и только потом COPY . . — это сохраняет кэш и ускоряет сборку в десятки раз',
        },
      ],
      checklist: [
        'Знаю структуру инструкций Dockerfile: FROM, WORKDIR, COPY, RUN, CMD',
        'Понимаю, как работает кэширование слоёв при сборке образа',
        'Знаю, зачем указывать --host 0.0.0.0',
        'Умею собирать образ (docker build) и запускать контейнер (docker run)',
      ],
    },

    {
      id: 'docker-compose',
      title: 'Docker Compose: оркестрация приложения и базы данных',
      summary: 'Как запустить FastAPI сервер и PostgreSQL одной командой docker compose up',
      theory: [
        {
          type: 'p',
          text: 'Реальный backend почти никогда не живёт в одиночку: ему нужна база данных PostgreSQL, кэш-сервер Redis, очередь Celery. Запускать каждый сервис отдельной длинной командой вручную неудобно и легко запутаться в сетевых настройках. Для этого существует инструмент оркестрации — DOCKER COMPOSE.',
        },
        {
          type: 'analogy',
          text: 'Docker Compose — это как пульт управления оркестром или дирижёр. Вместо того чтобы подходить к каждому музыканту по отдельности (запусти базу данных, настрой сеть, запусти сервер, передай пароли), ты нажимаешь одну кнопку на пульте (docker compose up) — и весь оркестр сервисов слаженно начинает играть вместе!',
        },
        {
          type: 'steps',
          title: 'Как устроен файл docker-compose.yml',
          items: [
            { code: 'services:', note: 'Главный блок со списком запускаемых контейнеров' },
            { code: '  db:\n    image: postgres:16', note: 'Сервис 1: База данных PostgreSQL (скачивается готовый официальный образ)' },
            { code: '  web:\n    build: .', note: 'Сервис 2: Наш FastAPI сервер (собирается из локального Dockerfile)' },
            { code: '    depends_on: [db]', note: 'Указываем, что сервер web должен стартовать ПОСЛЕ готовности базы db' },
            { code: 'volumes:', note: 'Тома для сохранения данных БД на диске даже после перезапуска контейнеров' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Автоматическая внутренняя сеть между контейнерами',
          text: 'Docker Compose автоматически создаёт изолированную локальную сеть. Контейнер FastAPI может обращаться к базе данных прямо по имени сервиса в URL: postgresql://user:pass@db:5432/mydb (хост db вместо localhost!).',
        },
      ],
      example: {
        title: 'Файл docker-compose.yml для связки FastAPI + PostgreSQL',
        lang: 'bash',
        code: `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: backend_db
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:mysecretpassword@db:5432/backend_db
    depends_on:
      - db

volumes:
  pg_data:`,
        explanation: 'Команда docker compose up поднимает оба контейнера, создаёт том pg_data для сохранности записей в БД и настраивает общую сеть.',
      },
      terminal: {
        title: 'Запуск связки сервисов через Docker Compose',
        description: 'Попробуй команду запуска docker compose up:',
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
        suggestions: ['docker compose up'],
        script: [
          { command: 'docker compose up' },
        ],
      },
      tasks: [
        {
          title: 'Задание 1: почему том (volume) обязателен для БД',
          difficulty: 'easy',
          description: 'Контейнеры Docker по умолчанию эфемерны (при удалении контейнера стирается всё, что было внутри него). Объясни, как блок volumes: pg_data защищает реальные данные клиентов в PostgreSQL от случайного удаления.',
          hints: ['Том (volume) монтирует папку на реальном жёстком диске компьютера, поэтому данные сохраняются между перезапусками'],
        },
        {
          title: 'Задание 2: фоновый режим (docker compose up -d)',
          difficulty: 'medium',
          description: 'Флаг -d (detached) запускает все контейнеры в фоновом режиме, освобождая терминал для других команд. Напиши в комментарии команды для просмотра логов (docker compose logs) и остановки сервисов (docker compose down).',
          hints: ['docker compose down останавливает и удаляет контейнеры проекта'],
          solution: `# Запуск в фоне: docker compose up -d
# Просмотр логов: docker compose logs -f web
# Остановка: docker compose down`,
        },
        {
          title: 'Задание 3: добавление сервиса Redis',
          difficulty: 'hard',
          description: 'Допиши в структуру docker-compose.yml третий сервис с именем redis на базе официального образа image: redis:7-alpine с пробросом порта "6379:6379".',
          hints: ['  redis:\n    image: redis:7-alpine\n    ports:\n      - "6379:6379"'],
        },
      ],
      mistakes: [
        {
          wrong: 'Указывать host: "localhost" в DATABASE_URL для подключения из контейнера FastAPI к контейнеру Postgres',
          right: 'Внутри Docker Compose хостом является имя сервиса базы данных (например @db:5432), а не localhost',
        },
        {
          wrong: 'Забыть объявить volume для PostgreSQL',
          right: 'Без тома (volume) при каждой пересборке или остановке контейнера база данных будет полностью стираться',
        },
      ],
      checklist: [
        'Понимаю назначение Docker Compose для мульти-контейнерных проектов',
        'Умею описывать сервисы, переменные окружения и порты в docker-compose.yml',
        'Знаю, зачем нужны Docker Volumes для баз данных',
        'Знаю команды docker compose up и docker compose down',
      ],
    },

    {
      id: 'cloud-deploy',
      title: 'Деплой в облако (Render / Railway / VPS)',
      summary: 'Как выложить своё FastAPI приложение в интернет, чтобы им могли пользоваться люди по всему миру',
      theory: [
        {
          type: 'p',
          text: 'Финальный шаг в создании бэкенда — ДЕПЛОЙ (развёртывание). Деплой означает публикацию твоего кода на удалённом сервере, работающем круглосуточно с публичным IP-адресом и доменным именем (https://my-api.onrender.com).',
        },
        {
          type: 'analogy',
          text: 'Деплой — это как торжественное открытие настоящего магазина. Пока ты писал код дома — ты строил витрины и раскладывал товар на закрытом складе. Деплой — это когда ты вешаешь вывеску с адресом, открываешь двери и начинаешь принимать реальных покупателей со всего мира 24/7.',
        },
        {
          type: 'steps',
          title: 'Как устроен современный деплой через Git (PaaS)',
          items: [
            { code: '1. git push origin main', note: 'Ты пушишь свой проверенный код в репозиторий на GitHub' },
            { code: '2. Подключение сервиса (Render / Railway)', note: 'В панели облачного сервиса выбираешь свой репозиторий на GitHub' },
            { code: '3. Настройка переменных окружения', note: 'В панели облака указываешь SECRET_KEY и DATABASE_URL (то, что мы изучили в модуле 11!)' },
            { code: '4. Автоматическая сборка', note: 'Сервер сам запускает сборку Dockerfile или выполняет pip install -r requirements.txt' },
            { code: '5. Выдача публичного HTTPS-адреса', note: 'Сервис автоматически выдаёт бесплатный SSL-сертификат (HTTPS) и публичную ссылку' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Команда запуска (Start Command) в облаке',
          text: 'Облачные платформы обычно передают динамический порт в переменной окружения $PORT. Поэтому стандартная команда запуска выглядит так: uvicorn main:app --host 0.0.0.0 --port $PORT',
        },
      ],
      example: {
        title: 'Чеклист готовности проекта к деплою в облако',
        lang: 'bash',
        code: `# 1. Проверен файл requirements.txt со всеми библиотеками:
fastapi==0.115.6
uvicorn==0.34.0
pydantic==2.10.4
psycopg2-binary==2.9.10
python-dotenv==1.0.1

# 2. Файл .gitignore содержит .env (секреты не в Git!)
# 3. База данных использует переменную DATABASE_URL из os.getenv
# 4. Все тесты пройдены: pytest`,
        explanation: 'Соблюдение этих 4 простых пунктов гарантирует, что деплой на Render, Railway или любой VPS пройдёт с первой попытки.',
      },
      terminal: {
        title: 'Подготовка к деплою в Git',
        description: 'Убедись, что все изменения закоммичены и готовы к отправке на сервер:',
        lessonCommands: {
          'git status': {
            output: [
              'On branch main',
              'Your branch is up to date with \'origin/main\'.',
              'nothing to commit, working tree clean',
            ],
            type: 'success',
          },
        },
        suggestions: ['git status'],
        script: [
          { command: 'git status' },
        ],
      },
      tasks: [
        {
          title: 'Задание 1: почему в облаке нельзя использовать SQLite',
          difficulty: 'easy',
          description: 'На бесплатных облачных хостингах (Render/Railway) файловая система контейнера сбрасывается при каждом деплое. Объясни в комментарии, почему для облачного продакшена обязательно подключать внешнюю базу PostgreSQL вместо локального файла SQLite.',
          hints: ['Локальный файл .db удалится при перезапуске контейнера, а облачная база PostgreSQL хранит данные на отдельном постоянном диске'],
        },
        {
          title: 'Задание 2: переменная PORT',
          difficulty: 'medium',
          description: 'Напиши команду запуска Uvicorn для продакшена с использованием переменной $PORT и 4 рабочими процессами (флаг --workers 4).',
          hints: ['uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4'],
          solution: `# Команда запуска для продакшена:
# uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4`,
        },
        {
          title: 'Задание 3: Healthcheck эндпоинт',
          difficulty: 'hard',
          description: 'Облачные провайдеры периодически пингуют сервер, чтобы убедиться, что он "жив". Напиши минимальный эндпоинт @app.get("/health"), который возвращает {"status": "ok", "version": "1.0.0"} со статусом 200.',
          hints: ['@app.get("/health")\ndef health(): return {"status": "ok", "version": "1.0.0"}'],
        },
      ],
      mistakes: [
        {
          wrong: 'Хранить пароли от продакшен-базы прямо в коде main.py при деплое на GitHub',
          right: 'В Git отправляется только чистый код. Все пароли и ключи задаются через вкладку Environment Variables в панели управления облачного провайдера',
        },
        {
          wrong: 'Запускать Uvicorn с флагом --reload в продакшене',
          right: 'Флаг --reload нужен только для локальной разработки. В продакшене он создаёт лишнюю нагрузку и снижает стабильность',
        },
      ],
      checklist: [
        'Понимаю процесс непрерывного деплоя (Git push -> Автоматическая сборка -> Деплой)',
        'Знаю, как настраивать Environment Variables в облачных платформах',
        'Понимаю, почему для продакшена используется управляемая база данных PostgreSQL',
        'Умею создавать Healthcheck эндпоинт для мониторинга сервера',
      ],
    },
  ],
};
