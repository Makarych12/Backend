export const module10 = {
  id: 'testing',
  order: 10,
  title: 'Тестирование',
  icon: '🧪',
  description: 'pytest, TestClient в FastAPI, фикстуры, изоляция БД и покрытие тестами.',
  lessons: [
    {
      id: 'why-tests-and-pytest',
      title: 'Зачем нужны автотесты и основы pytest',
      summary: 'Почему ручная проверка подводит, как устроен assert и как написать свой первый автоматический тест',
      theory: [
        {
          type: 'p',
          text: 'Когда ты пишешь код, всегда хочется сразу проверить, работает ли он. Обычно новичок делает это вручную: запускает сервер, открывает браузер или Swagger, кликает на кнопки и смотрит глазами. Но представь проект, в котором 50 разных роутов и сотни правил. Проверять всё вручную после каждого маленького изменения займёт часы, а забыть проверить какой-то незаметный крайний случай — проще простого. Именно для этого существуют АВТОТЕСТЫ — специальный код, который проверяет твой рабочий код сам.',
        },
        {
          type: 'analogy',
          text: 'Тест — это как проверка домашнего задания самим собой перед тем, как сдать его учителю. Если ты сам внимательно перепроверил решение по шагам, ты исправишь опечатки и ошибки заранее в спокойной обстановке. Если не проверил — ошибку найдёт учитель и поставит двойку. В разработке "учитель" — это реальный пользователь твоего сайта или строгий начальник: находить баги лучше до того, как они доберутся до людей!',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Главный враг разработчика — регрессия',
          text: 'Регрессия (regression) — это когда ты починил одно место в программе, но случайно сломал совершенно другое, соседнее. Без автотестов ты можешь даже не заметить этого неделями. Автотесты же запускаются за пару секунд и моментально бьют тревогу, если старый функционал сломался.',
        },
        {
          type: 'steps',
          title: 'Как работает ключевое слово assert в Python',
          items: [
            { code: 'assert 2 + 2 == 4', note: 'Если условие после assert истинно (True) — Python просто молча идёт дальше' },
            { code: 'assert 2 + 2 == 5', note: 'Если условие ложно (False) — Python моментально поднимает ошибку AssertionError и останавливает выполнение' },
            { code: 'assert user.is_active, "Пользователь должен быть активен"', note: 'Через запятую можно добавить поясняющий текст ошибки, который покажется при падении' },
          ],
        },
        {
          type: 'p',
          text: 'pytest — это самый популярный и удобный инструмент для тестирования в Python. Чтобы pytest понял, где лежат тесты, действует простое соглашение по именам: файлы называют с приставкой test_ (например, test_auth.py), а тестовые функции внутри — с префиксом test_ (например, def test_calculate_discount():).',
        },
        {
          type: 'list',
          title: 'Как pytest запускает тесты',
          items: [
            'Ты вводишь в терминале одну короткую команду: pytest',
            'pytest сам сканирует все папки проекта и находит все файлы test_*.py',
            'Внутри файлов он находит все функции def test_...() и по очереди запускает их',
            'Если все assert прошли успешно — тесты зелёные (PASSED). Если хоть один assert упал — pytest показывает красивый и понятный отчёт с точным местом ошибки (FAILED)',
          ],
        },
      ],
      example: {
        title: 'Тестирование функции расчёта скидки',
        lang: 'python',
        code: `def calculate_final_price(price: float, discount_pct: float) -> float:
    if discount_pct < 0 or discount_pct > 100:
        raise ValueError("Скидка должна быть от 0 до 100%")
    if price < 0:
        raise ValueError("Цена не может быть отрицательной")
    return price * (1 - discount_pct / 100)

# Тестовые функции для pytest:
def test_normal_discount():
    assert calculate_final_price(1000, 10) == 900.0

def test_zero_discount():
    assert calculate_final_price(500, 0) == 500.0

def test_full_discount():
    assert calculate_final_price(500, 100) == 0.0`,
        explanation: 'Каждая тестовая функция проверяет один конкретный сценарий: обычную скидку, нулевую скидку и 100% скидку.',
      },
      terminal: {
        title: 'Запуск pytest в терминале',
        description: 'Попробуй установить pytest и запустить тесты с подробным флагом -v (verbose — подробный вывод):',
        lessonCommands: {
          pytest: {
            output: [
              '============================= test session starts ==============================',
              'platform linux -- Python 3.12.7, pytest-8.3.4, pluggy-1.5.0',
              'rootdir: /home/user/project',
              'collected 3 items',
              '',
              'test_shop.py ...                                                         [100%]',
              '',
              '============================== 3 passed in 0.04s ===============================',
            ],
            type: 'success',
          },
          'pytest -v': {
            output: [
              '============================= test session starts ==============================',
              'platform linux -- Python 3.12.7, pytest-8.3.4, pluggy-1.5.0',
              'rootdir: /home/user/project',
              'collected 3 items',
              '',
              'test_shop.py::test_normal_discount PASSED                                [ 33%]',
              'test_shop.py::test_zero_discount PASSED                                  [ 66%]',
              'test_shop.py::test_full_discount PASSED                                  [100%]',
              '',
              '============================== 3 passed in 0.04s ===============================',
            ],
            type: 'success',
          },
        },
        suggestions: ['pip install pytest', 'pytest', 'pytest -v'],
        script: [
          { command: 'pip install pytest' },
          { command: 'pytest -v' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В песочнице работает настоящий assert. Запусти код и посмотри, как тесты успешно подтверждают правильность функции.',
        initialCode: `def calculate_final_price(price: float, discount_pct: float) -> float:
    if discount_pct < 0 or discount_pct > 100:
        raise ValueError("Скидка должна быть от 0 до 100%")
    if price < 0:
        raise ValueError("Цена не может быть отрицательной")
    return price * (1 - discount_pct / 100)

def test_normal_discount():
    result = calculate_final_price(1000, 10)
    assert result == 900.0
    print("✓ test_normal_discount прошёл")

def test_zero_discount():
    result = calculate_final_price(500, 0)
    assert result == 500.0
    print("✓ test_zero_discount прошёл")

def test_full_discount():
    result = calculate_final_price(500, 100)
    assert result == 0.0
    print("✓ test_full_discount прошёл")

# Запускаем наши тесты по очереди:
test_normal_discount()
test_zero_discount()
test_full_discount()
print("Все тесты успешно пройдены!")`,
      },
      tasks: [
        {
          title: 'Задание 1: напиши тест для валидатора email',
          difficulty: 'easy',
          description: 'Напиши функцию is_valid_email(email: str) -> bool (возвращает True, если в строке есть "@" и ".", иначе False). Добавь две тестовые функции: test_valid_email() с корректным адресом и test_invalid_email() с адресом без знака "@".',
          hints: [
            'def is_valid_email(email: str) -> bool:\n    return "@" in email and "." in email',
            'В test_valid_email напиши: assert is_valid_email("user@mail.com") is True',
          ],
        },
        {
          title: 'Задание 2: тестирование граничных условий имени пользователя',
          difficulty: 'medium',
          description: 'Напиши функцию format_username(name: str) -> str, которая убирает пробелы по краям (.strip()) и делает первую букву заглавной (.capitalize()). Напиши три теста: для обычного имени ("  ivan  " -> "Ivan"), для пустого имени ("" -> "") и для имени из одной буквы ("a" -> "A").',
          hints: [
            'def format_username(name: str) -> str:\n    return name.strip().capitalize()',
            'assert format_username("  ivan  ") == "Ivan"',
            'assert format_username("") == ""',
          ],
          solution: `def format_username(name: str) -> str:
    return name.strip().capitalize()

def test_spaces():
    assert format_username("  ivan  ") == "Ivan"

def test_empty():
    assert format_username("") == ""

def test_single_char():
    assert format_username("a") == "A"

test_spaces()
test_empty()
test_single_char()
print("Тесты format_username пройдены!")`,
        },
        {
          title: 'Задание 3: найди и исправь скрытый баг',
          difficulty: 'hard',
          description: 'Представь функцию def is_teenager(age: int) -> bool: return age > 13 and age < 19. Напиши тесты для возраста 13 и 19 лет. Убедись, что тест упадёт, потому что 13 и 19 тоже должны считаться подростками (в английском: thirTEEN .. nineTEEN). Исправь условие в функции на >= и <=, чтобы тесты стали зелёными.',
          hints: [
            'В изначальной функции строгое неравенство > 13 вместо >= 13',
            'Тест assert is_teenager(13) is True упадёт с AssertionError до исправления кода функции',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'def test_math():\n    result = 2 + 2\n    print("Результат:", result)  # тест без assert',
          right: 'Печать через print() не проверяет ничего автоматически: если результат станет неверным, print просто напечатает неправильное число, и тест не упадёт. Тест обязан содержать assert result == 4',
        },
        {
          wrong: 'Проверять только один идеальный сценарий ("happy path") и никогда не проверять граничные случаи (0, пустые строки, отрицательные числа)',
          right: 'Ошибки почти всегда прячутся на границах: 0, отрицательные значения, пустые списки или очень длинные строки. Хороший тест проверяет как правильные данные, так и экстремальные случаи',
        },
      ],
      checklist: [
        'Понимаю, зачем нужны автотесты и чем они лучше ручной проверки',
        'Знаю, что такое регрессия и как тесты защищают от неё',
        'Умею пользоваться ключевым словом assert',
        'Знаю правила именования файлов test_*.py и функций test_*() в pytest',
        'Знаю, как запустить тесты командой pytest в терминале',
      ],
    },

    {
      id: 'fastapi-testclient',
      title: 'Тестирование FastAPI: TestClient',
      summary: 'Как проверять роуты, статус-коды и JSON-ответы API прямо в коде без реального сервера',
      theory: [
        {
          type: 'p',
          text: 'В модулях 5-9 мы уже использовали TestClient, чтобы запускать код прямо в браузере. Но его главное настоящее назначение в реальных проектах — это быстрое и надёжное автоматическое тестирование API-эндпоинтов!',
        },
        {
          type: 'analogy',
          text: 'TestClient — это как тренажёр-симулятор для пилота или стенд для проверки двигателей на заводе. Нам не нужно строить целый самолёт и взлетать в воздух (поднимать реальный веб-сервер uvicorn, настраивать порты и слать сетевые пакеты), чтобы проверить реакцию двигателя на нажатие рычагов. TestClient передаёт запрос функции приложения напрямую в памяти компьютера за миллисекунды.',
        },
        {
          type: 'steps',
          title: 'Что проверяют в тестах API',
          items: [
            { code: 'response = client.get("/items/1")', note: '1. Отправляем запрос с помощью клиента (get, post, put, delete)' },
            { code: 'assert response.status_code == 200', note: '2. Проверяем HTTP статус-код (200 OK, 201 Created, 404 Not Found, 422 Unprocessable Entity)' },
            { code: 'data = response.json()\nassert data["title"] == "Книга"', note: '3. Превращаем тело ответа в словарь через .json() и проверяем структуру и значения полей' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Happy Path и Unhappy Path',
          text: 'У любого эндпоинта есть два типа сценариев: Happy Path (когда клиент прислал правильные данные, и сервер вернул 200/201) и Unhappy Path (когда клиент ошибся — запросил несуществующий ID или передал невалидный JSON, и сервер должен вернуть 404 или 422). Всегда тестируй оба пути!',
        },
      ],
      example: {
        title: 'Тестирование CRUD эндпоинтов',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
items = {}

class ItemCreate(BaseModel):
    title: str
    price: float

@app.post("/items", status_code=201)
def create_item(item: ItemCreate):
    item_id = len(items) + 1
    items[item_id] = {"id": item_id, "title": item.title, "price": item.price}
    return items[item_id]

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items:
        raise HTTPException(404, "Товар не найден")
    return items[item_id]

client = TestClient(app)

def test_create_and_get_item():
    # Создаём товар (Happy Path):
    res_post = client.post("/items", json={"title": "Клава", "price": 1500.0})
    assert res_post.status_code == 201
    created_id = res_post.json()["id"]

    # Читаем товар (Happy Path):
    res_get = client.get(f"/items/{created_id}")
    assert res_get.status_code == 200
    assert res_get.json()["title"] == "Клава"

def test_get_nonexistent_item():
    # Запрос товара с несуществующим ID (Unhappy Path):
    res = client.get("/items/999")
    assert res.status_code == 404`,
        explanation: 'Мы проверяем как успешное создание и получение товара, так и правильную реакцию на несуществующий ID (404).',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Запусти песочницу с автотестами FastAPI-сервера. Обрати внимание, как проверяются и успешные ответы, и ошибки валидации 422.',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
products = {}

class ProductIn(BaseModel):
    name: str
    price: float

@app.post("/products", status_code=201)
def create_product(product: ProductIn):
    pid = len(products) + 1
    products[pid] = {"id": pid, "name": product.name, "price": product.price}
    return products[pid]

@app.get("/products/{product_id}")
def get_product(product_id: int):
    if product_id not in products:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return products[product_id]

client = TestClient(app)

def test_create_product_success():
    res = client.post("/products", json={"name": "Ноутбук", "price": 85000.0})
    assert res.status_code == 201
    data = res.json()
    assert data["id"] == 1
    assert data["name"] == "Ноутбук"
    print("✓ test_create_product_success прошёл")

def test_get_product_not_found():
    res = client.get("/products/999")
    assert res.status_code == 404
    assert res.json()["detail"] == "Товар не найден"
    print("✓ test_get_product_not_found прошёл")

def test_create_product_validation_error():
    # Передаём невалидные данные (отсутствует обязательное поле price):
    res = client.post("/products", json={"name": "Мышка"})
    assert res.status_code == 422
    print("✓ test_create_product_validation_error прошёл")

test_create_product_success()
test_get_product_not_found()
test_create_product_validation_error()
print("Все тесты API успешно выполнены!")`,
      },
      tasks: [
        {
          title: 'Задание 1: тест на удаление товара (DELETE)',
          difficulty: 'easy',
          description: 'Добавь в приложение роут @app.delete("/products/{product_id}", status_code=200). Если товар есть — удали его из словаря и верни {"deleted": True}, если нет — подними 404. Напиши функцию test_delete_product(), которая проверяет удаление существующего товара.',
          hints: [
            '@app.delete("/products/{product_id}")\ndef delete_product(product_id: int):\n    if product_id not in products:\n        raise HTTPException(404, "Товар не найден")\n    del products[product_id]\n    return {"deleted": True}',
            'В тесте отправь client.delete("/products/1") и проверь status_code == 200',
          ],
        },
        {
          title: 'Задание 2: проверка пустого списка товаров',
          difficulty: 'medium',
          description: 'Добавь эндпоинт @app.get("/products"), возвращающий список всех товаров: list(products.values()). Напиши тест test_get_all_products(), который проверяет, что эндпоинт возвращает статус 200 и список нужной длины.',
          hints: [
            '@app.get("/products")\ndef get_all():\n    return list(products.values())',
            'В тесте проверь assert isinstance(res.json(), list)',
          ],
          solution: `@app.get("/products")
def get_all_products():
    return list(products.values())

def test_get_all():
    res = client.get("/products")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

test_get_all()
print("✓ Тест get_all пройден")`,
        },
        {
          title: 'Задание 3: полный сквозной тест сценария (E2E flow)',
          difficulty: 'hard',
          description: 'Напиши один большой тест test_full_lifecycle(): 1) создаёт товар; 2) убеждается, что он появился в общем списке; 3) запрашивает его по ID; 4) удаляет его; 5) проверяет, что повторный запрос по этому ID возвращает 404.',
          hints: [
            'Делай цепочку вызовов client.post -> client.get -> client.delete -> client.get',
            'На последнем шаге assert client.get(f"/products/{id}").status_code == 404',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'assert response.status_code == 200  # и больше никаких проверок',
          right: 'Статус 200 означает лишь, что сервер не упал. Но вернул ли он правильные данные? Всегда проверяй содержимое: data = response.json(); assert data["id"] == expected_id',
        },
        {
          wrong: 'Тестировать только эндпоинты с правильными данными и надеяться, что валидация и 404 сработают сами',
          right: 'Ошибочные запросы (404, 422, 401) — это полноценная часть контракта твоего API. Их нужно обязательно покрывать тестами так же тщательно, как и статус 200',
        },
      ],
      checklist: [
        'Понимаю, как работает TestClient и почему он быстрее реального сервера',
        'Умею проверять response.status_code и response.json() с помощью assert',
        'Знаю разницу между Happy Path и Unhappy Path',
        'Умею писать тесты на проверку кодов ошибок 404 и 422',
      ],
    },

    {
      id: 'testing-fixtures-and-db',
      title: 'Фикстуры и изоляция тестовой базы данных',
      summary: 'Как готовить тестовые данные с помощью фикстур и почему тесты должны запускаться в чистой изолированной БД',
      theory: [
        {
          type: 'p',
          text: 'Представь ситуацию: первый тест создал в базе данных пользователя "admin", а второй тест проверяет, что список пользователей пуст. Если запустить тесты по отдельности — оба пройдут. Но если запустить их вместе — второй тест упадёт, потому что первый оставил за собой мусор в общей базе данных! Такая взаимозависимость тестов — частая и мучительная головная боль.',
        },
        {
          type: 'analogy',
          text: 'Фикстура (fixture) — это как сервировка чистого стола перед подачей каждого нового блюда в ресторане (или чистый операционный стол перед операцией). Перед каждым тестом подготавливается свежее, чистое окружение (чистая база данных, тестовый клиент), а после окончания теста всё аккуратно убирается, чтобы следующий тест начинался с абсолютно чистого листа.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Почему НИКОГДА нельзя тестировать на рабочей (продакшен) базе данных',
          text: '1) Тесты могут случайно удалить или перезаписать данные реальных клиентов. 2) Тестовый мусор ("test_user_999", "asdfgh") засорит базу. 3) Тесты могут случайно отправить реальные SMS или списать настоящие деньги с карт! Для тестов всегда используется отдельная, изолированная тестовая БД.',
        },
        {
          type: 'steps',
          title: 'Как устроены фикстуры в pytest (@pytest.fixture)',
          items: [
            { code: '@pytest.fixture\ndef clean_db():', note: 'Декоратор @pytest.fixture превращает функцию в заготовку данных/окружения' },
            { code: '    db = create_fresh_database()\n    yield db', note: 'Код до yield готовит данные и передаёт их тесту' },
            { code: '    db.close()', note: 'Код после yield выполняется ПОСЛЕ завершения теста (уборка / teardown)' },
            { code: 'def test_user(clean_db):', note: 'pytest сам видит аргумент с именем фикстуры и автоматически передаёт результат её работы в тест' },
          ],
        },
        {
          type: 'p',
          text: 'В backend-разработке для тестов часто используют SQLite в оперативной памяти (sqlite:///:memory:). Такая база создаётся за 0.001 секунды прямо в оперативной памяти компьютера и моментально уничтожается после теста — никакой диск не засоряется, и каждый тест получает идеально чистую среду.',
        },
      ],
      example: {
        title: 'Изоляция состояния через фикстуру очистки базы данных',
        lang: 'python',
        code: `class FakeDatabase:
    def __init__(self):
        self.data = {}

    def clear(self):
        self.data.clear()

db = FakeDatabase()

# Фикстура-помощник для сброса БД перед каждым тестом:
def setup_clean_db():
    db.clear()
    return db

def test_add_user():
    current_db = setup_clean_db()
    current_db.data["user_1"] = "Аня"
    assert len(current_db.data) == 1

def test_empty_db_on_start():
    current_db = setup_clean_db()
    # Благодаря setup_clean_db() здесь гарантированно 0 записей,
    # даже если предыдущий тест что-то добавлял!
    assert len(current_db.data) == 0`,
        explanation: 'Каждый тест вызывает очистку состояния перед началом своей работы, поэтому тесты становятся полностью независимыми друг от друга.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Попробуй запустить изолированные тесты FastAPI с очисткой базы данных перед каждым запуском.',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
db_notes = {}

class Note(BaseModel):
    text: str

@app.post("/notes", status_code=201)
def add_note(note: Note):
    nid = len(db_notes) + 1
    db_notes[nid] = {"id": nid, "text": note.text}
    return db_notes[nid]

@app.get("/notes")
def get_notes():
    return list(db_notes.values())

client = TestClient(app)

def reset_database():
    """Сбрасывает состояние базы в исходное чистое состояние"""
    db_notes.clear()

def test_create_note():
    reset_database()
    res = client.post("/notes", json={"text": "Купить молоко"})
    assert res.status_code == 201
    assert len(client.get("/notes").json()) == 1
    print("✓ test_create_note прошёл")

def test_notes_initially_empty():
    reset_database()
    # База должна быть пустой, даже если прошлый тест создал заметку
    res = client.get("/notes")
    assert res.status_code == 200
    assert len(res.json()) == 0
    print("✓ test_notes_initially_empty прошёл")

test_create_note()
test_notes_initially_empty()
print("Изолированные тесты выполнены успешно!")`,
      },
      tasks: [
        {
          title: 'Задание 1: фикстура начальных данных (Seed Data)',
          difficulty: 'easy',
          description: 'Напиши функцию seed_database_with_two_notes(), которая очищает базу и добавляет в неё две тестовые заметки: "Заметка 1" и "Заметка 2". Напиши тест test_notes_count(), который использует эту функцию и проверяет, что эндпоинт GET /notes возвращает ровно 2 заметки.',
          hints: [
            'def seed_database_with_two_notes():\n    db_notes.clear()\n    client.post("/notes", json={"text": "Заметка 1"})\n    client.post("/notes", json={"text": "Заметка 2"})',
          ],
        },
        {
          title: 'Задание 2: тестирование удаления с проверкой очистки',
          difficulty: 'medium',
          description: 'Добавь эндпоинт @app.delete("/notes/{note_id}"). Напиши тест: подготовь 1 заметку через reset_database() + post, удали её через DELETE /notes/1, и проверь, что список GET /notes стал пустым (длина 0).',
          hints: [
            'Не забудь вызвать reset_database() в начале теста',
            'assert len(client.get("/notes").json()) == 0',
          ],
          solution: `@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    if note_id in db_notes:
        del db_notes[note_id]
        return {"ok": True}
    raise HTTPException(404, "Заметка не найдена")

def test_delete_note():
    reset_database()
    client.post("/notes", json={"text": "Временная"})
    res_del = client.delete("/notes/1")
    assert res_del.status_code == 200
    assert len(client.get("/notes").json()) == 0

test_delete_note()
print("✓ Тест удаления с проверкой очистки пройден")`,
        },
        {
          title: 'Задание 3: обнаружение скрытой зависимости тестов',
          difficulty: 'hard',
          description: 'Специально закомментируй вызов reset_database() в одном из тестов и поменяй порядок запуска тестов местами. Убедись, что без сброса базы порядок тестов ломает проверки. В комментарии объясни, почему изоляция каждого теста — обязательное требование к качественному коду.',
          hints: [
            'Тесты в реальном pytest могут запускаться в произвольном порядке или параллельно в несколько потоков',
            'Если тест №2 зависит от того, что сделал тест №1 — такой тест называется "хрупким" (flaky test)',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Полагаться на то, что тесты всегда запускаются строго сверху вниз по порядку',
          right: 'pytest не гарантирует порядок выполнения тестов, а в больших проектах тесты запускаются параллельно. Каждый тест обязан быть полностью автономен и не зависеть от других',
        },
        {
          wrong: 'Использовать реальную рабочую базу данных для тестов',
          right: 'Тестировать нужно только на изолированной тестовой БД (например, sqlite в памяти или отдельный тестовый контейнер). Боевая база никогда не должна трогаться тестами',
        },
      ],
      checklist: [
        'Понимаю, что такое фикстура в pytest и зачем она нужна',
        'Знаю, к чему приводит разделение общего изменяемого состояния между тестами',
        'Понимаю, почему нельзя запускать тесты на продакшен-базе данных',
        'Знаю преимущества тестовой базы в оперативной памяти (sqlite:///:memory:)',
      ],
    },

    {
      id: 'test-coverage',
      title: 'Покрытие тестами: что это и зачем к нему стремиться',
      summary: 'Как измерить, какой процент кода проверен тестами, и почему 100% — это не гарантия отсутствия багов',
      theory: [
        {
          type: 'p',
          text: 'Представь, что ты написал 1000 строк кода и 20 тестов. Как понять, сколько строк твоего кода эти тесты РЕАЛЬНО проверили, а какие функции остались совершенно нетронутыми? Для этого используется метрика — ПОКРЫТИЕ ТЕСТАМИ (Code Coverage).',
        },
        {
          type: 'analogy',
          text: 'Покрытие тестами — это как карта в стратегической игре с "туманом войны" (или покраска забора). Код, по которому пробежали тесты — освещён на карте и окрашен. А нетронутые участки остаются в темноте: именно в этих тёмных углах обычно и прячутся самые неприятные баги.',
        },
        {
          type: 'steps',
          title: 'Как инструменты считают процент покрытия',
          items: [
            { code: 'pip install pytest-cov', note: 'Устанавливаем плагин измерения покрытия для pytest' },
            { code: 'pytest --cov=app --cov-report=term-missing', note: 'Запускаем тесты с подсчётом покрытия модуля app и показом номеров непроверенных строк' },
            { code: 'Покрытие = (Выполненные строки / Всего строк) * 100%', note: 'Если в программе 100 строк кода, и тесты прошли по 85 из них — покрытие составляет 85%' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему 100% покрытие НЕ гарантирует отсутствие багов',
          text: 'Это популярный вопрос на собеседованиях! Если строчка кода выполнилась во время теста — это значит лишь то, что она выполнилась с ОДНИМ конкретным набором параметров. Но если передать туда ноль, отрицательное число или спецсимвол — программа может упасть. Покрытие показывает, какой код НЕ проверен вовсе, но не гарантирует безошибочность проверенного кода.',
        },
        {
          type: 'list',
          title: 'Разумные стандарты покрытия в индустрии',
          items: [
            '0-50% — критически мало, большинство логики работает "на удачу"',
            '70-85% — отличный стандарт для большинства коммерческих backend-проектов',
            '100% — часто ведёт к бессмысленным тестам ради красивой цифры (тестирование простых геттеров вместо сложной бизнес-логики)',
          ],
        },
      ],
      example: {
        title: 'Пример функции с ветвлением и неполным покрытием',
        lang: 'python',
        code: `def get_user_status(points: int) -> str:
    if points >= 1000:
        return "VIP"          # Ветка 1
    elif points >= 100:
        return "PRO"          # Ветка 2
    else:
        return "NEWBIE"       # Ветка 3

# Тест 1 покрывает только Ветку 1:
def test_vip():
    assert get_user_status(1500) == "VIP"

# Ветки 2 и 3 остались непокрытыми (покрытие ~40%)!
# Чтобы довести до 100%, нужны тесты для PRO и NEWBIE:
def test_pro():
    assert get_user_status(250) == "PRO"

def test_newbie():
    assert get_user_status(10) == "NEWBIE"`,
        explanation: 'Каждая ветка if/elif/else требует отдельного теста, чтобы код внутри неё был проверен и зафиксирован в отчёте покрытия.',
      },
      terminal: {
        title: 'Запуск отчёта о покрытии pytest-cov',
        description: 'Посмотри, как выглядит реальный отчёт pytest-cov в терминале:',
        lessonCommands: {
          'pytest --cov=app --cov-report=term-missing': {
            output: [
              '============================= test session starts ==============================',
              'platform linux -- Python 3.12.7, pytest-8.3.4, pytest-cov-6.0.0',
              'rootdir: /home/user/project',
              'collected 4 items',
              '',
              'tests/test_app.py ....                                                   [100%]',
              '',
              '---------- coverage: platform linux, python 3.12.7 -----------',
              'Name                 Stmts   Miss  Cover   Missing',
              '--------------------------------------------------',
              'app/__init__.py          0      0   100%',
              'app/main.py             18      2    89%   24-25',
              'app/services.py         12      0   100%',
              '--------------------------------------------------',
              'TOTAL                   30      2    93%',
              '',
              '============================== 4 passed in 0.08s ===============================',
            ],
            type: 'success',
          },
        },
        suggestions: ['pytest --cov=app --cov-report=term-missing'],
        script: [
          { command: 'pytest --cov=app --cov-report=term-missing' },
        ],
      },
      sandbox: {
        bootstrap: null,
        description: 'В этой песочнице работает симулятор покрытия кода. Запусти код и посмотри, как новые тесты повышают процент покрытия веток!',
        initialCode: `executed_branches = set()

def process_order(amount: float, is_vip: bool) -> float:
    if amount <= 0:
        executed_branches.add("branch_invalid_amount")
        raise ValueError("Сумма должна быть положительной")
    
    if is_vip:
        executed_branches.add("branch_vip_discount")
        return amount * 0.8
    else:
        executed_branches.add("branch_standard_order")
        return amount

total_branches = 3

def report_coverage():
    pct = (len(executed_branches) / total_branches) * 100
    print(f"Покрыто веток: {len(executed_branches)} из {total_branches} ({pct:.1f}%)")

# Тест 1: обычный заказ
def test_standard():
    assert process_order(100, False) == 100.0

test_standard()
report_coverage()  # Покрыта только 1 ветка из 3 (33.3%)

# Тест 2: заказ VIP
def test_vip():
    assert process_order(100, True) == 80.0

test_vip()
report_coverage()  # Покрыто 2 ветки из 3 (66.7%)`,
      },
      tasks: [
        {
          title: 'Задание 1: добей покрытие до 100%',
          difficulty: 'easy',
          description: 'Добавь тест test_invalid_amount(), который пытается передать отрицательную сумму process_order(-50, False) с перехватом исключения (через try/except ValueError) и проверь, что покрытие стало 100%.',
          hints: [
            'def test_invalid_amount():\n    try:\n        process_order(-50, False)\n    except ValueError:\n        pass',
          ],
        },
        {
          title: 'Задание 2: новая ветка супер-скидки',
          difficulty: 'medium',
          description: 'Добавь в функцию условие: если сумма amount > 10000, давать скидку 30% (amount * 0.7) и регистрировать ветку "branch_big_order". Увеличь total_branches до 4 и напиши тест для этой новой ветки.',
          hints: [
            'if amount > 10000:\n    executed_branches.add("branch_big_order")\n    return amount * 0.7',
          ],
          solution: `executed_branches = set()
total_branches = 4

def process_order(amount: float, is_vip: bool) -> float:
    if amount <= 0:
        executed_branches.add("branch_invalid_amount")
        raise ValueError("Сумма должна быть положительной")
    if amount > 10000:
        executed_branches.add("branch_big_order")
        return amount * 0.7
    if is_vip:
        executed_branches.add("branch_vip_discount")
        return amount * 0.8
    else:
        executed_branches.add("branch_standard_order")
        return amount

def test_all():
    assert process_order(100, False) == 100.0
    assert process_order(100, True) == 80.0
    assert process_order(20000, False) == 14000.0
    try:
        process_order(-10, False)
    except ValueError:
        pass

test_all()
pct = (len(executed_branches) / total_branches) * 100
print(f"Итоговое покрытие: {pct:.1f}%")`,
        },
        {
          title: 'Задание 3: найди баг при 100% покрытии',
          difficulty: 'hard',
          description: 'Подумай: если функция делит число a / b, и у нас есть тест с a=10, b=2, строчка выполнилась и покрытие 100%. Но что произойдёт при b=0? Напиши в коде тест test_division_by_zero() и покажи, почему строковое покрытие не заменяет проверку краевых условий.',
          hints: [
            'При b = 0 Python поднимет ZeroDivisionError, хотя строчка formalno покрыта тестом на других числах',
            'Тестировать нужно варианты входных данных, а не просто строчки кода',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Считать, что 100% покрытие кода гарантирует полное отсутствие багов',
          right: 'Покрытие показывает только то, какие строки исполнялись во время тестов. Оно ничего не знает о пропущенных проверках (деление на ноль, пустой ввод, переполнение)',
        },
        {
          wrong: 'Писать фиктивные тесты без assert только ради того, чтобы поднять цифру в отчёте покрытия',
          right: 'Тест без проверок assert бесполезен — он создаёт ложное ощущение безопасности. Главная цель тестов — находить реальные ошибки, а не радовать менеджмент цифрой 100%',
        },
      ],
      checklist: [
        'Понимаю, что такое Code Coverage (покрытие тестами) и как оно рассчитывается',
        'Знаю, почему 100% покрытие не означает 100% отсутствие ошибок',
        'Понимаю, почему нужно тестировать все ветки if/elif/else и исключения',
        'Знаю команду запуска отчёта покрытия pytest --cov',
      ],
    },
  ],
};
