export const module18 = {
  id: 'pure-python-web',
  order: 18,
  title: 'Веб-приложения на чистом Python — без единой строчки JS',
  icon: '🐍',
  description: 'NiceGUI, Reflex, Streamlit и HTMX + FastAPI: создание интерактивных веб-интерфейсов и анимаций на чистом Python.',
  lessons: [
    {
      id: 'why-pure-python-web',
      title: 'Как Python управляет браузером без JavaScript',
      summary: 'Почему эра раздельного написания JS-кода уходит в прошлое и как устроен Server-Driven UI на чистом Python',
      theory: [
        {
          type: 'p',
          text: 'Многие годы создание веб-сайтов требовало изучения двух абсолютно разных языков: Python для бэкенда и JavaScript/TypeScript для фронтенда. Это приводило к дублированию моделей данных, долгой настройке сборщиков (Webpack/Vite) и постоянным ошибкам согласования API. Но в последние годы в Python произошла революция: появились современные фреймворки, позволяющие писать полноценные интерактивные интерфейсы с анимациями ИСКЛЮЧИТЕЛЬНО на Python!',
        },
        {
          type: 'analogy',
          text: 'Представь кукольный театр. Браузер — это сцена с деревянными марионетками (кнопками, карточками, текстом). В классическом подходе ты нанимаешь отдельного кукловода, говорящего только по-японски (JavaScript), чтобы он стоял на сцене и двигал кукол. В подходе Pure Python Web главный кукловод (твой Python-сервер) находится за кулисами и управляет всеми движениями марионеток по невидимым тонким нитям (быстрый WebSocket-канал). Пользователь кликает по кнопке -> сигнал летит в Python -> Python меняет переменную состояния -> экран в браузере моментально обновляется!',
        },
        {
          type: 'list',
          title: 'Главные современные инструменты экосистемы Python Fullstack',
          items: [
            'NiceGUI — легковесный реактивный веб-фреймворк для быстрого создания панелей управления, ботов и умных устройств на базе FastAPI.',
            'Reflex (ранее Pynecone) — мощный промышленный фреймворк, который компилирует Python-код в настоящий высокопроизводительный React + Tailwind CSS с плавными анимациями.',
            'Streamlit — инструмент №1 в мире Data Science для мгновенного создания интерактивных аналитических дашбордов за 10 строк кода.',
            'HTMX + FastAPI — легковесный тренд: сервер возвращает готовые HTML-кусочки, а библиотека HTMX вставляет их в страницу без единой строчки клиентского JS.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему бэкенд-разработчикам выгодно знать эти фреймворки?',
          text: 'Ты можешь самостоятельно в одиночку создавать полноценные рабочие веб-приложения для стартапов, внутренние админки компаний (Internal Tools) и прототипы для инвесторов в 5 раз быстрее, чем команда из двух человек (фронтендер + бэкендер).',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Как работает реактивное состояние (State) в чистом Python',
          lang: 'python',
          code: `class UIState:
    def __init__(self):
        self.count = 0
        self.is_card_open = False
        self.subscribers = []

    def increment(self):
        self.count += 1
        self.notify_clients()

    def toggle_card(self):
        self.is_card_open = not self.is_card_open
        self.notify_clients()

    def notify_clients(self):
        print(f"[WebSocket -> Браузер] Обновление экрана: count={self.count}, open={self.is_card_open}")

state = UIState()
state.increment()    # Экраны всех пользователей видят число 1
state.toggle_card()  # Карточка на экране плавно раскрывается`,
          explanation: 'Любое изменение переменной в классе состояния Python автоматически транслируется в браузер через WebSocket.',
        },
        {
          title: 'Пример 2: Сравнение архитектур: React SPA vs Pure Python Web',
          lang: 'python',
          code: `# Классический подход (2 отдельных мира):
# 1. FastAPI (Python) -> отдает JSON: {"id": 1, "status": "ok"}
# 2. React (JS/TS) -> парсит JSON, рендерит JSX, слушает onClick...

# Подход Pure Python Web (1 единый мир):
# from nicegui import ui
# ui.label('Привет, мир!')
# ui.button('Нажми меня', on_click=lambda: ui.notify('Клик на чистом Python!'))`,
          explanation: 'В чистом Python отпадает необходимость описывать API-схемы дважды — интерфейс и логика живут в одном месте.',
        },
        {
          title: 'Пример 3: Быстрый прототип счётчика кликов',
          lang: 'python',
          code: `def build_counter_component():
    state = {"value": 0}
    
    def on_button_click():
        state["value"] += 1
        return f"Кликнули {state['value']} раз!"
    
    return on_button_click

click_handler = build_counter_component()
print(click_handler())
print(click_handler())`,
          explanation: 'Простые замыкания и функции Python связываются с кликами в браузере без клиентского JavaScript.',
        },
      ],
      terminal: {
        title: 'Установка современных Python Web библиотек',
        description: 'Команда установки NiceGUI, Reflex и Streamlit:',
        lessonCommands: {
          'pip install nicegui reflex streamlit': {
            output: [
              'Installing collected packages: nicegui, reflex, streamlit',
              'Successfully installed nicegui-2.9.1 reflex-0.6.8 streamlit-1.41.0',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install nicegui reflex streamlit'],
        script: [
          { command: 'pip install nicegui reflex streamlit' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирован движок Server-Driven UI. Запусти код и посмотри, как события изменяют виртуальное DOM-дерево интерфейса!',
        initialCode: `class VirtualUI:
    def __init__(self):
        self.elements = []

    def button(self, text: str, on_click):
        self.elements.append({"type": "button", "text": text, "action": on_click})

    def label(self, text: str):
        self.elements.append({"type": "label", "text": text})

    def render(self):
        return [f"<{e['type']}>{e['text']}</{e['type']}>" for e in self.elements]

app_ui = VirtualUI()
count = 0

def on_click_action():
    global count
    count += 1
    print(f"🎉 Событие клика обработано в Python! Новый счётчик: {count}")

app_ui.label(f"Текущее значение: {count}")
app_ui.button("Увеличить на 1", on_click=on_click_action)

print("Отрендеренный интерфейс:")
for html_elem in app_ui.render():
    print(" ->", html_elem)

# Симулируем клик пользователя:
app_ui.elements[1]["action"]()`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь поле ввода в виртуальный UI',
          difficulty: 'easy',
          description: 'Добавь в класс VirtualUI метод input(self, placeholder: str), который добавляет элемент типа "input". Создай поле ввода "Введите имя..." в интерфейсе.',
          hints: ['self.elements.append({"type": "input", "text": placeholder})'],
        },
        {
          title: 'Задание 2: двустороннее связывание данных (2-way Binding)',
          difficulty: 'medium',
          description: 'Создай класс ReactiveModel с полем username="Гость". Напиши метод set_name(new_name), который при изменении имени печатает: "Привет, [новое_имя]!".',
          hints: ['Используй сеттеры или метод update'],
          solution: `class ReactiveModel:
    def __init__(self, name="Гость"):
        self._name = name

    def set_name(self, new_name):
        self._name = new_name
        print(f"Экран обновился: Привет, {self._name}!")

model = ReactiveModel()
model.set_name("Елена")
assert model._name == "Елена"`,
        },
        {
          title: 'Задание 3: сравнение производительности',
          difficulty: 'hard',
          description: 'Объясни в комментарии: для каких типов задач Pure Python Web (на базе WebSockets) идеален (внутренние CRM, панели, админки), а для каких всё же лучше классический React с клиентским рендерингом (игры с 60 FPS, офлайн-приложения, мобильные клиенты с плохой связью)?',
          hints: ['Приложениям с постоянным офлайном или сложной анимацией на клиенте требуется локальный JS в браузере'],
        },
      ],
      mistakes: [
        {
          wrong: 'Считать, что без JavaScript невозможно сделать красивый современный интерфейс с анимациями',
          right: 'Фреймворки вроде Reflex компилируют Python в чистый React + CSS анимации под капотом, давая идеальную плавность интерфейса',
        },
        {
          wrong: 'Пытаться писать сложный SPA-интерфейс на чистом FastAPI без шаблонов или HTMX',
          right: 'Сам FastAPI возвращает сырой JSON. Для визуального UI используй NiceGUI, Streamlit или связку FastAPI + HTMX',
        },
      ],
      checklist: [
        'Понимаю концепцию Server-Driven UI и управления браузером через Python',
        'Знаю 4 главных инструмента: NiceGUI, Reflex, Streamlit и HTMX',
        'Понимаю колоссальную экономию времени при разработке интерфейсов на Python',
      ],
    },

    {
      id: 'nicegui-interactive-ui',
      title: 'NiceGUI: реактивный интерфейс на чистом Python',
      summary: 'Кнопки, формы, таблицы данных, уведомления и двустороннее связывание данных в реальном времени',
      theory: [
        {
          type: 'p',
          text: 'NiceGUI — один из самых быстрорастущих фреймворков в мире Python. Он построен прямо поверх FastAPI и Vue/Quasar, позволяя создавать полноценные интерактивные веб-страницы всего в несколько строк понятного Python-кода.',
        },
        {
          type: 'steps',
          title: 'Базовые строительные блоки NiceGUI',
          items: [
            { code: 'from nicegui import ui', note: 'Импортируем модуль элементов интерфейса' },
            { code: 'ui.label("Заголовок").classes("text-h4 text-primary")', note: 'Текстовый заголовок со стилизацией классами Tailwind/Quasar' },
            { code: 'name_input = ui.input("Ваше имя")', note: 'Интерактивное поле ввода' },
            { code: 'ui.button("Поздороваться", on_click=lambda: ui.notify(f"Привет, {name_input.value}!"))', note: 'Кнопка с всплывающим уведомлением по клику' },
            { code: 'ui.run(port=8080)', note: 'Запуск веб-сервера' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Магическое свойство .bind_value()',
          text: 'В NiceGUI есть двустороннее связывание данных (2-way data binding): ui.label().bind_text_from(slider, "value"). Когда пользователь двигает слайдер на экране, текст в лейбле меняется мгновенно без написания единой строки логики обработки событий!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Интерактивный калькулятор скидки в реальном времени',
          lang: 'python',
          code: `from nicegui import ui

# Переменные реактивного состояния:
state = {"price": 1000, "discount": 10}

def update_ui():
    final_price = state["price"] * (1 - state["discount"] / 100)
    result_label.set_text(f"Итого к оплате: {final_price:.2f} ₽")

ui.label("🛍️ Калькулятор скидок магазина").classes("text-2xl font-bold")

price_slider = ui.slider(min=100, max=10000, value=1000, step=100).bind_value(state, "price")
ui.label().bind_text_from(price_slider, "value", backward=lambda v: f"Цена: {v} ₽")

discount_slider = ui.slider(min=0, max=50, value=10).bind_value(state, "discount")
ui.label().bind_text_from(discount_slider, "value", backward=lambda v: f"Скидка: {v}%")

result_label = ui.label("Итого к оплате: 900.00 ₽").classes("text-xl font-semibold text-green-600")

# Автоматическое обновление при движении слайдеров:
price_slider.on("update:model-value", update_ui)
discount_slider.on("update:model-value", update_ui)

# ui.run()`,
          explanation: 'Слайдеры и лейбл связаны через bind_value, пересчёт цены происходит прямо в браузере в реальном времени.',
        },
        {
          title: 'Пример 2: Интерактивная таблица пользователей с поиском и фильтрацией',
          lang: 'python',
          code: `from nicegui import ui

users = [
    {"id": 1, "name": "Аня", "role": "Admin", "active": True},
    {"id": 2, "name": "Борис", "role": "User", "active": True},
    {"id": 3, "name": "Виктор", "role": "Moderator", "active": False},
]

columns = [
    {"name": "id", "label": "ID", "field": "id"},
    {"name": "name", "label": "Имя", "field": "name", "sortable": True},
    {"name": "role", "label": "Роль", "field": "role"},
    {"name": "active", "label": "Активен", "field": "active"},
]

ui.label("👥 Панель управления пользователями").classes("text-xl")
search_input = ui.input("Поиск по имени...")
table = ui.table(columns=columns, rows=users, row_key="id").classes("w-full")

# Фильтрация таблицы при вводе в поиск:
def on_search():
    query = search_input.value.lower()
    table.rows = [u for u in users if query in u["name"].lower()]

search_input.on("input", on_search)`,
          explanation: 'Компонент ui.table поддерживает сортировку колонок, выбор строк и пагинацию из коробки.',
        },
        {
          title: 'Пример 3: Всплывающие диалоговые окна (Dialogs) и подтверждения',
          lang: 'python',
          code: `from nicegui import ui

with ui.dialog() as dialog, ui.card():
    ui.label("Вы уверены, что хотите удалить товар?")
    with ui.row():
        ui.button("Да, удалить", color="red", on_click=lambda: (ui.notify("Товар удалён!", color="negative"), dialog.close()))
        ui.button("Отмена", on_click=dialog.close)

ui.button("Удалить элемент", on_click=dialog.open).classes("bg-red-500 text-white")`,
          explanation: 'Модальные диалоги создаются через простой контекстный менеджер with ui.dialog() и легко открываются по dialog.open().',
        },
      ],
      terminal: {
        title: 'Запуск NiceGUI приложения локально',
        description: 'Запуск скрипта NiceGUI открывает окно браузера автоматически:',
        lessonCommands: {
          'python app.py': {
            output: [
              'NiceGUI ready to go on http://localhost:8080',
              'Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)',
            ],
            type: 'success',
          },
        },
        suggestions: ['python app.py'],
        script: [
          { command: 'python app.py' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице работает реактивная модель биндинга NiceGUI. Запусти код!',
        initialCode: `class NiceGUISimulator:
    def __init__(self):
        self.widgets = {}

    def input(self, name: str, default=""):
        self.widgets[name] = {"type": "input", "value": default}
        return self.widgets[name]

    def notify(self, message: str, color="positive"):
        print(f"🔔 [UI NOTIFY - {color.upper()}]: {message}")

gui = NiceGUISimulator()
login_field = gui.input("username", "admin")

# Имитируем нажатие кнопки "Войти":
print("Текущее значение поля ввода:", login_field["value"])
gui.notify(f"Добро пожаловать в систему, {login_field['value']}!")`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь поле ввода пароля',
          difficulty: 'easy',
          description: 'Создай виджет password_field = gui.input("password", "secret123"). Проверь значение поля в словаре виджетов.',
          hints: ['gui.input("password", "secret123")'],
        },
        {
          title: 'Задание 2: валидатор формы регистрации',
          difficulty: 'medium',
          description: 'Напиши функцию validate_and_submit(username, email): если email не содержит "@", вызови gui.notify("Неверный email!", color="negative"), иначе gui.notify("Регистрация успешна!").',
          hints: ['if "@" not in email: gui.notify(..., "negative") else: gui.notify(..., "positive")'],
          solution: `def validate_and_submit(username: str, email: str):
    if "@" not in email:
        gui.notify("Некорректный email адрес!", color="negative")
        return False
    gui.notify(f"Пользователь {username} успешно зарегистрирован!", color="positive")
    return True

validate_and_submit("Иван", "bad-email")
validate_and_submit("Иван", "ivan@mail.com")`,
        },
        {
          title: 'Задание 3: интеграция NiceGUI с существующим FastAPI роутом',
          difficulty: 'hard',
          description: 'NiceGUI можно встроить прямо внутрь существующего FastAPI приложения через ui.run_with(fastapi_app). Объясни, как это позволяет иметь и REST API для мобильных приложений (/api/v1/...), и красивый веб-интерфейс на одном порту.',
          hints: ['FastAPI обслуживает JSON эндпоинты, а NiceGUI рендерит веб-страницы'],
        },
      ],
      mistakes: [
        {
          wrong: 'Блокировать интерфейс вызовом time.sleep() внутри обработчика клика on_click',
          right: 'NiceGUI асинхронен под капотом. Используй async def обработчики и await asyncio.sleep(), чтобы не блокировать интерфейс других пользователей',
        },
        {
          wrong: 'Забыть указать lambda или имя функции в on_click=my_func',
          right: 'Если написать on_click=my_func(), функция вызовется мгновенно при сборке страницы, а не при клике. Передавай ссылку на функцию: on_click=my_func или on_click=lambda: ...',
        },
      ],
      checklist: [
        'Умею создавать кнопки, слайдеры, поля ввода и таблицы в NiceGUI',
        'Понимаю механизм двустороннего связывания bind_value',
        'Знаю, как показывать всплывающие уведомления ui.notify',
        'Понимаю, как NiceGUI работает поверх FastAPI',
      ],
    },

    {
      id: 'reflex-react-compiler',
      title: 'Reflex: компиляция Python в анимированный React',
      summary: 'Создание полноценных веб-приложений с плавными CSS-анимациями, переходами и компонентной архитектурой на чистом Python',
      theory: [
        {
          type: 'p',
          text: 'Если NiceGUI ориентирован на простые панели и админки, то Reflex (ранее Pynecone) — это полноценный фреймворк для создания сложных клиентских приложений. Уникальность Reflex в том, что он КОМПИЛИРУЕТ твой Python-код в оптимизированный React + Next.js + Tailwind CSS на фронтенде и FastAPI на бэкенде. Ты пишешь только на Python, а получаешь производительность и плавные анимации топового React-приложения!',
        },
        {
          type: 'steps',
          title: 'Архитектура приложения на Reflex (State + Components)',
          items: [
            { code: 'import reflex as rx', note: 'Импорт фреймворка' },
            { code: 'class State(rx.State):\n    is_expanded: bool = False', note: '1. Состояние (State): класс с переменными и логикой на чистом Python' },
            { code: 'def index():\n    return rx.box(...)', note: '2. Компоненты (UI): дерево компонентов (кнопки, карточки, анимации)' },
            { code: 'app = rx.App()\napp.add_page(index)', note: '3. Приложение: сборка страниц и компиляция в React' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Плавные CSS-анимации на чистом Python',
          text: 'В Reflex компоненты поддерживают transition, hover-эффекты и ключевые кадры анимаций: rx.box(..., _hover={"scale": "1.05", "shadow": "lg"}, transition="all 0.3s ease"). Элементы плавно увеличиваются и светятся при наведении курсора!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Анимированная интерактивная карточка товара (Expandable Card)',
          lang: 'python',
          code: `import reflex as rx

class CardState(rx.State):
    is_open: bool = False
    likes: int = 0

    def toggle(self):
        self.is_open = not self.is_open

    def add_like(self):
        self.likes += 1

def animated_card() -> rx.Component:
    return rx.vstack(
        # Заголовок карточки:
        rx.heading("Кроссовки CyberRunner 2026", size="md"),
        
        # Кнопка раскрытия подробностей с плавной анимацией:
        rx.button(
            rx.cond(CardState.is_open, "Скрыть описание ↑", "Показать подробности ↓"),
            on_click=CardState.toggle,
            color_scheme="blue",
            variant="outline"
        ),
        
        # Раскрывающийся блок с анимацией:
        rx.cond(
            CardState.is_open,
            rx.box(
                rx.text("Ультралегкая подошва с амортизацией и светодиодной подсветкой."),
                padding="1em",
                background="gray.100",
                border_radius="8px",
                transition="opacity 0.4s ease-in-out"
            )
        ),
        
        # Счётчик лайков с кнопкой:
        rx.hstack(
            rx.button("❤️ Лайк", on_click=CardState.add_like, color_scheme="red"),
            rx.badge(CardState.likes, color_scheme="red", variant="solid")
        ),
        padding="2em",
        border="1px solid #e2e8f0",
        border_radius="12px",
        box_shadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        _hover={"box_shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.2)", "transform": "translateY(-2px)"},
        transition="all 0.2s ease"
    )`,
          explanation: 'Карточка имеет hover-эффект парения (translateY) и плавное раскрытие описания через rx.cond.',
        },
        {
          title: 'Пример 2: Переключатель тёмной и светлой темы в Reflex',
          lang: 'python',
          code: `import reflex as rx

def theme_switcher() -> rx.Component:
    return rx.hstack(
        rx.text("Тема оформления:"),
        rx.color_mode.button(),  # готовая анимированная кнопка ☀️ / 🌙 из коробки!
        spacing="3"
    )`,
          explanation: 'Reflex содержит встроенные компоненты управления цветовой схемой с плавной сменяемостью стилей.',
        },
        {
          title: 'Пример 3: Живой поиск с фильтрацией на лету',
          lang: 'python',
          code: `import reflex as rx

class SearchState(rx.State):
    query: str = ""
    items: list[str] = ["FastAPI", "PostgreSQL", "Docker", "Reflex", "Python", "Redis"]

    @rx.var
    def filtered_items(self) -> list[str]:
        if not self.query:
            return self.items
        return [i for i in self.items if self.query.lower() in i.lower()]

def search_page() -> rx.Component:
    return rx.vstack(
        rx.input(placeholder="Поиск по стеку...", on_change=SearchState.set_query),
        rx.foreach(SearchState.filtered_items, lambda item: rx.badge(item, color_scheme="green")),
        spacing="4"
    )`,
          explanation: '@rx.var объявляет вычисляемое свойство (computed var), которое пересчитывается автоматически при вводе в инпут.',
        },
      ],
      terminal: {
        title: 'Инициализация и запуск проекта Reflex',
        description: 'Команды создания и запуска проекта Reflex:',
        lessonCommands: {
          'reflex run': {
            output: [
              '────────────────────────────────── Starting Reflex App ──────────────────────────────────',
              'App running at: http://localhost:3000',
              'Backend running at: http://localhost:8000',
              'Compiled successfully in 1.4s! 🎉',
            ],
            type: 'success',
          },
        },
        suggestions: ['reflex init', 'reflex run'],
        script: [
          { command: 'reflex run' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице смоделирован реактивный стейт Reflex с вычисляемыми свойствами (Computed Vars). Запусти код!',
        initialCode: `class ReflexStateSimulator:
    def __init__(self):
        self.search_query = ""
        self.all_courses = ["Основы Python", "FastAPI с нуля", "PostgreSQL Базы", "Docker Деплой", "Reflex Веб"]

    def set_query(self, query: str):
        self.search_query = query
        print(f"[State Event] Запрос поиска изменился на: '{query}'")

    @property
    def filtered_courses(self) -> list[str]:
        if not self.search_query:
            return self.all_courses
        return [c for c in self.all_courses if self.search_query.lower() in c.lower()]

state = ReflexStateSimulator()

print("1. Все курсы изначально:", state.filtered_courses)

# Пользователь вводит "Fast" в поле поиска:
state.set_query("Fast")
print("2. Результаты фильтрации на лету:", state.filtered_courses)

# Пользователь стирает и вводит "Деплой":
state.set_query("Деплой")
print("3. Новые результаты:", state.filtered_courses)`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь счётчик элементов в стейт',
          difficulty: 'easy',
          description: 'Добавь в ReflexStateSimulator вычисляемое свойство count, возвращающее len(self.filtered_courses). Проверь его значение при разных поисковых запросах.',
          hints: ['@property\ndef count(self): return len(self.filtered_courses)'],
        },
        {
          title: 'Задание 2: состояние корзины покупок (CartState)',
          difficulty: 'medium',
          description: 'Напиши класс CartState: список cart = [], метод add_item(title, price), метод remove_item(index) и вычисляемое свойство total_price (сумма всех товаров).',
          hints: ['sum(item["price"] for item in self.cart)'],
          solution: `class CartState:
    def __init__(self):
        self.cart = []

    def add_item(self, title: str, price: float):
        self.cart.append({"title": title, "price": price})

    def remove_item(self, idx: int):
        if 0 <= idx < len(self.cart):
            self.cart.pop(idx)

    @property
    def total_price(self) -> float:
        return sum(item["price"] for item in self.cart)

cart = CartState()
cart.add_item("Книга", 1200)
cart.add_item("Курс", 5000)
assert cart.total_price == 6200
print("✓ CartState корректно рассчитывает сумму:", cart.total_price)`,
        },
        {
          title: 'Задание 3: как Reflex компилирует код',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему архитектура Reflex (компиляция Python в React + FastAPI) даёт лучшую отзывчивость интерфейса при медленном интернете, чем постоянная отправка каждого движения мыши по сети?',
          hints: ['Статический макет и анимации выполняются на клиенте через скомпилированный React/CSS, а по сети передаются только сами данные состояния'],
        },
      ],
      mistakes: [
        {
          wrong: 'Изменять обычные переменные внутри функций интерфейса index() вместо использования rx.State',
          right: 'Интерфейс в Reflex реактивен только тогда, когда данные хранятся внутри класса rx.State. Обычные локальные переменные Python не вызывают перерисовку экрана',
        },
        {
          wrong: 'Использовать стандартный if вместо rx.cond() при описании структуры интерфейса',
          right: 'Для условной отрисовки элементов интерфейса в Reflex используется rx.cond(условие, компонент_если_True, компонент_если_False)',
        },
      ],
      checklist: [
        'Понимаю, как Reflex компилирует Python в React и Tailwind CSS',
        'Умею создавать классы состояния rx.State и обработчики событий',
        'Знаю, как применять CSS-анимации и hover-эффекты к компонентам',
        'Умею строить условную отрисовку через rx.cond и списки через rx.foreach',
      ],
    },

    {
      id: 'streamlit-and-htmx',
      title: 'Streamlit для дашбордов и FastAPI + HTMX',
      summary: 'Мгновенные дашборды с графиками на Streamlit и современный паттерн серверного рендеринга HTMX',
      theory: [
        {
          type: 'p',
          text: 'Завершают нашу панораму Pure Python Web два невероятно популярных инструмента: STREAMLIT (король интерактивных дашбордов для аналитики и ML) и связка FASTAPI + HTMX (современный хит веб-разработки, возвращающий простоту классического веба без тяжести SPA).',
        },
        {
          type: 'steps',
          title: '1. Streamlit: веб-дашборд за 5 строк',
          items: [
            { code: 'import streamlit as st', note: 'Каждая строка кода буквально сразу рисует элемент на экране' },
            { code: 'st.title("Аналитика продаж")', note: 'Выводит красивый заголовок' },
            { code: 'days = st.slider("Период (дней)", 1, 30, 7)', note: 'Создаёт слайдер, возвращающий выбранное число' },
            { code: 'st.line_chart(data)', note: 'Строит интерактивный зумируемый график' },
          ],
        },
        {
          type: 'steps',
          title: '2. FastAPI + HTMX: магия атрибутов HTML',
          items: [
            { code: 'hx-get="/api/items"', note: 'Кнопка сама делает AJAX GET-запрос к FastAPI без написания JS-кода' },
            { code: 'hx-target="#results-box"', note: 'Указывает, в какой именно div на странице нужно вставить ответ' },
            { code: 'hx-swap="innerHTML"', note: 'Плавно заменяет содержимое контейнера новым HTML-фрагментом от сервера' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'В чём прелесть связки FastAPI + HTMX?',
          text: 'FastAPI отдаёт не JSON, а кусочек готового HTML (например, Jinja2 template или HTML строку). Браузер мгновенно вставляет его на страницу без полной перезагрузки страницы. Получается плавность Single Page Application с простотой обычного Python-кода!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полноценный аналитический дашборд на Streamlit',
          lang: 'python',
          code: `import streamlit as st
import random

st.set_page_config(page_title="Дашборд магазина", layout="wide")

st.title("📊 Панель мониторинга заказов")

# Боковая панель с фильтрами:
with st.sidebar:
    st.header("Настройки фильтра")
    selected_category = st.selectbox("Категория товара", ["Все", "Электроника", "Одежда", "Книги"])
    show_raw_data = st.checkbox("Показать сырые данные таблицы", value=False)

# Интерактивные карточки метрик:
col1, col2, col3 = st.columns(3)
col1.metric("Выручка за сегодня", "148 500 ₽", "+12%")
col2.metric("Количество заказов", "342", "+5%")
col3.metric("Средний чек", "434 ₽", "-2%")

# Интерактивный график:
chart_data = [random.randint(50, 200) for _ in range(14)]
st.line_chart(chart_data)

if show_raw_data:
    st.write("Сырые данные заказов:", chart_data)`,
          explanation: 'Весь этот интерактивный интерфейс с графиками, фильтрами и колонками создаётся на чистом Python без HTML/CSS.',
        },
        {
          title: 'Пример 2: Серверный эндпоинт FastAPI для работы с HTMX',
          lang: 'python',
          code: `from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

# Базовая страница:
@app.get("/", response_class=HTMLResponse)
def index_page():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        <style>
            .card { padding: 15px; border: 1px solid #ddd; margin-top: 10px; transition: all 0.3s; }
        </style>
    </head>
    <body style="font-family: sans-serif; padding: 30px;">
        <h2>Список товаров (FastAPI + HTMX)</h2>
        <!-- Кнопка делает запрос и обновляет блок #catalog-box без перезагрузки: -->
        <button hx-get="/clicked-catalog" hx-target="#catalog-box" hx-swap="innerHTML" style="padding: 10px 20px; cursor: pointer;">
            Загрузить свежий каталог товаров 🔄
        </button>
        <div id="catalog-box">
            <p>Нажмите кнопку для загрузки данных...</p>
        </div>
    </body>
    </html>
    """

# Эндпоинт, возвращающий готовый HTML фрагмент для HTMX:
@app.get("/clicked-catalog", response_class=HTMLResponse)
def get_catalog_fragment():
    items = ["Ноутбук Pro - 90 000 ₽", "Мышка Wireless - 1 500 ₽", "Монитор 4K - 35 000 ₽"]
    html_items = "".join([f"<div class='card'>📦 {item}</div>" for item in items])
    return f"<div>{html_items}<p style='color: green;'>✓ Каталог успешно обновлен!</p></div>"`,
          explanation: 'FastAPI возвращает HTML-фрагмент, а библиотека HTMX на лету вставляет его в div#catalog-box без перезагрузки вкладки.',
        },
        {
          title: 'Пример 3: Поиск с живой подгрузкой результатов через HTMX (Active Search)',
          lang: 'bash',
          code: `<!-- Живой поиск: запрос отправляется через 300мс после окончания ввода (keyup delay:300ms) -->
<input type="text" 
       name="search" 
       placeholder="Начните вводить название..." 
       hx-get="/api/search-users" 
       hx-trigger="keyup changed delay:300ms" 
       hx-target="#search-results">

<div id="search-results">
    <!-- Сюда сервер FastAPI подставит отфильтрованный список -->
</div>`,
          explanation: 'Атрибут hx-trigger="keyup changed delay:300ms" реализует встроенный дебаунс (debounce) для живого поиска без единой строчки JS.',
        },
      ],
      terminal: {
        title: 'Запуск Streamlit дашборда',
        description: 'Запуск приложения Streamlit командой в консоли:',
        lessonCommands: {
          'streamlit run app.py': {
            output: [
              '  You can now view your Streamlit app in your browser.',
              '  Local URL: http://localhost:8501',
              '  Network URL: http://192.168.1.50:8501',
            ],
            type: 'success',
          },
        },
        suggestions: ['streamlit run app.py'],
        script: [
          { command: 'streamlit run app.py' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'В песочнице FastAPI возвращает HTMLResponse фрагменты для HTMX. Запусти код и проверь ответы!',
        initialCode: `from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.testclient import TestClient

app = FastAPI()

database = ["Заметка 1: Выучить FastAPI", "Заметка 2: Освоить HTMX", "Заметка 3: Собрать портфолио"]

@app.get("/htmx/notes", response_class=HTMLResponse)
def get_notes_html():
    html_rows = "".join([f"<li class='note-item'>{n}</li>" for n in database])
    return f"<ul id='notes-list'>{html_rows}</ul>"

@app.post("/htmx/notes", response_class=HTMLResponse)
def add_note_html(text: str):
    database.append(text)
    return f"<li class='note-item' style='color: green;'>✓ {text}</li>"

client = TestClient(app)

res1 = client.get("/htmx/notes")
print("1. HTML фрагмент списка заметок:")
print(res1.text)

res2 = client.post("/htmx/notes?text=Заметка 4: Найти работу")
print("\\n2. HTML фрагмент добавленной заметки:")
print(res2.text)`,
      },
      tasks: [
        {
          title: 'Задание 1: удаление элемента через HTMX DELETE',
          difficulty: 'easy',
          description: 'Добавь эндпоинт @app.delete("/htmx/notes/{index}", response_class=HTMLResponse), который удаляет заметку по индексу и возвращает пустую строку "" (HTMX удалит элемент из DOM-дерева).',
          hints: ['del database[index]\nreturn ""'],
        },
        {
          title: 'Задание 2: пагинация списка через HTMX hx-swap="beforeend"',
          difficulty: 'medium',
          description: 'Напиши эндпоинт @app.get("/htmx/more-items"), возвращающий 2 новых элемента и кнопку "Загрузить ещё" с инкрементом номера страницы.',
          hints: ['Возвращай <div class="item">...</div><button hx-get="/htmx/more-items?page=2"...>'],
          solution: `@app.get("/htmx/more-items", response_class=HTMLResponse)
def more_items(page: int = 1):
    return f"<div class='item'>Элемент страницы {page}</div><button hx-get='/htmx/more-items?page={page+1}'>Еще</button>"

print(client.get("/htmx/more-items?page=2").text)`,
        },
        {
          title: 'Задание 3: сравнение HTMX и React SPA',
          difficulty: 'hard',
          description: 'Объясни в комментарии: почему для приложений, ориентированных на контент и админки (CRUD), связка FastAPI + HTMX часто выигрывает у React по скорости разработки и простоте поддержки?',
          hints: ['Нет необходимости в JSON-сериализации, стейт-менеджерах Redux/Zustand, роутерах на клиенте и двойных моделях данных'],
        },
      ],
      mistakes: [
        {
          wrong: 'Возвращать JSON в эндпоинтах, предназначенных для HTMX',
          right: 'HTMX ожидает готовые куски HTML разметки (HTMLResponse), а не JSON словари',
        },
        {
          wrong: 'Использовать Streamlit для высоконагруженных публичных B2C сайтов с миллионами пользователей',
          right: 'Streamlit перезапускает весь скрипт сверху вниз при каждом взаимодействии. Он идеален для внутренних дашбордов и Data Science, но для публичных B2C сервисов лучше выбрать Reflex или HTMX + FastAPI',
        },
      ],
      checklist: [
        'Умею создавать интерактивные дашборды и графики на Streamlit',
        'Понимаю архитектуру и атрибуты HTMX (hx-get, hx-target, hx-swap)',
        'Знаю, как отдавать готовые HTMLResponse фрагменты из FastAPI',
        'Понимаю преимущества подхода HTML-over-the-wire',
      ],
    },

    {
      id: 'choosing-python-ui-stack',
      title: 'Сравнение стеков и создание анимированного виджета',
      summary: 'Итоговое руководство по выбору стека и создание интерактивного виджета на чистом Python',
      theory: [
        {
          type: 'p',
          text: 'Мы изучили 4 мощных инструмента: NiceGUI, Reflex, Streamlit и HTMX. Давай сведем их в единую матрицу принятия решений, чтобы ты всегда безошибочно выбирал идеальный инструмент под любую задачу.',
        },
        {
          type: 'list',
          title: 'Матрица выбора инструмента под задачу',
          items: [
            '📊 Streamlit — идеален для: аналитических дашбордов, Data Science, демонстрации моделей машинного обучения (ML) и быстрых внутренних прототипов за 1 вечер.',
            '⚡ NiceGUI — идеален для: управления роботами и умным домом (IoT), локальных утилит, небольших админок и систем автоматизации, работающих в одной локальной сети.',
            '✨ Reflex — идеален для: полноценных стартапов, SaaS-сервисов, сложных веб-приложений с кастомным дизайном, мобильной адаптацией и плавными анимациями.',
            '🚀 FastAPI + HTMX — идеален для: классических CRUD-сервисов, сайтов с высокой нагрузкой и команд бэкендеров, которые хотят интерактивность без усложнения стека JavaScript-фреймворками.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Финальная практическая задача',
          text: 'В этом уроке мы спроектируем полноценный интерактивный анимированный виджет (интерактивную карточку со счётчиком и плавной сменой состояний) на чистом Python!',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Интерактивный виджет "Умный переключатель с анимацией"',
          lang: 'python',
          code: `class AnimatedToggleWidget:
    def __init__(self, title: str):
        self.title = title
        self.is_active = False
        self.power_level = 50
        self.history = []

    def toggle(self):
        self.is_active = not self.is_active
        status = "ВКЛ" if self.is_active else "ВЫКЛ"
        self.history.append(f"Переключатель переведён в {status}")
        return self.render()

    def set_power(self, value: int):
        self.power_level = max(0, min(100, value))
        self.history.append(f"Мощность установлена на {self.power_level}%")
        return self.render()

    def render(self) -> dict:
        color = "#22c55e" if self.is_active else "#ef4444"
        return {
            "title": self.title,
            "active": self.is_active,
            "power": self.power_level,
            "badge_color": color,
            "css_animation": "pulse 1.5s infinite" if self.is_active else "none",
            "last_event": self.history[-1] if self.history else "Инициализация"
        }

widget = AnimatedToggleWidget("Умная лампа")
print("Изначальное состояние:", widget.render())
print("После включения:", widget.toggle())
print("После изменения мощности:", widget.set_power(85))`,
          explanation: 'Логика виджета инкапсулирована в чистом Python классе и готова к привязке к любому Python-UI фреймворку.',
        },
        {
          title: 'Пример 2: Сравнительная таблица скорости отклика и сложности',
          lang: 'bash',
          code: `# Фреймворк    | Порог входа | Производительность | Анимации / CSS
# Streamlit     | ⭐ (10 мин)  | Средняя            | Базовые
# NiceGUI       | ⭐⭐ (1 час)  | Высокая (FastAPI)  | Tailwind + Quasar
# Reflex        | ⭐⭐⭐ (3 часа)| Максимальная(React)| Полный CSS / Framer
# FastAPI+HTMX  | ⭐⭐ (1 час)  | Максимальная (C)   | Любой HTML / CSS`,
          explanation: 'Выбирай инструмент исходя из требуемой кастомизации дизайна и времени на реализацию задачи.',
        },
        {
          title: 'Пример 3: Полный конвейер событий виджета',
          lang: 'python',
          code: `def event_pipeline(event_type: str, payload: dict, widget_state: dict):
    if event_type == "CLICK_TOGGLE":
        widget_state["enabled"] = not widget_state.get("enabled", False)
    elif event_type == "SLIDER_CHANGE":
        widget_state["value"] = payload.get("val", 0)
    return widget_state

state = {"enabled": False, "value": 10}
state = event_pipeline("CLICK_TOGGLE", {}, state)
state = event_pipeline("SLIDER_CHANGE", {"val": 99}, state)
print("Результат пайплайна событий:", state)`,
          explanation: 'Паттерн Redux-подобного обработчика событий на чистом Python.',
        },
      ],
      terminal: {
        title: 'Финальный обзор экосистемы Python',
        description: 'Проверка установленных пакетов в виртуальном окружении:',
        lessonCommands: {
          'pip list': {
            output: [
              'Package         Version',
              '--------------- -------',
              'fastapi         0.115.6',
              'nicegui         2.9.1',
              'pydantic        2.10.4',
              'reflex          0.6.8',
              'sqlalchemy      2.0.36',
              'streamlit       1.41.0',
              'uvicorn         0.34.0',
            ],
            type: 'default',
          },
        },
        suggestions: ['pip list'],
        script: [
          { command: 'pip list' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице интерактивный виджет обрабатывает клики и вычисляет CSS-классы анимации. Запусти код!',
        initialCode: `class AnimatedCardWidget:
    def __init__(self, title: str):
        self.title = title
        self.expanded = False
        self.count = 0

    def click_expand(self):
        self.expanded = not self.expanded
        return self.get_view()

    def click_increment(self):
        self.count += 1
        return self.get_view()

    def get_view(self):
        return {
            "title": self.title,
            "expanded": self.expanded,
            "counter": self.count,
            "animation_style": "transform: scale(1.05); transition: all 0.3s ease;" if self.expanded else "transform: scale(1.0);"
        }

widget = AnimatedCardWidget("Карточка курса")
print("1. Закрыта:", widget.get_view())
print("2. Раскрыта с анимацией:", widget.click_expand())
print("3. Счётчик увеличен:", widget.click_increment())`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь сброс состояния виджета',
          difficulty: 'easy',
          description: 'Добавь метод reset(self), который сбрасывает expanded в False, а count в 0. Проверь результат.',
          hints: ['self.expanded = False\nself.count = 0'],
        },
        {
          title: 'Задание 2: генерация динамических CSS классов Tailwind',
          difficulty: 'medium',
          description: 'Напиши метод get_tailwind_classes(self) -> str: если expanded==True — возвращает "p-6 bg-blue-500 text-white rounded-xl shadow-lg transition-all duration-300", иначе "p-4 bg-gray-100 text-gray-800 rounded-lg".',
          hints: ['return "p-6 bg-blue-500..." if self.expanded else "p-4 bg-gray-100..."'],
          solution: `def get_tailwind_classes(self):
    if self.expanded:
        return "p-6 bg-blue-500 text-white rounded-xl shadow-lg transition-all duration-300"
    return "p-4 bg-gray-100 text-gray-800 rounded-lg"

AnimatedCardWidget.get_tailwind_classes = get_tailwind_classes
w = AnimatedCardWidget("Тест")
assert "bg-gray-100" in w.get_tailwind_classes()
w.click_expand()
assert "bg-blue-500" in w.get_tailwind_classes()
print("✓ Динамические CSS классы генерируются корректно!")`,
        },
        {
          title: 'Задание 3: итоговое практическое задание курса',
          difficulty: 'hard',
          description: 'Поздравляем! Ты освоил 18 модулей от абсолютного нуля до продвинутой бэкенд и фуллстек Python разработки. Выбери один из инструментов (NiceGUI, Reflex или HTMX) и реализуй интерактивный веб-интерфейс для своего Todo API из проекта 1!',
          hints: ['Используй все знания курса: чистый код, автотесты, безопасные переменные окружения и деплой в облако!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Выбирать сложный React/Reflex там, где нужен простой 5-строчный дашборд (Streamlit)',
          right: 'Всегда подбирай инструмент под реальную задачу: для быстрого анализа данных бери Streamlit, для полноценного сайта с анимациями — Reflex, для админок — NiceGUI или HTMX',
        },
        {
          wrong: 'Считать, что настоящий backend-разработчик не должен уметь делать интерфейсы',
          right: 'Умение быстро собрать работающий интерфейс на Python делает тебя универсальным Fullstack разработчиком (T-shaped engineer) и многократно повышает ценность на рынке труда',
        },
      ],
      checklist: [
        'Уверенно ориентируюсь в матрице выбора Python Web стеков (Streamlit vs Reflex vs NiceGUI vs HTMX)',
        'Понимаю принципы анимаций и переходов в Server-Driven UI',
        'Умею проектировать интерактивные компоненты и виджеты на чистом Python',
        'Полностью готов к созданию любых веб-приложений и коммерческой разработке!',
      ],
    },
  ],
};
