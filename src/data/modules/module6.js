export const module6 = {
  id: 'validation',
  order: 6,
  title: 'Валидация данных',
  icon: '✅',
  description: 'Pydantic-модели по-настоящему: сложные проверки, обработка ошибок, статус-коды.',
  lessons: [
    {
      id: 'pydantic-models',
      title: 'Pydantic-модели: форма для данных',
      summary: 'Что такое Pydantic-модель, зачем она нужна и как описать обязательные и необязательные поля',
      theory: [
        {
          type: 'p',
          text: 'В модуле 5 мы уже один раз использовали BaseModel, чтобы принять тело POST-запроса. Тогда мы просто скопировали структуру, не углубляясь. Теперь разберём подробно: что такое Pydantic-модель на самом деле и почему в FastAPI её используют почти везде.',
        },
        {
          type: 'analogy',
          text: 'Представь трафарет для вырезания снежинок из бумаги: у него есть отверстия строго определённой формы. Ты прикладываешь лист бумаги, обводишь — и получаешь фигуру именно той формы, что задана трафаретом, ни на миллиметр иначе. Pydantic-модель — такой же "трафарет", только для данных: она описывает, какой именно ФОРМЫ должны быть данные (какие поля обязаны быть, какого они типа), и пропускает дальше только то, что совпадает с этой формой. Всё остальное отсеивается ещё на входе, до того, как попадёт в твою функцию.',
        },
        {
          type: 'p',
          text: 'Без такого трафарета тебе пришлось бы вручную писать десятки проверок в начале каждой функции: "а есть ли поле name?", "а правда ли age — это число?", "а не отрицательное ли оно?". Pydantic берёт всю эту рутину на себя — тебе достаточно один раз описать форму данных.',
        },
        {
          type: 'steps',
          title: 'Из чего состоит модель',
          items: [
            { code: 'from pydantic import BaseModel', note: 'BaseModel — родительский класс, от которого наследуются все модели-трафареты' },
            { code: 'class UserProfile(BaseModel):', note: 'Свой класс, унаследованный от BaseModel — ровно так же, как мы наследовали классы в модуле 3' },
            { code: '    name: str', note: 'Поле name, обязательно должно быть строкой. Раз нет знака "=" — поле ОБЯЗАТЕЛЬНО' },
            { code: '    age: int', note: 'Поле age, обязательно целое число' },
            { code: '    bio: str = ""', note: 'А вот здесь есть "=" — значит, поле НЕОБЯЗАТЕЛЬНО. Если клиент его не пришлёт, bio станет пустой строкой' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Главное правило: наличие "=" решает всё',
          text: 'В Pydantic-модели поле обязательно ровно тогда, когда у него НЕТ значения по умолчанию. name: str — обязательно. bio: str = "" — необязательно, потому что есть значение по умолчанию ("" — пустая строка). Это то же самое правило, что и для обычных параметров функций в Python, которое мы проходили в модуле 2.',
        },
        {
          type: 'p',
          text: 'Когда FastAPI получает такую модель как параметр функции-роута, происходит целая цепочка событий ещё ДО того, как выполнится хоть одна строчка твоего кода: FastAPI берёт JSON из тела запроса → пытается создать из него объект модели → Pydantic проверяет каждое поле по трафарету → если всё совпало, объект передаётся в функцию; если нет — клиент получает ошибку 422, а твоя функция вообще не вызывается.',
        },
        {
          type: 'analogy',
          text: 'Это как охранник у входа с портретом на пропуске: он сверяет лицо ДО того, как ты попадёшь внутрь здания. Если лицо не совпадает — тебя развернут на входе, и никто внутри здания (твоя функция) даже не узнает, что ты приходил.',
        },
      ],
      example: {
        title: 'main.py — модель профиля пользователя',
        lang: 'python',
        code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserProfile(BaseModel):
    name: str
    age: int
    bio: str = ""

profiles = []

@app.post("/profiles", status_code=201)
def create_profile(profile: UserProfile):
    new_profile = {
        "id": len(profiles) + 1,
        "name": profile.name,
        "age": profile.age,
        "bio": profile.bio,
    }
    profiles.append(new_profile)
    return new_profile

@app.get("/profiles")
def list_profiles():
    return profiles`,
        explanation: 'name и age обязательны — без них Pydantic не даст создать объект UserProfile. bio необязателен: если его не прислать, он станет пустой строкой сам по себе.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь, что будет, если отправить полные данные, данные без необязательного поля и данные без обязательного поля.',
        initialCode: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()

class UserProfile(BaseModel):
    name: str
    age: int
    bio: str = ""

profiles = []

@app.post("/profiles", status_code=201)
def create_profile(profile: UserProfile):
    new_profile = {
        "id": len(profiles) + 1,
        "name": profile.name,
        "age": profile.age,
        "bio": profile.bio,
    }
    profiles.append(new_profile)
    return new_profile

client = TestClient(app)

full = client.post("/profiles", json={"name": "Аня", "age": 20, "bio": "Люблю Python"})
print(full.status_code, full.json())

without_bio = client.post("/profiles", json={"name": "Борис", "age": 25})
print(without_bio.status_code, without_bio.json())

without_age = client.post("/profiles", json={"name": "Вика"})
print(without_age.status_code, without_age.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: модель книги',
          difficulty: 'easy',
          description: 'Создай класс BookCreate(BaseModel) с обязательными полями title: str и pages: int, и необязательным полем is_read: bool = False. Добавь роут POST /books и проверь его через client.post(...) с полными и с неполными данными.',
          hints: [
            'Копируй структуру UserProfile один в один, просто с другими именами полей',
            'Проверь три случая: все поля, без is_read, без обязательного поля',
          ],
        },
        {
          title: 'Задание 2: два необязательных поля',
          difficulty: 'medium',
          description: 'Добавь в UserProfile ещё одно необязательное поле city: str = "Не указан". Проверь, что если прислать только name и age, в ответе появятся оба поля по умолчанию — и bio, и city.',
          hints: [
            'Значения по умолчанию можно добавлять к скольки угодно полям подряд',
            'Порядок полей в классе не важен для того, какие из них обязательны',
          ],
          solution: `class UserProfile(BaseModel):
    name: str
    age: int
    bio: str = ""
    city: str = "Не указан"

client = TestClient(app)
r = client.post("/profiles", json={"name": "Аня", "age": 20})
print(r.json())`,
        },
        {
          title: 'Задание 3: разбираем, что произошло без единой строчки твоего кода',
          difficulty: 'hard',
          description: 'Вызови client.post("/profiles", json={"name": "Аня"}) — без age. Выведи response.status_code и response.json(). В комментарии объясни своими словами: почему функция create_profile вообще не выполнилась (то есть новый профиль НЕ добавился в список profiles)?',
          hints: [
            'Pydantic не смог создать объект UserProfile из-за отсутствующего age — значит, до вызова create_profile дело не дошло вообще',
            'Проверь длину списка profiles после этого запроса — она не должна была измениться',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'class UserProfile(BaseModel):\n    name: str\n    age: int = 18\n    bio: str  — необязательное поле оказалось раньше обязательного',
          right: 'В реальном Pydantic порядок полей с значением по умолчанию не обязан идти строго после обязательных (в отличие от обычных функций Python) — но для читаемости кода лучше сначала перечислять обязательные поля, а потом — с умолчаниями',
        },
        {
          wrong: 'Ожидать, что profile.name сработает как обращение к словарю profile["name"]',
          right: 'Объект Pydantic-модели — это НЕ словарь, а обычный объект класса. К полям обращаются через точку: profile.name, а не profile["name"]. Если нужен словарь — используй profile.dict()',
        },
      ],
      checklist: [
        'Понимаю, что Pydantic-модель — это "трафарет", который проверяет форму данных',
        'Умею описать обязательное поле (без "=") и необязательное поле (со значением по умолчанию)',
        'Понимаю, что если данные не подходят под модель, функция-роут вообще не выполнится',
        'Умею обращаться к полям объекта модели через точку (profile.name)',
      ],
    },

    {
      id: 'validation-constraints-errors',
      title: 'Ограничения полей и ошибки валидации',
      summary: 'Field с условиями (больше нуля, минимальная длина), и что именно возвращает FastAPI, если данные не подходят',
      theory: [
        {
          type: 'p',
          text: 'Простой тип (str, int) — это только часть проверки. Иногда нужно проверить не просто "это число", а "это число больше нуля" (например, цена товара не может быть отрицательной). Для таких более точных проверок в Pydantic есть функция Field.',
        },
        {
          type: 'steps',
          title: 'Field с условиями',
          items: [
            { code: 'from pydantic import BaseModel, Field', note: 'Field импортируется вместе с BaseModel из pydantic' },
            { code: 'price: float = Field(gt=0)', note: 'gt = "greater than" ("больше чем") — цена обязана быть строго больше нуля. Field(gt=0) в этой позиции заменяет собой значение по умолчанию, но поле остаётся ОБЯЗАТЕЛЬНЫМ (Field без первого аргумента = ...)' },
            { code: 'name: str = Field(min_length=2, max_length=50)', note: 'min_length и max_length — ограничения на длину строки: имя не короче 2 и не длиннее 50 символов' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Полный список условий Field, которые пригодятся чаще всего',
          text: 'Для чисел: gt (больше), ge (больше или равно), lt (меньше), le (меньше или равно). Для строк и списков: min_length, max_length. Названия читаются почти как обычные слова: gt = greater than, ge = greater or equal, lt = less than, le = less or equal.',
        },
        {
          type: 'p',
          text: 'Теперь разберём подробно, что именно приходит клиенту, если данные не прошли проверку. Мы уже видели код 422 — но что внутри? Настоящий ответ выглядит примерно так же, как в нашей песочнице: список ошибок, а не одна ошибка.',
        },
        {
          type: 'steps',
          title: 'Разбираем одну ошибку валидации по кусочкам',
          items: [
            { code: '"loc": ["body", "price"]', note: 'loc (location — "местоположение") — где именно искать проблему. "body" значит "в теле запроса", "price" — конкретное поле' },
            { code: '"msg": "значение должно быть больше 0"', note: 'msg (message) — человекочитаемое объяснение, что именно не так' },
            { code: '"type": "value_error.number.not_gt"', note: 'type — техническое имя ошибки, по которому программа (не человек) может понять ТИП проблемы и обработать её автоматически' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'FastAPI сообщает о ВСЕХ ошибках сразу, а не только о первой',
          text: 'Если у тебя не так и name, и price одновременно, ты получишь список из двух ошибок в одном ответе — а не только первую. Это специально устроено так, чтобы клиенту (например, разработчику формы на сайте) не пришлось отправлять запрос заново десять раз подряд, каждый раз узнавая только об одной новой ошибке.',
        },
        {
          type: 'p',
          text: 'Важно отличать два разных вида ошибок. 422 — это ошибка ФОРМЫ данных: "ты прислал не то, что описывает модель" (не хватает поля, неправильный тип, число вне допустимых границ). А есть ошибки БИЗНЕС-ЛОГИКИ: сама форма заполнена правильно, но по смыслу так поступать нельзя — например, "пользователь с таким email уже существует". Для таких случаев форма верна, поэтому Pydantic тут ни при чём — используется HTTPException с кодом 400 (Bad Request), который мы уже видели в модуле 5.',
        },
      ],
      example: {
        title: 'Товар с ограничениями и проверкой на дубликат',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0)

products = []

@app.post("/products", status_code=201)
def create_product(product: ProductCreate):
    # Это проверка БИЗНЕС-ЛОГИКИ, а не формы — поэтому не Pydantic, а HTTPException
    for existing in products:
        if existing["name"] == product.name:
            raise HTTPException(400, f'Товар "{product.name}" уже существует')

    new_product = {"id": len(products) + 1, "name": product.name, "price": product.price}
    products.append(new_product)
    return new_product`,
        explanation: 'Если name или price не проходят Field-ограничения — это 422 (проблема формы, обрабатывает Pydantic). Если товар с таким именем уже есть — это 400 (проблема смысла, обрабатываешь ты сам через HTTPException).',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь три случая: правильные данные, данные с нарушенными ограничениями (сразу два поля неправильные) и повторное имя товара.',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

app = FastAPI()

class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0)

products = []

@app.post("/products", status_code=201)
def create_product(product: ProductCreate):
    for existing in products:
        if existing["name"] == product.name:
            raise HTTPException(400, f'Товар "{product.name}" уже существует')
    new_product = {"id": len(products) + 1, "name": product.name, "price": product.price}
    products.append(new_product)
    return new_product

client = TestClient(app)

ok = client.post("/products", json={"name": "Книга", "price": 500})
print(ok.status_code, ok.json())

bad_form = client.post("/products", json={"name": "К", "price": -5})
print(bad_form.status_code)
print(bad_form.json())

duplicate = client.post("/products", json={"name": "Книга", "price": 300})
print(duplicate.status_code, duplicate.json())`,
      },
      tasks: [
        {
          title: 'Задание 1: ограничение на возраст',
          difficulty: 'easy',
          description: 'Добавь в модель UserProfile (из прошлого урока, или создай заново) поле age: int = Field(ge=0, le=120). Проверь через client.post(...), что значение age=200 вызывает ошибку 422, а age=30 проходит.',
          hints: ['ge=0 — не может быть отрицательным, le=120 — разумный верхний предел', 'Не забудь Field импортировать из pydantic'],
        },
        {
          title: 'Задание 2: своя проверка бизнес-логики',
          difficulty: 'medium',
          description: 'В роуте create_product добавь вторую проверку: если price больше 1 000 000, поднимай HTTPException(400, "Слишком дорогой товар для этого магазина"). Проверь оба случая: дорогой товар и обычный.',
          hints: [
            'Это условие про смысл цены, а не про её формат — поэтому HTTPException, а не Field',
            'if product.price > 1_000_000: raise HTTPException(400, "...")',
          ],
          solution: `@app.post("/products", status_code=201)
def create_product(product: ProductCreate):
    if product.price > 1_000_000:
        raise HTTPException(400, "Слишком дорогой товар для этого магазина")
    for existing in products:
        if existing["name"] == product.name:
            raise HTTPException(400, f'Товар "{product.name}" уже существует')
    new_product = {"id": len(products) + 1, "name": product.name, "price": product.price}
    products.append(new_product)
    return new_product`,
        },
        {
          title: 'Задание 3: читаем список ошибок',
          difficulty: 'hard',
          description: 'Отправь client.post("/products", json={"name": "К", "price": -5}) — сразу с двумя нарушениями. Выведи response.json()["detail"] и посмотри, сколько ошибок внутри списка. В комментарии распиши для КАЖДОЙ ошибки: какое поле, что не так и что означает поле type.',
          hints: [
            'response.json()["detail"] — это список (list), можно пройтись по нему циклом for',
            'Ожидается ровно 2 элемента в списке — по одному на каждое нарушенное условие',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'price: float = Field(gt=0, default=100)  — попытка одновременно указать позиционное значение и default',
          right: 'Field(default) принимает значение по умолчанию ПЕРВЫМ позиционным аргументом: Field(100, gt=0). Если вообще не передать значение по умолчанию, поле остаётся обязательным, даже несмотря на использование Field',
        },
        {
          wrong: 'raise HTTPException(422, "Такой товар уже есть")  — использовать 422 для ошибки бизнес-логики',
          right: '422 предназначен для ошибок ФОРМЫ данных и генерируется автоматически самим Pydantic. Для ошибок, связанных со смыслом (дубликаты, нарушение правил), правильно использовать HTTPException с кодом 400',
        },
      ],
      checklist: [
        'Умею добавлять условия к полям через Field (gt, ge, lt, le, min_length, max_length)',
        'Понимаю структуру одной ошибки валидации: loc, msg, type',
        'Знаю, что FastAPI сообщает сразу обо ВСЕХ ошибках формы, а не по одной',
        'Понимаю разницу между 422 (проблема формы, обрабатывает Pydantic) и 400 (проблема смысла, обрабатываю сам через HTTPException)',
      ],
    },

    {
      id: 'http-status-codes',
      title: 'HTTP статус-коды простыми словами',
      summary: 'Что означают коды 200, 201, 204, 400, 401, 403, 404, 422, 500 — и как их расставлять в FastAPI',
      theory: [
        {
          type: 'p',
          text: 'Мы уже несколько раз видели разные числа рядом с ответом сервера: 200, 201, 404, 422... Настало время разобрать их по-настоящему. Статус-код — это трёхзначное число, которое сервер прикладывает к КАЖДОМУ ответу, чтобы клиент сразу понимал, как всё прошло, даже не читая текст ответа.',
        },
        {
          type: 'analogy',
          text: 'Представь, что после каждого твоего запроса официант (сервер) приносит не только еду, но и маленькую карточку одного из трёх цветов. Зелёная карточка (коды 2xx) — "всё прошло отлично, вот твой заказ". Жёлтая карточка (коды 4xx) — "тут проблема с ТВОИМ заказом" (не то попросил, забыл сказать нужное, не имеешь права это заказывать). Красная карточка (коды 5xx) — "проблема на КУХНЕ, ты тут ни при чём, это мы всё сломали".',
        },
        {
          type: 'list',
          title: 'Самые частые коды и их смысл на человеческом языке',
          items: [
            '200 OK — всё прошло успешно, вот результат (обычный ответ на GET)',
            '201 Created — успешно, и в результате СОЗДАЛОСЬ что-то новое (обычно ответ на POST)',
            '204 No Content — успешно, но отвечать нечем (например, после удаления — просто "готово", без тела ответа)',
            '400 Bad Request — запрос в принципе не имеет смысла (например, нарушено бизнес-правило)',
            '401 Unauthorized — сервер не понимает, кто ты (не пришёл токен или пароль) — подробнее в модуле про аутентификацию',
            '403 Forbidden — сервер точно знает, кто ты, но тебе сюда нельзя (не хватает прав)',
            '404 Not Found — того, что ты просишь, просто не существует по этому адресу',
            '422 Unprocessable Entity — данные пришли не той формы, какую ожидала модель (это код специально для ошибок Pydantic)',
            '500 Internal Server Error — что-то сломалось у сервера, и это НЕ вина клиента',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Как запомнить разницу между 401 и 403',
          text: '401 — "я не знаю, кто ты" (как будто у входа вообще не показал пропуск). 403 — "я знаю, кто ты, но конкретно сюда тебе нельзя" (пропуск есть, но в этот кабинет не пускают). Это два разных этапа: сначала аутентификация (401, если провалилась), потом авторизация (403, если провалилась она).',
        },
        {
          type: 'steps',
          title: 'Как указывать коды в FastAPI',
          items: [
            { code: '@app.post("/items", status_code=201)', note: 'status_code в декораторе — код, который вернётся, если функция отработает без ошибок' },
            { code: 'raise HTTPException(404, "Товар не найден")', note: 'HTTPException всегда прерывает выполнение немедленно и возвращает указанный код с сообщением' },
            { code: 'from fastapi import status\n...\nraise HTTPException(status.HTTP_404_NOT_FOUND, "...")', note: 'fastapi.status содержит именованные константы вместо голых чисел — код становится понятнее для человека, который его читает' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: '500 — это ВСЕГДА признак необработанной ошибки в твоём коде',
          text: 'В отличие от всех кодов 4xx (которые ты выбираешь и поднимаешь сам через HTTPException), 500 появляется САМ, когда в твоём коде происходит непредвиденная ошибка Python (например, деление на ноль или обращение по несуществующему ключу словаря), которую ты не обработал заранее. Клиент не может ничего исправить в своём запросе, чтобы получить другой ответ — ошибка не на его стороне. В реальном проекте появление 500 в логах — сигнал разработчику: "здесь не хватает try/except или проверки условия".',
        },
      ],
      example: {
        title: 'Разные статус-коды в одном сервере',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException, status

app = FastAPI()

items = {1: {"name": "Книга"}, 2: {"name": "Ручка"}}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Товар не найден")
    return items[item_id]

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Товар не найден")
    del items[item_id]
    return None

@app.get("/broken")
def broken():
    # Здесь специально нет проверки — ошибка не поймана, и FastAPI сам ответит 500
    return 1 / 0`,
        explanation: 'get_item и delete_item поднимают ожидаемые ошибки через HTTPException (это код, который написал ты). broken() не ловит свою ошибку деления на ноль — FastAPI сам превратит её в 500, без твоего участия.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь все три семьи кодов на одном сервере: успех, ошибку клиента и необработанную ошибку сервера.',
        initialCode: `from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient

app = FastAPI()

items = {1: {"name": "Книга"}, 2: {"name": "Ручка"}}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Товар не найден")
    return items[item_id]

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Товар не найден")
    del items[item_id]
    return None

@app.get("/broken")
def broken():
    return 1 / 0

client = TestClient(app)

print("успех:", client.get("/items/1").status_code, client.get("/items/1").json())
print("нет товара:", client.get("/items/999").status_code, client.get("/items/999").json())
print("удаление:", client.delete("/items/2").status_code)
print("удаление ещё раз:", client.delete("/items/2").status_code)
print("сломанный роут:", client.get("/broken").status_code, client.get("/broken").json())`,
      },
      tasks: [
        {
          title: 'Задание 1: 403 для чужого товара',
          difficulty: 'easy',
          description: 'Добавь товарам поле owner (например, {"name": "Книга", "owner": "anya"}). Напиши роут DELETE /items/{item_id} с query-параметром requester: str, который возвращает 403, если requester не совпадает с owner товара, и удаляет товар, если совпадает.',
          hints: ['raise HTTPException(status.HTTP_403_FORBIDDEN, "Это не твой товар")', 'client.delete("/items/1?requester=boris") — не тот пользователь'],
        },
        {
          title: 'Задание 2: именованные константы вместо чисел',
          difficulty: 'medium',
          description: 'Перепиши все HTTPException и status_code в примере так, чтобы вместо голых чисел (404, 204...) везде использовались константы из fastapi.status (например, status.HTTP_404_NOT_FOUND). Убедись, что песочница по-прежнему возвращает те же самые коды.',
          hints: ['from fastapi import status уже есть в примере', 'status.HTTP_204_NO_CONTENT равен числу 204 — поведение не меняется, меняется только читаемость кода'],
        },
        {
          title: 'Задание 3: намеренно вызови 500 и объясни разницу',
          difficulty: 'hard',
          description: 'Добавь роут @app.get("/divide/{a}/{b}") с параметрами a: int, b: int, который возвращает {"result": a / b}. Вызови client.get("/divide/10/0"). В комментарии объясни: почему это 500, а не 422 — ведь оба числа отлично прошли проверку типов int?',
          hints: [
            '422 отвечает за ФОРМУ данных (a и b — правда целые числа, тут всё верно)',
            'Деление на ноль — это ошибка, которая происходит уже ВНУТРИ функции, после успешной валидации, поэтому это 500',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'raise HTTPException(500, "Сервер сломался")  — вручную поднимать 500 "на всякий случай"',
          right: '500 не нужно поднимать вручную почти никогда — он появляется САМ, когда возникает необработанная ошибка. Если ты знаешь заранее, что может пойти не так, используй конкретный код 4xx (400/404/403) — это гораздо понятнее для клиента',
        },
        {
          wrong: 'Использовать 200 для абсолютно всех успешных ответов, включая создание нового объекта',
          right: 'Для создания нового объекта (POST) по правилам REST принято использовать 201 Created, а не 200 — это явно говорит клиенту "что-то новое появилось", а не просто "запрос прошёл"',
        },
      ],
      checklist: [
        'Понимаю разницу между семьями кодов: 2xx (успех), 4xx (ошибка клиента), 5xx (ошибка сервера)',
        'Знаю значение основных кодов: 200, 201, 204, 400, 401, 403, 404, 422, 500',
        'Понимаю разницу между 401 ("не знаю кто ты") и 403 ("знаю, но нельзя")',
        'Умею задать код через status_code в декораторе и через HTTPException',
        'Понимаю, что 500 появляется сам при необработанной ошибке, а не поднимается вручную',
      ],
    },
  ],
};
