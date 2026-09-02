export const module30 = {
  id: 'ci-cd-github-actions',
  order: 30,
  title: 'CI/CD: автотесты и деплой с GitHub Actions',
  icon: '🔄',
  description: 'Автоматизация разработки: пайплайны GitHub Actions, автозапуск pytest и линтеров, сборка Docker и автоматический деплой.',
  lessons: [
    {
      id: 'what-is-ci-cd',
      title: 'Что такое CI/CD: робот-контролёр качества',
      summary: 'Почему ручной деплой с компьютера разработчика опасен и как роботы автоматизируют тестирование и выкатку кода 24/7',
      theory: [
        {
          type: 'p',
          text: 'В командах без автоматизации процесс выпуска обновлений выглядит пугающе: программист ночью вручную подключается по SSH к серверу, скачивает файлы, руками перезапускает процессы... Стоит забыть запустить тесты или опечататься в одной строчке — и весь продакшен падает, а клиенты не могут сделать заказ. Чтобы исключить человеческий фактор, используется CI/CD.',
        },
        {
          type: 'analogy',
          text: 'CI/CD — это АВТОМАТИЧЕСКИЙ КОНВЕЙЕР завода Tesla. Когда рабочий (программист) кладёт новую деталь (коммит с кодом), роботы конвейера мгновенно: 1) Проверяют деталь лазером на трещины (Линтер и автотесты pytest — CI, Continuous Integration); 2) Если всё идеально — робот сам устанавливает деталь на автомобиль и выпускает его на дорогу (Автоматический деплой — CD, Continuous Deployment). Если хотя бы 1 тест упал — конвейер останавливается и не пускает бракованный код к пользователям!',
        },
        {
          type: 'list',
          title: 'Две составляющие CI/CD',
          items: [
            '1. CI (Continuous Integration / Непрерывная интеграция): автоматический запуск тестов, проверка типов (mypy) и стиля кода (linter) при каждом git push или Pull Request.',
            '2. CD (Continuous Delivery / Deployment / Непрерывная доставка): автоматическая сборка Docker-образа и обновление сервера на продакшене без участия человека.',
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Структура каталога для GitHub Actions в проекте',
          lang: 'bash',
          code: `# GitHub автоматически видит пайплайны в скрытой папке .github/workflows/:
my-project/
├── .github/
│   └── workflows/
│       └── ci.yml        # Конфигурация конвейера CI/CD
├── src/
│   └── main.py
├── tests/
│   └── test_main.py
└── requirements.txt`,
          explanation: 'Любой .yml файл в папке .github/workflows автоматически становится активным роботом-пайплайном в репозитории на GitHub.',
        },
        {
          title: 'Пример 2: Парсер статуса выполнения пайплайна (CI Status Check)',
          lang: 'python',
          code: `def can_merge_pull_request(test_status: str, lint_status: str) -> bool:
    """GitHub блокирует зелёную кнопку 'Merge', если тесты не прошли"""
    is_safe = (test_status == "SUCCESS") and (lint_status == "SUCCESS")
    return is_safe

print("Можно вливать код в main?", can_merge_pull_request("SUCCESS", "SUCCESS")) # True
print("Можно вливать сломанный код?", can_merge_pull_request("FAILED", "SUCCESS"))  # False`,
          explanation: 'В настройках репозитория включают защиту веток (Branch Protection Rules), запрещая слияние при упавших тестах.',
        },
        {
          title: 'Пример 3: Логирование шагов конвейера в консоли',
          lang: 'bash',
          code: `# Вывод консоли в интерфейсе GitHub Actions:
# [Step 1] Set up Python 3.12 ................... [OK 1.2s]
# [Step 2] Install dependencies ................. [OK 4.5s]
# [Step 3] Run pytest tests/ .................... [OK 0.8s]
# Result: All 45 tests passed! Pipeline GREEN.`,
          explanation: 'Зелёный бейдж (Passing) подтверждает высокое качество кодовой базы.',
        },
      ],
      terminal: {
        title: 'Локальная проверка перед отправкой в CI (Pre-commit check)',
        description: 'Прогон линтера и тестов локально:',
        lessonCommands: {
          'pytest tests/': {
            output: [
              '============================= test session starts ==============================',
              'collected 6 items',
              'tests/test_api.py ......                                                [100%]',
              '============================== 6 passed in 0.08s ===============================',
            ],
            type: 'success',
          },
        },
        suggestions: ['pytest tests/'],
        script: [
          { command: 'pytest tests/' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор CI/CD конвейера выполняет шаги валидации. Запусти код!',
        initialCode: `class CIPipelineRunner:
    def __init__(self):
        self.steps = []
        self.all_passed = True

    def run_step(self, name: str, is_successful: bool, duration_sec: float):
        status = "PASSED" if is_successful else "FAILED"
        if not is_successful: self.all_passed = False
        self.steps.append({"step": name, "status": status, "duration": duration_sec})
        icon = "✔" if is_successful else "✖"
        print(f"[{icon}] Шаг '{name}': {status} ({duration_sec}с)")

pipeline = CIPipelineRunner()
print("--- [CI Pipeline]: Запуск автоматических проверок на GitHub ---")

pipeline.run_step("1. Настройка Python 3.12", is_successful=True, duration_sec=1.1)
pipeline.run_step("2. Установка requirements.txt", is_successful=True, duration_sec=3.4)
pipeline.run_step("3. Проверка линтером (Ruff / Oxlint)", is_successful=True, duration_sec=0.2)
pipeline.run_step("4. Запуск автотестов pytest", is_successful=True, duration_sec=0.6)

if pipeline.all_passed:
    print("\\n🎉 ВСЕ ТЕСТЫ ЗЕЛЁНЫЕ! Пуллреквест разрешён к слиянию.")
else:
    print("\\n❌ СБОЙ В CI! Слияние заблокировано до исправления ошибок.")

assert pipeline.all_passed is True`,
      },
      tasks: [
        {
          title: 'Задание 1: симуляция падения теста в CI',
          difficulty: 'easy',
          description: 'Добавь шаг pipeline.run_step("5. Проверка покрытия кода coverage", is_successful=False, duration_sec=0.4). Убедись, что итоговый статус пайплайна становится красным.',
          hints: ['pipeline.run_step("5. Coverage", is_successful=False, duration_sec=0.4)'],
        },
        {
          title: 'Задание 2: расчёт суммарного времени пайплайна',
          difficulty: 'medium',
          description: 'Напиши функцию get_total_pipeline_time(steps: list[dict]) -> float: суммирует duration всех шагов с округлением до 2 знаков.',
          hints: ['return round(sum(s["duration"] for s in steps), 2)'],
          solution: `def get_total_pipeline_time(steps: list[dict]) -> float:
    return round(sum(s["duration"] for s in steps), 2)

total_t = get_total_pipeline_time(pipeline.steps)
print("Суммарное время работы CI:", total_t, "с")
assert total_t > 0`,
        },
        {
          title: 'Задание 3: правила защиты веток (Branch Protection)',
          difficulty: 'hard',
          description: 'Объясни, почему в профессиональных командах запрещают прямой `git push origin main` и заставляют разработчиков делать ветки `feature/...` и Pull Requests с обязательным прохождением CI тестов.',
          hints: ['Прямой пуш в main может сломать продакшен для всех клиентов; PR гарантирует ревью кода и проверку тестами'],
        },
      ],
      mistakes: [
        {
          wrong: 'Деплоить проект на сервер вручную через копирование файлов по FTP/SSH',
          right: 'Ручной деплой неизбежно приведёт к ошибкам. Настрой CI/CD через GitHub Actions один раз, и роботы будут безопасно деплоить проект годами',
        },
        {
          wrong: 'Игнорировать падение тестов в CI и всё равно выкатывать код на прод',
          right: 'Если CI упал — в коде есть критический баг. Сначала исправь ошибку, добейся зелёного статуса и только потом деплой',
        },
      ],
      checklist: [
        'Понимаю назначение Continuous Integration и Continuous Deployment',
        'Знаю структуру каталога .github/workflows/',
        'Понимаю, как CI защищает главную ветку от поломок',
        'Знаю преимущества автоматического конвейера проверок',
      ],
    },

    {
      id: 'github-actions-workflow',
      title: 'Пишем .github/workflows/ci.yml',
      summary: 'Построчный анатомический разбор YAML-файла: триггеры on, виртуальные машины ubuntu-latest, шаги actions/checkout, setup-python и запуск pytest',
      theory: [
        {
          type: 'p',
          text: 'Конфигурация GitHub Actions описывается на человекочитаемом языке разметки YAML. Давай разберём каждую строчку реального файла `.github/workflows/ci.yml`, который используют в ведущих IT-компаниях.',
        },
        {
          type: 'steps',
          title: 'Построчный разбор файла ci.yml',
          items: [
            { code: 'name: Backend CI Pipeline', note: '1. Название пайплайна (отображается в интерфейсе GitHub)' },
            { code: 'on: [push, pull_request]', note: '2. Триггеры: запускать робота при каждом пуше и при создании PR' },
            { code: 'runs-on: ubuntu-latest', note: '3. Окружение: GitHub бесплатно выделяет свежую виртуальную машину Linux Ubuntu' },
            { code: 'uses: actions/checkout@v4', note: '4. Скачиваем исходный код проекта на виртуальную машину' },
            { code: 'uses: actions/setup-python@v5\n  with: { python-version: "3.12" }', note: '5. Устанавливаем точную версию Python' },
            { code: 'run: pip install -r requirements.txt', note: '6. Устанавливаем библиотеки' },
            { code: 'run: pytest tests/ -v', note: '7. Запускаем тесты' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полный боевой файл .github/workflows/ci.yml для FastAPI',
          lang: 'bash',
          code: `name: Tests and Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Клонируем репозиторий
        uses: actions/checkout@v4

      - name: 🐍 Настраиваем Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip' # кэширует библиотеки для ускорения повторных запусков!

      - name: 📦 Устанавливаем зависимости
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest httpx

      - name: 🧪 Запускаем автотесты pytest
        run: |
          pytest tests/ -v`,
          explanation: 'Параметр cache: "pip" ускоряет установку библиотек в 5 раз при повторных коммитах.',
        },
        {
          title: 'Пример 2: Добавление проверки матрицей версий (Python 3.11 + 3.12)',
          lang: 'bash',
          code: `# strategy:
#   matrix:
#     python-version: ["3.11", "3.12"]
# Тесты запустятся ПАРАЛЛЕЛЬНО на обеих версиях Python!`,
          explanation: 'Матричная сборка гарантирует совместимость библиотеки с разными версиями языка.',
        },
        {
          title: 'Пример 3: Валидатор синтаксиса YAML на Python',
          lang: 'python',
          code: `def validate_ci_yaml_structure(config: dict) -> list[str]:
    errors = []
    if "name" not in config: errors.append("Отсутствует поле 'name'")
    if "on" not in config: errors.append("Отсутствует триггер 'on'")
    if "jobs" not in config: errors.append("Отсутствует блок 'jobs'")
    return errors`,
          explanation: 'Валидатор проверяет обязательные корневые секции файла конфигурации.',
        },
      ],
      terminal: {
        title: 'Просмотр логов запуска GitHub Actions через CLI (gh cli)',
        description: 'Утилита GitHub CLI позволяет следить за пайплайнами из терминала:',
        lessonCommands: {
          'gh run list --limit 1': {
            output: [
              'STATUS  TITLE               WORKFLOW  BRANCH  EVENT  ID',
              '✓       feat: add cart api  Tests     main    push   1029384756',
            ],
            type: 'success',
          },
        },
        suggestions: ['gh run list --limit 1'],
        script: [
          { command: 'gh run list --limit 1' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор парсит шаги workflow файла. Запусти код!',
        initialCode: `fake_yaml_workflow = {
    "name": "Backend CI",
    "on": ["push", "pull_request"],
    "jobs": {
        "test": {
            "runs-on": "ubuntu-latest",
            "steps": [
                {"name": "Checkout code", "uses": "actions/checkout@v4"},
                {"name": "Setup Python", "uses": "actions/setup-python@v5", "version": "3.12"},
                {"name": "Install deps", "run": "pip install -r requirements.txt"},
                {"name": "Run tests", "run": "pytest"}
            ]
        }
    }
}

print("Workflow:", fake_yaml_workflow["name"])
print("Триггеры:", fake_yaml_workflow["on"])
print("Окружение:", fake_yaml_workflow["jobs"]["test"]["runs-on"])
print("\\nШаги выполнения:")
for s in fake_yaml_workflow["jobs"]["test"]["steps"]:
    action = s.get("uses") or s.get("run")
    print(f" -> {s['name']} [{action}]")

assert len(fake_yaml_workflow["jobs"]["test"]["steps"]) == 4`,
      },
      tasks: [
        {
          title: 'Задание 1: добавление шага линтинга',
          difficulty: 'easy',
          description: 'Добавь пятый шаг {"name": "Lint with Ruff", "run": "ruff check ."} в список steps. Распечатай обновленный список шагов.',
          hints: ['fake_yaml_workflow["jobs"]["test"]["steps"].append({"name": "Lint", "run": "ruff check ."})'],
        },
        {
          title: 'Задание 2: проверка наличия шага тестирования',
          difficulty: 'medium',
          description: 'Напиши функцию has_test_step(steps: list[dict]) -> bool: проверяет, содержит ли хотя бы один шаг команду "pytest" в поле "run".',
          hints: ['return any("pytest" in s.get("run", "") for s in steps)'],
          solution: `def has_test_step(steps: list[dict]) -> bool:
    return any("pytest" in s.get("run", "") for s in steps)

steps_list = fake_yaml_workflow["jobs"]["test"]["steps"]
assert has_test_step(steps_list) is True
print("✓ Проверка наличия шага pytest пройдена успешно!")`,
        },
        {
          title: 'Задание 3: переменные окружения и секреты в GitHub Actions',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему секретные пароли от базы данных и API-ключи передают в шаги через `secrets.DATABASE_URL` (Settings -> Secrets and variables -> Actions), а не прописывают открытым текстом в ci.yml.',
          hints: ['Файл ci.yml публично виден всем в репозитории, а GitHub Secrets шифруются и скрываются маской *** в логах'],
        },
      ],
      mistakes: [
        {
          wrong: 'Делать синтаксические ошибки в отступах YAML (смешивать табы и пробелы)',
          right: 'YAML строго чувствителен к отступам: используй ровно 2 пробела для каждого уровня вложенности',
        },
        {
          wrong: 'Забыть указать actions/checkout первым шагом в списке steps',
          right: 'Без actions/checkout виртуальная машина Ubuntu будет пустой, и команда pytest выдаст ошибку "файлы тестов не найдены"',
        },
      ],
      checklist: [
        'Понимаю синтаксис и структуру файла .github/workflows/ci.yml',
        'Знаю назначение actions/checkout и actions/setup-python',
        'Умею настраивать кэширование pip-зависимостей',
        'Понимаю, как хранить секреты в GitHub Secrets',
      ],
    },

    {
      id: 'automated-deployment',
      title: 'Автоматический деплой на Render/Railway после успешных тестов',
      summary: 'Связываем CI и CD: как настроить автоматический деплой по вебхуку только при условии 100% зелёных тестов',
      theory: [
        {
          type: 'p',
          text: 'Финальный этап современного DevOps пайплайна — автоматическая выкатка (Continuous Deployment). Как только ты делаешь `git push origin main`, GitHub Actions запускает тесты. Если ВСЕ тесты прошли успешно — GitHub сам отправляет защищенный вебхук в облако Render или Railway: "Собрать свежую версию и задеплоить!". Твой сайт обновляется в интернете через 1 минуту без единого клика мыши!',
        },
        {
          type: 'steps',
          title: '3 шага настройки автодеплоя',
          items: [
            { code: '1. Скопируй Deploy Hook URL в Render/Railway', note: 'В панели настроек сервиса нажми "Create Deploy Hook"' },
            { code: '2. Сохрани в GitHub Secrets:', note: 'В репозитории добавь секрет RENDER_DEPLOY_HOOK = https://api.render.com/deploy/...' },
            { code: '3. Добавь шаг деплоя в конец workflow:', note: 'curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Шаг автодеплоя в ci.yml (только для ветки main)',
          lang: 'bash',
          code: `      # Этот шаг выполнится ТОЛЬКО если все предыдущие тесты завершились успехом:
      - name: 🚀 Автоматический деплой на Render
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          echo "Тесты прошли успешно! Отправляем сигнал на деплой..."
          curl -f -X POST "\${{ secrets.RENDER_DEPLOY_HOOK }}"
          echo "Деплой успешно инициирован!"`,
          explanation: 'Флаг curl -f выбрасывает ошибку, если облачный сервис вернул статус сбоя.',
        },
        {
          title: 'Пример 2: Сборка и отправка Docker-образа в Docker Hub / GitHub Packages (GHCR)',
          lang: 'bash',
          code: `# - name: 🐳 Сборка и пуш Docker-образа
#   uses: docker/build-push-action@v5
#   with:
#     push: true
#     tags: ghcr.io/username/shop-api:latest`,
          explanation: 'Сборка контейнера в CI гарантирует готовность продакшен-образа для серверов.',
        },
        {
          title: 'Пример 3: Уведомление в Telegram о статусе релиза',
          lang: 'bash',
          code: `# - name: 📢 Отправка отчёта в Telegram
#   if: always() # выполняется и при успехе, и при падении
#   run: |
#     curl -s -X POST "https://api.telegram.org/bot\${{ secrets.TG_BOT }}/sendMessage" \\
#       -d chat_id="\${{ secrets.TG_CHAT }}" \\
#       -d text="Релиз: \${{ job.status == 'success' && '✅ УСПЕШНО' || '❌ СБОЙ' }}"`,
          explanation: 'Команда моментально узнаёт в чате Telegram о результатах каждого деплоя.',
        },
      ],
      terminal: {
        title: 'Тестирование Deploy Hook через curl',
        description: 'Отправка триггера деплоя на облачный сервер:',
        lessonCommands: {
          'curl -X POST https://api.render.com/deploy/srv-mock123?key=secret': {
            output: [
              '{"deploy":{"id":"dep-mock456","status":"created"}}',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl -X POST https://api.render.com/deploy/srv-mock123?key=secret'],
        script: [
          { command: 'curl -X POST https://api.render.com/deploy/srv-mock123?key=secret' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор CD триггера проверяет ветку и результаты тестов перед деплоем. Запусти код!',
        initialCode: `def should_deploy(branch: str, tests_passed: bool) -> tuple[bool, str]:
    if not tests_passed:
        return False, "❌ Деплой отклонён: тесты не прошли!"
    if branch != "main":
        return False, f"⚠️ Деплой отклонён: ветка '{branch}' не является продакшен-веткой 'main'."
    return True, "🚀 ДЕПЛОЙ ОДОБРЕН! Отправляем Deploy Hook в облако."

# 1. Попытка деплоя из ветки фичи:
print("1. Ветка feature/auth:", should_deploy("feature/auth", tests_passed=True)[1])

# 2. Попытка деплоя с упавшими тестами:
print("2. Ветка main (тесты упали):", should_deploy("main", tests_passed=False)[1])

# 3. Успешный коммит в main со всеми тестами:
ok, msg = should_deploy("main", tests_passed=True)
print("3. Ветка main (тесты зеленые):", msg)
assert ok is True`,
      },
      tasks: [
        {
          title: 'Задание 1: проверка деплоя для тегов релизов (v1.0.0)',
          difficulty: 'easy',
          description: 'Модифицируй функцию should_deploy: разрешай деплой, если ветка равна "main" ИЛИ начинается с префикса "v" (например, "v1.2.0").',
          hints: ['if branch == "main" or branch.startswith("v"): ...'],
        },
        {
          title: 'Задание 2: симулятор отправки алерта в Telegram при сбое деплоя',
          difficulty: 'medium',
          description: 'Напиши функцию make_tg_alert(repo_name: str, commit_msg: str, status: str) -> str: возвращает красивый текст для Telegram бота: `f"[{status}] Репозиторий {repo_name}: {commit_msg}"`.',
          hints: ['return f"[{status}] Репозиторий {repo_name}: {commit_msg}"'],
          solution: `def make_tg_alert(repo: str, msg: str, status: str) -> str:
    return f"[{status}] Репозиторий {repo}: {msg}"

alert = make_tg_alert("shop-api", "feat: payment intent", "SUCCESS")
assert alert == "[SUCCESS] Репозиторий shop-api: feat: payment intent"
print("✓ Текст алерта сформирован:", alert)`,
        },
        {
          title: 'Задание 3: практическая настройка CI/CD для своего GitHub портфолио',
          difficulty: 'hard',
          description: 'Создай в своём GitHub репозитории файл .github/workflows/ci.yml: настрой автозапуск pytest и подключи бесплатный Deploy Hook на Render. Теперь при каждом git push твой сайт обновляется сам!',
          hints: ['Поздравляем! Ты построил полноценный профессиональный DevOps конвейер!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Деплоить из веток разработки feature/ или dev прямо на боевой продакшен',
          right: 'Автоматический деплой на продакшен настраивается СТРОГО для ветки main после успешного прохождения всех тестов',
        },
        {
          wrong: 'Вставлять секретный URL деплой-хука прямо в текст файла ci.yml',
          right: 'URL хука содержит секретный ключ. Всегда сохраняй его в GitHub Secrets (secrets.RENDER_DEPLOY_HOOK)',
        },
      ],
      checklist: [
        'Понимаю архитектуру автоматического деплоя (Continuous Deployment)',
        'Знаю, как работают Deploy Hooks в Render и Railway',
        'Умею ставить условие if: github.ref == \'refs/heads/main\' в шагах workflow',
        'Знаю, как связать прохождение тестов с триггером выкатки релиза',
      ],
    },
  ],
};
