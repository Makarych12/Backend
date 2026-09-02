export const module9 = {
  id: 'architecture',
  order: 9,
  title: 'Архитектура приложения',
  icon: '🏛️',
  description: 'Роуты, сервисы, репозитории и Dependency Injection в FastAPI.',
  lessons: [
    {
      id: 'why-architecture',
      title: 'Зачем вообще нужна архитектура',
      summary: 'Что идёт не так, когда весь код живёт в одном файле, и почему это становится всё больнее со временем',
      theory: [
        {
          type: 'p',
          text: 'Во всех предыдущих модулях мы писали весь код одним куском — роуты, данные и правила вперемешку в одном файле. Для маленьких учебных примеров это совершенно нормально. Но представь, что твой проект вырос до сотен роутов и тысяч строк кода. Именно тогда на первый план выходит АРХИТЕКТУРА — то, как ты организуешь код, а не то, что он делает.',
        },
        {
          type: 'analogy',
          text: 'Архитектура — это как порядок в доме. Представь квартиру, где абсолютно всё свалено в одну комнату: одежда, посуда, инструменты, еда — одной большой кучей. Формально все вещи "на месте", но найти конкретную ложку займёт вечность, а доставая нужную вещь, легко случайно что-то опрокинуть или сломать рядом. Теперь представь квартиру с отдельными комнатами: кухня — для готовки, спальня — для сна, кладовка — для инструментов. У каждой комнаты одна чёткая роль, и любой человек (включая тебя самого через полгода) сразу понимает, где что искать.',
        },
        {
          type: 'list',
          title: 'Признаки того, что файлу пора "разъехаться по комнатам"',
          items: [
            'Файл настолько длинный, что приходится подолгу скроллить, чтобы найти нужное место',
            'Одно и то же правило (например, проверка возраста) скопировано в нескольких местах — и рано или поздно копии начинают отличаться друг от друга',
            'Двое разработчиков не могут одновременно менять код без постоянных конфликтов при слиянии (git merge conflict)',
            'Чтобы протестировать одно маленькое правило, приходится поднимать весь сервер целиком',
            'Новый человек в команде не может быстро понять, где именно живёт логика, отвечающая за конкретную вещь',
          ],
        },
        {
          type: 'p',
          text: 'Самая частая причина этих проблем — код, который выполняет сразу НЕСКОЛЬКО разных задач одновременно: один и тот же кусок кода одновременно и принимает HTTP-запрос, и решает бизнес-правила, и обращается к базе данных. Разберём это на конкретном, живом примере — двух похожих роутах, где одно и то же правило написано дважды.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Дублирование — это бомба замедленного действия',
          text: 'Если одно и то же правило записано в двух разных местах, рано или поздно кто-то поправит только ОДНУ из копий (например, во время срочного фикса за 5 минут до конца рабочего дня) — и копии начнут противоречить друг другу. Хуже всего, что такая рассинхронизация обычно остаётся незамеченной месяцами, пока на неё случайно не наткнётся реальный пользователь.',
        },
      ],
      example: {
        title: 'Одно и то же правило, случайно записанное дважды по-разному',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException

app = FastAPI()
users = []

@app.post("/users", status_code=201)
def create_user(name: str, age: int):
    if age < 0 or age > 120:
        raise HTTPException(400, "Некорректный возраст")
    user = {"id": len(users) + 1, "name": name, "age": age}
    users.append(user)
    return user

@app.put("/users/{user_id}")
def update_user(user_id: int, age: int):
    if age < 0 or age > 130:  # кто-то скопировал правило и случайно поменял 120 на 130
        raise HTTPException(400, "Некорректный возраст")
    for u in users:
        if u["id"] == user_id:
            u["age"] = age
            return u
    raise HTTPException(404, "Не найден")`,
        explanation: 'Правило "возраст не больше 120" списано в update_user из create_user — но при копировании число случайно изменилось на 130. Теперь создать пользователя с возрастом 125 нельзя, а вот ОБНОВИТЬ уже существующего до 125 — можно. Два места, которые должны говорить одно и то же, говорят разное.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Убедись своими глазами, что дублированное правило действительно разъехалось: одно и то же значение возраста ведёт себя по-разному в двух разных роутах.',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()
users = []

@app.post("/users", status_code=201)
def create_user(name: str, age: int):
    if age < 0 or age > 120:
        raise HTTPException(400, "Некорректный возраст")
    user = {"id": len(users) + 1, "name": name, "age": age}
    users.append(user)
    return user

@app.put("/users/{user_id}")
def update_user(user_id: int, age: int):
    if age < 0 or age > 130:
        raise HTTPException(400, "Некорректный возраст")
    for u in users:
        if u["id"] == user_id:
            u["age"] = age
            return u
    raise HTTPException(404, "Не найден")

client = TestClient(app)

print("создать с возрастом 20:", client.post("/users?name=Аня&age=20").status_code)
print("создать с возрастом 125:", client.post("/users?name=Странно&age=125").status_code)
print("обновить тем же 125:", client.put("/users/1?age=125").status_code, client.put("/users/1?age=125").json())`,
      },
      tasks: [
        {
          title: 'Задание 1: почини расхождение, не убирая дублирование',
          difficulty: 'easy',
          description: 'Самый простой (но не идеальный) способ починить баг — просто исправить 130 обратно на 120 в update_user. Сделай это и убедись, что оба роута снова ведут себя одинаково на возрасте 125.',
          hints: ['Правило должно быть одинаковым в обоих местах: age < 0 or age > 120', 'Это чинит СИМПТОМ, но не саму причину — дублирование остаётся'],
        },
        {
          title: 'Задание 2: вынеси правило в отдельную функцию',
          difficulty: 'medium',
          description: 'Напиши функцию validate_age(age: int), которая поднимает HTTPException(400, ...), если возраст некорректен, и вызови её из ОБОИХ роутов вместо повторения условия. Теперь правило существует только в одном месте.',
          hints: [
            'def validate_age(age):\n    if age < 0 or age > 120:\n        raise HTTPException(400, "Некорректный возраст")',
            'В обоих роутах первой строкой вызови validate_age(age)',
          ],
          solution: `def validate_age(age: int):
    if age < 0 or age > 120:
        raise HTTPException(400, "Некорректный возраст")

@app.post("/users", status_code=201)
def create_user(name: str, age: int):
    validate_age(age)
    user = {"id": len(users) + 1, "name": name, "age": age}
    users.append(user)
    return user

@app.put("/users/{user_id}")
def update_user(user_id: int, age: int):
    validate_age(age)
    for u in users:
        if u["id"] == user_id:
            u["age"] = age
            return u
    raise HTTPException(404, "Не найден")`,
        },
        {
          title: 'Задание 3: докажи, что теперь расхождение невозможно',
          difficulty: 'hard',
          description: 'После задания 2 попробуй специально "испортить" правило только в одном месте — например, поменяй 120 на 130 ТОЛЬКО внутри вызова в update_user (например, временно допиши отдельную проверку рядом). Заметь, насколько СЛОЖНЕЕ теперь случайно создать расхождение, раз правило хранится в одном общем месте. Опиши в комментарии, почему это именно так.',
          hints: [
            'Чтобы испортить правило только в одном месте, теперь нужно ОТДЕЛЬНО дублировать код заново — а это уже осознанное действие, а не случайная опечатка при копировании',
            'Единственный источник правды (validate_age) означает: почини баг один раз — почини его везде',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Копировать кусок кода в новый роут "по образцу" вместо того, чтобы вызвать общую функцию',
          right: 'Если один и тот же код нужен в двух местах — самое время вынести его в отдельную функцию и вызывать её из обоих мест. Задача архитектуры — не "красота", а защита от подобных расхождений',
        },
        {
          wrong: 'Считать, что архитектура нужна только "большим проектам корпораций", а маленький учебный проект в ней не нуждается',
          right: 'Привычки складываются на маленьких проектах. Проект, который начинается с одного файла "на скорую руку", очень редко вовремя "останавливается и переписывается" — обычно он просто продолжает расти в том же виде, в каком был начат',
        },
      ],
      checklist: [
        'Понимаю архитектуру как способ организации кода, а не как что-то, что меняет ЧТО делает программа',
        'Умею распознать признаки того, что коду пора "разъехаться по комнатам"',
        'Понимаю на конкретном примере, как дублирование правила приводит к незаметному расхождению',
        'Умею вынести повторяющееся правило в отдельную функцию',
      ],
    },

    {
      id: 'layered-architecture',
      title: 'Слоистая архитектура: роуты, сервисы, репозитории',
      summary: 'Три главные "комнаты" типичного backend-проекта и что именно должно жить в каждой из них',
      theory: [
        {
          type: 'p',
          text: 'Продолжим аналогию с квартирой из прошлого урока. В подавляющем большинстве backend-проектов на FastAPI код принято раскладывать по трём главным "комнатам": роуты, сервисы и репозитории. У каждой — своя, чётко ограниченная работа.',
        },
        {
          type: 'analogy',
          text: 'Представь ресторан. Официант (роут) принимает заказ у посетителя и приносит готовое блюдо обратно — но сам НЕ готовит и не решает, что вообще можно заказать. Повар (сервис) знает рецепты и бизнес-правила кухни ("если гостю меньше 18 — алкоголь не наливаем"), но сам не ходит в кладовку за продуктами. Кладовщик (репозиторий) — единственный, кто знает, где именно на складе лежат продукты, и просто выдаёт нужное количество по запросу повара.',
        },
        {
          type: 'list',
          title: 'Что именно должно жить в каждом слое',
          items: [
            'Роут (routes/endpoints) — принимает HTTP-запрос, проверяет форму данных (Pydantic), вызывает нужный сервис и превращает результат обратно в HTTP-ответ. НЕ содержит бизнес-правил и не обращается к базе напрямую',
            'Сервис (services) — вся бизнес-логика и правила ("нельзя зарегистрироваться младше 18 лет", "скидка не может быть больше 50%"). НЕ знает вообще ничего про HTTP, роуты или коды состояния',
            'Репозиторий (repositories) — единственное место, которое умеет доставать и сохранять данные (SQL-запросы, вызовы ORM). НЕ содержит бизнес-правил — просто выполняет то, что попросили',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Главная выгода: сервис можно проверить БЕЗ единого HTTP-запроса',
          text: 'Раз сервис ничего не знает про HTTP, его можно вызвать напрямую в обычном Python-коде — например, в тесте — вообще не поднимая сервер и не отправляя запросы. Это делает тестирование бизнес-правил быстрым и простым, в отличие от кода, где HTTP, правила и база данных перемешаны в одной функции.',
        },
        {
          type: 'p',
          text: 'Ниже — тот же самый пример с пользователями, но разложенный по трём слоям. Обрати внимание: в реальном проекте каждый класс жил бы в своём отдельном файле (это разберём в следующем уроке) — здесь всё в одной песочнице только для удобства.',
        },
      ],
      example: {
        title: 'Три слоя: репозиторий → сервис → роут',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException

app = FastAPI()

# ---------- РЕПОЗИТОРИЙ: единственное место, которое знает про хранение данных ----------
class UserRepository:
    def __init__(self):
        self._users = {}
        self._next_id = 1

    def add(self, name: str, age: int) -> dict:
        user = {"id": self._next_id, "name": name, "age": age}
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def get(self, user_id: int):
        return self._users.get(user_id)


# ---------- СЕРВИС: бизнес-правила, ничего не знает про HTTP ----------
class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register_user(self, name: str, age: int) -> dict:
        if age < 18:
            raise ValueError("Регистрация доступна только с 18 лет")
        return self.repo.add(name, age)

    def find_user(self, user_id: int) -> dict:
        user = self.repo.get(user_id)
        if not user:
            raise LookupError("Пользователь не найден")
        return user


# ---------- РОУТЫ: принимают HTTP-запрос, вызывают сервис, отвечают HTTP-кодом ----------
repo = UserRepository()
service = UserService(repo)

@app.post("/users", status_code=201)
def create_user(name: str, age: int):
    try:
        return service.register_user(name, age)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.get("/users/{user_id}")
def get_user(user_id: int):
    try:
        return service.find_user(user_id)
    except LookupError as e:
        raise HTTPException(404, str(e))`,
        explanation: 'ValueError и LookupError — это обычные Python-исключения, никак не связанные с HTTP (сервис их даже не импортирует из fastapi). Именно роут решает, во ЧТО их превратить — в 400 или 404. Так сервис остаётся полностью независимым от факта, что его вообще вызывают через веб-сервер.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь, что сервис работает и через HTTP-роуты, и напрямую, в обычном Python-коде, без единого запроса.',
        initialCode: `from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

class UserRepository:
    def __init__(self):
        self._users = {}
        self._next_id = 1

    def add(self, name: str, age: int) -> dict:
        user = {"id": self._next_id, "name": name, "age": age}
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def get(self, user_id: int):
        return self._users.get(user_id)

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register_user(self, name: str, age: int) -> dict:
        if age < 18:
            raise ValueError("Регистрация доступна только с 18 лет")
        return self.repo.add(name, age)

    def find_user(self, user_id: int) -> dict:
        user = self.repo.get(user_id)
        if not user:
            raise LookupError("Пользователь не найден")
        return user

repo = UserRepository()
service = UserService(repo)

@app.post("/users", status_code=201)
def create_user(name: str, age: int):
    try:
        return service.register_user(name, age)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.get("/users/{user_id}")
def get_user(user_id: int):
    try:
        return service.find_user(user_id)
    except LookupError as e:
        raise HTTPException(404, str(e))

client = TestClient(app)
print("через HTTP:", client.post("/users?name=Аня&age=20").json())
print("несовершеннолетний через HTTP:", client.post("/users?name=Ребёнок&age=10").status_code)
print("не найден через HTTP:", client.get("/users/999").status_code)

# А теперь — напрямую, без единого HTTP-запроса
test_service = UserService(UserRepository())
print("сервис напрямую:", test_service.register_user("Прямой вызов", 30))
try:
    test_service.register_user("Малыш", 5)
except ValueError as e:
    print("правило сработало и без HTTP:", e)`,
      },
      tasks: [
        {
          title: 'Задание 1: слой для товаров',
          difficulty: 'easy',
          description: 'По образцу User создай ProductRepository и ProductService (с правилом: цена должна быть больше 0, иначе ValueError) и роуты POST /products и GET /products/{id}.',
          hints: ['Копируй структуру один в один, просто с другими именами и другим правилом', 'Не забудь try/except в роутах, превращающий ValueError в HTTPException(400, ...)'],
        },
        {
          title: 'Задание 2: найди нарушение слоёв',
          difficulty: 'medium',
          description: 'Добавь роут @app.get("/users-count"), который лезет НАПРЯМУЮ в repo._users (минуя сервис) и возвращает {"count": len(repo._users)}. Это нарушение слоистой архитектуры! В комментарии объясни, в чём именно проблема, и допиши в UserService метод count_users(), через который роут должен обращаться вместо repo напрямую.',
          hints: [
            'Роут не должен трогать repo._users напрямую — только через service',
            'def count_users(self):\n    return len(self.repo._users)',
          ],
        },
        {
          title: 'Задание 3: что не изменится при смене хранилища',
          difficulty: 'hard',
          description: 'Представь, что UserRepository переписан так, чтобы использовать SQLAlchemy вместо словаря (из модуля 7). Опиши в комментарии: какие строки кода в UserService и в роутах ПРИДЁТСЯ поменять при таком переходе, а какие — нет? Объясни, почему.',
          hints: [
            'UserService и роуты вызывают только repo.add(...) и repo.get(...) — им не важно, ЧТО происходит внутри этих методов',
            'Поменяться должна ТОЛЬКО реализация UserRepository — интерфейс (какие методы у него есть и что они возвращают) может остаться прежним',
          ],
        },
      ],
      mistakes: [
        {
          wrong: '@app.post("/users")\ndef create_user(name: str, age: int):\n    if age < 18: raise HTTPException(400, ...)\n    ...  — бизнес-правило прямо внутри роута',
          right: 'Правило "младше 18 нельзя" — это бизнес-логика, ей место в сервисе, а не в роуте. Роут должен оставаться "тонким": принять запрос, вызвать сервис, вернуть ответ',
        },
        {
          wrong: 'Роут напрямую обращается к repo, пропуская сервис (как в задании 2 выше)',
          right: 'Даже если действие кажется "простым чтением", пропуск сервиса означает, что бизнес-правила (например, будущая проверка прав доступа) легко забыть добавить именно в этом месте. Все обращения к данным должны идти через сервис',
        },
      ],
      checklist: [
        'Понимаю зону ответственности каждого слоя: роут / сервис / репозиторий',
        'Понимаю, почему сервис не должен ничего знать про HTTP-коды и HTTPException',
        'Умею разложить простой пример (создание + поиск) по всем трём слоям',
        'Понимаю, что сервис можно протестировать напрямую, без единого HTTP-запроса',
      ],
    },

    {
      id: 'dependency-injection',
      title: 'Dependency Injection в FastAPI',
      summary: 'Как получать уже готовые объекты вместо того, чтобы каждый раз собирать их вручную',
      theory: [
        {
          type: 'p',
          text: 'В прошлом уроке repo и service создавались как обычные переменные вне роутов: repo = UserRepository(); service = UserService(repo). Это работает, но неудобно масштабируется: что, если для теста нужен ДРУГОЙ репозиторий? Что, если сервис сам зависит от нескольких других сервисов? Пришлось бы вручную переписывать код каждого роута. Для этого в FastAPI есть Depends — мы уже использовали его в модуле 8 для аутентификации, но на самом деле это куда более общий инструмент.',
        },
        {
          type: 'analogy',
          text: 'Представь два способа приготовить ужин. Первый: самому съездить в один магазин за мукой, в другой за яйцами, в третий за молоком — и только потом начать готовить. Второй: заказать набор для готовки (meal kit), где все ингредиенты уже отмерены и приедут одной коробкой прямо к двери — остаётся просто открыть коробку и готовить. Dependency Injection ("внедрение зависимости") — это второй способ, только для кода: вместо того, чтобы каждая функция-роут сама вручную "собирала" себе нужные объекты, FastAPI сам подготавливает и доставляет их прямо в параметры функции.',
        },
        {
          type: 'steps',
          title: 'Превращаем создание сервиса в зависимость',
          items: [
            { code: 'def get_user_service() -> UserService:', note: 'Обычная функция, которая знает, КАК собрать готовый сервис (в реальном проекте — например, взять соединение с базой и обернуть его в репозиторий)' },
            { code: '    return UserService(_shared_repo)', note: '_shared_repo хранится один раз "снаружи" — репозиторий обычно долгоживущий объект (как настоящее соединение с базой), а вот сервис — лёгкий, его не жалко создавать заново' },
            { code: 'def create_user(name: str, age: int, service: UserService = Depends(get_user_service)):', note: 'FastAPI сам вызовет get_user_service() и подставит результат в параметр service — тебе не нужно делать это вручную внутри функции' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Главная выгода — подмена зависимости без переписывания роутов',
          text: 'В реальном FastAPI-проекте для тестов существует app.dependency_overrides — способ подменить get_user_service на версию с "игрушечным" тестовым репозиторием, ни строчки не меняя в самих роутах. Роуты просто просят "дай мне сервис" и не знают и не должны знать, откуда именно он берётся.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Честная разница между нашей песочницей и настоящим FastAPI',
          text: 'В настоящем FastAPI зависимость, использованная несколько раз в рамках ОДНОГО запроса, вызывается только один раз — результат переиспользуется (это называется кэшированием зависимости в рамках запроса). В нашей упрощённой песочнице каждая Depends(...) вызывается заново при каждом обращении — для наших примеров разницы не видно, но в реальном проекте с "дорогими" зависимостями (например, открытие соединения с базой) это важное отличие.',
        },
      ],
      example: {
        title: 'Сервис как зависимость через Depends',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException, Depends

app = FastAPI()

class UserRepository:
    def __init__(self):
        self._users = {}
        self._next_id = 1

    def add(self, name: str, age: int) -> dict:
        user = {"id": self._next_id, "name": name, "age": age}
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def get(self, user_id: int):
        return self._users.get(user_id)


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register_user(self, name: str, age: int) -> dict:
        if age < 18:
            raise ValueError("Регистрация доступна только с 18 лет")
        return self.repo.add(name, age)

    def find_user(self, user_id: int) -> dict:
        user = self.repo.get(user_id)
        if not user:
            raise LookupError("Пользователь не найден")
        return user


_shared_repo = UserRepository()  # "долгоживущий" объект — в реальном проекте так живёт пул соединений с БД

def get_user_service() -> UserService:
    return UserService(_shared_repo)


@app.post("/users", status_code=201)
def create_user(name: str, age: int, service: UserService = Depends(get_user_service)):
    try:
        return service.register_user(name, age)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.get("/users/{user_id}")
def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    try:
        return service.find_user(user_id)
    except LookupError as e:
        raise HTTPException(404, str(e))`,
        explanation: 'Оба роута просят один и тот же get_user_service — и ни один из них ни разу не написал UserService(...) вручную. Если однажды понадобится дополнительная настройка сервиса, менять придётся только одну функцию get_user_service, а не каждый роут по отдельности.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь, что оба роута действительно используют один и тот же общий репозиторий (данные, созданные через POST, видны в GET), и что сервис по-прежнему можно вызвать напрямую с чистым тестовым репозиторием.',
        initialCode: `from fastapi import FastAPI, HTTPException, Depends
from fastapi.testclient import TestClient

app = FastAPI()

class UserRepository:
    def __init__(self):
        self._users = {}
        self._next_id = 1

    def add(self, name: str, age: int) -> dict:
        user = {"id": self._next_id, "name": name, "age": age}
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def get(self, user_id: int):
        return self._users.get(user_id)

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register_user(self, name: str, age: int) -> dict:
        if age < 18:
            raise ValueError("Регистрация доступна только с 18 лет")
        return self.repo.add(name, age)

    def find_user(self, user_id: int) -> dict:
        user = self.repo.get(user_id)
        if not user:
            raise LookupError("Пользователь не найден")
        return user

_shared_repo = UserRepository()

def get_user_service() -> UserService:
    return UserService(_shared_repo)

@app.post("/users", status_code=201)
def create_user(name: str, age: int, service: UserService = Depends(get_user_service)):
    try:
        return service.register_user(name, age)
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.get("/users/{user_id}")
def get_user(user_id: int, service: UserService = Depends(get_user_service)):
    try:
        return service.find_user(user_id)
    except LookupError as e:
        raise HTTPException(404, str(e))

client = TestClient(app)
print(client.post("/users?name=Аня&age=20").json())
print(client.post("/users?name=Ребёнок&age=10").status_code)
print(client.get("/users/1").json())
print(client.get("/users/999").status_code)

test_service = UserService(UserRepository())
print("отдельный тестовый сервис:", test_service.register_user("Тест", 25))`,
      },
      tasks: [
        {
          title: 'Задание 1: зависимость для товаров',
          difficulty: 'easy',
          description: 'По образцу get_user_service создай get_product_service() -> ProductService и используй его через Depends в роутах для товаров (из задания прошлого урока).',
          hints: ['Структура один в один: _shared_repo снаружи, функция-зависимость возвращает новый сервис поверх него'],
        },
        {
          title: 'Задание 2: зависимость с параметром',
          difficulty: 'medium',
          description: 'Добавь роут @app.get("/users") с query-параметром min_age: int = 0 и НОВОЙ зависимостью-функцией get_users_filter(min_age: int = 0) -> int, которая просто возвращает min_age (зависимости тоже могут принимать параметры запроса!). В роуте выведи всех пользователей старше min_age, используя service.repo._users.',
          hints: [
            'def get_users_filter(min_age: int = 0) -> int:\n    return min_age',
            'def list_users(min_age: int = Depends(get_users_filter), service: UserService = Depends(get_user_service)):',
          ],
        },
        {
          title: 'Задание 3: подмени зависимость вручную',
          difficulty: 'hard',
          description: 'В нашей песочнице нет настоящего app.dependency_overrides, поэтому подмени зависимость "руками": напиши вторую функцию get_fake_user_service(), которая возвращает UserService с ЗАРАНЕЕ заполненным тестовым репозиторием (например, с уже одним существующим пользователем), и вызови её напрямую в коде (без Depends, просто как обычную функцию) — убедись, что get_user_service и get_fake_user_service дают полностью независимые друг от друга данные.',
          hints: [
            'def get_fake_user_service():\n    fake_repo = UserRepository()\n    fake_repo.add("Заготовка", 40)\n    return UserService(fake_repo)',
            'Убедись, что вызов get_fake_user_service() никак не влияет на _shared_repo, используемый настоящими роутами',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'service: UserService = Depends(UserService(repo))  — вызывать зависимость с готовым результатом вместо передачи самой функции',
          right: 'В Depends(...) передаётся ФУНКЦИЯ (без вызывающих скобок в конце неё самой) — FastAPI сам её вызовет в нужный момент: Depends(get_user_service), а не Depends(get_user_service())',
        },
        {
          wrong: 'Создавать repo = UserRepository() ЗАНОВО внутри каждой функции-зависимости',
          right: 'Если репозиторий хранит настоящее состояние (данные, соединение с базой), он должен быть создан один раз "снаружи" и переиспользоваться — иначе каждый запрос будет работать со своей независимой, всегда пустой копией данных',
        },
      ],
      checklist: [
        'Понимаю Dependency Injection как получение уже готового объекта вместо сборки его вручную',
        'Умею превратить создание сервиса в функцию-зависимость и подключить через Depends',
        'Понимаю разницу между "долгоживущим" репозиторием и "лёгким" сервисом, создаваемым заново',
        'Знаю, что в реальном FastAPI зависимости можно подменять для тестов через dependency_overrides',
      ],
    },

    {
      id: 'project-structure',
      title: 'Как организовать структуру проекта на практике',
      summary: 'Как разложить роуты, сервисы, репозитории и модели по папкам в настоящем проекте',
      theory: [
        {
          type: 'p',
          text: 'Всё, что мы проходили в этом модуле — роуты, сервисы, репозитории — в наших песочницах жило в одном файле только ради удобства обучения. В настоящем проекте каждая такая штука обычно живёт в своём собственном файле, а файлы группируются по папкам. Разберём одну из самых распространённых раскладок.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Это не единственно верная раскладка',
          text: 'Разные команды и разные проекты используют разные конкретные названия папок — и это нормально. Важна не точная структура из примера ниже, а САМ ПРИНЦИП: код группируется по тому, ЗА ЧТО он отвечает, а не по тому, к какой конкретной фиче он относится.',
        },
        {
          type: 'p',
          text: 'Отдельно стоит слово "модель" — оно означает РАЗНЫЕ вещи в разных частях проекта, и это частая путаница у новичков. models/ (SQLAlchemy) — описывает структуру ТАБЛИЦ в базе данных (модуль 7). schemas/ (Pydantic) — описывает форму данных ЗАПРОСОВ и ОТВЕТОВ по HTTP (модуль 6). Это два разных класса, даже если оба называются "User" — специально держи их в разных папках, чтобы не путать.',
        },
      ],
      example: {
        title: 'Типичная структура FastAPI-проекта',
        lang: 'bash',
        code: `project/
├── app/
│   ├── main.py              # создаёт FastAPI(), подключает все роутеры
│   ├── routers/
│   │   ├── users.py         # роуты, связанные с пользователями
│   │   └── products.py      # роуты, связанные с товарами
│   ├── services/
│   │   ├── user_service.py
│   │   └── product_service.py
│   ├── repositories/
│   │   ├── user_repository.py
│   │   └── product_repository.py
│   ├── models/
│   │   └── db_models.py     # SQLAlchemy-модели — структура таблиц (модуль 7)
│   ├── schemas/
│   │   └── user_schemas.py  # Pydantic-модели — форма запросов/ответов (модуль 6)
│   └── dependencies.py      # общие функции-зависимости (Depends)
├── alembic/
│   └── versions/            # файлы миграций (модуль 7)
├── tests/
│   └── test_users.py
├── requirements.txt          # список библиотек проекта (то, что ставит pip install -r)
└── .env                       # секреты и настройки (подробнее в модуле про безопасность)`,
        explanation: 'main.py остаётся маленьким: он только создаёт приложение и подключает роутеры из routers/ — вся содержательная логика живёт в других папках, каждая со своей ролью.',
      },
      tasks: [
        {
          title: 'Задание 1: разложи обязанности по папкам',
          difficulty: 'easy',
          description:
            'Для каждого из следующих кусков кода в комментарии укажи, в какой папке из структуры выше ему место: 1) "SELECT * FROM orders WHERE id = ?", 2) "if discount > 50: raise ValueError(...)", 3) "class OrderCreate(BaseModel): ...", 4) "@app.get(\'/orders/{id}\')", 5) "class Order(Base): __tablename__ = \'orders\'", 6) "app = FastAPI()".',
          hints: [
            '1 — repositories (SQL-запрос), 2 — services (бизнес-правило)',
            '3 — schemas (Pydantic), 4 — routers, 5 — models (SQLAlchemy), 6 — main.py',
          ],
        },
        {
          title: 'Задание 2: раздели гигантский main.py',
          difficulty: 'medium',
          description: 'Представь файл main.py на 800 строк, где вперемешку лежат 10 роутов, 10 функций с бизнес-правилами и 10 функций с SQL-запросами. Опиши (в комментарии, без кода) пошаговый план: в каком порядке ты бы стал раскладывать этот файл по папкам, чтобы в процессе сайт не переставал работать ни на минуту.',
          hints: [
            'Разумный порядок: сначала вынести repositories (они не зависят ни от чего), затем services (зависят только от repositories), последними — routers',
            'На каждом шаге можно временно оставлять "переходный" импорт из старого main.py, чтобы ничего не сломать резко',
          ],
        },
        {
          title: 'Задание 3: что изменится при смене базы данных',
          difficulty: 'hard',
          description: 'В проекте с такой структурой понадобилось перейти с SQLite на PostgreSQL (модуль 7). Опиши в комментарии, какие ИМЕННО папки/файлы придётся менять, а какие — гарантированно нет, и почему это возможно благодаря именно такой структуре, а не благодаря PostgreSQL самому по себе.',
          hints: [
            'Скорее всего: repositories/ (детали подключения) и, возможно, models/ — если появятся Postgres-специфичные типы столбцов',
            'services/ и routers/ трогать не придётся вообще — они работают через уже знакомый интерфейс репозитория, а не напрямую с базой',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Класть Pydantic-модель и SQLAlchemy-модель с одинаковым именем ("User") в один и тот же файл',
          right: 'Держи их в разных папках (schemas/ и models/) и, если нужно, с разными именами классов (например, UserSchema и UserModel) — иначе легко случайно перепутать, какой именно "User" импортирован в конкретном файле',
        },
        {
          wrong: 'Переносить весь проект на новую структуру папок за один гигантский коммит "переделал всё"',
          right: 'Переносить код по слоям постепенно (сначала repositories, потом services, потом routers), проверяя после каждого шага, что всё продолжает работать — это гораздо безопаснее одного огромного изменения',
        },
      ],
      checklist: [
        'Понимаю раскладку app/routers, app/services, app/repositories, app/models, app/schemas',
        'Понимаю разницу между models/ (SQLAlchemy, структура таблиц) и schemas/ (Pydantic, форма запросов)',
        'Понимаю, что конкретные названия папок менее важны, чем сам принцип разделения по ответственности',
        'Умею определить, в какую папку попадёт конкретный кусок кода, глядя на то, ЗА ЧТО он отвечает',
      ],
    },
  ],
};
