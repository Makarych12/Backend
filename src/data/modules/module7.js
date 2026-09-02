export const module7 = {
  id: 'databases',
  order: 7,
  title: 'Базы данных',
  icon: '🗄️',
  description: 'SQL с нуля на PostgreSQL, ORM SQLAlchemy и миграции через Alembic.',
  lessons: [
    {
      id: 'what-is-database',
      title: 'Что такое база данных и основы SQL',
      summary: 'Таблицы, строки и столбцы, и четыре главные команды: SELECT, INSERT, UPDATE, DELETE',
      theory: [
        {
          type: 'p',
          text: 'Во всех предыдущих модулях наши "пользователи" и "товары" жили в обычном списке Python (users = [...]). Это удобно для обучения, но есть большая проблема: как только сервер перезапускается — весь список исчезает. Всё, что накопили пользователи, пропадает без следа. Базе данных эта проблема не страшна: она хранит данные на диске, а не в оперативной памяти программы.',
        },
        {
          type: 'analogy',
          text: 'Представь огромный шкаф с папками в офисе. У каждой папки внутри — анкеты одной и той же формы: например, "Имя", "Отдел", "Зарплата" — всегда одни и те же графы, только разные значения. База данных устроена так же: ТАБЛИЦА — это как один такой шкаф, отведённый под один тип анкет (например, таблица "users"). СТОЛБЦЫ (columns) — сами графы анкеты (name, age, email — всегда одинаковые для всех папок в этом шкафу). СТРОКА (row) — одна конкретная заполненная анкета, то есть один конкретный пользователь.',
        },
        {
          type: 'p',
          text: 'Чтобы разговаривать с базой данных, используется не Python, а отдельный язык — SQL. Он устроен как набор команд, максимально похожих на простые английские фразы. Есть всего четыре основные команды, с которых начинается вообще любая работа с БД.',
        },
        {
          type: 'list',
          title: 'Четыре главные команды SQL — и их смысл на языке "шкафа с папками"',
          items: [
            'SELECT — "найди и покажи мне папки" (прочитать данные)',
            'INSERT — "добавь новую папку в шкаф" (создать запись)',
            'UPDATE — "исправь что-то в уже существующей папке" (изменить запись)',
            'DELETE — "выбрось папку из шкафа" (удалить запись)',
          ],
        },
        {
          type: 'steps',
          title: 'Как эти команды выглядят на настоящем SQL',
          items: [
            { code: 'SELECT * FROM users;', note: '"Выбери ВСЁ (*) из таблицы users" — вернёт все столбцы всех строк' },
            { code: "SELECT name FROM users WHERE age > 18;", note: '"Выбери только столбец name из users, но только те строки, где age больше 18" — WHERE это условие-фильтр' },
            { code: "INSERT INTO users (name, age) VALUES ('Аня', 20);", note: '"Добавь в таблицу users новую строку с такими значениями столбцов name и age"' },
            { code: "UPDATE users SET age = 21 WHERE name = 'Аня';", note: '"В таблице users поменяй столбец age на 21, но только там, где name равно \'Аня\'"' },
            { code: "DELETE FROM users WHERE name = 'Борис';", note: '"Удали из users строку, где name равно \'Борис\'"' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'WHERE — самое важное слово в этом уроке',
          text: 'Если написать UPDATE users SET age = 21; или DELETE FROM users; БЕЗ условия WHERE — команда применится вообще ко ВСЕМ строкам таблицы разом. Это одна из самых частых и самых болезненных ошибок новичков в SQL: забыл WHERE — случайно обнулил или удалил всю таблицу целиком.',
        },
        {
          type: 'p',
          text: 'Чтобы попробовать всё это на практике, нам нужна настоящая, но при этом самая простая база данных. SQLite — база данных, которая устроена как ОДИН обычный файл на диске и уже встроена в стандартную библиотеку Python (на твоём компьютере import sqlite3 сработает без единой установки). Она отлично подходит для обучения и маленьких проектов. Из Python с ней работают через объекты connection (соединение) и cursor (курсор — как "указка", через которую отправляются SQL-команды).',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Почему в коде значения передаются через "?", а не просто вставляются в строку',
          text: 'Обрати внимание в примере ниже: cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Аня", 20)) — вместо того, чтобы собрать строку SQL через f-строку с именем прямо внутри. Это называется параметризованный запрос, и это не просто стиль — это защита от одной из самых опасных уязвimostей веб-разработки, SQL-инъекции. Разберём её прямо в практике ниже.',
        },
      ],
      example: {
        title: 'Первая работа с настоящей базой данных',
        lang: 'python',
        code: `import sqlite3

conn = sqlite3.connect("shop.db")  # на реальном компьютере создаст файл shop.db на диске
cur = conn.cursor()

cur.execute("""
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY,
        title TEXT,
        year INTEGER
    )
""")

cur.execute("INSERT INTO books (title, year) VALUES (?, ?)", ("Мастер и Маргарита", 1967))
cur.execute("INSERT INTO books (title, year) VALUES (?, ?)", ("Дюна", 1965))
conn.commit()  # без commit() изменения не сохранятся на диск!

cur.execute("SELECT * FROM books WHERE year > ?", (1965,))
print(cur.fetchall())`,
        explanation: 'conn.commit() обязателен после INSERT/UPDATE/DELETE — без него изменения останутся только "в черновике" и не запишутся по-настоящему. fetchall() возвращает список результатов SELECT в виде кортежей.',
      },
      sandbox: {
        bootstrap: 'sqlite3',
        description:
          'Здесь работает настоящий sqlite3 — те же самые SQL-команды, что выполнились бы на твоём компьютере. Единственное отличие от твоего компьютера: браузеру нужно один раз ДОГРУЗИТЬ модуль sqlite3 отдельно (на реальном компьютере он уже встроен в Python) — а connect(":memory:") означает "база данных прямо в памяти, без файла на диске", это удобно именно для песочницы.',
        initialCode: `import sqlite3

conn = sqlite3.connect(":memory:")
cur = conn.cursor()

cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER
    )
""")

cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Аня", 20))
cur.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Борис", 25))
conn.commit()

cur.execute("SELECT * FROM users")
print("Все пользователи:", cur.fetchall())

cur.execute("UPDATE users SET age = ? WHERE name = ?", (21, "Аня"))
conn.commit()

cur.execute("SELECT name, age FROM users WHERE age > ?", (20,))
print("Старше 20:", cur.fetchall())

cur.execute("DELETE FROM users WHERE name = ?", ("Борис",))
conn.commit()

cur.execute("SELECT COUNT(*) FROM users")
print("Осталось пользователей:", cur.fetchone())`,
      },
      tasks: [
        {
          title: 'Задание 1: таблица книг',
          difficulty: 'easy',
          description: 'Создай таблицу books с колонками id, title, author, year. Добавь через INSERT две любые книги. Выведи через SELECT * все строки таблицы.',
          hints: ['Копируй структуру CREATE TABLE из примера, просто с другими колонками', 'Не забудь conn.commit() после INSERT'],
        },
        {
          title: 'Задание 2: фильтр по году',
          difficulty: 'medium',
          description: 'Добавь в таблицу books ещё 2-3 книги с разными годами издания. Напиши SELECT с условием WHERE year >= ..., используя параметризованный запрос (через ?), и выведи только подходящие книги.',
          hints: [
            'cur.execute("SELECT * FROM books WHERE year >= ?", (2000,))',
            'Значение года передавай вторым аргументом в execute(), а не через f-строку',
          ],
        },
        {
          title: 'Задание 3: увидеть SQL-инъекцию своими глазами',
          difficulty: 'hard',
          description:
            'Создай таблицу users(username, password), добавь двух пользователей. Затем задай username = "anya\' OR \'1\'=\'1" и выполни ДВА запроса подряд: один через f-строку (f"SELECT * FROM users WHERE username = \'{username}\'"), другой — параметризованный (через ?). Сравни результаты и в комментарии объясни своими словами, почему f-строка "утекла" чужие данные, а параметризованный запрос — нет.',
          hints: [
            "После подстановки в f-строку итоговый SQL становится: ...WHERE username = 'anya' OR '1'='1' — а '1'='1' истинно ВСЕГДА, поэтому условие срабатывает для любой строки таблицы",
            'В параметризованном запросе значение никогда не становится частью текста SQL-команды — база ищет буквально пользователя с таким длинным именем целиком, и не находит',
          ],
        },
      ],
      mistakes: [
        {
          wrong: "cur.execute(f\"DELETE FROM users WHERE name = '{name}'\")  — собирать SQL-команду через f-строку с данными от пользователя",
          right: 'cur.execute("DELETE FROM users WHERE name = ?", (name,))  — всегда передавай значения от пользователя отдельным параметром через ?, а не вклеивай их прямо в текст SQL-команды',
        },
        {
          wrong: 'Забыть conn.commit() после INSERT/UPDATE/DELETE и удивляться, что данные "не сохранились"',
          right: 'commit() нужен после КАЖДОЙ группы изменяющих команд (INSERT, UPDATE, DELETE) — без него всё останется черновиком и исчезнет при закрытии соединения. Для SELECT commit() не нужен, потому что он ничего не меняет',
        },
      ],
      checklist: [
        'Понимаю аналогию таблица/строка/столбец как шкаф/папка/графа анкеты',
        'Знаю четыре главные команды SQL: SELECT, INSERT, UPDATE, DELETE',
        'Понимаю, зачем в UPDATE и DELETE обязательно нужно условие WHERE',
        'Умею работать с sqlite3 из Python: connect, cursor, execute, commit, fetchall',
        'Понимаю, почему значения нужно передавать через ?, а не вклеивать в текст SQL напрямую',
      ],
    },

    {
      id: 'postgres-connection',
      title: 'PostgreSQL: настоящая база для настоящего сайта',
      summary: 'Чем PostgreSQL отличается от SQLite и как подключиться к нему из Python',
      theory: [
        {
          type: 'p',
          text: 'SQLite отлично подходит для обучения — это просто один файл на диске. Но у настоящего сайта обычно одновременно с базой работают сотни пользователей и несколько серверных процессов сразу. Один файл с этим не справится: два процесса, одновременно пытающихся записать в один и тот же файл, легко всё сломают. Для этого существуют полноценные СЕРВЕРЫ баз данных — например, PostgreSQL (часто говорят коротко "Postgres").',
        },
        {
          type: 'analogy',
          text: 'SQLite — как личный блокнот, который лежит у тебя в столе: пишешь в него только ты сам, один за раз. PostgreSQL — как общая база данных компании в отдельной серверной комнате: десятки сотрудников (серверных процессов) могут читать и писать в неё одновременно, по сети, и специальная система внутри следит, чтобы они не мешали друг другу и не портили данные.',
        },
        {
          type: 'p',
          text: 'PostgreSQL — это отдельная программа (сервер баз данных), которая работает постоянно и слушает сеть на определённом порту (обычно 5432) — очень похоже на то, как наш собственный FastAPI-сервер слушает порт 8000. Из Python к нему подключаются как КЛИЕНТ, примерно так же, как клиент (браузер) подключается к нашему серверу по HTTP — только вместо HTTP используется свой протокол PostgreSQL.',
        },
        {
          type: 'command',
          command: 'pip install psycopg2-binary',
          parts: [
            { text: 'pip install', desc: 'уже знакомая нам команда для установки библиотек' },
            { text: 'psycopg2-binary', desc: 'самая популярная библиотека-"переводчик" между Python и PostgreSQL — умеет открывать соединение и отправлять SQL-команды' },
          ],
          result: 'Теперь в коде можно писать import psycopg2 и подключаться к настоящему серверу PostgreSQL.',
        },
        {
          type: 'list',
          title: 'Из чего состоит строка подключения к базе',
          items: [
            'postgresql:// — какой "язык" (протокол) использовать для разговора с сервером БД',
            'user:password — логин и пароль для входа в базу данных',
            'host:port — где искать сервер (адрес компьютера и номер порта, обычно 5432)',
            'dbname — имя конкретной базы данных на этом сервере (на одном сервере PostgreSQL может жить сразу много разных баз)',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'В браузере нельзя открыть настоящее сетевое соединение',
          text: 'У песочницы ниже есть честное ограничение: браузер по соображениям безопасности не разрешает Python-коду открывать произвольные сетевые подключения к серверам баз данных. Поэтому там мы по-прежнему используем sqlite3 (:memory:) как "тренажёр" — но сама ФОРМА кода (connect, cursor, execute, commit) абсолютно одинакова что для SQLite, что для PostgreSQL. Именно в этом и состоит удобство SQL как языка: одни и те же команды понимает почти любая база данных.',
        },
      ],
      example: {
        title: 'Подключение к настоящему PostgreSQL (так выглядело бы на твоём компьютере)',
        lang: 'python',
        code: `import psycopg2

conn = psycopg2.connect(
    "postgresql://app_user:secret_password@localhost:5432/shop_db"
)
cur = conn.cursor()

cur.execute("SELECT * FROM users WHERE age > %s", (18,))
print(cur.fetchall())

conn.close()  # соединение по сети стоит закрывать явно, когда работа закончена`,
        explanation:
          'Обрати внимание: psycopg2 использует %s вместо ? для параметров — у разных библиотек-"переводчиков" разный синтаксис плейсхолдеров, но идея параметризованных запросов остаётся той же самой.',
      },
      terminal: {
        title: 'Устанавливаем библиотеку и проверяем подключение',
        description: 'Так это выглядело бы на твоём компьютере, если рядом уже запущен сервер PostgreSQL.',
        script: [
          { command: 'pip install psycopg2-binary', type: 'success' },
          {
            command: 'python check_connection.py',
            output:
              'Подключение к базе установлено!\nВерсия сервера: PostgreSQL 16.4\nТекущая база данных: shop_db',
            type: 'success',
          },
        ],
      },
      sandbox: {
        bootstrap: 'sqlite3',
        description:
          'Потренируйся на том же самом "тренажёре" sqlite3 — но пиши код так, будто перед тобой настоящий PostgreSQL: с connection, cursor, execute, commit. При переходе на реальный проект поменяется только адрес подключения, а не форма кода.',
        initialCode: `import sqlite3

# На реальном сервере здесь было бы:
# conn = psycopg2.connect("postgresql://app_user:secret@localhost:5432/shop_db")
conn = sqlite3.connect(":memory:")
cur = conn.cursor()

cur.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer TEXT,
        total REAL
    )
""")

cur.execute("INSERT INTO orders (customer, total) VALUES (?, ?)", ("Аня", 1500.0))
cur.execute("INSERT INTO orders (customer, total) VALUES (?, ?)", ("Борис", 300.0))
conn.commit()

cur.execute("SELECT * FROM orders WHERE total > ?", (500,))
print(cur.fetchall())

conn.close()`,
      },
      tasks: [
        {
          title: 'Задание 1: разбери строку подключения',
          difficulty: 'easy',
          description: 'Возьми строку "postgresql://shop_admin:qwerty123@db.example.com:5432/shop_production" и распиши в комментариях, что означает каждая из четырёх её частей (по аналогии со списком в теории).',
          hints: ['Раздели строку на 4 куска: протокол, логин:пароль, адрес:порт, имя базы', 'Сверься со списком "Из чего состоит строка подключения" в теории'],
        },
        {
          title: 'Задание 2: закрытие соединения',
          difficulty: 'medium',
          description: 'В песочнице выше добавь ещё один SELECT ПОСЛЕ conn.close() и посмотри, какая ошибка появится. В комментарии объясни своими словами, почему нельзя пользоваться соединением после того, как его закрыли.',
          hints: [
            'Ожидается ошибка вроде "Cannot operate on a closed database"',
            'close() буквально обрывает связь с базой — как положить трубку в конце телефонного звонка: сказать что-то ещё в неё уже нельзя',
          ],
        },
        {
          title: 'Задание 3: почему нельзя одним файлом',
          difficulty: 'hard',
          description: 'Напиши своими словами (в комментарии, без кода) ответ: почему для сайта с 10 000 одновременных посетителей SQLite (один файл) подойдёт плохо, а PostgreSQL (сервер с сетевыми подключениями) — хорошо? Используй аналогию блокнота и серверной комнаты из теории.',
          hints: [
            'Подумай, что произойдёт, если 10 000 человек одновременно попробуют писать в один и тот же файл на диске',
            'PostgreSQL специально спроектирован для множества одновременных подключений — он "по умолчанию" умеет то, что SQLite не умеет вообще',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Пытаться "просто скопировать" файл SQLite на сервер и называть это готовой базой для сайта',
          right: 'SQLite отлично подходит для обучения, тестов и маленьких локальных инструментов, но для сайта с реальными посетителями нужен полноценный сервер БД (PostgreSQL, MySQL и подобные) — они спроектированы для параллельной работы многих подключений',
        },
        {
          wrong: 'Хранить пароль от базы данных прямо в коде, который потом попадёт в git (например, в открытом виде в connect(...))',
          right: 'Пароли и адреса баз данных принято хранить отдельно от кода — в переменных окружения — это разберём подробно в модуле про безопасность. Прямо в коде их писать не стоит даже для учебных целей',
        },
      ],
      checklist: [
        'Понимаю разницу между SQLite (файл) и PostgreSQL (сервер с сетевыми подключениями)',
        'Знаю, из каких частей состоит строка подключения к базе данных',
        'Умею установить psycopg2-binary и представляю, как выглядит подключение из кода',
        'Понимаю, почему песочница использует sqlite3 вместо настоящего сетевого подключения',
      ],
    },

    {
      id: 'sqlalchemy-orm',
      title: 'ORM: SQLAlchemy вместо ручного SQL',
      summary: 'Зачем нужен ORM, если уже есть SQL, и как описать таблицу через обычный Python-класс',
      theory: [
        {
          type: 'p',
          text: 'Писать SQL руками — это нормально и полезно (мы это только что делали), но в большом проекте с десятками таблиц это быстро становится утомительным: SQL-строки — это просто текст, и Python никак не подскажет тебе, если ты опечатаешься в названии столбца — ошибку ты узнаешь только когда код реально попробует выполниться.',
        },
        {
          type: 'analogy',
          text: 'ORM (Object-Relational Mapping) — это переводчик между двумя языками. Представь: ты говоришь на обычном человеческом языке (пишешь Python-код: "создай пользователя", "найди всех, у кого имя Аня"), а база данных понимает только строгий формальный язык SQL. ORM стоит между вами и переводит: твои Python-команды — в SQL-запросы, а результат SQL-запроса — обратно в удобные Python-объекты. SQLAlchemy — самый popular ORM для Python.',
        },
        {
          type: 'p',
          text: 'Первый шаг — описать таблицу не через CREATE TABLE, а через обычный Python-класс. Это называется declarative-моделью (по смыслу очень похоже на Pydantic-модели из модуля 6, только тут класс описывает не форму запроса, а структуру ТАБЛИЦЫ в базе).',
        },
        {
          type: 'steps',
          title: 'Описываем таблицу через класс',
          items: [
            { code: 'from sqlalchemy import create_engine, Column, Integer, String', note: 'Column — способ описать один столбец таблицы; Integer/String — типы данных столбца (аналог int/str в Pydantic)' },
            { code: 'from sqlalchemy.orm import declarative_base', note: 'declarative_base() создаёт базовый класс Base, от которого наследуются все модели-таблицы' },
            { code: 'Base = declarative_base()', note: 'Base — общий "родитель" для всех твоих таблиц в проекте' },
            { code: 'class User(Base):', note: 'Один класс — одна таблица. Название класса обычно в единственном числе' },
            { code: '    __tablename__ = "users"', note: 'Явно указываем имя таблицы в базе данных (по умолчанию его пришлось бы выводить из имени класса)' },
            { code: '    id = Column(Integer, primary_key=True)', note: 'primary_key=True — этот столбец уникально определяет строку (как id вообще везде в наших примерах раньше)' },
            { code: '    name = Column(String)\n    age = Column(Integer)', note: 'Обычные столбцы — просто перечисляем их как атрибуты класса с типом' },
          ],
        },
        {
          type: 'steps',
          title: 'Работаем с таблицей через сессию',
          items: [
            { code: 'engine = create_engine("sqlite:///:memory:")', note: 'engine — "точка входа" к базе данных. В реальном проекте здесь была бы строка postgresql://... из прошлого урока' },
            { code: 'Base.metadata.create_all(engine)', note: 'По всем описанным классам-моделям создаёт настоящие таблицы в базе (это как выполнить все CREATE TABLE за тебя)' },
            { code: 'Session = sessionmaker(bind=engine)\nsession = Session()', note: 'session — твой "разговорник" с базой на всё время работы: через него добавляют, ищут и удаляют записи' },
            { code: 'session.add(User(name="Аня", age=20))\nsession.commit()', note: 'add() готовит новую запись, commit() по-настоящему сохраняет её в базу (SQLAlchemy сам построит и выполнит INSERT)' },
            { code: 'session.query(User).filter_by(name="Аня").first()', note: 'query(User) — "хочу поискать среди пользователей", filter_by(...) — условие, first() — взять первый подходящий результат' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'ORM не заменяет SQL — он его пишет ЗА тебя',
          text: 'session.query(User).filter_by(name="Аня").first() под капотом всё равно превращается в SELECT * FROM users WHERE name = \'Аня\' LIMIT 1 — точно такой же SQL, что мы писали руками в прошлых уроках. ORM не "магия вместо SQL", а автоматизация написания SQL, с дополнительным удобством: результат сразу возвращается как обычный Python-объект (user.name, а не user["name"] или user[1]).',
        },
      ],
      example: {
        title: 'Модель User и работа с ней через сессию',
        lang: 'python',
        code: `from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

session.add(User(name="Аня", age=20))
session.add(User(name="Борис", age=25))
session.commit()

all_users = session.query(User).all()
print([u.name for u in all_users])

anya = session.query(User).filter_by(name="Аня").first()
print(anya.name, anya.age)`,
        explanation: 'Ни одной строчки SQL не написано вручную — но за кулисами выполнились самые настоящие CREATE TABLE, INSERT и SELECT.',
      },
      sandbox: {
        bootstrap: 'sqlalchemy',
        description: 'Здесь по-настоящему работает мини-версия SQLAlchemy поверх настоящего sqlite3: реальные SQL-запросы выполняются под капотом, только ты их не видишь — как и в настоящем проекте.',
        initialCode: `from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    age = Column(Integer)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

session.add(User(name="Аня", age=20))
session.add(User(name="Борис", age=25))
session.commit()

print([u.name for u in session.query(User).all()])

anya = session.query(User).filter_by(name="Аня").first()
print(anya.name, anya.age)

nobody = session.query(User).filter_by(name="Нет такого").first()
print(nobody)

first_user = session.get(User, 1)
print(first_user)`,
      },
      tasks: [
        {
          title: 'Задание 1: модель товара',
          difficulty: 'easy',
          description: 'Опиши класс Product(Base) с __tablename__ = "products" и столбцами id (primary_key), name (String), price (Float — импортируй его тоже из sqlalchemy). Создай таблицу, добавь два товара и выведи их имена.',
          hints: ['from sqlalchemy import Float', 'Копируй структуру User, просто с другими столбцами'],
        },
        {
          title: 'Задание 2: уникальный email и IntegrityError',
          difficulty: 'medium',
          description: 'Добавь в User столбец email = Column(String, unique=True). Попробуй добавить двух пользователей с ОДИНАКОВЫМ email и сделай commit() внутри try/except, поймав sqlalchemy.exc.IntegrityError. Выведи понятное сообщение об ошибке вместо падения программы.',
          hints: [
            'from sqlalchemy.exc import IntegrityError',
            'try:\n    session.add(...)\n    session.commit()\nexcept IntegrityError as e:\n    print("Такой email уже занят")',
          ],
          solution: `from sqlalchemy.exc import IntegrityError

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

session.add(User(name="Аня", email="a@example.com"))
session.commit()

try:
    session.add(User(name="Копия", email="a@example.com"))
    session.commit()
except IntegrityError:
    print("Такой email уже занят")`,
        },
        {
          title: 'Задание 3: удаление и что происходит под капотом',
          difficulty: 'hard',
          description: 'Найди пользователя по id через session.get(User, 1), удали его через session.delete(...), затем выведи session.query(User).all(). В комментарии напиши, какой SQL примерно выполнился под капотом для получения пользователя и для его удаления (используй знания из прошлых двух уроков).',
          hints: [
            'session.get(User, 1) внутри превращается в что-то вроде SELECT * FROM users WHERE id = 1',
            'session.delete(user) + отсутствие явного commit в нашей мини-версии — обрати внимание, вызывается ли SQL DELETE сразу или после commit',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Забыть Base.metadata.create_all(engine) и удивляться ошибке "таблица не существует"',
          right: 'create_all() обязателен хотя бы один раз для новой базы данных — без него классы-модели остаются просто описанием на Python, а настоящих таблиц в базе ещё нет',
        },
        {
          wrong: 'session.add(user) без последующего session.commit() и ожидание, что данные уже сохранены',
          right: 'add() только "готовит" запись к сохранению (кладёт в очередь на запись). Реальный SQL INSERT выполняется именно в момент commit() — без него изменения не попадут в базу',
        },
      ],
      checklist: [
        'Понимаю ORM как "переводчика" между Python-кодом и SQL',
        'Умею описать таблицу через class Модель(Base) со столбцами Column',
        'Умею создавать таблицы (create_all), сессию (sessionmaker) и добавлять записи (add + commit)',
        'Умею искать записи через session.query(...).filter_by(...) и session.get(...)',
        'Понимаю, что под ORM всё равно выполняется настоящий SQL, просто написанный автоматически',
      ],
    },

    {
      id: 'alembic-migrations',
      title: 'Миграции: как менять структуру базы безопасно',
      summary: 'Зачем нужен Alembic и что происходит, если менять структуру таблиц без миграций',
      theory: [
        {
          type: 'p',
          text: 'В прошлом уроке Base.metadata.create_all(engine) создал нам таблицы с нуля — это отлично работает для новой, пустой базы данных. Но представь ситуацию: сайт уже полгода как работает, в таблице users уже 10 000 настоящих пользователей, и тебе нужно добавить новый столбец phone. Что произойдёт, если ты просто допишешь phone = Column(String) в класс User и снова вызовешь create_all(engine)?',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'create_all() не умеет ИЗМЕНЯТЬ уже существующие таблицы',
          text: 'create_all() создаёт только те таблицы, которых ЕЩЁ НЕТ в базе. Если таблица users уже существует (пусть даже без нового столбца phone), create_all() просто ничего не сделает с ней — новый столбец не появится. Твой Python-код будет думать, что phone есть (ведь он описан в классе), а настоящая база данных о нём ничего не будет знать. Первое же обращение к user.phone обернётся настоящей ошибкой.',
        },
        {
          type: 'analogy',
          text: 'Представь, что твой дом (база данных) уже построен, и в нём давно живут люди со своими вещами (реальные данные). Если тебе нужна ещё одна комната, ты же не сносишь весь дом, чтобы построить по новому плану — вещи жильцов потеряются! Ты аккуратно пристраиваешь комнату к уже стоящему дому, по чёткой пошаговой инструкции. Миграция — это и есть такая инструкция: точный, пошаговый план, как изменить структуру существующей базы, не потеряв то, что в ней уже накопилось.',
        },
        {
          type: 'p',
          text: 'Alembic — стандартный инструмент миграций для SQLAlchemy. Он сравнивает твои Python-модели с тем, что РЕАЛЬНО сейчас есть в базе данных, и сам предлагает список отличий в виде SQL-инструкций (например, ALTER TABLE users ADD COLUMN phone). Ты сохраняешь эти инструкции в отдельный файл — файл миграции — и применяешь его, когда готов.',
        },
        {
          type: 'terminal',
          title: 'Типичный путь работы с Alembic',
          script: [
            {
              command: 'alembic init alembic',
              output:
                "Creating directory '/home/user/project/alembic' ...  done\nCreating directory '/home/user/project/alembic/versions' ...  done\nGenerating /home/user/project/alembic.ini ...  done\nGenerating /home/user/project/alembic/env.py ...  done\nPlease edit configuration/connection/logging settings in 'alembic.ini' before proceeding.",
              type: 'success',
            },
            {
              command: 'alembic revision --autogenerate -m "add phone column"',
              output:
                "INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.\nINFO  [alembic.autogenerate.compare] Detected added column 'users.phone'\nGenerating /home/user/project/alembic/versions/3f8a1c2b9e21_add_phone_column.py ...  done",
              type: 'success',
            },
            {
              command: 'alembic upgrade head',
              output:
                'INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.\nINFO  [alembic.runtime.migration] Running upgrade  -> 3f8a1c2b9e21, add phone column',
              type: 'success',
            },
          ],
        },
        {
          type: 'list',
          title: 'Что означает каждая из трёх команд',
          items: [
            'alembic init alembic — один раз в начале проекта: создаёт папку для хранения файлов миграций',
            'alembic revision --autogenerate -m "..." — "посмотри, что изменилось в моделях по сравнению с базой, и подготовь файл-инструкцию с этими изменениями"',
            'alembic upgrade head — "примени все ещё не применённые миграции к базе данных прямо сейчас"',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Файлы миграций коммитятся в git вместе с кодом',
          text: 'В этом ключевая польза Alembic для команды: файл миграции — это обычный файл в проекте, который попадает в git точно так же, как любой другой код. Когда коллега делает git pull и видит новую миграцию, ему достаточно выполнить alembic upgrade head — и его локальная база данных автоматически "догонит" структуру, которую ты только что изменил. Никому не нужно вручную запоминать и пересказывать друг другу, что именно поменялось в таблицах.',
        },
        {
          type: 'p',
          text: 'Без миграций команда постепенно приходит к "расхождению схемы" (schema drift): у одного разработчика в базе есть столбец, которого нет у другого, а на сервере в продакшене — вообще третий вариант. Отследить, кто и что менял вручную через ALTER TABLE, становится практически невозможно.',
        },
      ],
      tasks: [
        {
          title: 'Задание 1: объясни три команды своими словами',
          difficulty: 'easy',
          description: 'В комментарии кратко опиши своими словами, что делает каждая из трёх команд: alembic init alembic, alembic revision --autogenerate -m "...", alembic upgrade head. Представь, что объясняешь это другу, который никогда не слышал слова "миграция".',
          hints: ['Используй аналогию "пристройки к дому" из теории', 'init — подготовка папки, revision — план изменений, upgrade — применить план'],
        },
        {
          title: 'Задание 2: обязательное поле без значения по умолчанию',
          difficulty: 'medium',
          description: 'Представь: в таблице users уже 10 000 строк, и ты добавляешь новый столбец phone = Column(String, nullable=False) — то есть "обязательно должен быть заполнен". Опиши в комментарии, какая проблема возникнет у уже существующих 10 000 строк, и как можно было бы её избежать (подумай про nullable=True или значение по умолчанию).',
          hints: [
            'У всех уже существующих строк для нового столбца просто нет значения — а nullable=False требует, чтобы оно ОБЯЗАТЕЛЬНО было',
            'Решение: либо сделать столбец nullable=True (разрешить пустое значение), либо задать server_default с каким-то значением по умолчанию для старых строк',
          ],
        },
        {
          title: 'Задание 3: диагностируй ошибку по симптому',
          difficulty: 'hard',
          description: 'Коллега пишет тебе: "После git pull мой FastAPI роут начал падать с ошибкой no such column: email, хотя раньше всё работало!" Опиши в комментарии: что, скорее всего, произошло, и какую ОДНУ команду коллеге нужно выполнить, чтобы всё заработало.',
          hints: [
            'git pull подтянул новый код (и, вероятно, новый файл миграции), но саму базу данных коллеги никто не тронул',
            'Ответ: alembic upgrade head — применить накопившиеся миграции к его локальной базе',
          ],
        },
      ],
      mistakes: [
        {
          wrong: 'Менять структуру таблицы прямо в базе вручную (через ALTER TABLE в консоли), "чтобы было быстрее"',
          right: 'Даже маленькое изменение стоит проводить через миграцию — иначе через полгода никто (включая тебя самого) не вспомнит, что и когда менялось, а база данных на другом окружении (у коллеги, на сервере) неизбежно разъедется с кодом',
        },
        {
          wrong: 'Полагаться на Base.metadata.create_all() и для новых, и для уже работающих в продакшене проектов',
          right: 'create_all() создаёт только отсутствующие таблицы и никогда не изменяет уже существующие. Для любых изменений в уже работающей базе данных нужен именно Alembic',
        },
      ],
      checklist: [
        'Понимаю, почему create_all() не подходит для изменения уже существующих таблиц',
        'Знаю три базовые команды: alembic init, alembic revision --autogenerate, alembic upgrade head',
        'Понимаю, что файлы миграций — это обычные файлы проекта, которые коммитятся в git',
        'Понимаю риск "расхождения схемы" при работе без миграций в команде',
      ],
    },
  ],
};
