export const module17 = {
  id: 'python-pro-tricks',
  order: 17,
  title: 'Крутые фишки Python, которые впечатляют на собеседовании',
  icon: '✨',
  description: 'Comprehensions, Walrus (:=), генераторы yield, itertools, декораторы, context managers, dataclasses и match/case.',
  lessons: [
    {
      id: 'comprehensions-and-walrus',
      title: 'Comprehensions и моржовый оператор (:=)',
      summary: 'Как превратить громоздкие циклы for в элегантный однострочник и вычислять значения прямо в условии if',
      theory: [
        {
          type: 'p',
          text: 'В Python есть уникальные синтаксические конструкции, которые отличают новичка от уверенного разработчика (Pythonista). Первые из них — это генераторы списков/словарей (Comprehensions) и "моржовый оператор" (Walrus Operator :=), появившийся в Python 3.8.',
        },
        {
          type: 'analogy',
          text: 'Обычный цикл for для создания списка — это как ручная сборка заказа: взял пустую коробку (result = []), пошёл на склад, взял первый предмет, проверил его качество (if), положил в коробку (.append()), пошёл за следующим... List Comprehension — это автоматический конвейер с лазерной сортировкой: ты в одну строку задаёшь формулу, и готовая коробка появляется мгновенно, без ручного append!',
        },
        {
          type: 'steps',
          title: 'Сравнение: Было (старый цикл) vs Стало (Comprehension)',
          items: [
            { code: 'squares = [x**2 for x in range(10) if x % 2 == 0]', note: 'List comprehension: [выражение for элемент in коллекция if условие]' },
            { code: 'user_map = {u["id"]: u["name"] for u in users}', note: 'Dict comprehension: мгновенное превращение списка словарей в быстрый индекс по ID' },
            { code: 'unique_tags = {tag.lower() for post in posts for tag in post.tags}', note: 'Set comprehension: сбор уникальных значений во множество с автоматическим удалением дублей' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Моржовый оператор (Walrus operator :=) — почему он так называется?',
          text: 'Символ := похож на мордочку моржа с круглыми глазами : и бивнями =. Он позволяет ПРИСВОИТЬ значение переменной прямо внутри выражения (например, внутри условия if или while) и тут же использовать его, не вычисляя функцию дважды.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Было vs Стало с List и Dict Comprehension',
          lang: 'python',
          code: `# ❌ БЫЛО (по-новичковски, 7 строк кода):
users_db = [{"id": 1, "name": "алексей", "active": True}, {"id": 2, "name": "борис", "active": False}]

active_usernames = []
for user in users_db:
    if user["active"]:
        active_usernames.append(user["name"].capitalize())

# ✅ СТАЛО (по-профессиональному, 1 чистая строка):
active_usernames_pro = [u["name"].capitalize() for u in users_db if u["active"]]

# Мгновенный словарь ID -> Имя:
user_by_id = {u["id"]: u["name"] for u in users_db}

print("Активные:", active_usernames_pro)  # -> ['Алексей']
print("Словарь:", user_by_id)             # -> {1: 'алексей', 2: 'борис'}`,
          explanation: 'Код стал короче, читаемее и работает быстрее за счёт внутренней C-оптимизации Python.',
        },
        {
          title: 'Пример 2: Было vs Стало с Моржовым оператором (:=)',
          lang: 'python',
          code: `def get_user_from_cache(user_id: int):
    # Имитация поиска в кэше (возвращает данные или None)
    return {"id": user_id, "name": "Аня"} if user_id == 42 else None

# ❌ БЫЛО:
user = get_user_from_cache(42)
if user is not None:
    print(f"Пользователь найден: {user['name']}")

# ✅ СТАЛО (с моржовым оператором :=):
if (user := get_user_from_cache(42)) is not None:
    print(f"Пользователь найден одной строкой: {user['name']}")`,
          explanation: 'Переменная user объявляется и проверяется прямо в условии if, избавляя от лишней строки перед ветвлением.',
        },
        {
          title: 'Пример 3: Фильтрация тяжёлых вычислений с Walrus-оператором',
          lang: 'python',
          code: `def complex_score(item: int) -> int:
    return (item * 3) + 7  # имитация формулы

numbers = [1, 2, 3, 4, 5]

# ❌ БЫЛО (функция complex_score вызывается ДВАЖДЫ для каждого элемента!):
# result = [complex_score(x) for x in numbers if complex_score(x) > 15]

# ✅ СТАЛО (функция вызывается 1 раз, результат сохраняется в score):
result = [score for x in numbers if (score := complex_score(x)) > 15]
print("Отфильтрованные результаты:", result)  # -> [16, 19, 22]`,
          explanation: 'Моржовый оператор внутри comprehension предотвращает повторное вычисление тяжёлой функции.',
        },
      ],
      terminal: {
        title: 'Запуск Python в интерактивном режиме с проверкой comprehension',
        description: 'Проверь работу comprehension в интерактивной консоли:',
        lessonCommands: {
          'python -c "print([x**2 for x in range(5)])"': {
            output: ['[0, 1, 4, 9, 16]'],
            type: 'success',
          },
        },
        suggestions: ['python -c "print([x**2 for x in range(5)])"'],
        script: [
          { command: 'python -c "print([x**2 for x in range(5)])"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице работают все виды Comprehensions и Walrus-оператор. Запусти код!',
        initialCode: `raw_emails = ["  Alex@Mail.RU  ", "boris@gmail.com", "  invalid_email", "admin@company.COM "]

# Очищаем email-адреса, фильтруем невалидные и приводим к нижнему регистру:
clean_emails = [
    email for raw in raw_emails 
    if "@" in (email := raw.strip().lower())
]

print("Очищенные email:", clean_emails)

# Создаём словарь {домен: список пользователей}
domain_stats = {e.split("@")[1]: e.split("@")[0] for e in clean_emails}
print("Словарь доменов:", domain_stats)

assert len(clean_emails) == 3
print("\\n✓ Код на comprehension и := успешно выполнен!")`,
      },
      tasks: [
        {
          title: 'Задание 1: фильтрация каталога товаров',
          difficulty: 'easy',
          description: 'Дан список товаров: products = [{"title": "Книга", "price": 500}, {"title": "Чехол", "price": 200}, {"title": "Ноутбук", "price": 60000}]. Напиши list comprehension, который вернёт список названий товаров с ценой больше 1000.',
          hints: ['[p["title"] for p in products if p["price"] > 1000]'],
        },
        {
          title: 'Задание 2: моржовый оператор в цикле while',
          difficulty: 'medium',
          description: 'Напиши генератор чисел gen = iter([10, 20, 30, None, 40]). Используй цикл while (val := next(gen, None)) is not None: для сбора чисел в список до первого None.',
          hints: ['val := next(gen, None) присваивает и проверяет в одну строчку'],
          solution: `gen = iter([10, 20, 30, None, 40])
collected = []
while (val := next(gen, None)) is not None:
    collected.append(val)

print("Собрано до None:", collected)
assert collected == [10, 20, 30]`,
        },
        {
          title: 'Задание 3: транспонирование матрицы в 1 строку',
          difficulty: 'hard',
          description: 'Дана матрица matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]. Напиши вложенный comprehension [[row[i] for row in matrix] for i in range(3)] для транспонирования (превращения строк в столбцы).',
          hints: ['Вложенный comprehension создаёт список списков'],
        },
      ],
      mistakes: [
        {
          wrong: 'Писать гигантские comprehensions на 5 вложенных условий и 4 цикла',
          right: 'Если comprehension не умещается в 1-2 понятные строки и тяжело читается — лучше написать обычный цикл for. Читаемость кода всегда на первом месте',
        },
        {
          wrong: 'Использовать list comprehension ради сайд-эффекта: [print(x) for x in list]',
          right: 'Comprehension предназначен для СОЗДАНИЯ новой коллекции. Для простых действий без возврата значения используй обычный цикл for x in list: print(x)',
        },
      ],
      checklist: [
        'Умею уверенно писать List, Dict и Set comprehensions',
        'Знаю синтаксис моржового оператора := и зачем он нужен',
        'Понимаю выигрыш в скорости и читаемости кода',
      ],
    },

    {
      id: 'generators-and-itertools',
      title: 'Генераторы (yield) и магия itertools',
      summary: 'Как обрабатывать гигабайты данных без переполнения памяти и использовать скрытую мощь модуля itertools',
      theory: [
        {
          type: 'p',
          text: 'Представь, что тебе нужно прочитать лог-файл размером 50 Гигабайт и найти строки с ошибками. Если сделать lines = file.readlines(), Python попытается загрузить все 50 ГБ в оперативную память твоего сервера. Сервер моментально упадёт с ошибкой Out Of Memory (OOM Killer). Как обработать файл любого размера, потратив всего 5 Мегабайт памяти? Ответ — ГЕНЕРАТОРЫ и ключевое слово yield.',
        },
        {
          type: 'analogy',
          text: 'Обычный список — это как набрать полную ванну воды перед тем, как выпить один стакан. Генератор (yield) — это кухонный кран: вода (элемент данных) льётся ровно тогда, когда ты открываешь кран (вызываешь next()), и ровно в том количестве, которое тебе нужно прямо сейчас. Кран не хранит в себе 1000 литров воды — он выдаёт её потоком по запросу.',
        },
        {
          type: 'steps',
          title: 'Как работает yield',
          items: [
            { code: 'def count_up():', note: 'Обычная функция возвращает результат через return и полностью завершается' },
            { code: '    yield 1\n    yield 2', note: 'Функция с yield возвращает значение и ЗАМОРАЖИВАЕТ своё состояние на этой строке' },
            { code: 'num = next(generator)', note: 'При следующем вызове функция "просыпается" и продолжает выполнение ровно с места заморозки' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Модуль itertools — швейцарский нож стандартной библиотеки Python',
          text: 'Модуль itertools встроен в Python и содержит супер-быстрые функции для работы с последовательностями: itertools.islice (срез генератора без загрузки в память), itertools.chain (склейка нескольких списков без копирования), itertools.groupby (группировка).',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Было (жрёт гигабайты) vs Стало (потоковый генератор)',
          lang: 'python',
          code: `# ❌ БЫЛО (создаёт список из 1 000 000 элементов в RAM ~80 МБ):
def get_numbers_list(n):
    result = []
    for i in range(n):
        result.append(i * 2)
    return result

# ✅ СТАЛО (расходует ~100 байт памяти независимо от размера n!):
def get_numbers_generator(n):
    for i in range(n):
        yield i * 2

# Использование генератора:
gen = get_numbers_generator(1000000)
print("Первое число:", next(gen))  # -> 0
print("Второе число:", next(gen))  # -> 2
print("Третье число:", next(gen))  # -> 4`,
          explanation: 'Генератор вычисляет каждое следующее число на лету по мере обращения, не выделяя массив в памяти.',
        },
        {
          title: 'Пример 2: Было vs Стало со склейкой списков через itertools.chain',
          lang: 'python',
          code: `import itertools

list1 = ["товар_1", "товар_2"]
list2 = ["товар_3", "товар_4"]
list3 = ["товар_5"]

# ❌ БЫЛО (создаёт новый третий список в памяти, копируя элементы):
# combined = list1 + list2 + list3

# ✅ СТАЛО (итератор без выделения новой памяти):
combined_iter = itertools.chain(list1, list2, list3)

for item in combined_iter:
    print("Элемент каталога:", item)`,
          explanation: 'itertools.chain последовательно проходит по нескольким коллекциям как по единому списку без затрат на копирование памяти.',
        },
        {
          title: 'Пример 3: Пагинация больших генераторов через itertools.islice',
          lang: 'python',
          code: `import itertools

def infinite_id_stream():
    """Бесконечный генератор ID записей"""
    current_id = 1
    while True:
        yield f"USER_ID_{current_id}"
        current_id += 1

# Берём только первые 3 элемента из бесконечного потока через islice:
first_page = list(itertools.islice(infinite_id_stream(), 0, 3))
print("Первые 3 ID:", first_page)  # -> ['USER_ID_1', 'USER_ID_2', 'USER_ID_3']`,
          explanation: 'itertools.islice умеет делать срезы [start:stop] даже по бесконечным потокам генераторов.',
        },
      ],
      terminal: {
        title: 'Проверка размера объекта в памяти через sys.getsizeof',
        description: 'Посмотри на колоссальную разницу в размере списка и генератора в байтах:',
        lessonCommands: {
          'python -c "import sys; print(\'Список:\', sys.getsizeof([x for x in range(100000)]), \'байт | Генератор:\', sys.getsizeof((x for x in range(100000))), \'байт\')"': {
            output: ['Список: 800984 байт | Генератор: 200 байт'],
            type: 'success',
          },
        },
        suggestions: ['python -c "import sys; print(\'Список:\', sys.getsizeof([x for x in range(100000)]), \'байт | Генератор:\', sys.getsizeof((x for x in range(100000))), \'байт\')"'],
        script: [
          { command: 'python -c "import sys; print(\'Список:\', sys.getsizeof([x for x in range(100000)]), \'байт | Генератор:\', sys.getsizeof((x for x in range(100000))), \'байт\')"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице генератор читает поток логов и фильтрует критические ошибки без нагрузки на память. Запусти код!',
        initialCode: `def log_stream_generator():
    logs = [
        "2026-09-02 12:00:01 INFO Server start",
        "2026-09-02 12:00:02 ERROR Database connection failed",
        "2026-09-02 12:00:03 INFO Retry connection",
        "2026-09-02 12:00:04 ERROR Out of memory exception",
        "2026-09-02 12:00:05 INFO User logged in"
    ]
    for entry in logs:
        yield entry

def filter_errors(stream):
    for line in stream:
        if "ERROR" in line:
            yield f"🚨 НАЙДЕНА ОШИБКА: {line}"

# Соединяем два генератора в потоковый конвейер (Pipeline):
pipeline = filter_errors(log_stream_generator())

print("Результаты работы генераторного пайплайна:")
for error_event in pipeline:
    print(error_event)`,
      },
      tasks: [
        {
          title: 'Задание 1: бесконечный счётчик чётных чисел',
          difficulty: 'easy',
          description: 'Напиши функцию-генератор even_numbers_gen(): в бесконечном цикле while True возвращает через yield чётные числа: 0, 2, 4, 6... Получи первые 4 числа через вызовы next().',
          hints: ['num = 0\nwhile True:\n    yield num\n    num += 2'],
        },
        {
          title: 'Задание 2: группировка логов по уровню важности через groupby',
          difficulty: 'medium',
          description: 'Используй itertools.groupby для группировки отсортированного списка записей events = [("INFO", "start"), ("INFO", "ready"), ("WARN", "disk slow")]. Выведи ключ и количество записей в группе.',
          hints: ['for key, group in itertools.groupby(events, key=lambda x: x[0]): print(key, len(list(group)))'],
          solution: `import itertools

events = [("INFO", "start"), ("INFO", "ready"), ("WARN", "disk slow")]
for level, group in itertools.groupby(events, key=lambda x: x[0]):
    items = list(group)
    print(f"Уровень {level}: {len(items)} событий")`,
        },
        {
          title: 'Задание 3: генератор батчей (пакетов данных)',
          difficulty: 'hard',
          description: 'Напиши генератор batch_generator(data, batch_size): разбивает большой список на порции указанного размера (например, по 100 элементов) для порционной вставки в БД через SQLAlchemy. Примени yield для каждой порции.',
          hints: ['for i in range(0, len(data), batch_size): yield data[i:i + batch_size]'],
        },
      ],
      mistakes: [
        {
          wrong: 'Обернуть генератор в list(gen) при обработке файла на 50 ГБ: list(read_huge_file())',
          right: 'Оборачивание в list() заставляет Python мгновенно загрузить ВСЕ элементы генератора в память, полностью уничтожая смысл экономии RAM. Итерируйся по генератору циклом for line in gen',
        },
        {
          wrong: 'Пытаться повторно прочитать уже исчерпанный генератор циклом for',
          right: 'Генератор одноразовый. Как только он дошёл до конца (StopIteration), его нельзя прочитать второй раз — нужно создать новый экземпляр генератора',
        },
      ],
      checklist: [
        'Понимаю, как ключевое слово yield приостанавливает выполнение функции',
        'Знаю, почему генераторы потребляют константный минимум памяти',
        'Умею строить потоковые пайплайны обработки данных',
        'Знаю полезные функции itertools.chain и islice',
      ],
    },

    {
      id: 'decorators-and-context-managers',
      title: 'Декораторы и свои Context Managers (with)',
      summary: 'Как расширять поведение функций без изменения их кода и писать собственные контекстные менеджеры',
      theory: [
        {
          type: 'p',
          text: 'В модулях FastAPI мы постоянно встречали значок "собачки" @app.get("/") или @pytest.fixture. Это ДЕКОРАТОРЫ — одна из самых мощных возможностей Python. А конструкция with open(...) — это КОНТЕКСТНЫЙ МЕНЕДЖЕР. Давай научимся писать их своими руками!',
        },
        {
          type: 'analogy',
          text: 'ДЕКОРАТОР — это как подарочная упаковочная бумага с бантом вокруг подарка (исходной функции). Сам подарок внутри остаётся нетронутым, но снаружи добавляется красивая обёртка, которая может сделать что-то ДО распаковки (замерить время старта, проверить авторизацию) и ПОСЛЕ (залогировать результат или перехватить ошибку). КОНТЕКСТНЫЙ МЕНЕДЖЕР (with) — это как автоматический шлюз: когда ты заходишь внутрь (__enter__) — включается свет, когда выходишь (__exit__) — свет ГАРАНТИРОВАННО выключается, даже если внутри здания произошёл пожар (ошибка).',
        },
        {
          type: 'steps',
          title: 'Анатомия универсального декоратора',
          items: [
            { code: 'import functools', note: 'Обязательный модуль для сохранения имени и документации исходной функции' },
            { code: 'def my_decorator(func):', note: 'Принимает исходную функцию как аргумент' },
            { code: '    @functools.wraps(func)\n    def wrapper(*args, **kwargs):', note: 'Внутренняя функция-обёртка, принимающая любые аргументы (*args, **kwargs)' },
            { code: '        # Код ДО вызова\n        result = func(*args, **kwargs)\n        # Код ПОСЛЕ вызова\n        return result', note: 'Вызывает оригинальную функцию и возвращает её результат' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Декоратор замера времени выполнения функции (@timer)',
          lang: 'python',
          code: `import time
import functools

def timer_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration_ms = (time.time() - start_time) * 1000
        print(f"⏱ Функция {func.__name__} выполнилась за {duration_ms:.2f} мс")
        return result
    return wrapper

@timer_decorator
def calculate_sum(n: int) -> int:
    return sum(range(n))

print("Результат:", calculate_sum(100000))`,
          explanation: 'Декоратор timer_decorator можно повесить на любую функцию, не меняя ни единой строчки её внутренней логики.',
        },
        {
          title: 'Пример 2: Декоратор повтора при сбоях (@retry)',
          lang: 'python',
          code: `import functools

def retry_on_failure(max_attempts=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as exc:
                    attempts += 1
                    print(f"⚠️ Попытка {attempts} упала с ошибкой: {exc}. Пробуем снова...")
                    if attempts >= max_attempts:
                        raise exc
        return wrapper
    return decorator`,
          explanation: 'Декоратор с параметрами (max_attempts=3) автоматически повторяет вызов при сетевых сбоях.',
        },
        {
          title: 'Пример 3: Свой Context Manager через @contextmanager',
          lang: 'python',
          code: `from contextlib import contextmanager
import time

@contextmanager
def execution_block(label: str):
    print(f"--- [START] {label} ---")
    start = time.time()
    try:
        yield  # Здесь выполняется код внутри блока with!
    finally:
        # Этот блок выполнится ВСЕГДА, даже при ошибке!
        print(f"--- [FINISH] {label} (заняло {time.time()-start:.4f}с) ---")

with execution_block("Обработка заказа пользователя"):
    time.sleep(0.05)
    print("Выполняем бизнес-логику...")`,
          explanation: 'Декоратор @contextmanager превращает простую функцию с yield в полноценный контекстный менеджер with.',
        },
      ],
      terminal: {
        title: 'Проверка сохранения метаданных функции через @functools.wraps',
        description: 'Убедись, что __name__ и __doc__ функции не стираются декоратором:',
        lessonCommands: {
          'python -c "import functools; def d(f): \n @functools.wraps(f)\n def w(): return f()\n return w\n@d\ndef my_func(): \n \'\'\'Тест\'\'\'\n pass\nprint(my_func.__name__, my_func.__doc__)"': {
            output: ['my_func Тест'],
            type: 'success',
          },
        },
        suggestions: ['python -c "import functools; def d(f): \n @functools.wraps(f)\n def w(): return f()\n return w\n@d\ndef my_func(): \n \'\'\'Тест\'\'\'\n pass\nprint(my_func.__name__, my_func.__doc__)"'],
        script: [
          { command: 'python -c "import functools; def d(f): \n @functools.wraps(f)\n def w(): return f()\n return w\n@d\ndef my_func(): \n \'\'\'Тест\'\'\'\n pass\nprint(my_func.__name__, my_func.__doc__)"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице работает декоратор аудита безопасности и контекстный менеджер транзакций. Запусти код!',
        initialCode: `from contextlib import contextmanager
import functools

# 1. Декоратор логирования вызова:
def audit_log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[AUDIT] Вызвана функция {func.__name__} с аргументами args={args}, kwargs={kwargs}")
        res = func(*args, **kwargs)
        print(f"[AUDIT] Функция {func.__name__} вернула: {res}")
        return res
    return wrapper

# 2. Контекстный менеджер транзакции:
@contextmanager
def fake_db_transaction():
    print("[DB] Начата транзакция: BEGIN")
    try:
        yield
        print("[DB] Транзакция успешно зафиксирована: COMMIT")
    except Exception as exc:
        print(f"[DB] Произошла ошибка ({exc}): откат ROLLBACK")
        raise exc

@audit_log
def transfer_money(from_user: str, to_user: str, amount: int):
    with fake_db_transaction():
        print(f"Переводим {amount} руб от {from_user} к {to_user}")
        return True

transfer_money("Аня", "Борис", 1500)`,
      },
      tasks: [
        {
          title: 'Задание 1: декоратор проверки прав доступа (role-check)',
          difficulty: 'easy',
          description: 'Напиши декоратор admin_only(func): проверяет, что первый аргумент user_role == "admin". Если нет — поднимает PermissionError("Доступ запрещён!"), если да — выполняет функцию.',
          hints: ['def admin_only(func):\n    def wrapper(user_role, *args, **kwargs):\n        if user_role != "admin": raise PermissionError\n        return func(user_role, *args, **kwargs)'],
        },
        {
          title: 'Задание 2: контекстный менеджер временного изменения переменной окружения',
          difficulty: 'medium',
          description: 'Напиши @contextmanager def temp_env(key, value): сохраняет старое значение os.environ.get(key), устанавливает новое os.environ[key] = value, передаёт управление через yield, а в блоке finally возвращает старое значение на место.',
          hints: ['old = os.environ.get(key)\ntry: os.environ[key]=value; yield\nfinally: восстанавливаем old'],
          solution: `import os
from contextlib import contextmanager

@contextmanager
def temp_env(key: str, value: str):
    old_val = os.environ.get(key)
    os.environ[key] = value
    try:
        yield
    finally:
        if old_val is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = old_val

with temp_env("TEST_MODE", "TRUE"):
    assert os.environ.get("TEST_MODE") == "TRUE"
assert "TEST_MODE" not in os.environ
print("✓ Контекстный менеджер temp_env работает безупречно!")`,
        },
        {
          title: 'Задание 3: класс контекстного менеджера (__enter__ и __exit__)',
          difficulty: 'hard',
          description: 'Реализуй классический контекстный менеджер через класс TimerContextManager с методами def __enter__(self) и def __exit__(self, exc_type, exc_val, exc_tb). Замерь время блока with.',
          hints: ['__enter__ возвращает self, __exit__ печатает duration'],
        },
      ],
      mistakes: [
        {
          wrong: 'Забыть @functools.wraps(func) внутри декоратора',
          right: 'Без @functools.wraps декорированная функция теряет своё имя (становится "wrapper") и документацию, что ломает Swagger-документацию в FastAPI и тесты',
        },
        {
          wrong: 'Забыть блок finally: внутри контекстного менеджера',
          right: 'Код очистки (закрытие файла, rollback БД) ОБЯЗАН быть в блоке finally, иначе при любой ошибке ресурсы останутся незакрытыми (утечка памяти/дескрипторов)',
        },
      ],
      checklist: [
        'Понимаю принцип работы декораторов и обязательность @functools.wraps',
        'Умею писать декораторы с аргументами и без',
        'Понимаю устройство контекстных менеджеров with (__enter__ / __exit__)',
        'Умею создавать лёгкие контекстные менеджеры через @contextmanager',
      ],
    },

    {
      id: 'dataclasses-match-unpacking',
      title: 'Dataclasses, Type Hints, match/case и распаковка',
      summary: 'Современные стандарты Python: датаклассы без бойлерплейта, Pattern Matching и продвинутая распаковка *args/**kwargs',
      theory: [
        {
          type: 'p',
          text: 'Современный Python 3.10+ предлагает элегантные инструменты, которые избавляют от сотен строк шаблонного "бойлерплейт" кода: датаклассы (@dataclass), структурное сопоставление шаблонов (match/case), аннотации типов (Type Hints) и операторы распаковки.',
        },
        {
          type: 'steps',
          title: 'Главные фишки современного синтаксиса',
          items: [
            { code: '@dataclass(slots=True)\nclass UserDTO:', note: 'Датаклассы: автоматически генерируют __init__, __repr__, __eq__ и оптимизируют память через slots=True' },
            { code: 'match status_code:\n    case 200 | 201:\n        return "OK"', note: 'match/case (Pattern Matching): мощная замена громоздким цепочкам if/elif/else с проверкой типов' },
            { code: 'merged = dict1 | dict2', note: 'Оператор слияния словарей | (Python 3.9+): объединяет два словаря без вызова .update()' },
            { code: 'first, *middle, last = [1, 2, 3, 4, 5]', note: 'Продвинутая распаковка: *middle соберёт все промежуточные элементы в отдельный список' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'В чём разница между Pydantic BaseModel и Python @dataclass?',
          text: 'Pydantic BaseModel (из модуля 6) создан для парсинга и валидации сырых внешних данных (например, JSON из HTTP-запроса). Dataclass — встроенный в Python инструмент для внутренних легковесных структур данных в памяти без накладных расходов на валидацию.',
        },
      ],
      examples: [
        {
          title: 'Пример 1: Было (обычный класс с __init__) vs Стало (@dataclass)',
          lang: 'python',
          code: `from dataclasses import dataclass, field

# ❌ БЫЛО (15 строк бойлерплейта):
class OldUser:
    def __init__(self, id, name, roles=None):
        self.id = id
        self.name = name
        self.roles = roles if roles is not None else []
    def __repr__(self):
        return f"OldUser(id={self.id}, name={self.name})"

# ✅ СТАЛО (4 чистые строки с автогенерацией всех методов):
@dataclass(slots=True)
class UserDTO:
    id: int
    name: str
    roles: list[str] = field(default_factory=list)

u1 = UserDTO(id=1, name="Аня", roles=["admin"])
u2 = UserDTO(id=1, name="Аня", roles=["admin"])

print(u1)               # -> UserDTO(id=1, name='Аня', roles=['admin'])
print("Равны?", u1 == u2) # -> True (автоматическое сравнение по полям!)`,
          explanation: '@dataclass автоматически генерирует конструктор, читаемый вывод __repr__ и операторы сравнения ==.',
        },
        {
          title: 'Пример 2: Было vs Стало с Pattern Matching (match/case)',
          lang: 'python',
          code: `# Обработка различных форматов команд от клиента:
def process_command(event: dict):
    # ✅ Современный match/case с деструктуризацией словарей:
    match event:
        case {"action": "create", "user": {"name": str(name), "age": int(age)}}:
            return f"Создаём пользователя {name}, возраст {age}"
        case {"action": "delete", "id": int(user_id)}:
            return f"Удаляем пользователя ID {user_id}"
        case {"action": "ping"}:
            return "PONG"
        case _:
            return "Неизвестный формат команды!"

print(process_command({"action": "create", "user": {"name": "Иван", "age": 25}}))
print(process_command({"action": "delete", "id": 42}))
print(process_command({"action": "unknown"}))`,
          explanation: 'match/case не просто проверяет значение, но и автоматически валидирует структуру и типы вложенных данных.',
        },
        {
          title: 'Пример 3: Продвинутая распаковка и объединение словарей через оператор |',
          lang: 'python',
          code: `# Объединение настроек (дефолтные + пользовательские):
default_config = {"theme": "light", "port": 8000, "debug": False}
user_override = {"theme": "dark", "debug": True}

# Объединение словарей через оператор | (Python 3.9+):
final_config = default_config | user_override
print("Итоговая конфигурация:", final_config)

# Распаковка списка с префиксом и суффиксом:
log_records = ["START", "step_1", "step_2", "step_3", "FINISH"]
first, *middle_steps, last = log_records

print(f"Старт: {first}, Шаги: {middle_steps}, Конец: {last}")`,
          explanation: 'Оператор | создаёт новый объединённый словарь, а звездочка * распаковывает произвольное количество элементов.',
        },
      ],
      terminal: {
        title: 'Проверка работы Pattern Matching (match/case)',
        description: 'Проверь синтаксис match/case в Python 3.10+:',
        lessonCommands: {
          'python -c "x = 200; match x: \n case 200: print(\'OK\')"': {
            output: ['OK'],
            type: 'success',
          },
        },
        suggestions: ['python -c "x = 200; match x: \n case 200: print(\'OK\')"'],
        script: [
          { command: 'python -c "x = 200; match x: \n case 200: print(\'OK\')"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице работают dataclasses, match/case и продвинутая распаковка. Запусти код!',
        initialCode: `from dataclasses import dataclass

@dataclass
class OrderItem:
    item_id: int
    title: str
    price: float
    quantity: int = 1

    @property
    def total(self) -> float:
        return self.price * self.quantity

item1 = OrderItem(1, "Клавиатура", 1500.0, 2)
item2 = OrderItem(2, "Мышка", 800.0)

print("Товар 1:", item1, "Сумма:", item1.total)
print("Товар 2:", item2, "Сумма:", item2.total)

# Слияние настроек:
base = {"db": "postgres"}
extra = {"cache": "redis"}
print("Объединённый стек:", base | extra)`,
      },
      tasks: [
        {
          title: 'Задание 1: датакласс с замороженными полями (frozen=True)',
          difficulty: 'easy',
          description: 'Создай @dataclass(frozen=True) class Point: x: int; y: int. Попробуй изменить point.x = 10 после создания и убедись, что frozen датаклассы неизменяемы (иммутабельны) и защищены от случайной перезаписи.',
          hints: ['frozen=True делает объект неизменяемым и хешируемым'],
        },
        {
          title: 'Задание 2: обработка HTTP-ответов через match/case',
          difficulty: 'medium',
          description: 'Напиши функцию handle_http_response(status: int, data: dict): используй match/case для: case 200 -> "Успех", case 404 -> "Не найдено", case 500 -> "Ошибка сервера", case _ -> "Неизвестный код".',
          hints: ['match status:\n    case 200: ...'],
          solution: `def handle_http_response(status: int, data: dict) -> str:
    match status:
        case 200 | 201:
            return f"Успех: {data.get('message', 'OK')}"
        case 404:
            return "Ресурс не найден"
        case 500:
            return "Критический сбой сервера"
        case _:
            return f"Неизвестный статус: {status}"

assert handle_http_response(200, {"message": "Готово"}) == "Успех: Готово"
assert handle_http_response(404, {}) == "Ресурс не найден"
print("✓ match/case роутер статусов работает отлично!")`,
        },
        {
          title: 'Задание 3: распаковка вложенных структур',
          difficulty: 'hard',
          description: 'Дан кортеж config = ("api.site.com", 8000, ("user", "pass", "neondb")). Используй распаковку host, port, (db_user, db_pass, db_name) = config в одну строку и собери строку подключения DATABASE_URL.',
          hints: ['host, port, (db_user, db_pass, db_name) = config'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать изменяемые значения по умолчанию в датаклассе: roles: list = []',
          right: 'В Python списки и словари по умолчанию в датаклассах обязаны объявляться через default_factory: roles: list[str] = field(default_factory=list)',
        },
        {
          wrong: 'Путать оператор объединения словарей | с побитовым OR над числами',
          right: 'Для словарей оператор d1 | d2 объединяет ключи и значения (значения d2 перезаписывают d1 при совпадении ключа)',
        },
      ],
      checklist: [
        'Умею создавать чистые структуры данных через @dataclass',
        'Знаю синтаксис структурного сопоставления match/case',
        'Умею объединять словари через оператор |',
        'Знаю правила продвинутой распаковки *args, **kwargs и *rest',
      ],
    },
  ],
};
