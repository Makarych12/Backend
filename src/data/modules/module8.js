export const module8 = {
  id: 'auth',
  order: 8,
  title: 'Аутентификация',
  icon: '🔐',
  description: 'JWT, хеширование паролей, OAuth2 в FastAPI.',
  lessons: [
    {
      id: 'authn-vs-authz',
      title: 'Аутентификация и авторизация — это разное',
      summary: 'Разбираемся в разнице между «кто ты?» и «что тебе можно?» и учимся отвечать 401 и 403 по делу',
      theory: [
        {
          type: 'p',
          text: 'В модуле 6 мы уже узнали про коды 401 и 403, но не разобрались до конца, откуда они берутся. За этими двумя кодами стоят два разных понятия, которые новички почти всегда путают: аутентификация и авторизация. Разберём их по отдельности — дальше это станет основой для JWT и OAuth2.',
        },
        {
          type: 'analogy',
          text: 'Представь большой офис с охраной на входе и разными кабинетами внутри. На входе охранник проверяет твой пропуск и убеждается, кто ты — это АУТЕНТИФИКАЦИЯ, ответ на вопрос "кто ты?". Дальше, уже внутри здания, разные двери открыты разным людям в зависимости от их должности: стажёру нельзя в серверную, а системному администратору — можно. Это АВТОРИЗАЦИЯ, ответ на вопрос "а конкретно ЭТО тебе можно?".',
        },
        {
          type: 'p',
          text: 'Это ровно те же самые два шага, что происходят при обычном запросе к серверу: сначала сервер должен понять, КТО отправил запрос (аутентификация), и только потом — решить, МОЖНО ли этому конкретному человеку делать то, что он просит (авторизация).',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Именно поэтому существуют два разных кода ошибки',
          text: '401 Unauthorized — провалился первый шаг: сервер вообще не смог понять, кто ты (не пришёл токен, неверный пароль). 403 Forbidden — первый шаг прошёл успешно (сервер точно знает, кто ты), но второй шаг провалился: именно тебе конкретно сюда нельзя. Одна из самых частых ошибок в реальных проектах — перепутать эти два кода местами.',
        },
        {
          type: 'steps',
          title: 'Как это выглядит в виде функций',
          items: [
            { code: 'def authenticate(token):', note: 'Первый шаг: получает "пропуск" (токен/заголовок) и возвращает объект пользователя — либо поднимает 401, если пропуск не распознан' },
            { code: '    ...\n    return user', note: 'Если пропуск валиден — возвращает конкретного пользователя, для которого он выдан' },
            { code: 'def authorize(user, required_role):', note: 'Второй шаг: получает УЖЕ известного пользователя и проверяет, хватает ли ему прав — либо поднимает 403' },
            { code: '    if user.role != required_role:\n        raise HTTPException(403, ...)', note: 'Обрати внимание: authorize вызывается ПОСЛЕ authenticate, и никогда не наоборот — нельзя проверить права у пользователя, которого ещё не определили' },
          ],
        },
        {
          type: 'p',
          text: 'Самый простой вид авторизации — по ролям (role-based): у каждого пользователя есть роль (например, "user" или "admin"), и конкретные действия разрешены только определённым ролям. Именно так чаще всего устроена авторизация в небольших и средних проектах.',
        },
      ],
      example: {
        title: 'Удаление пользователя — только для admin',
        lang: 'python',
        code: `from fastapi import FastAPI, HTTPException, Header

app = FastAPI()

tokens_db = {
    "anya-secret-token": {"username": "anya", "role": "admin"},
    "boris-secret-token": {"username": "boris", "role": "user"},
}

def authenticate(authorization: str) -> dict:
    if not authorization or authorization not in tokens_db:
        raise HTTPException(401, "Не удалось определить, кто ты")
    return tokens_db[authorization]

def authorize(user: dict, required_role: str):
    if user["role"] != required_role:
        raise HTTPException(403, f"Нужна роль {required_role}, а у тебя {user['role']}")

@app.delete("/users/{user_id}")
def delete_user(user_id: int, authorization: str = Header(None)):
    user = authenticate(authorization)   # шаг 1: кто ты?
    authorize(user, "admin")             # шаг 2: тебе можно?
    return {"deleted": user_id}`,
        explanation: 'authorization: str = Header(None) — заголовок необязателен (значение по умолчанию None), поэтому если его нет, авторизация 401 поднимается внутри authenticate() самостоятельно, с понятным сообщением, а не автоматической ошибкой 422.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Проверь все четыре ситуации: правильный токен админа, токен обычного пользователя, отсутствие токена и неправильный токен.',
        initialCode: `from fastapi import FastAPI, HTTPException, Header
from fastapi.testclient import TestClient

app = FastAPI()

tokens_db = {
    "anya-secret-token": {"username": "anya", "role": "admin"},
    "boris-secret-token": {"username": "boris", "role": "user"},
}

def authenticate(authorization: str) -> dict:
    if not authorization or authorization not in tokens_db:
        raise HTTPException(401, "Не удалось определить, кто ты")
    return tokens_db[authorization]

def authorize(user: dict, required_role: str):
    if user["role"] != required_role:
        raise HTTPException(403, f"Нужна роль {required_role}, а у тебя {user['role']}")

@app.delete("/users/{user_id}")
def delete_user(user_id: int, authorization: str = Header(None)):
    user = authenticate(authorization)
    authorize(user, "admin")
    return {"deleted": user_id}

client = TestClient(app)

print("админ:", client.delete("/users/5", headers={"Authorization": "anya-secret-token"}).status_code)
print("обычный пользователь:", client.delete("/users/5", headers={"Authorization": "boris-secret-token"}).json())
print("без токена:", client.delete("/users/5").json())
print("неверный токен:", client.delete("/users/5", headers={"Authorization": "totally-fake"}).json())`,
      },
      tasks: [
        {
          title: 'Задание 1: роль moderator',
          difficulty: 'easy',
          description: 'Добавь третьего пользователя с ролью "moderator" и новый роут @app.patch("/posts/{post_id}"), доступный только для этой роли. Проверь все три вида токенов.',
          hints: ['Копируй структуру delete_user, поменяй только required_role', 'Не забудь добавить новый токен в tokens_db'],
        },
        {
          title: 'Задание 2: несколько разрешённых ролей',
          difficulty: 'medium',
          description: 'Перепиши authorize так, чтобы она принимала список ролей (required_roles: list вместо required_role: str) и пропускала пользователя, если его роль есть В ЭТОМ списке. Проверь, что и admin, и moderator теперь могут зайти на один и тот же роут, а user — нет.',
          hints: [
            'def authorize(user, required_roles):\n    if user["role"] not in required_roles:\n        raise HTTPException(403, ...)',
            'Вызывай так: authorize(user, ["admin", "moderator"])',
          ],
          solution: `def authorize(user: dict, required_roles: list):
    if user["role"] not in required_roles:
        raise HTTPException(403, f"Нужна одна из ролей {required_roles}, а у тебя {user['role']}")

@app.patch("/posts/{post_id}")
def edit_post(post_id: int, authorization: str = Header(None)):
    user = authenticate(authorization)
    authorize(user, ["admin", "moderator"])
    return {"edited": post_id}`,
        },
        {
          title: 'Задание 3: почему порядок шагов важен',
          difficulty: 'hard',
          description: 'Намеренно поменяй местами вызовы: сначала authorize(user, "admin"), а потом authenticate(authorization) — то есть попробуй проверить права у переменной user ДО того, как она вообще определена. Запусти и посмотри на ошибку. В комментарии объясни, почему authenticate ВСЕГДА обязан идти первым.',
          hints: [
            'Python выполнит authorize(user, ...) раньше, чем узнает, что такое user — ожидай NameError',
            'Это отражает реальную логику: нельзя проверить права у ещё не известного пользователя',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'raise HTTPException(401, "Недостаточно прав")  — использовать 401 там, где пользователь уже опознан, но ему просто нельзя',
          right: 'Если сервер точно знает, кто перед ним, но именно этому пользователю конкретное действие запрещено — это 403 Forbidden, а не 401. 401 — только для случаев, когда личность вообще не определена',
        },
        {
          wrong: 'Проверять роль пользователя только в интерфейсе на сайте (например, скрывать кнопку "Удалить" в браузере) и не проверять её на сервере',
          right: 'Скрыть кнопку в браузере не мешает никому отправить тот же самый запрос напрямую (например, через curl), в обход интерфейса. Любая проверка прав ОБЯЗАНА повторяться на сервере — интерфейс может помочь удобству, но никогда не заменяет настоящую проверку',
        },
      ],
      checklist: [
        'Понимаю разницу между аутентификацией ("кто ты?") и авторизацией ("что тебе можно?")',
        'Знаю, что 401 — провал аутентификации, а 403 — провал авторизации',
        'Понимаю, что authorize должен вызываться только после успешного authenticate',
        'Понимаю, что проверка прав в браузере не заменяет проверку прав на сервере',
      ],
    },

    {
      id: 'password-hashing',
      title: 'Хеширование паролей',
      summary: 'Почему нельзя хранить пароли как есть, что такое хеш и соль простыми словами',
      theory: [
        {
          type: 'p',
          text: 'Чтобы проверять пароль при входе, серверу нужно где-то его хранить. Самая опасная ошибка, которую может допустить начинающий разработчик — хранить пароль ТАК, КАК ЕГО ВВЁЛ пользователь (открытым текстом). Если база данных когда-нибудь утечёт (взлом, украденная резервная копия, невнимательный сотрудник) — пароли ВСЕХ пользователей утекут в открытом виде мгновенно. А так как многие люди используют один и тот же пароль на разных сайтах, это может открыть доступ и к их почте, и к другим сервисам.',
        },
        {
          type: 'analogy',
          text: 'Хеширование — как мясорубка. Кусок мяса легко превратить в фарш, но никаким способом нельзя превратить фарш обратно в исходный кусок мяса — это необратимый процесс. Хеш-функция делает то же самое с паролем: "password123" превращается в бессмысленный набор символов, и обратно его получить невозможно. При входе сервер не "расшифровывает" сохранённый хеш — он берёт заново введённый пароль, пропускает его через ТУ ЖЕ мясорубку и сравнивает два фарша: если они совпали — пароль верный.',
        },
        {
          type: 'steps',
          title: 'Простое хеширование на встроенных модулях Python',
          items: [
            { code: 'import hashlib, secrets', note: 'hashlib — модуль для хеш-функций (например, sha256), secrets — модуль для генерации криптографически надёжных случайных значений' },
            { code: 'salt = secrets.token_hex(16)', note: 'Соль — случайная "добавка" к паролю перед хешированием. token_hex(16) генерирует 16 случайных байт в виде строки из шестнадцатеричных символов' },
            { code: 'digest = hashlib.sha256((salt + password).encode()).hexdigest()', note: 'encode() превращает строку в байты (хеш-функции работают именно с байтами), hexdigest() возвращает результат в виде читаемой строки' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Зачем вообще нужна соль, если хеш и так необратим?',
          text: 'Проблема в том, что у ОДИНАКОВОГО пароля всегда получается ОДИНАКОВЫЙ хеш. Если два пользователя оба выберут пароль "123456", у них в базе окажутся идентичные хеши — и злоумышленник с заранее подготовленной таблицей хешей популярных паролей ("радужной таблицей") мгновенно узнает пароль обоих. Соль делает хеш каждого пользователя уникальным, даже если сам пароль у них совпадает — потому что к паролю каждый раз подмешивается своя случайная добавка.',
        },
        {
          type: 'p',
          text: 'В нашей песочнице ниже мы используем hashlib.sha256 — он отлично подходит, чтобы ПОНЯТЬ идею хеширования, потому что настоящий, а не имитация. Но в реальном проекте для паролей используют не sha256 напрямую, а специальные, намеренно МЕДЛЕННЫЕ алгоритмы вроде bcrypt (через библиотеку passlib) — потому что sha256 хоть и необратим, но выполняется слишком быстро.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему "быстро" — это плохо именно для паролей',
          text: 'Если атакующий украл базу с хешами, он пытается угадать пароль перебором — считает хеш для миллионов вариантов паролей и сравнивает с украденным. Быстрый sha256 позволяет современной видеокарте перебирать миллиарды вариантов в секунду. bcrypt специально спроектирован работать медленно (например, ~100 миллисекунд на один хеш) — для одного честного входа пользователя это незаметно, а для атакующего, перебирающего миллионы вариантов, это превращает взлом из нескольких секунд в буквально годы.',
        },
        {
          type: 'steps',
          title: 'Как это выглядело бы в реальном проекте (библиотека passlib)',
          items: [
            { code: 'from passlib.context import CryptContext', note: 'passlib — библиотека-обёртка над разными алгоритмами хеширования паролей' },
            { code: 'pwd_context = CryptContext(schemes=["bcrypt"])', note: 'Указываем конкретный алгоритм — bcrypt, специально медленный и проверенный временем' },
            { code: 'hashed = pwd_context.hash("hunter2")', note: 'passlib сам генерирует случайную соль внутри и упаковывает всё в одну строку — руками солью заниматься не нужно' },
            { code: 'pwd_context.verify("hunter2", hashed)', note: 'Возвращает True или False. Сравнение (расшифровку) полностью берёт на себя библиотека' },
          ],
        },
      ],
      example: {
        title: 'Хеширование и проверка пароля с солью',
        lang: 'python',
        code: `import hashlib
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode()).hexdigest()
    return salt + "$" + digest

def verify_password(password: str, stored: str) -> bool:
    salt, digest = stored.split("$")
    return hashlib.sha256((salt + password).encode()).hexdigest() == digest

stored = hash_password("hunter2")
print("Сохранили в базе:", stored)

print(verify_password("hunter2", stored))       # True — пароль верный
print(verify_password("wrong-guess", stored))   # False — пароль неверный`,
        explanation: 'В базе данных хранится только "salt$хеш" — сам пароль "hunter2" нигде не сохраняется и восстановить его из хеша невозможно.',
      },
      sandbox: {
        bootstrap: null,
        description: 'Здесь работает настоящий hashlib и secrets — те же самые модули, что и на твоём компьютере, без всякой имитации.',
        initialCode: `import hashlib
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode()).hexdigest()
    return salt + "$" + digest

def verify_password(password: str, stored: str) -> bool:
    salt, digest = stored.split("$")
    return hashlib.sha256((salt + password).encode()).hexdigest() == digest

stored1 = hash_password("hunter2")
stored2 = hash_password("hunter2")
print("Хеш 1:", stored1)
print("Хеш 2:", stored2)
print("Это одинаковый пароль, но хеши совпадают?", stored1 == stored2)

print("Проверка верного пароля:", verify_password("hunter2", stored1))
print("Проверка неверного пароля:", verify_password("wrong-guess", stored1))

# А теперь без соли — вот почему это опасно
def unsalted_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

print("Аня (без соли), пароль 123456:", unsalted_hash("123456"))
print("Борис (без соли), пароль 123456:", unsalted_hash("123456"))`,
      },
      tasks: [
        {
          title: 'Задание 1: третья проверка',
          difficulty: 'easy',
          description: 'Добавь третий вызов verify_password с паролем, который отличается от "hunter2" всего на один символ (например, "hunter3"). Выведи результат и убедись, что он тоже False.',
          hints: ['Даже минимальное отличие пароля даёт совершенно другой хеш', 'verify_password("hunter3", stored1)'],
        },
        {
          title: 'Задание 2: докажи, что соль работает',
          difficulty: 'medium',
          description: 'В комментарии объясни: почему stored1 и stored2 в песочнице выше — РАЗНЫЕ строки, хотя оба хеша получены из одного и того же пароля "hunter2"? Затем допиши код, который всё равно доказывает, что verify_password("hunter2", stored2) тоже вернёт True.',
          hints: ['Разные строки — потому что salt каждый раз генерируется случайно заново', 'Само сравнение внутри verify_password не зависит от того, какая именно соль была использована — она читается прямо из stored'],
        },
        {
          title: 'Задание 3: радужная таблица своими руками',
          difficulty: 'hard',
          description: 'Собери словарь COMMON_PASSWORD_HASHES из hashlib.sha256(...).hexdigest() (БЕЗ соли) для трёх популярных паролей: "123456", "password", "qwerty". Затем, имея произвольный "хеш из утечки", напиши код, который находит совпадение в этом словаре и мгновенно "взламывает" пароль. Объясни в комментарии, почему такая атака невозможна против хешей с солью из основного примера.',
          hints: [
            'COMMON_PASSWORD_HASHES = {hashlib.sha256(p.encode()).hexdigest(): p for p in ["123456", "password", "qwerty"]}',
            'leaked_hash = hashlib.sha256("123456".encode()).hexdigest()\nprint(COMMON_PASSWORD_HASHES.get(leaked_hash))',
            'С солью у каждого пользователя хеш уникален, даже при одинаковом пароле — заранее посчитанная таблица здесь бесполезна',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'users_db[username] = {"password": password}  — хранить пароль как обычную строку "на потом, добавим хеширование позже"',
          right: 'Хеширование нужно добавлять СРАЗУ, с самого первого сохранённого пароля — это никогда не бывает "мелкой доработкой на потом". users_db[username] = {"password": hash_password(password)}',
        },
        {
          wrong: 'hashlib.md5(password.encode()).hexdigest()  — использовать быстрый хеш общего назначения (md5, sha1, даже sha256 без спец. алгоритма) как единственную защиту в реальном продакшен-проекте',
          right: 'Для настоящих паролей в проде используют специально медленные алгоритмы вроде bcrypt (через passlib) — они спроектированы так, чтобы массовый перебор был практически невозможен, в отличие от быстрых универсальных хеш-функций',
        },
      ],
      checklist: [
        'Понимаю, почему нельзя хранить пароли в открытом виде',
        'Понимаю хеширование как необратимое превращение (аналогия мясорубки)',
        'Понимаю, зачем нужна соль и что без неё одинаковые пароли дают одинаковые хеши',
        'Умею хешировать и проверять пароль через hashlib + secrets',
        'Знаю, что в реальном проекте для паролей используют bcrypt/passlib, а не голый sha256',
      ],
    },

    {
      id: 'jwt-tokens',
      title: 'JWT-токены',
      summary: 'Из чего состоит токен, зачем нужна подпись и как реализовать HS256 своими руками',
      theory: [
        {
          type: 'p',
          text: 'Пароль проверяется один раз, при входе. Но что происходит дальше? Не спрашивать же пароль заново на КАЖДЫЙ следующий запрос — это было бы неудобно и небезопасно (передавать пароль лишний раз). Один из самых распространённых способов "запомнить", что пользователь уже вошёл — выдать ему JWT (JSON Web Token).',
        },
        {
          type: 'analogy',
          text: 'Представь браслет на входе на фестиваль. Охрана на входе один раз проверяет твой документ, а потом надевает на руку браслет с особым рисунком, который трудно подделать. Весь остальной день ЛЮБОЙ сотрудник фестиваля, просто взглянув на браслет, сразу понимает, что тебя уже проверили — не нужно снова показывать документ. JWT — точно такой же "браслет", только цифровой: сервер выдаёт его один раз при входе, а потом любой другой запрос сервер может проверить, просто взглянув на токен, не спрашивая пароль заново.',
        },
        {
          type: 'p',
          text: 'JWT состоит из трёх частей, разделённых точками: header.payload.signature.',
        },
        {
          type: 'list',
          title: 'Что лежит в каждой части',
          items: [
            'header (заголовок) — служебная информация, например, каким алгоритмом подписан токен',
            'payload (полезная нагрузка) — сами данные, например {"username": "anya", "role": "admin"}',
            'signature (подпись) — "печать", которую может поставить только сервер, знающий секретный ключ. Она доказывает, что токен не подделан и не изменён',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'JWT не зашифрован — он просто закодирован!',
          text: 'Header и payload — это просто данные, закодированные в base64 (это НЕ шифрование). Их может прочитать абсолютно КТО УГОДНО, у кого есть токен, без всякого секретного ключа — достаточно открыть любой онлайн-декодер base64. Секретный ключ нужен только для того, чтобы СОЗДАТЬ подпись или ПРОВЕРИТЬ её — но не для того, чтобы прочитать payload. Именно поэтому в payload никогда нельзя класть пароль или другую по-настоящему секретную информацию — только "не секретные" данные вроде имени пользователя и роли.',
        },
        {
          type: 'p',
          text: 'Соберём такой токен своими руками — используя только встроенные модули Python (hmac, hashlib, base64, json). Это НЕ имитация — это ровно тот же алгоритм HS256, что используют настоящие библиотеки вроде PyJWT.',
        },
        {
          type: 'steps',
          title: 'Как устроена подпись HS256',
          items: [
            { code: 'signing_input = f"{header_b64}.{payload_b64}"', note: 'Подписывается не сам payload, а буквально ТЕКСТ "header.payload" целиком — если поменять хоть один символ в любой из частей, подпись перестанет совпадать' },
            { code: 'hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()', note: 'hmac.new — специальная функция для создания "подписи, зависящей от секретного ключа". Без знания SECRET_KEY подделать такую подпись практически невозможно' },
            { code: 'hmac.compare_digest(expected, actual)', note: 'Сравнивать подписи нужно именно этой функцией, а не обычным "==" — она защищена от особого вида атак по времени сравнения строк' },
          ],
        },
        {
          type: 'steps',
          title: 'Как это выглядело бы с готовой библиотекой PyJWT',
          items: [
            { code: 'import jwt', note: 'PyJWT — самая популярная библиотека для работы с JWT в Python' },
            { code: 'token = jwt.encode({"username": "anya"}, SECRET_KEY, algorithm="HS256")', note: 'Один вызов вместо ручной сборки header/payload/signature — библиотека делает всё то же самое под капотом' },
            { code: 'payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])', note: 'Проверяет подпись автоматически и поднимает исключение jwt.InvalidSignatureError, если токен подделан' },
          ],
        },
      ],
      example: {
        title: 'Собираем и проверяем JWT вручную',
        lang: 'python',
        code: `import base64
import hmac
import hashlib
import json

SECRET_KEY = "super-secret-key"

def b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_token(payload: dict) -> str:
    header_b64 = b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_b64 = b64encode(json.dumps(payload).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{payload_b64}.{b64encode(signature)}"

def verify_token(token: str) -> dict:
    header_b64, payload_b64, signature_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected = b64encode(hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest())
    if not hmac.compare_digest(expected, signature_b64):
        raise ValueError("Подпись не совпадает — токен подделан или испорчен")
    return json.loads(b64decode(payload_b64))

token = create_token({"username": "anya", "role": "admin"})
print("Токен:", token)

payload = verify_token(token)
print("Проверка прошла:", payload)`,
        explanation: 'Три части токена видны прямо в строке через точки. verify_token пересчитывает подпись заново и сравнивает — если кто-то поменял хоть символ в payload, пересчитанная подпись не совпадёт со старой.',
      },
      sandbox: {
        bootstrap: null,
        description: 'Полностью настоящий код на встроенных модулях Python — точно такой же алгоритм HS256 используют библиотеки вроде PyJWT.',
        initialCode: `import base64
import hmac
import hashlib
import json

SECRET_KEY = "super-secret-key"

def b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_token(payload: dict) -> str:
    header_b64 = b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_b64 = b64encode(json.dumps(payload).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{payload_b64}.{b64encode(signature)}"

def verify_token(token: str) -> dict:
    header_b64, payload_b64, signature_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected = b64encode(hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest())
    if not hmac.compare_digest(expected, signature_b64):
        raise ValueError("Подпись не совпадает — токен подделан или испорчен")
    return json.loads(b64decode(payload_b64))

token = create_token({"username": "anya", "role": "admin"})
print("Токен:", token)
print("Частей в токене:", len(token.split(".")))

payload = verify_token(token)
print("Проверка прошла, внутри:", payload)

# Любой может прочитать payload БЕЗ секретного ключа — это не шифрование!
header_b64, payload_b64, _ = token.split(".")
print("Прочитано без секрета:", json.loads(b64decode(payload_b64)))

# Подделываем подпись
tampered = token[:-5] + "AAAAA"
try:
    verify_token(tampered)
except ValueError as e:
    print("Поддельный токен пойман:", e)`,
      },
      tasks: [
        {
          title: 'Задание 1: добавь время жизни токена',
          difficulty: 'easy',
          description: 'Добавь в payload поле "exp" (например, текущее время + 3600 — представь его как обычное число секунд, без реального времени). Создай токен и выведи payload["exp"] после verify_token.',
          hints: ['payload = {"username": "anya", "exp": 1_700_003_600}', 'exp (expiration) — стандартное имя поля в JWT для времени истечения токена'],
        },
        {
          title: 'Задание 2: подделай payload, а не подпись',
          difficulty: 'medium',
          description: 'Возьми настоящий токен, раздели его на 3 части через .split("."). Замени payload_b64 на b64encode другого payload (например, {"username": "anya", "role": "superadmin"}), но ОСТАВЬ старую подпись нетронутой. Собери токен заново и попробуй verify_token(). Убедись, что подделка поймана.',
          hints: [
            'fake_payload_b64 = b64encode(json.dumps({"username": "anya", "role": "superadmin"}).encode())',
            'fake_token = f"{header_b64}.{fake_payload_b64}.{signature_b64}"',
          ],
          solution: `header_b64, payload_b64, signature_b64 = token.split(".")
fake_payload_b64 = b64encode(json.dumps({"username": "anya", "role": "superadmin"}).encode())
fake_token = f"{header_b64}.{fake_payload_b64}.{signature_b64}"

try:
    verify_token(fake_token)
except ValueError as e:
    print("Подделка роли поймана:", e)`,
        },
        {
          title: 'Задание 3: токен с другим секретным ключом',
          difficulty: 'hard',
          description: 'Создай токен с SECRET_KEY = "super-secret-key" (как в примере), а затем напиши ВТОРУЮ версию verify_token, которая при проверке использует ДРУГОЙ секрет, например "wrong-key". Проверь тем же токеном. В комментарии объясни, почему подделать токен, не зная настоящего секретного ключа сервера, практически невозможно.',
          hints: [
            'Подпись — это hmac от SECRET_KEY и текста header.payload. Если пересчитать её с другим ключом, результат будет совершенно другим числом',
            'Единственный способ подобрать подходящую подпись без знания секрета — перебор, а хороший секретный ключ достаточно длинный, чтобы перебор занял практически бесконечное время',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'payload = {"username": "anya", "password": "hunter2"}  — класть пароль или другие секретные данные внутрь payload',
          right: 'Payload JWT читается кем угодно без секретного ключа — это не шифрование, а просто кодирование. Внутрь можно класть только "не секретные" данные (имя пользователя, роль, id), но никогда — пароли, номера карт и подобное',
        },
        {
          wrong: 'if expected == signature_b64:  — сравнивать подписи обычным оператором сравнения строк',
          right: 'Для сравнения подписей и хешей стоит использовать hmac.compare_digest(a, b) — она устроена так, чтобы время сравнения не зависело от того, на каком символе строки не совпали, что защищает от особого вида атак по времени выполнения',
        },
      ],
      checklist: [
        'Понимаю структуру токена: header.payload.signature',
        'Понимаю, что payload JWT не зашифрован, а просто закодирован — его может прочитать кто угодно',
        'Понимаю, что подпись защищает от ПОДДЕЛКИ данных, а не скрывает их',
        'Умею создать и проверить простой HS256-токен на hmac/hashlib/base64',
        'Знаю, что в реальном проекте для JWT используют готовую библиотеку (например, PyJWT), а не ручную реализацию',
      ],
    },

    {
      id: 'oauth2-fastapi',
      title: 'OAuth2 в FastAPI: логин и защищённые роуты',
      summary: 'Собираем всё вместе: форма логина, выдача JWT-токена и роут, доступный только вошедшим пользователям',
      theory: [
        {
          type: 'p',
          text: 'Мы по отдельности разобрали хеширование паролей и JWT-токены. Теперь соберём из них полноценный, пусть и упрощённый, механизм входа — точно по той же схеме, что использует FastAPI под названием OAuth2. Это не одна конкретная технология, а общепринятый в индустрии СПОСОБ организовать логин, который FastAPI поддерживает "из коробки" через набор готовых инструментов.',
        },
        {
          type: 'steps',
          title: 'Инструменты FastAPI для OAuth2',
          items: [
            { code: 'from fastapi.security import OAuth2PasswordBearer', note: 'Объект, который умеет доставать токен из заголовка Authorization: Bearer ... и автоматически поднимать 401, если заголовка нет' },
            { code: 'oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")', note: 'tokenUrl указывает, на какой адрес отправлять логин и пароль, чтобы получить токен — это используется, например, в Swagger-документации' },
            { code: 'from fastapi.security import OAuth2PasswordRequestForm', note: 'Специальная "форма" для приёма логина и пароля — по стандарту OAuth2 они передаются как form-data, а не как обычный JSON' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему логин передаётся не JSON, а form-data',
          text: 'Это исторически сложившийся стандарт OAuth2, а не прихоть FastAPI. Практическое следствие: в песочнице ниже login-запрос отправляется через client.post("/token", data={...}), а НЕ через json={...} — обрати внимание на эту разницу, это частая причина путаницы у новичков.',
        },
        {
          type: 'p',
          text: 'Дальше — простая схема из трёх шагов, использующая всё, что мы уже знаем.',
        },
        {
          type: 'steps',
          title: 'Собираем логин по шагам',
          items: [
            { code: '@app.post("/token")\ndef login(form_data: OAuth2PasswordRequestForm = Depends()):', note: 'form_data.username и form_data.password — то, что прислал клиент' },
            { code: '    user = fake_users_db.get(form_data.username)\n    if not user or user["password"] != form_data.password:\n        raise HTTPException(401, "Неверный логин или пароль")', note: 'В реальном проекте здесь было бы verify_password(...) из урока про хеширование, а не прямое сравнение' },
            { code: '    token = create_access_token({"sub": user["username"]})\n    return {"access_token": token, "token_type": "bearer"}', note: '"sub" (subject) — стандартное имя поля в JWT для того, КОМУ принадлежит токен' },
          ],
        },
        {
          type: 'steps',
          title: 'Защищаем роут через Depends',
          items: [
            { code: 'def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:', note: 'oauth2_scheme сам достанет токен из заголовка — если его нет, до этой строчки дело даже не дойдёт, FastAPI сразу ответит 401' },
            { code: '    payload = decode_access_token(token)\n    return fake_users_db[payload["sub"]]', note: 'Расшифровываем токен (из прошлого урока) и находим пользователя по имени внутри' },
            { code: '@app.get("/me")\ndef read_me(current_user: dict = Depends(get_current_user)):', note: 'Depends(get_current_user) означает: "прежде чем выполнить этот роут, сначала выполни get_current_user и подставь результат сюда". Если там что-то пошло не так — read_me вообще не вызовется' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Depends — это "получи готовый результат", а не "собери всё сам"',
          text: 'Обрати внимание на цепочку: read_me зависит от get_current_user, а get_current_user зависит от oauth2_scheme. FastAPI сам разбирается, в каком порядке всё это вызвать, и передаёт результат каждого шага дальше. Тебе не нужно самому в каждом защищённом роуте вручную доставать заголовок и расшифровывать токен — это разберём подробнее как приём "Dependency Injection" в следующем модуле.',
        },
      ],
      example: {
        title: 'Полный цикл: логин → токен → защищённый роут',
        lang: 'python',
        code: `import base64, hmac, hashlib, json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

SECRET_KEY = "super-secret-key"

def b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def b64decode(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))

def create_access_token(payload: dict) -> str:
    header_b64 = b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_b64 = b64encode(json.dumps(payload).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{payload_b64}.{b64encode(signature)}"

def decode_access_token(token: str) -> dict:
    header_b64, payload_b64, signature_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected = b64encode(hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest())
    if not hmac.compare_digest(expected, signature_b64):
        raise ValueError("Невалидная подпись токена")
    return json.loads(b64decode(payload_b64))

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

fake_users_db = {"anya": {"username": "anya", "password": "secret123", "role": "admin"}}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(401, "Неверный логин или пароль")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(401, "Невалидный токен")
    user = fake_users_db.get(payload.get("sub"))
    if not user:
        raise HTTPException(401, "Пользователь не найден")
    return user

@app.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "role": current_user["role"]}`,
        explanation: 'В реальном проекте пароль в fake_users_db хранился бы как hash_password(...) из прошлого урока, а сравнение шло бы через verify_password(...) — здесь упрощено ради краткости примера.',
      },
      sandbox: {
        bootstrap: 'fastapi',
        description: 'Пройди полный цикл: получи токен через логин, используй его для доступа к /me, и проверь, что без токена и с неверным паролем доступа нет.',
        initialCode: `import base64, hmac, hashlib, json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.testclient import TestClient

SECRET_KEY = "super-secret-key"

def b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def b64decode(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))

def create_access_token(payload: dict) -> str:
    header_b64 = b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_b64 = b64encode(json.dumps(payload).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{payload_b64}.{b64encode(signature)}"

def decode_access_token(token: str) -> dict:
    header_b64, payload_b64, signature_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected = b64encode(hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest())
    if not hmac.compare_digest(expected, signature_b64):
        raise ValueError("Невалидная подпись токена")
    return json.loads(b64decode(payload_b64))

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

fake_users_db = {"anya": {"username": "anya", "password": "secret123", "role": "admin"}}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(401, "Неверный логин или пароль")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(401, "Невалидный токен")
    user = fake_users_db.get(payload.get("sub"))
    if not user:
        raise HTTPException(401, "Пользователь не найден")
    return user

@app.get("/me")
def read_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "role": current_user["role"]}

client = TestClient(app)

login_response = client.post("/token", data={"username": "anya", "password": "secret123"})
print("логин:", login_response.status_code, login_response.json())

token = login_response.json()["access_token"]
me_response = client.get("/me", headers={"Authorization": f"Bearer {token}"})
print("/me с токеном:", me_response.status_code, me_response.json())

print("/me без токена:", client.get("/me").status_code)
print("неверный пароль:", client.post("/token", data={"username": "anya", "password": "wrong"}).status_code)
print("сломанный токен:", client.get("/me", headers={"Authorization": "Bearer garbage.token.here"}).status_code)`,
      },
      tasks: [
        {
          title: 'Задание 1: второй пользователь',
          difficulty: 'easy',
          description: 'Добавь в fake_users_db второго пользователя "boris" с ролью "user". Пройди для него полный цикл: логин → получение токена → запрос /me. Убедись, что в ответе видна именно его роль.',
          hints: ['Структура точно такая же, как для "anya"', 'Не перепутай логин и пароль при запросе /token'],
        },
        {
          title: 'Задание 2: роут только для admin',
          difficulty: 'medium',
          description: 'Добавь роут @app.get("/admin-only") с зависимостью current_user: dict = Depends(get_current_user), который дополнительно проверяет current_user["role"] == "admin" и поднимает HTTPException(403, ...), если это не так (используй знания из первого урока модуля).',
          hints: [
            'def read_admin_only(current_user: dict = Depends(get_current_user)):\n    if current_user["role"] != "admin":\n        raise HTTPException(403, "Только для админов")\n    return {"secret": "42"}',
            'Проверь роут и токеном Ани (admin), и токеном Бориса (user)',
          ],
          solution: `@app.get("/admin-only")
def read_admin_only(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(403, "Только для админов")
    return {"secret": "42"}`,
        },
        {
          title: 'Задание 3: используй хеширование паролей вместо сравнения строк',
          difficulty: 'hard',
          description: 'Перепиши fake_users_db так, чтобы пароль хранился как hash_password("secret123") (функцию скопируй из урока про хеширование). Исправь login() так, чтобы он использовал verify_password(...) вместо прямого сравнения строк password. Проверь, что вход по-прежнему работает.',
          hints: [
            'Скопируй hash_password и verify_password из прошлого урока прямо в код песочницы',
            'user["password"] теперь хранит не пароль, а хеш — сравнение нужно делать через verify_password(form_data.password, user["password"])',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'client.post("/token", json={"username": "anya", "password": "secret123"})  — отправлять логин как JSON',
          right: 'OAuth2PasswordRequestForm ожидает form-data, а не JSON: client.post("/token", data={"username": "anya", "password": "secret123"}) — с json= вместо data= форма не соберётся',
        },
        {
          wrong: 'Проверять токен вручную внутри каждого роута через if not token: raise HTTPException(401, ...)',
          right: 'Вместо повторения одной и той же проверки в каждом роуте, вынеси её в функцию-зависимость (get_current_user) и подключай через Depends(...) — это именно то, для чего Dependency Injection существует, подробнее в следующем модуле',
        },
      ],
      checklist: [
        'Понимаю связку OAuth2PasswordBearer + OAuth2PasswordRequestForm для организации логина',
        'Умею написать роут логина, который выдаёт JWT-токен при верном пароле',
        'Умею защитить роут через current_user: dict = Depends(get_current_user)',
        'Понимаю, что form-data (data=) и JSON (json=) — это разные способы передачи данных, и OAuth2 требует именно form-data',
        'Понимаю, как складывается цепочка: хеширование пароля → выдача JWT → проверка JWT на каждом защищённом роуте',
      ],
    },
  ],
};
