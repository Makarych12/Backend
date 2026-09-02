export const module5 = {
  id: 'fastapi-basics',
  order: 5,
  title: 'FastAPI: основы',
  icon: '🚀',
  description: 'Пишем настоящий сервер на Python: роуты, параметры и автодокументация.',
  lessons: [
    {
      id: 'first-fastapi-server',
      title: 'Первый сервер на FastAPI',
      summary: 'Устанавливаем FastAPI, пишем первый роут, запускаем сервер',
      theory: [
        {
          type: 'p',
          text: 'В модуле 4 мы узнали, что сервер — это программа, которая отвечает на запросы клиента. Настало время написать такую программу самим — на Python, с помощью инструмента FastAPI.',
        },
        {
          type: 'analogy',
          text: 'FastAPI — это готовый "кухонный набор инструментов" для повара (сервера). Тебе не нужно самому изобретать, как принимать заказы и отправлять блюда обратно — FastAPI уже умеет это делать. Твоя задача — только написать, ЧТО происходит с каждым конкретным заказом (какой ответ давать на какой запрос).',
        },
        {
          type: 'p',
          text: 'FastAPI — не часть самого Python, это отдельная библиотека (готовый чужой код, которым можно пользоваться). Такие библиотеки устанавливаются через pip — программу, о которой мы говорили в шпаргалках, а сейчас разберём подробно.',
        },
        {
          type: 'command',
          command: 'pip install fastapi uvicorn',
          parts: [
            { text: 'pip', desc: 'программа-менеджер пакетов, которая идёт вместе с Python и умеет скачивать готовые библиотеки из интернета' },
            { text: 'install', desc: 'команда для pip: "установи"' },
            { text: 'fastapi', desc: 'сама библиотека FastAPI — то, с помощью чего мы будем писать сервер' },
            { text: 'uvicorn', desc: 'отдельная программа, которая умеет по-настоящему "включить" наш FastAPI-сервер и заставить его слушать запросы' },
          ],
          result: 'pip скачает обе библиотеки из интернета и установит их на твой компьютер, чтобы можно было писать import fastapi и import uvicorn в коде.',
        },
        {
          type: 'p',
          text: 'Дальше пишем сам код сервера — обычно в файле с именем main.py.',
        },
        {
          type: 'steps',
          title: 'Собираем первый сервер по кусочкам',
          items: [
            { code: 'from fastapi import FastAPI', note: 'Импортируем сам инструмент FastAPI из установленной библиотеки' },
            { code: 'app = FastAPI()', note: 'Создаём "приложение" — это и есть наш будущий сервер. app — переменная, дальше мы будем настраивать именно её' },
            { code: '@app.get("/")', note: 'Это декоратор — специальная строка над функцией, которая говорит: "следующая функция должна сработать, когда придёт GET-запрос на адрес /"' },
            { code: 'def read_root():', note: 'Обычная функция Python — но благодаря декоратору выше она становится обработчиком запроса' },
            { code: '    return {"message": "Привет!"}', note: 'Что вернёт функция — то и получит клиент в ответ, в формате JSON (FastAPI сам превратит словарь в JSON)' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Что такое декоратор простыми словами',
          text: '@app.get("/") — это "наклейка" над функцией, которая меняет её поведение. Сама по себе функция read_root() ничего не знает про запросы — а декоратор говорит FastAPI: "запомни, что вот эту функцию нужно вызывать, когда придёт GET-запрос на путь /". Декораторы всегда пишутся с символа @ прямо над функцией.',
        },
        {
          type: 'p',
          text: 'Теперь нужно "включить" сервер — заставить его реально слушать запросы. Это делает uvicorn, через терминал.',
        },
      ],
      example: {
        title: 'main.py — первый настоящий сервер',
        lang: 'python',
        code: `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Привет!"}

@app.get("/about")
def about():
    return {"info": "Это мой первый сервер на FastAPI"}`,
        explanation: 'Этот файл сам по себе ничего не запускает — он просто ОПИСЫВАЕТ сервер. Чтобы реально его включить, нужно выполнить команду в терминале — смотри ниже.',
      },
      terminal: {
        title: 'Запускаем сервер',
        description: 'Так это выглядело бы на твоём компьютере: сначала ставим библиотеки, потом запускаем сервер командой uvicorn.',
        script: [
          { command: 'pip install fastapi uvicorn', type: 'success' },
          { command: 'uvicorn main:app --reload', type: 'success' },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description:
          'В браузере нельзя по-настоящему "открыть порт" и слушать интернет, поэтому здесь работает точная копия FastAPI — с теми же from fastapi import FastAPI и @app.get(...). Вместо настоящего запроса из браузера мы используем TestClient — способ "понарошку" отправить запрос прямо из кода (кстати, это по-настоящему используется и в реальных проектах, для тестирования).',
        initialCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Привет!"}

@app.get("/about")
def about():
    return {"info": "Это мой первый сервер на FastAPI"}

client = TestClient(app)

response = client.get("/")
print(response.status_code)
print(response.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: новый роут',
          difficulty: 'easy',
          description: 'Добавь в песочнице новый роут @app.get("/hello"), который возвращает {"text": "Привет от FastAPI"}. Проверь его через client.get("/hello").',
          hints: ['Копируй структуру существующих роутов: декоратор, функция, return со словарём', 'Не забудь client.get("/hello") и print() для проверки'],
        },
        {
          title: 'Задание 2: разбери uvicorn main:app',
          difficulty: 'medium',
          description: 'В терминале ниже (в разделе "Терминал") введи команду uvicorn main:app --reload и прочитай вывод. Затем своими словами (в комментарии # ...) объясни, что означают слова main и app в этой команде.',
          hints: [
            'main — это имя файла main.py (без расширения .py)',
            'app — это имя переменной внутри файла (app = FastAPI())',
            'То есть команда буквально говорит: "возьми переменную app из файла main.py и запусти её как сервер"',
          ],
        },
        {
          title: 'Задание 3: несколько запросов подряд',
          difficulty: 'hard',
          description: 'В песочнице сделай три разных запроса через client.get(...) к разным роутам (в том числе к несуществующему, например "/nope") и выведи для каждого response.status_code. Посмотри, какой код вернётся для несуществующего адреса.',
          hints: [
            'Несуществующий адрес должен вернуть 404 — точно так же, как это было бы у настоящего FastAPI',
            'Собери все три запроса и print() рядом, чтобы сравнить коды',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Запускать файл напрямую через python main.py и удивляться, что сервер не работает',
          right: 'FastAPI-сервер запускается не через python main.py, а через uvicorn main:app --reload — именно uvicorn "оживляет" приложение и заставляет его слушать запросы',
        },
        {
          wrong: 'Забыть скобки после FastAPI: app = FastAPI  (без вызова)',
          right: 'app = FastAPI()  — круглые скобки обязательны, они означают "создай приложение прямо сейчас". Без скобок app будет ссылаться на сам класс, а не на готовый объект',
        },
      ],
      checklist: [
        'Понимаю, что FastAPI — библиотека для написания сервера на Python',
        'Умею установить библиотеку через pip install',
        'Умею написать простой роут через @app.get(...)',
        'Понимаю, что запускает сервер именно uvicorn, а не сам файл python',
      ],
    },

    {
      id: 'path-query-params',
      title: 'Параметры пути и запроса',
      summary: 'Как принимать данные из адреса запроса — путь и query-параметры',
      theory: [
        {
          type: 'p',
          text: 'Пока наши роуты были "статичными" — фиксированный адрес всегда выдаёт одно и то же. Но обычно нужно, чтобы сервер учитывал КОНКРЕТНЫЕ данные из запроса — например, id нужного товара.',
        },
        {
          type: 'analogy',
          text: 'Представь: вместо одного адреса "стол номер 5" в ресторане у каждого столика свой номер, и официант понимает, к какому столику нести заказ, просто по номеру в адресе. Так же и в FastAPI: часть адреса может быть "переменной" — например, /users/5 или /users/42, и функция получает этот номер как параметр.',
        },
        {
          type: 'p',
          text: 'Такая "переменная часть" адреса называется параметром пути (path parameter). В FastAPI её обозначают фигурными скобками прямо в декораторе.',
        },
        {
          type: 'steps',
          title: 'Собираем параметр пути по кусочкам',
          items: [
            { code: '@app.get("/users/{user_id}")', note: '{user_id} в адресе — место, куда подставится любое значение из реального запроса, например число 5' },
            { code: 'def get_user(user_id: int):', note: 'Имя параметра функции ДОЛЖНО совпадать с именем в фигурных скобках. : int — это подсказка типа: FastAPI сам превратит текст из адреса в настоящее целое число' },
            { code: '    return {"id": user_id}', note: 'Теперь можно использовать user_id внутри функции как обычную переменную-число' },
          ],
        },
        {
          type: 'p',
          text: 'Есть и другой способ передавать данные — через query-параметры: то, что идёт после знака ? в адресе, например /search?q=книга. Их FastAPI тоже умеет принимать автоматически.',
        },
        {
          type: 'steps',
          title: 'Собираем query-параметр по кусочкам',
          items: [
            { code: '@app.get("/search")', note: 'В адресе декоратора query-параметры НЕ пишутся — только сам путь' },
            { code: 'def search(q: str = ""):', note: 'А вот в параметрах функции — да. Если имя параметра НЕ встречается в фигурных скобках пути, FastAPI автоматически считает его query-параметром. = "" задаёт значение по умолчанию — параметр необязателен' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Типы важны для FastAPI не просто так',
          text: 'Если написать user_id: int, а клиент пришлёт /users/abc (не число) — FastAPI сам, автоматически, без единой строчки твоего кода, ответит ошибкой 422 с понятным объяснением "value is not a valid integer". Это огромное преимущество FastAPI — проверка данных встроена в сам способ описания параметров.',
        },
      ],
      example: {
        title: 'Параметры пути и запроса вместе',
        lang: 'python',
        code: `from fastapi import FastAPI

app = FastAPI()

users = [
    {"id": 1, "name": "Аня"},
    {"id": 2, "name": "Борис"},
]

@app.get("/users/{user_id}")
def get_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            return user
    return {"error": "Пользователь не найден"}

@app.get("/users")
def list_users(name: str = ""):
    if not name:
        return users
    return [u for u in users if name.lower() in u["name"].lower()]`,
        explanation: '/users/{user_id} — параметр пути (обязателен, часть адреса). name в list_users — query-параметр (необязателен, идёт после ?name=...).',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь оба вида параметров через TestClient. Обрати внимание на путь с ? для query-параметра.',
        initialCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

users = [
    {"id": 1, "name": "Аня"},
    {"id": 2, "name": "Борис"},
]

@app.get("/users/{user_id}")
def get_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            return user
    return {"error": "Пользователь не найден"}

@app.get("/users")
def list_users(name: str = ""):
    if not name:
        return users
    return [u for u in users if name.lower() in u["name"].lower()]

client = TestClient(app)

print(client.get("/users/1").json())
print(client.get("/users?name=ан").json())`,
      },
      tasks: [
        {
          title: 'Задание 1: параметр пути для товара',
          difficulty: 'easy',
          description: 'Добавь список products и роут @app.get("/products/{product_id}"), который ищет товар по id (как в примере про users). Проверь через client.get("/products/1").',
          hints: ['Копируй структуру get_user, только для products', 'Не забудь product_id: int в параметрах функции'],
        },
        {
          title: 'Задание 2: query-параметр с числом',
          difficulty: 'medium',
          description: 'Добавь роут @app.get("/users") с query-параметром min_age: int = 0, который возвращает только пользователей старше указанного возраста (добавь в словари users поле age). Проверь client.get("/users?min_age=21").',
          hints: [
            'Добавь "age" в каждый словарь в users',
            'def list_by_age(min_age: int = 0): return [u for u in users if u["age"] >= min_age]',
          ],
          solution: `users = [
    {"id": 1, "name": "Аня", "age": 20},
    {"id": 2, "name": "Борис", "age": 25},
]

@app.get("/users")
def list_by_age(min_age: int = 0):
    return [u for u in users if u["age"] >= min_age]`,
        },
        {
          title: 'Задание 3: ошибка валидации типа',
          difficulty: 'hard',
          description: 'Вызови client.get("/users/abc") (не число вместо user_id) и посмотри на status_code и .json(). Объясни в комментарии, откуда взялась эта ошибка, хотя ты не писал код для её обработки.',
          hints: [
            'FastAPI сам проверяет, что user_id можно превратить в int — потому что ты написал user_id: int',
            'Ожидаемый код ответа — 422 (Unprocessable Entity)',
          ],
        },
      ],
      mistakes: [
        {
          wrong: '@app.get("/users/{id}")\ndef get_user(user_id: int):  — имя в фигурных скобках не совпадает с именем параметра функции',
          right: '@app.get("/users/{user_id}")\ndef get_user(user_id: int):  — имя в {фигурных скобках} и имя параметра функции должны совпадать буква в букву, иначе FastAPI не поймёт, откуда брать значение',
        },
        {
          wrong: 'Ожидать, что параметр без значения по умолчанию (name: str) будет необязательным',
          right: 'Если у параметра нет значения по умолчанию (= "..."), FastAPI считает его ОБЯЗАТЕЛЬНЫМ query-параметром — без него запрос завершится ошибкой 422. Если параметр должен быть необязательным — обязательно укажи значение по умолчанию',
        },
      ],
      checklist: [
        'Умею принимать параметр пути через {фигурные скобки} в декораторе',
        'Умею принимать query-параметр через обычный параметр функции со значением по умолчанию',
        'Понимаю, что подсказки типа (: int, : str) заставляют FastAPI автоматически проверять данные',
        'Понимаю, откуда берётся автоматическая ошибка 422',
      ],
    },

    {
      id: 'json-responses-docs',
      title: 'JSON-ответы и автодокументация',
      summary: 'Принимаем данные через POST и знакомимся со Swagger — документацией "из коробки"',
      theory: [
        {
          type: 'p',
          text: 'Мы уже научились ЧИТАТЬ данные (GET). Теперь научимся их ПРИНИМАТЬ от клиента, чтобы что-то создавать — например, добавить нового пользователя. Для этого используется тело запроса (request body) и метод POST.',
        },
        {
          type: 'analogy',
          text: 'GET — это когда ты просто спрашиваешь "какое у вас меню?". POST — это когда ты передаёшь официанту заполненный бланк заказа: "хочу вот это, вот это и вот это". Бланк с деталями заказа — это и есть "тело запроса".',
        },
        {
          type: 'p',
          text: 'Чтобы FastAPI понимал, каким должно быть тело запроса, используется библиотека Pydantic (она устанавливается вместе с FastAPI автоматически). Ты описываешь "форму бланка заказа" один раз — классом, похожим на те, что мы проходили в модуле 3.',
        },
        {
          type: 'steps',
          title: 'Собираем модель данных по кусочкам',
          items: [
            { code: 'from pydantic import BaseModel', note: 'BaseModel — родительский класс от Pydantic, от которого наследуются все "формы бланков"' },
            { code: 'class UserCreate(BaseModel):', note: 'Свой класс, унаследованный от BaseModel — точно как мы наследовали Dog от Animal в модуле 3' },
            { code: '    name: str\n    age: int', note: 'Просто перечисляем поля с их типами. Без __init__ — Pydantic сам создаст его за нас, с проверкой типов!' },
          ],
        },
        {
          type: 'steps',
          title: 'Используем модель в роуте',
          items: [
            { code: '@app.post("/users")', note: 'POST вместо GET — этот роут будет создавать, а не читать' },
            { code: 'def create_user(user: UserCreate):', note: 'Параметр user с типом UserCreate — FastAPI поймёт, что нужно взять JSON из тела запроса и превратить его в объект UserCreate, проверив все поля' },
            { code: '    return {"id": 1, "name": user.name}', note: 'Внутри функции user — это уже готовый объект с атрибутами user.name, user.age — как обычный объект класса из модуля 3' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Swagger — документация, которая появляется сама',
          text: 'Одна из лучших особенностей FastAPI: как только сервер запущен, по адресу /docs автоматически появляется страница со ВСЕМИ твоими роутами — с описанием параметров, возможностью их сразу попробовать прямо в браузере. Это называется Swagger UI. Тебе не нужно писать документацию отдельно — FastAPI собирает её сам, глядя на твой код (в том числе на типы параметров, которые ты указал).',
        },
        {
          type: 'p',
          text: 'Ещё одно важное преимущество Pydantic-моделей: если клиент пришлёт данные неправильного формата (например, забудет обязательное поле age) — FastAPI автоматически ответит статус-кодом 422 с понятным объяснением, что именно не так. Тебе не нужно проверять это вручную.',
        },
      ],
      example: {
        title: 'POST-роут с Pydantic-моделью',
        lang: 'python',
        code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    age: int

users = []

@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    new_user = {"id": len(users) + 1, "name": user.name, "age": user.age}
    users.append(new_user)
    return new_user

@app.get("/users")
def list_users():
    return users

# После запуска (uvicorn main:app --reload) открой в браузере:
# http://127.0.0.1:8000/docs`,
        explanation: 'status_code=201 в декораторе говорит FastAPI: "если всё прошло успешно, отвечай кодом 201 Created", вместо 200 по умолчанию.',
      },
      terminal: {
        title: 'Смотрим документацию',
        description: 'Так выглядел бы запуск и переход к Swagger на твоём компьютере.',
        script: [
          { command: 'uvicorn main:app --reload', type: 'success' },
          {
            command: 'curl http://127.0.0.1:8000/docs',
            output: '<!-- HTML-страница Swagger UI со списком всех твоих роутов, полями и кнопкой "Try it out" для проверки каждого запроса прямо в браузере -->',
            type: 'success',
          },
        ],
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь POST-запрос с телом через TestClient — и посмотри, что произойдёт, если отправить неполные данные.',
        initialCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    age: int

users = []

@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    new_user = {"id": len(users) + 1, "name": user.name, "age": user.age}
    users.append(new_user)
    return new_user

@app.get("/users")
def list_users():
    return users

client = TestClient(app)

response = client.post("/users", json={"name": "Аня", "age": 20})
print(response.status_code, response.json())

print(client.get("/users").json())

bad_response = client.post("/users", json={"name": "Боря"})
print(bad_response.status_code, bad_response.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: модель для товара',
          difficulty: 'easy',
          description: 'Создай класс ProductCreate(BaseModel) с полями name: str и price: float. Добавь роут POST /products, который создаёт товар и возвращает его. Проверь через client.post(...).',
          hints: ['Копируй структуру UserCreate и create_user', 'client.post("/products", json={"name": "Книга", "price": 500})'],
        },
        {
          title: 'Задание 2: необязательное поле в модели',
          difficulty: 'medium',
          description: 'Добавь в UserCreate необязательное поле is_admin: bool = False (значение по умолчанию, как в обычных функциях). Проверь, что можно создать пользователя, вообще не передавая is_admin, и он всё равно получит значение False.',
          hints: [
            'class UserCreate(BaseModel):\n    name: str\n    age: int\n    is_admin: bool = False',
            'client.post("/users", json={"name": "Аня", "age": 20}) — без is_admin в JSON',
          ],
          solution: `class UserCreate(BaseModel):
    name: str
    age: int
    is_admin: bool = False

@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    return {"name": user.name, "age": user.age, "is_admin": user.is_admin}

client = TestClient(app)
print(client.post("/users", json={"name": "Аня", "age": 20}).json())`,
        },
        {
          title: 'Задание 3: разбираем ошибку валидации',
          difficulty: 'hard',
          description: 'Отправь client.post("/users", json={"name": "Аня"}) — без обязательного поля age. Выведи response.status_code и response.json(). В комментарии объясни, что означает это сообщение об ошибке своими словами.',
          hints: [
            'Ожидаемый статус-код — 422',
            'В detail будет указано конкретное поле, которого не хватает — это то самое "бесплатное" преимущество Pydantic-моделей',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'class UserCreate(BaseModel):\n    def __init__(self, name, age):\n        ...  — попытка написать __init__ вручную, как в обычном классе',
          right: 'В Pydantic-моделях __init__ писать не нужно — достаточно перечислить поля с типами (name: str), а Pydantic сам создаст всё необходимое, включая проверку данных',
        },
        {
          wrong: 'Забыть, что POST без status_code=201 в декораторе вернёт 200, а не 201',
          right: 'По умолчанию FastAPI всегда отвечает 200 OK, даже для POST. Если по правилам REST при создании нужен именно 201 Created — укажи это явно: @app.post("/users", status_code=201)',
        },
      ],
      checklist: [
        'Понимаю, что Pydantic-модель описывает "форму" данных, которые ожидает роут',
        'Умею создать модель через class Модель(BaseModel) с полями и типами',
        'Умею принять тело запроса в роуте, указав параметр с типом модели',
        'Знаю, что документация Swagger доступна на /docs сама по себе, без дополнительного кода',
      ],
    },
  ],
};
