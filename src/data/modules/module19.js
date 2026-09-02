export const module19 = {
  id: 'git-github',
  order: 19,
  title: 'Git и GitHub с нуля',
  icon: '🐙',
  description: 'Система контроля версий Git, ветвление, слияния, GitHub и оформление идеального портфолио.',
  lessons: [
    {
      id: 'git-basics-time-machine',
      title: 'Зачем нужен Git: машина времени для кода',
      summary: 'Почему файлы `main_final_v2_точно_финал.py` — это кошмар и как Git сохраняет историю проекта',
      theory: [
        {
          type: 'p',
          text: 'Каждый начинающий программист до знакомства с Git проходил через ад ручного копирования файлов: `app.py`, `app_copy.py`, `app_final.py`, `app_final_fixed2.py`. А если проект сломался в 2 часа ночи — как вспомнить, какую именно строчку ты изменил полчаса назад? Для решения этой проблемы создатель Linux Линус Торвальдс написал GIT — распределённую систему контроля версий (VCS).',
        },
        {
          type: 'analogy',
          text: 'Git — это НАСТОЯЩАЯ МАШИНА ВРЕМЕНИ или система контрольных точек (Save points) в компьютерной игре. Представь, что ты проходишь сложного босса: перед боем ты делаешь сохранение (КОММИТ — git commit). Ты можешь смело экспериментировать, менять код, пробовать новые идеи. Если всё сломалось — ты в 1 клик возвращаешься к точке сохранения, где всё гарантированно работало!',
        },
        {
          type: 'steps',
          title: '3 главных этапа сохранения изменений в Git',
          items: [
            { code: '1. Working Directory (Рабочая папка)', note: 'Ты пишешь и редактируешь файлы в редакторе кода' },
            { code: '2. Staging Area / Index (git add .)', note: '"Складываем в корзину": отмечаем, какие именно измененные файлы войдут в следующий снимок' },
            { code: '3. Repository (git commit -m "...")', note: '"Делаем снимок": навсегда запечатываем состояние файлов с понятным текстовым описанием' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Первоначальная настройка: кто автор кода?',
          text: 'После установки Git нужно один раз представиться системе: git config --global user.name "Иван Иванов" и git config --global user.email "ivan@example.com". Это имя будет записываться во все твои коммиты.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Базовый цикл сохранения проекта в терминале',
          lang: 'bash',
          code: `# 1. Инициализируем Git в папке проекта (создаётся скрытая папка .git):
git init

# 2. Проверяем текущее состояние файлов:
git status

# 3. Добавляем все новые и изменённые файлы в подготовку (Staging):
git add .

# 4. Фиксируем снимок (коммит) с понятным сообщением:
git commit -m "feat: добавить эндпоинты авторизации и регистрации"

# 5. Просматриваем красивую историю снимков:
git log --oneline`,
          explanation: 'Команда git add выбирает файлы, а git commit упаковывает их в неизменяемый исторический снимок с уникальным хешем SHA-1.',
        },
        {
          title: 'Пример 2: Парсер и валидатор истории коммитов на Python',
          lang: 'python',
          code: `def format_commit_log(commit_hash: str, author: str, message: str) -> str:
    """Форматирует запись истории коммита по стандарту Conventional Commits"""
    short_hash = commit_hash[:7]
    return f"[{short_hash}] {author}: {message}"

commits = [
    {"hash": "4a1f9e2d8b7c3e1a", "author": "Alex", "msg": "feat: initial project setup"},
    {"hash": "8b9c0d1e2f3a4b5c", "author": "Alex", "msg": "fix: resolve db connection timeout"},
]

for c in commits:
    print(format_commit_log(c["hash"], c["author"], c["msg"]))`,
          explanation: 'В реальной разработке принято использовать префиксы коммитов: feat: (новая функция), fix: (исправление бага), docs: (документация).',
        },
        {
          title: 'Пример 3: Откат случайных изменений файла (git checkout / git restore)',
          lang: 'bash',
          code: `# Если ты случайно испортил файл main.py и хочешь вернуть его к последнему коммиту:
git restore main.py

# Если ты добавил файл в staging (git add), но передумал его коммитить:
git restore --staged main.py`,
          explanation: 'git restore моментально возвращает файл к исходному состоянию из последнего сохранения без перезагрузки системы.',
        },
      ],
      terminal: {
        title: 'Тренажёр первого коммита в терминале',
        description: 'Попробуй инициализировать Git-репозиторий, проверить статус и создать свой первый коммит:',
        lessonCommands: {
          'git init': {
            output: ['Initialized empty Git repository in /home/user/project/.git/'],
            type: 'success',
          },
        },
        suggestions: ['git init', 'git status', 'git add .', 'git commit -m "Initial commit"', 'git log'],
        script: [
          { command: 'git init' },
          { command: 'git status' },
          { command: 'git add .' },
          { command: 'git commit -m "Initial commit"' },
          { command: 'git log' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирована структура снимков Git (дерево коммитов). Запусти код!',
        initialCode: `import hashlib
import time

class GitCommit:
    def __init__(self, message: str, parent=None):
        self.message = message
        self.parent = parent
        self.timestamp = time.strftime("%H:%M:%S")
        # Генерируем хеш коммита:
        data = f"{message}-{self.timestamp}-{parent.commit_hash if parent else 'root'}"
        self.commit_hash = hashlib.sha1(data.encode()).hexdigest()[:7]

# Создаём цепочку коммитов:
c1 = GitCommit("Initial commit (создан main.py)")
c2 = GitCommit("Добавлены модели SQLAlchemy", parent=c1)
c3 = GitCommit("Подключен JWT токен", parent=c2)

print("История коммитов проекта:")
current = c3
while current:
    print(f"[{current.commit_hash}] -> {current.message} ({current.timestamp})")
    current = current.parent`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь четвёртый коммит',
          difficulty: 'easy',
          description: 'Создай четвёртый коммит c4 = GitCommit("Написаны тесты pytest", parent=c3) и распечатай всю цепочку от c4 до корня.',
          hints: ['c4 = GitCommit("Написаны тесты pytest", parent=c3)\ncurrent = c4'],
        },
        {
          title: 'Задание 2: валидатор сообщений коммитов',
          difficulty: 'medium',
          description: 'Напиши функцию is_valid_commit_msg(msg: str) -> bool: проверяет, что сообщение начинается с одного из префиксов ("feat:", "fix:", "docs:", "refactor:", "test:") и содержит не менее 10 символов.',
          hints: ['valid_prefixes = ("feat:", "fix:", "docs:", "refactor:", "test:")\nreturn msg.startswith(valid_prefixes) and len(msg) >= 10'],
          solution: `def is_valid_commit_msg(msg: str) -> bool:
    prefixes = ("feat:", "fix:", "docs:", "refactor:", "test:")
    return msg.startswith(prefixes) and len(msg) >= 10

assert is_valid_commit_msg("feat: add login endpoint") is True
assert is_valid_commit_msg("исправил баг") is False
print("✓ Валидатор сообщений коммитов работает верно!")`,
        },
        {
          title: 'Задание 3: поиск коммита по сообщению (git log --grep)',
          difficulty: 'hard',
          description: 'Напиши функцию find_commit_by_keyword(head_commit, keyword: str), которая проходит по цепочке родительских коммитов и возвращает первый коммит, содержащий указанное слово в сообщении.',
          hints: ['while current:\n    if keyword.lower() in current.message.lower(): return current\n    current = current.parent'],
        },
      ],
      mistakes: [
        {
          wrong: 'Писать бессмысленные сообщения коммитов вроде "fix", "asdasd", "update", "qwerty"',
          right: 'Через месяц ты сам не вспомнишь, что означал коммит "fix". Пиши конкретно: "fix: исправить ошибку деления на ноль в расчёте скидки"',
        },
        {
          wrong: 'Копить изменения за 3 недели работы и коммитить 10 000 строк одним гигантским коммитом',
          right: 'Делай маленькие атомарные коммиты: сделал одну фичу или исправил один баг -> сразу сделал коммит. Это облегчает поиск ошибок в 100 раз',
        },
      ],
      checklist: [
        'Понимаю назначение Git как машины времени и системы снимков',
        'Знаю 3 этапа: Рабочая папка -> Staging (git add) -> Репозиторий (git commit)',
        'Знаю команды git init, git status, git add, git commit и git log',
        'Умею писать понятные сообщения коммитов по стандарту Conventional Commits',
      ],
    },

    {
      id: 'git-branches-and-merge',
      title: 'Ветки и слияния: параллельные вселенные кода',
      summary: 'Как работать в ветках без риска сломать главный код, делать слияния (merge) и разрешать конфликты',
      theory: [
        {
          type: 'p',
          text: 'В командной разработке или при создании новой большой фичи нельзя писать код прямо в главной ветке (`main` или `master`). Если твоя новая функция ещё не доделана, а на продакшене срочно нужно исправить критический баг — как разделить незаконченный код и стабильную рабочую версию? Ответ — ВЕТКИ (Branches).',
        },
        {
          type: 'analogy',
          text: 'ВЕТКА (Branch) — это как параллельная вселенная в фантастическом фильме. Ты отпочковываешься от основной реальности (ветки main) в параллельную ветку `feature/payments`. Там ты можешь смело менять файлы, переписывать логику — в основной вселенной main всё продолжает стабильно работать для клиентов! Когда фича готова и протестирована, ты совершаешь СЛИЯНИЕ ВСЕЛЕННЫХ (git merge) — и твой новый код вливается в основную ветку main.',
        },
        {
          type: 'steps',
          title: 'Стандартный жизненный цикл работы в ветке',
          items: [
            { code: '1. git switch -c feature/order-api', note: 'Создаём новую ветку и сразу переключаемся в неё' },
            { code: '2. Пишем код и делаем коммиты', note: 'Все коммиты сохраняются ТОЛЬКО в этой изолированной ветке' },
            { code: '3. git switch main', note: 'Возвращаемся в главную ветку' },
            { code: '4. git merge feature/order-api', note: 'Вливаем изменения из ветки фичи в главную ветку main' },
            { code: '5. git branch -d feature/order-api', note: 'Удаляем временную ветку после успешного слияния' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Что такое Конфликт слияния (Merge Conflict)?',
          text: 'Конфликт возникает, если два программиста изменили ОДНУ И ТУ ЖЕ СТРОКУ в одном и том же файле в разных ветках. Git не может угадать, чей вариант правильный, и просит человека открыть файл и руками выбрать нужный код между маркерами <<<<<<< HEAD и >>>>>>>.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полный сценарий создания ветки и слияния',
          lang: 'bash',
          code: `# Создаём ветку для разработки новой корзины покупок:
git checkout -b feature/cart

# Делаем изменения в коде и коммитим:
git add cart.py
git commit -m "feat: add shopping cart logic"

# Переключаемся обратно в main и сливаем:
git switch main
git merge feature/cart`,
          explanation: 'Команда git switch main переводит рабочую директорию обратно к состоянию главной ветки, а git merge объединяет историю.',
        },
        {
          title: 'Пример 2: Разрешение конфликта слияния (Merge Conflict)',
          lang: 'python',
          code: `# Так выглядит файл при возникновении конфликта:
# <<<<<<< HEAD (текущая ветка main)
# DB_HOST = "localhost"
# =======
# DB_HOST = "postgres.cloud.internal"
# >>>>>>> feature/cloud-db (вливаемая ветка)

# ✅ Чтобы разрешить конфликт, программист стирает маркеры и оставляет верный вариант:
DB_HOST = "postgres.cloud.internal"`,
          explanation: 'После ручного выбора правильных строк остаётся выполнить git add . и git commit для завершения слияния.',
        },
        {
          title: 'Пример 3: Сравнение веток перед слиянием (git diff)',
          lang: 'bash',
          code: `# Показывает точную разницу в коде между веткой main и веткой feature:
git diff main..feature/cart

# Показывает список коммитов, которые есть в feature, но ещё нет в main:
git log main..feature/cart --oneline`,
          explanation: 'Команда git diff позволяет заранее увидеть все изменения до выполнения слияния.',
        },
      ],
      terminal: {
        title: 'Работа с ветками в терминале',
        description: 'Попробуй просмотреть список веток и выполнить слияние:',
        lessonCommands: {
          'git branch': {
            output: ['* main', '  feature/auth-jwt', '  fix/db-connection'],
            type: 'default',
          },
        },
        suggestions: ['git branch', 'git switch feature/auth-jwt', 'git switch main', 'git merge feature/auth-jwt'],
        script: [
          { command: 'git branch' },
          { command: 'git switch feature/auth-jwt' },
          { command: 'git switch main' },
          { command: 'git merge feature/auth-jwt' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирована структура веток репозитория. Запусти код!',
        initialCode: `class GitBranchManager:
    def __init__(self):
        self.branches = {"main": ["init commit", "setup fastapi"]}
        self.current_branch = "main"

    def create_branch(self, name: str):
        # Новая ветка копирует историю текущей ветки:
        self.branches[name] = list(self.branches[self.current_branch])
        print(f"✓ Создана ветка '{name}' от '{self.current_branch}'")

    def switch(self, name: str):
        if name not in self.branches:
            raise ValueError(f"Ветка {name} не найдена!")
        self.current_branch = name
        print(f"👉 Переключились на ветку '{name}'")

    def commit(self, msg: str):
        self.branches[self.current_branch].append(msg)
        print(f"[{self.current_branch}] Закоммичено: {msg}")

    def merge(self, from_branch: str):
        new_commits = [c for c in self.branches[from_branch] if c not in self.branches[self.current_branch]]
        self.branches[self.current_branch].extend(new_commits)
        print(f"🎉 Ветка '{from_branch}' успешно влита в '{self.current_branch}' (+{len(new_commits)} коммитов)")

repo = GitBranchManager()
repo.create_branch("feature/catalog")
repo.switch("feature/catalog")
repo.commit("feat: add products model")
repo.commit("feat: add get products route")

repo.switch("main")
repo.merge("feature/catalog")
print("Итоговые коммиты в main:", repo.branches["main"])`,
      },
      tasks: [
        {
          title: 'Задание 1: удаление ветки после слияния',
          difficulty: 'easy',
          description: 'Добавь в GitBranchManager метод delete_branch(self, name: str), который удаляет ветку из self.branches (но запрещает удалять "main"). Удали "feature/catalog" после слияния.',
          hints: ['if name == "main": raise ValueError("Нельзя удалять main!")\ndel self.branches[name]'],
        },
        {
          title: 'Задание 2: парсер конфликтов слияния',
          difficulty: 'medium',
          description: 'Напиши функцию has_merge_conflict(file_text: str) -> bool: проверяет, содержит ли файл маркеры конфликта ("<<<<<<<" и ">>>>>>>").',
          hints: ['return "<<<<<<<" in file_text and ">>>>>>>" in file_text'],
          solution: `def has_merge_conflict(file_text: str) -> bool:
    return "<<<<<<<" in file_text and ">>>>>>>" in file_text

conflict_code = "<<<<<<< HEAD\\nx = 1\\n=======\\nx = 2\\n>>>>>>> feature"
clean_code = "x = 2"

assert has_merge_conflict(conflict_code) is True
assert has_merge_conflict(clean_code) is False
print("✓ Детектор конфликтов слияния работает безупречно!")`,
        },
        {
          title: 'Задание 3: симулятор Fast-Forward слияния',
          difficulty: 'hard',
          description: 'Объясни в комментарии: что такое Fast-Forward слияние в Git и почему оно возможно только тогда, когда в ветке main не появилось новых коммитов за время работы над веткой feature.',
          hints: ['Fast-forward просто сдвигает указатель ветки main вперёд без создания дополнительного merge-коммита'],
        },
      ],
      mistakes: [
        {
          wrong: 'Забыть переключиться в main перед выполнением git merge feature',
          right: 'git merge ВСЕГДА вливает указанную ветку в ТЕКУЩУЮ активную ветку. Сначала перейди в ту ветку, КУДА вливать (git switch main)',
        },
        {
          wrong: 'Бояться конфликтов слияния и стирать проект заново при их появлении',
          right: 'Конфликт — это штатная ситуация. Открой конфликтный файл в VS Code / редакторе, выбери нужные строки и сделай коммит',
        },
      ],
      checklist: [
        'Понимаю назначение веток для изолированной разработки фич',
        'Знаю команды создания и переключения веток (git switch -c / git checkout -b)',
        'Понимаю процесс слияния веток через git merge',
        'Знаю, как устроен конфликт слияния и как его разрешать',
      ],
    },

    {
      id: 'github-and-portfolio',
      title: 'GitHub, .gitignore и идеальное портфолио',
      summary: 'Как работать с удалённым репозиторием GitHub (push/pull), скрывать секреты через .gitignore и оформлять проекты для тимлидов',
      theory: [
        {
          type: 'p',
          text: 'Git хранит историю локально на твоём компьютере. GITHUB — это крупнейшая в мире облачная платформа для хранения Git-репозиториев и совместной работы. Твой профиль на GitHub — это главное резюме разработчика, на которое в первую очередь смотрят тимлиды на собеседованиях.',
        },
        {
          type: 'steps',
          title: 'Связка локального Git с GitHub',
          items: [
            { code: '1. Создай репозиторий на github.com', note: 'Нажми "New Repository" и укажи имя (например, fastapi-shop-api)' },
            { code: '2. git remote add origin https://github.com/user/repo.git', note: 'Привязываем локальный Git к облачному репозиторию на GitHub' },
            { code: '3. git push -u origin main', note: 'Отправляем ("выталкиваем") локальные коммиты на GitHub' },
            { code: '4. git pull origin main', note: 'Скачиваем ("подтягиваем") свежие коммиты от коллег из облака' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Файл .gitignore — защита от утечки паролей и мусора',
          text: 'Никогда нельзя отправлять на GitHub: виртуальное окружение venv/ (сотни мегабайт сторонних библиотек), файлы кэша __pycache__/, локальные базы SQLite (.db) и самое главное — файлы .env с паролями! Файл .gitignore содержит список путей, которые Git будет игнорировать.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Эталонный файл .gitignore для Python и FastAPI проектов',
          lang: 'bash',
          code: `# Виртуальное окружение (НЕ должно быть в Git!):
venv/
.venv/
env/

# Переменные окружения и секретные ключи:
.env
.env.local
.env.production

# Базы данных и временные файлы:
*.db
*.sqlite3
__pycache__/
*.pyc

# IDE и операционная система:
.vscode/
.idea/
.DS_Store`,
          explanation: 'Файл с именем .gitignore кладётся в корень проекта. Git автоматически перестаёт отслеживать перечисленные файлы.',
        },
        {
          title: 'Пример 2: Парсер файла .gitignore на Python',
          lang: 'python',
          code: `def should_ignore_file(filepath: str, gitignore_patterns: list[str]) -> bool:
    """Проверяет, должен ли файл быть проигнорирован Git"""
    for pattern in gitignore_patterns:
        pattern = pattern.strip()
        if not pattern or pattern.startswith("#"):
            continue
        if pattern.endswith("/") and filepath.startswith(pattern):
            return True
        if pattern.startswith("*") and filepath.endswith(pattern[1:]):
            return True
        if pattern == filepath:
            return True
    return False

rules = ["venv/", ".env", "*.pyc", "*.db"]

print("Игнорировать venv/lib/python.so?", should_ignore_file("venv/lib/python.so", rules))  # True
print("Игнорировать .env?", should_ignore_file(".env", rules))                              # True
print("Игнорировать main.py?", should_ignore_file("main.py", rules))                        # False`,
          explanation: 'Этот алгоритм имитирует логику сопоставления путей в движке Git.',
        },
        {
          title: 'Пример 3: Структура звёздного README.md для проекта в портфолио',
          lang: 'bash',
          code: `# 🚀 Shop API Backend
REST API сервис на FastAPI с PostgreSQL, JWT-аутентификацией и автотестами.

## 🛠 Стек:
- Python 3.12, FastAPI, Pydantic v2
- PostgreSQL 16, SQLAlchemy 2.0, Alembic
- Pytest, TestClient, Docker Compose

## ⚡ Быстрый старт:
\`\`\`bash
git clone https://github.com/alex/shop-api.git
cd shop-api
docker compose up -d --build
\`\`\`
Документация Swagger: http://localhost:8000/docs`,
          explanation: 'Красивый заголовок, бейджи технологий и команда запуска в 1 строку выделяют сильного кандидата.',
        },
      ],
      terminal: {
        title: 'Отправка первого коммита на GitHub (git push)',
        description: 'Попробуй отправить коммиты в удалённый репозиторий:',
        lessonCommands: {
          'git push -u origin main': {
            output: [
              'Enumerating objects: 7, done.',
              'Counting objects: 100% (7/7), done.',
              'Writing objects: 100% (7/7), 1.42 KiB | 1.42 MiB/s, done.',
              'To https://github.com/alex/my-backend-app.git',
              ' * [new branch]      main -> main',
              'Branch \'main\' set up to track remote branch \'main\' from \'origin\'.',
            ],
            type: 'success',
          },
        },
        suggestions: ['git push -u origin main', 'git pull origin main'],
        script: [
          { command: 'git push -u origin main' },
          { command: 'git pull origin main' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор .gitignore проверяет чистоту проекта перед отправкой на GitHub. Запусти код!',
        initialCode: `files_in_project = [
    "main.py",
    "models.py",
    ".env",
    "venv/bin/python",
    "requirements.txt",
    "dev.db",
    "__pycache__/main.cpython-312.pyc",
    "README.md"
]

ignored_extensions = (".db", ".pyc")
ignored_folders = ("venv/", "__pycache__/")
ignored_exact = (".env",)

clean_repo = []
for file in files_in_project:
    is_ignored = (
        file.endswith(ignored_extensions) or
        any(file.startswith(folder) for folder in ignored_folders) or
        file in ignored_exact
    )
    if not is_ignored:
        clean_repo.append(file)
    else:
        print(f"🔒 Скрыто от GitHub: {file}")

print("\\n📦 Файлы, которые безопасно попадут в коммит:")
for f in clean_repo:
    print(" ->", f)

assert ".env" not in clean_repo
assert "main.py" in clean_repo`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь игнорирование .log файлов',
          difficulty: 'easy',
          description: 'Добавь расширение ".log" в список ignored_extensions. Проверь, что файл "server.log" отфильтровывается и не попадает в чистый коммит.',
          hints: ['ignored_extensions = (".db", ".pyc", ".log")'],
        },
        {
          title: 'Задание 2: генерация шаблона .env.example',
          difficulty: 'medium',
          description: 'Поскольку .env скрыт в .gitignore, для других разработчиков создают безопасный файл .env.example. Напиши скрипт, который берёт словарь настроек {"DB_URL": "secret_pass", "SECRET_KEY": "12345"} и возвращает текст с заменой реальных значений на "your_value_here".',
          hints: ['lines = [f"{k}=your_{k.lower()}_here" for k in config]'],
          solution: `def make_env_example(config: dict) -> str:
    lines = [f"{k}=your_{k.lower()}_here" for k in config]
    return "\\n".join(lines)

cfg = {"DATABASE_URL": "postgresql://alex:123@host/db", "SECRET_KEY": "super_secret"}
print("Файл .env.example для GitHub:\\n" + make_env_example(cfg))`,
        },
        {
          title: 'Задание 3: практический чеклист GitHub портфолио',
          difficulty: 'hard',
          description: 'Сформулируй 4 правила оформления репозиториев на GitHub, которые гарантируют высокий балл на техническом скрининге резюме.',
          hints: ['1. Понятный README с бейджами и инструкцией запуска; 2. Чистый .gitignore без venv/.env; 3. Наличие Dockerfile/docker-compose; 4. Наличие автотестов pytest'],
        },
      ],
      mistakes: [
        {
          wrong: 'Случайно закоммитить файл .env с реальным паролем от базы данных на публичный GitHub',
          right: 'Роботы сканируют GitHub 24/7. Если ты случайно запушил пароль — немедленно смени пароль в облаке Neon/Render и добавь .env в .gitignore',
        },
        {
          wrong: 'Закоммитить папку venv/ на 500 МБ',
          right: 'Библиотеки никогда не коммитят в репозиторий. Вместо этого в репозиторий кладут файл requirements.txt со списком названий пакетов',
        },
      ],
      checklist: [
        'Умею подключать удалённый репозиторий GitHub через git remote add',
        'Знаю команды отправки (git push) и получения (git pull) изменений',
        'Умею правильно настраивать файл .gitignore для защиты секретов',
        'Знаю структуру профессионального README.md для портфолио',
      ],
    },
  ],
};
