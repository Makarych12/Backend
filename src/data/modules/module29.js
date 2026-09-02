export const module29 = {
  id: 'pagination-search',
  order: 29,
  title: 'Пагинация, фильтрация и полнотекстовый поиск',
  icon: '🔍',
  description: 'Как быстро отдавать большие объёмы данных: Offset vs Cursor пагинация, динамические фильтры в SQLAlchemy и полнотекстовый поиск в PostgreSQL.',
  lessons: [
    {
      id: 'pagination-offset-vs-cursor',
      title: 'Offset пагинация против Cursor пагинации',
      summary: 'Почему классический OFFSET 1000000 сканирует миллион строк впустую и как курсорная пагинация делает бесконечную ленту мгновенной',
      theory: [
        {
          type: 'p',
          text: 'В базе данных интернет-магазина хранится 1 000 000 товаров. Если клиент запрашивает 100 000-ю страницу через `LIMIT 20 OFFSET 1000000`, база данных PostgreSQL вынуждена прочитать и выбросить 1 000 000 строк с диска, прежде чем вернуть нужные 20 штук! Время ответа возрастает с 2 миллисекунд до 5 секунд. Кроме того, если во время листания добавится новый товар — пользователь увидит дубликаты.',
        },
        {
          type: 'analogy',
          text: 'Offset пагинация — это как листать бумажную книгу на 1 000 000 страниц с самого начала каждый раз: чтобы прочитать страницу 5000, ты обязан пересчитать руками все 4999 страниц перед ней. CURSOR ПАГИНАЦИЯ (Пагинация по курсору) — это ЗАКЛАДКА. Ты просто открываешь страницу сразу после закладки: `WHERE id > 4999 LIMIT 20`. База данных прыгает по B-Tree индексу за 0.0001 секунды ровно в нужное место!',
        },
        {
          type: 'steps',
          title: 'Сравнение двух подходов',
          items: [
            { code: 'Offset пагинация (?page=5&limit=20):', note: 'Плюсы: можно прыгнуть на страницу #42. Минусы: тормозит на больших объемах, сдвигается при добавлении новых записей' },
            { code: 'Cursor пагинация (?cursor=last_id&limit=20):', note: 'Плюсы: работает мгновенно O(1) на любых объемах данных, идеальна для бесконечных лент (Instagram, Twitter, маркетплейсы)' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Курсорная пагинация в FastAPI и SQLAlchemy',
          lang: 'python',
          code: `from fastapi import FastAPI, Query
from pydantic import BaseModel

app = FastAPI()

class ProductCursorResponse(BaseModel):
    items: list[dict]
    next_cursor: int | None
    has_more: bool

# Имитация базы данных из 10 000 товаров:
FAKE_DB = [{"id": i, "name": f"Товар #{i}", "price": i * 10} for i in range(1, 10001)]

@app.get("/api/products/cursor", response_model=ProductCursorResponse)
def get_products_by_cursor(
    cursor: int = Query(0, description="ID последнего увиденного товара"),
    limit: int = Query(10, le=50, description="Количество товаров на странице")
):
    # SQL: SELECT * FROM products WHERE id > :cursor ORDER BY id ASC LIMIT :limit + 1
    # Запрашиваем limit + 1, чтобы узнать, есть ли следующая страница:
    matching_items = [p for p in FAKE_DB if p["id"] > cursor][:limit + 1]
    
    has_more = len(matching_items) > limit
    items = matching_items[:limit]
    next_cursor = items[-1]["id"] if (items and has_more) else None
    
    return {
        "items": items,
        "next_cursor": next_cursor,
        "has_more": has_more
    }`,
          explanation: 'Запрос limit + 1 позволяет без отдельного дорогого COUNT(*) запроса узнать, есть ли следующая страница.',
        },
        {
          title: 'Пример 2: Кодирование курсора в Base64 для сокрытия структуры ID',
          lang: 'python',
          code: `import base64

def encode_cursor(record_id: int) -> str:
    """Кодирует ID в непрозрачную строку курсора (opaque cursor)"""
    return base64.b64encode(f"cursor:{record_id}".encode()).decode()

def decode_cursor(cursor_str: str) -> int:
    raw = base64.b64decode(cursor_str.encode()).decode()
    return int(raw.split(":")[1])

encoded = encode_cursor(42)
print("Зашифрованный курсор:", encoded) # 'Y3Vyc29yOjQy'
assert decode_cursor(encoded) == 42`,
          explanation: 'Opaque курсоры защищают от перебора ID и позволяют безопасно менять внутреннюю логику сортировки.',
        },
        {
          title: 'Пример 3: Сравнение скорости SQL запросов',
          lang: 'bash',
          code: `# ❌ Медленно (Offset): сканирует 500 000 строк
SELECT * FROM orders ORDER BY id ASC LIMIT 20 OFFSET 500000; -- Execution time: 142ms

# ✅ Быстро (Cursor): использует B-Tree индекс
SELECT * FROM orders WHERE id > 500000 ORDER BY id ASC LIMIT 20; -- Execution time: 0.8ms`,
          explanation: 'Разница в скорости составляет более 150 раз на таблицах от сотен тысяч строк.',
        },
      ],
      terminal: {
        title: 'Запрос следующей страницы по курсору через curl',
        description: 'Получение первой порции и следующей страницы по next_cursor:',
        lessonCommands: {
          'curl http://localhost:8000/api/products/cursor?cursor=0&limit=2': {
            output: [
              '{"items":[{"id":1,"name":"Товар #1"},{"id":2,"name":"Товар #2"}],"next_cursor":2,"has_more":true}',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl http://localhost:8000/api/products/cursor?cursor=0&limit=2'],
        script: [
          { command: 'curl http://localhost:8000/api/products/cursor?cursor=0&limit=2' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор курсорного пейджера перелистывает миллионную базу. Запусти код!',
        initialCode: `class MockCursorPager:
    def __init__(self, total_records=1000):
        self.records = [{"id": i, "title": f"Пост #{i}"} for i in range(1, total_records + 1)]

    def fetch_page(self, last_seen_id: int = 0, page_size: int = 3):
        # Быстрый поиск от закладки:
        slice_items = [r for r in self.records if r["id"] > last_seen_id][:page_size + 1]
        has_more = len(slice_items) > page_size
        items = slice_items[:page_size]
        next_cursor = items[-1]["id"] if items and has_more else None
        return items, next_cursor

pager = MockCursorPager(total_records=10)

# Страница 1:
p1, cursor1 = pager.fetch_page(last_seen_id=0, page_size=3)
print("Страница 1:", [x["id"] for x in p1], "| Следующий курсор:", cursor1)

# Страница 2 (по курсору):
p2, cursor2 = pager.fetch_page(last_seen_id=cursor1, page_size=3)
print("Страница 2:", [x["id"] for x in p2], "| Следующий курсор:", cursor2)

assert [x["id"] for x in p2] == [4, 5, 6]`,
      },
      tasks: [
        {
          title: 'Задание 1: получение третьей страницы',
          difficulty: 'easy',
          description: 'Используй cursor2 для получения третьей страницы p3. Убедись, что получены посты [7, 8, 9].',
          hints: ['p3, cursor3 = pager.fetch_page(last_seen_id=cursor2, page_size=3)'],
        },
        {
          title: 'Задание 2: расчёт количества страниц для классической пагинации',
          difficulty: 'medium',
          description: 'Напиши функцию calculate_total_pages(total_items: int, page_size: int) -> int: для 100 товаров и page_size=15 должна вернуть 7 страниц (с округлением вверх).',
          hints: ['import math\nreturn math.ceil(total_items / page_size) if page_size else 0'],
          solution: `import math

def calculate_total_pages(total: int, size: int) -> int:
    return math.ceil(total / size) if size > 0 else 0

assert calculate_total_pages(100, 15) == 7
assert calculate_total_pages(10, 10) == 1
print("✓ Количество страниц рассчитано верно!")`,
        },
        {
          title: 'Задание 3: пагинация по двум полям (id и created_at)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: как строится условие курсорной пагинации, если сортировка идёт по дате создания, а не по ID (`WHERE (created_at, id) < (:last_date, :last_id)`), и почему составной B-Tree индекс `(created_at DESC, id DESC)` необходим для мгновенной выборки.',
          hints: ['Row-value comparison / Tuple comparison в PostgreSQL позволяет однозначно сортировать неуникальные даты с tie-breaker по id'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать OFFSET 500000 на таблицах с миллионами строк',
          right: 'Большой OFFSET вызывает full-table scan. Для больших списков и бесконечных лент всегда используй курсорную пагинацию (id > last_id)',
        },
        {
          wrong: 'Делать SELECT COUNT(*) на каждый запрос страницы при миллионах записей',
          right: 'COUNT(*) сканирует всю таблицу. Используй трюк limit + 1 для проверки has_more или кэшируй общее количество в Redis',
        },
      ],
      checklist: [
        'Понимаю разницу между Offset и Cursor пагинацией',
        'Знаю, почему Cursor пагинация работает со скоростью O(1)',
        'Умею реализовывать трюк limit + 1 для флага has_more',
        'Понимаю назначение составных индексов для сортировки',
      ],
    },

    {
      id: 'advanced-filters-sorting',
      title: 'Динамические фильтры и сортировка в SQLAlchemy',
      summary: 'Как строить гибкие фильтры по диапазону цен, категориям, статусам и датам без кучи вложенных if/else',
      theory: [
        {
          type: 'p',
          text: 'В реальном интернет-магазине у каталога десятки фильтров: цена от/до, бренд, цвет, наличие скидки, сортировка по популярности или новизне. Если писать это через 20 вложенных `if/else` или собирать SQL конкатенацией строк — код превратится в нечитаемый кошмар с уязвимостями к SQL-инъекциям.',
        },
        {
          type: 'steps',
          title: 'Паттерн построения динамических запросов в SQLAlchemy 2.0',
          items: [
            { code: 'query = select(Product)', note: '1. Начинаем с базового запроса' },
            { code: 'if min_price is not None: query = query.where(Product.price >= min_price)', note: '2. Динамически наслаиваем условия фильтрации' },
            { code: 'if sort_by == "price_desc": query = query.order_by(Product.price.desc())', note: '3. Применяем сортировку' },
            { code: 'result = session.scalars(query).all()', note: '4. Выполняем единый оптимизированный параметризованный SQL-запрос' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Чистый сервис фильтрации товаров в FastAPI',
          lang: 'python',
          code: `from dataclasses import dataclass
from typing import Optional

@dataclass
class ProductFilterParams:
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    in_stock_only: bool = False
    sort_by: str = "newest" # "newest", "price_asc", "price_desc"

def filter_products(products: list[dict], params: ProductFilterParams) -> list[dict]:
    res = products
    if params.category:
        res = [p for p in res if p["category"] == params.category]
    if params.min_price is not None:
        res = [p for p in res if p["price"] >= params.min_price]
    if params.max_price is not None:
        res = [p for p in res if p["price"] <= params.max_price]
    if params.in_stock_only:
        res = [p for p in res if p.get("stock", 0) > 0]
        
    if params.sort_by == "price_asc":
        res.sort(key=lambda p: p["price"])
    elif params.sort_by == "price_desc":
        res.sort(key=lambda p: p["price"], reverse=True)
        
    return res`,
          explanation: 'Фильтры объединяются в чистую структуру данных (Dataclass / Pydantic), что делает код расширяемым.',
        },
        {
          title: 'Пример 2: Динамический запрос в SQLAlchemy 2.0',
          lang: 'python',
          code: `# def build_sqlalchemy_query(filters: ProductFilterParams):
#     stmt = select(ProductModel)
#     conditions = []
#     if filters.min_price:
#         conditions.append(ProductModel.price >= filters.min_price)
#     if filters.category:
#         conditions.append(ProductModel.category == filters.category)
#     if conditions:
#         stmt = stmt.where(and_(*conditions))
#     return stmt`,
          explanation: 'and_(*conditions) объединяет массив условий в один безопасный SQL WHERE блок.',
        },
        {
          title: 'Пример 3: Валидация полей сортировки (Защита от инъекций в ORDER BY)',
          lang: 'python',
          code: `ALLOWED_SORT_FIELDS = {"price": "price", "created_at": "created_at", "rating": "rating"}

def get_safe_order_by(field_name: str, direction: str = "asc"):
    safe_field = ALLOWED_SORT_FIELDS.get(field_name, "created_at")
    desc = direction.lower() == "desc"
    return {"field": safe_field, "descending": desc}`,
          explanation: 'Белый список полей (Whitelist) предотвращает подстановку произвольных SQL выражений в блок ORDER BY.',
        },
      ],
      terminal: {
        title: 'Фильтрация через Query-параметры в терминале',
        description: 'Пример запроса с несколькими фильтрами:',
        lessonCommands: {
          'curl "http://localhost:8000/api/products?min_price=1000&category=books&sort_by=price_asc"': {
            output: [
              '[{"id":10,"name":"Чистый код","price":1500,"category":"books"}]',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl "http://localhost:8000/api/products?min_price=1000&category=books&sort_by=price_asc"'],
        script: [
          { command: 'curl "http://localhost:8000/api/products?min_price=1000&category=books&sort_by=price_asc"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор фильтрации каталога обрабатывает сложные поисковые критерии. Запусти код!',
        initialCode: `items_db = [
    {"id": 1, "title": "Ноутбук Pro", "price": 95000, "category": "laptops", "rating": 4.8},
    {"id": 2, "title": "Бюджетный планшет", "price": 15000, "category": "tablets", "rating": 4.1},
    {"id": 3, "title": "Игровой ультрабук", "price": 120000, "category": "laptops", "rating": 4.9},
    {"id": 4, "title": "Электронная книга", "price": 9000, "category": "tablets", "rating": 4.5},
]

def search_catalog(category=None, min_p=None, max_p=None, min_rating=None):
    results = items_db
    if category: results = [i for i in results if i["category"] == category]
    if min_p is not None: results = [i for i in results if i["price"] >= min_p]
    if max_p is not None: results = [i for i in results if i["price"] <= max_p]
    if min_rating is not None: results = [i for i in results if i["rating"] >= min_rating]
    return results

# Ищем ноутбуки от 50 000 до 100 000 руб с рейтингом >= 4.5:
found = search_catalog(category="laptops", min_p=50000, max_p=100000, min_rating=4.5)
print("Найденные товары:", found)
assert len(found) == 1 and found[0]["title"] == "Ноутбук Pro"`,
      },
      tasks: [
        {
          title: 'Задание 1: поиск планшетов до 20 000 руб',
          difficulty: 'easy',
          description: 'Вызови search_catalog с category="tablets" и max_p=20000. Проверь, что нашлись оба планшета.',
          hints: ['tablets = search_catalog(category="tablets", max_p=20000)'],
        },
        {
          title: 'Задание 2: сортировка результатов по убыванию рейтинга',
          difficulty: 'medium',
          description: 'Напиши функцию sort_by_rating_desc(items: list[dict]) -> list[dict]: сортирует список товаров от самого высокого рейтинга к низкому.',
          hints: ['return sorted(items, key=lambda x: x["rating"], reverse=True)'],
          solution: `def sort_by_rating_desc(items: list[dict]) -> list[dict]:
    return sorted(items, key=lambda x: x["rating"], reverse=True)

sorted_items = sort_by_rating_desc(items_db)
assert sorted_items[0]["title"] == "Игровой ультрабук"
print("✓ Сортировка по рейтингу работает верно!")`,
        },
        {
          title: 'Задание 3: составные индексы для фильтров (B-Tree Composite Indexes)',
          difficulty: 'hard',
          description: 'Объясни в комментарии: если пользователи чаще всего фильтруют по категории и сортируют по цене (`WHERE category = :cat ORDER BY price ASC`), какой составной индекс `CREATE INDEX idx_products_cat_price ON products (category, price)` нужно создать в PostgreSQL и почему порядок колонок в индексе критически важен.',
          hints: ['Правило левого префикса: колонка с точным равенством (category) должна идти первой, а колонка диапазона/сортировки (price) — второй'],
        },
      ],
      mistakes: [
        {
          wrong: 'Склеивать SQL запрос через f-строки: query = f"SELECT * FROM items WHERE price > {user_price}"',
          right: 'Это приводит к фатальным SQL-инъекциям. ВСЕГДА используй параметризованные запросы SQLAlchemy (where(Product.price > user_price))',
        },
        {
          wrong: 'Делать фильтрацию в Python после выгрузки 100 000 строк из базы данных (db.query().all())',
          right: 'Фильтрация ОБЯЗАНА происходить на стороне PostgreSQL. В Python должны попадать только готовые отфильтрованные 20 строк',
        },
      ],
      checklist: [
        'Умею динамически конструировать фильтры в SQLAlchemy 2.0',
        'Знаю, как безопасно валидировать поля сортировки через Whitelist',
        'Понимаю, почему фильтрация должна выполняться в БД, а не в памяти Python',
        'Понимаю важность составных индексов (Composite Index)',
      ],
    },

    {
      id: 'full-text-search-postgres',
      title: 'Полнотекстовый поиск в PostgreSQL',
      summary: 'Почему LIKE %слово% не работает для человеческого поиска и как использовать tsvector, русскую морфологию и нечеткий поиск триграммами',
      theory: [
        {
          type: 'p',
          text: 'Если искать товары через `WHERE name LIKE \'%телефон%\'`, база данных не сможет найти слово "телефонам", "телефоны" или "смартфон", не исправит опечатку "тилефон" и выполнит медленный Full Table Scan. Для настоящего поискового опыта в PostgreSQL встроен мощный движок ПОЛНОТЕКСТОВОГО ПОИСКА (Full-Text Search, FTS) с поддержкой морфологии русского языка!',
        },
        {
          type: 'steps',
          title: '3 кита полнотекстового поиска PostgreSQL',
          items: [
            { code: '1. tsvector (Вектор документов):', note: 'Преобразует текст в нормальные формы слов (стеммы): "Купил отличные кроссовки" -> \'купи\':1 \'отличн\':2 \'кроссовк\':3' },
            { code: '2. tsquery (Поисковый запрос):', note: 'Преобразует пользовательский ввод с поддержкой логики: to_tsquery(\'russian\', \'кроссовки & бег\')' },
            { code: '3. pg_trgm (Триграммы / Нечеткий поиск):', note: 'Разбивает слова на тройки букв для исправления опечаток ("ноутбук" vs "наутбук") и быстрого автодополнения (Autocomplete)' },
          ],
        },
      ],
      examples: [
        {
          title: 'Пример 1: Полнотекстовый поиск с морфологией в PostgreSQL',
          lang: 'bash',
          code: `# Создаём быстрый GIN индекс по тексту:
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('russian', title || ' ' || description));

# Выполняем поиск (найдёт и "смартфоны", и "смартфонами", и "смартфону"):
SELECT title, ts_rank(to_tsvector('russian', title), to_tsquery('russian', 'смартфон')) AS rank
FROM products
WHERE to_tsvector('russian', title) @@ to_tsquery('russian', 'смартфон')
ORDER BY rank DESC;`,
          explanation: 'Оператор @@ выполняет сопоставление вектора документа с поисковым запросом, а ts_rank ранжирует по релевантности.',
        },
        {
          title: 'Пример 2: Нечеткий поиск триграммами (Fuzzy Search / Similarity) на Python',
          lang: 'python',
          code: `def get_trigrams(word: str) -> set[str]:
    """Разбивает слово на триграммы (тройки символов)"""
    padded = f"  {word.lower()} "
    return {padded[i:i+3] for i in range(len(padded) - 2)}

def trigram_similarity(word1: str, word2: str) -> float:
    """Рассчитывает схожесть двух слов (от 0.0 до 1.0)"""
    tri1 = get_trigrams(word1)
    tri2 = get_trigrams(word2)
    intersection = len(tri1 & tri2)
    union = len(tri1 | tri2)
    return round(intersection / union, 2) if union else 0.0

# Сравниваем слово с опечаткой:
sim = trigram_similarity("клавиатура", "клавиатура")      # 1.0 (точное)
sim_typo = trigram_similarity("клавиатура", "клавиотура") # 0.73 (опечатка найдена!)
print("Схожесть слова с опечаткой 'клавиотура':", sim_typo)`,
          explanation: 'Алгоритм триграмм находит нужный товар, даже если пользователь допустил 1–2 опечатки в слове.',
        },
        {
          title: 'Пример 3: Поисковый эндпоинт в FastAPI с ранжированием',
          lang: 'python',
          code: `from fastapi import FastAPI, Query

app = FastAPI()

# def search_products_api(q: str = Query(..., min_length=2)):
#     # В реальном коде вызывается SQLAlchemy с match()
#     # stmt = select(Product).where(Product.search_vector.match(q, postgresql_regconfig='russian'))
#     return [{"id": 1, "title": "Смартфон Apple iPhone 15 Pro", "relevance": 0.92}]`,
          explanation: 'SQLAlchemy поддерживает полнотекстовый поиск через метод match().',
        },
      ],
      terminal: {
        title: 'Тестирование поиска через curl',
        description: 'Поиск товаров по ключевым словам:',
        lessonCommands: {
          'curl "http://localhost:8000/api/search?q=купить+телефон"': {
            output: [
              '[{"id":42,"title":"Смартфон флагман 256GB","rank":0.85}]',
            ],
            type: 'success',
          },
        },
        suggestions: ['curl "http://localhost:8000/api/search?q=купить+телефон"'],
        script: [
          { command: 'curl "http://localhost:8000/api/search?q=купить+телефон"' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице симулятор стемминга и поиска сопоставляет формы слов. Запусти код!',
        initialCode: `class MockStemmerSearch:
    def __init__(self):
        # Словарь стемминга (приведение к корню):
        self.roots = {
            "книга": "книг", "книги": "книг", "книгу": "книг", "книгами": "книг",
            "питон": "питон", "python": "питон", "питону": "питон",
            "быстрый": "быстр", "быстрая": "быстр", "быстро": "быстр"
        }
        self.catalog = [
            {"id": 1, "title": "Книга по языку Python для новичков"},
            {"id": 2, "title": "Быстрый старт в программировании"},
            {"id": 3, "title": "Книги по кулинарии"}
        ]

    def _stem(self, word: str) -> str:
        return self.roots.get(word.lower(), word.lower())

    def search(self, query: str):
        query_stems = [self._stem(w) for w in query.split()]
        matches = []
        for item in self.catalog:
            item_stems = [self._stem(w) for w in item["title"].split()]
            score = sum(1 for qs in query_stems if qs in item_stems)
            if score > 0:
                matches.append((item, score))
        matches.sort(key=lambda x: x[1], reverse=True)
        return [m[0] for m in matches]

fts = MockStemmerSearch()
results = fts.search("книгу по питону")
print("Результаты поиска по запросу 'книгу по питону':")
for r in results:
    print(" ->", r["title"])

assert results[0]["id"] == 1`,
      },
      tasks: [
        {
          title: 'Задание 1: поиск по кулинарным книгам',
          difficulty: 'easy',
          description: 'Выполни поиск по запросу "книги". Убедись, что нашлись оба товара: #1 и #3.',
          hints: ['res_books = fts.search("книги")'],
        },
        {
          title: 'Задание 2: очистка поискового запроса от стоп-слов',
          difficulty: 'medium',
          description: 'Напиши функцию remove_stop_words(query: str, stop_words: set) -> str: удаляет из запроса союзы и предлоги ("и", "в", "по", "для", "на"). Для "книга по питону" должна вернуть "книга питону".',
          hints: ['return " ".join([w for w in query.split() if w.lower() not in stop_words])'],
          solution: `def remove_stop_words(query: str, stop_words: set) -> str:
    return " ".join([w for w in query.split() if w.lower() not in stop_words])

stops = {"и", "в", "по", "для", "на", "с"}
cleaned = remove_stop_words("книга по питону для новичков", stops)
assert cleaned == "книга питону новичков"
print("✓ Стоп-слова успешно удалены:", cleaned)`,
        },
        {
          title: 'Задание 3: практическое внедрение поиска в проект 2 (Shop API)',
          difficulty: 'hard',
          description: 'Добавь в проект интернет-магазина эндпоинт GET /api/v1/products/search?q=ноутбук: использует полнотекстовый поиск с ранжированием релевантности и подсветкой совпадений (Highlighting)!',
          hints: ['Поздравляем! Твой интернет-магазин обладает мгновенным умным поиском промышленного уровня!'],
        },
      ],
      mistakes: [
        {
          wrong: 'Использовать поиск ILIKE %поиск% на таблицах с сотнями тысяч товаров',
          right: 'ILIKE сканирует всю таблицу целиком без использования индексов. Всегда используй полнотекстовый поиск PostgreSQL с GIN-индексом',
        },
        {
          wrong: 'Не использовать языковой словарь (russian) при вызове to_tsvector',
          right: 'Без указания словаря \'russian\' PostgreSQL не сможет нормализовать окончания русских падежей и склонений',
        },
      ],
      checklist: [
        'Понимаю разницу между LIKE и полнотекстовым поиском FTS',
        'Знаю работу tsvector и tsquery с русской морфологией',
        'Понимаю, как GIN-индексы ускоряют текстовый поиск',
        'Знаю концепцию нечеткого поиска триграммами (pg_trgm)',
      ],
    },
  ],
};
