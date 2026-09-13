export const cheatsheets = [
  {
    id: 'terminal-basics',
    title: 'Терминал: базовые команды',
    icon: '⌨️',
    lang: 'bash',
    code: `pwd                     # показать, в какой папке я сейчас нахожусь
ls                      # показать список файлов и папок здесь (dir — на Windows)
cd my_project           # зайти в папку my_project
cd ..                   # выйти на уровень выше
mkdir new_folder        # создать новую папку
touch app.py            # создать пустой файл (на Windows: type nul > app.py)
python app.py           # запустить файл app.py
clear                   # очистить экран терминала (cls — на Windows)`,
  },
  {
    id: 'venv-pip',
    title: 'Виртуальное окружение и pip',
    icon: '📦',
    lang: 'bash',
    code: `python -m venv venv               # создать виртуальное окружение в папке venv
source venv/bin/activate          # активировать (Mac/Linux)
venv\\Scripts\\activate             # активировать (Windows)
deactivate                        # выйти из виртуального окружения

pip install fastapi uvicorn       # установить пакеты
pip install -r requirements.txt   # установить всё из файла со списком пакетов
pip freeze > requirements.txt     # сохранить список установленных пакетов в файл
pip list                          # какие пакеты уже установлены
pip uninstall <пакет>             # удалить пакет`,
  },
  {
    id: 'python-basics',
    title: 'Python: основы синтаксиса',
    icon: '🐍',
    lang: 'python',
    code: `# Переменные и типы
name = "Аня"        # str — текст
age = 20             # int — целое число
price = 9.99         # float — дробное число
is_active = True     # bool — истина/ложь

# Условие
if age >= 18:
    print("Совершеннолетний")
elif age > 0:
    print("Несовершеннолетний")
else:
    print("Некорректный возраст")

# Циклы
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

while age < 25:
    age += 1

# Функция
def greet(name, greeting="Привет"):
    return f"{greeting}, {name}!"

# Список и словарь
fruits = ["яблоко", "банан"]
fruits.append("груша")

user = {"name": "Аня", "age": 20}
print(user["name"])
print(user.get("email", "нет почты"))`,
  },
  {
    id: 'python-oop',
    title: 'Python: классы (ООП)',
    icon: '🧩',
    lang: 'python',
    code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} издаёт звук"

class Dog(Animal):          # Dog наследуется от Animal
    def speak(self):
        return f"{self.name} говорит: Гав!"

rex = Dog("Рекс")
print(rex.speak())          # Рекс говорит: Гав!
print(isinstance(rex, Animal))  # True`,
  },
  {
    id: 'fastapi-basics',
    title: 'FastAPI: базовые паттерны',
    icon: '🚀',
    lang: 'python',
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/")
def root():
    return {"message": "Привет!"}

@app.get("/items/{item_id}")     # параметр пути
def get_item(item_id: int):
    return {"id": item_id}

@app.get("/search")              # параметр запроса (query)
def search(q: str = ""):
    return {"query": q}

@app.post("/items", status_code=201)   # тело запроса через Pydantic
def create_item(item: Item):
    return item

@app.get("/items/{item_id}")
def get_item_or_404(item_id: int):
    if item_id != 1:
        raise HTTPException(status_code=404, detail="Не найден")
    return {"id": item_id}

# Запуск: uvicorn main:app --reload
# Автодокументация: http://127.0.0.1:8000/docs`,
  },
  {
    id: 'http-status',
    title: 'HTTP статус-коды',
    icon: '🚦',
    items: [
      { label: '200 OK', text: 'Успешный запрос, есть тело ответа' },
      { label: '201 Created', text: 'Ресурс успешно создан (обычно ответ на POST)' },
      { label: '204 No Content', text: 'Успех, но тела ответа нет (например, после DELETE)' },
      { label: '400 Bad Request', text: 'Клиент прислал некорректные данные' },
      { label: '401 Unauthorized', text: 'Не передана или невалидна аутентификация' },
      { label: '403 Forbidden', text: 'Аутентификация есть, но прав недостаточно' },
      { label: '404 Not Found', text: 'Ресурс с таким адресом не найден' },
      { label: '409 Conflict', text: 'Конфликт состояния (например, дубликат email)' },
      { label: '422 Unprocessable Entity', text: 'Данные не проходят валидацию Pydantic — стандартный ответ FastAPI' },
      { label: '429 Too Many Requests', text: 'Превышен лимит запросов (rate limit)' },
      { label: '500 Internal Server Error', text: 'Необработанная ошибка на сервере' },
    ],
  },
  {
    id: 'env-vars',
    title: 'Переменные окружения (.env)',
    icon: '🔑',
    lang: 'python',
    code: `# .env  (никогда не коммитить в git!)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
SECRET_KEY=supersecretvalue
DEBUG=True

# в коде (пакет python-dotenv)
from dotenv import load_dotenv
import os

load_dotenv()
database_url = os.getenv("DATABASE_URL")`,
  },
  {
    id: 'sql',
    title: 'SQL — база (PostgreSQL)',
    icon: '🗄️',
    lang: 'sql',
    code: `SELECT id, name FROM users WHERE age > 18 ORDER BY name LIMIT 10;
INSERT INTO users (name, email) VALUES ('Аня', 'anya@mail.com');
UPDATE users SET name = 'Анна' WHERE id = 1;
DELETE FROM users WHERE id = 1;

SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id;

CREATE INDEX idx_users_email ON users(email);`,
  },
  {
    id: 'git',
    title: 'Git — база для повседневной работы',
    icon: '🌿',
    lang: 'bash',
    code: `git status                      # что изменилось
git add .                       # добавить всё в индекс
git commit -m "message"         # закоммитить
git push origin main            # отправить на удалённый репозиторий
git checkout -b feature/login   # создать и переключиться на ветку
git pull --rebase               # обновить ветку без лишнего merge-коммита
git log --oneline --graph       # компактная история коммитов`,
  },
  {
    id: 'docker',
    title: 'Docker — база',
    icon: '🐳',
    lang: 'bash',
    code: `docker build -t myapp .          # собрать образ
docker run -p 8000:8000 myapp    # запустить контейнер
docker ps                        # список запущенных контейнеров
docker compose up -d             # поднять сервисы из docker-compose.yml
docker compose down              # остановить и удалить контейнеры
docker logs -f <container>       # смотреть логи в реальном времени`,
  },
  {
    id: 'linux-basics',
    title: 'Linux: файлы, права, процессы, конвейер',
    icon: '🐧',
    lang: 'bash',
    code: `# --- Навигация и файлы (модуль 32) ---
pwd                             # где я? (полный путь текущего каталога)
ls -la                          # список файлов: -l подробно, -a со скрытыми (.env)
cd projects  /  cd ..  /  cd    # зайти в каталог / на уровень выше / домой (~)
mkdir -p a/b/c                  # создать каталог (со всей цепочкой родителей)
touch app.py                    # создать пустой файл
cat app.py                      # показать содержимое файла
cp app.py backup.py             # скопировать (каталог — с флагом -r)
mv old.txt new.txt              # переместить = переименовать
rm file.txt  /  rm -r folder    # удалить файл / каталог с содержимым — БЕЗ корзины!

# --- Права доступа (r=4, w=2, x=1; владелец / группа / остальные) ---
ls -l                           # -rwxr-xr-- 1 user user ... — читать по тройкам
chmod +x deploy.sh              # сделать исполняемым (то же: chmod u+x)
chmod 755 deploy.sh             # скрипты: rwx r-x r-x
chmod 644 notes.txt             # обычные файлы: rw- r-- r--
chmod 600 secret.key            # секреты: только владелец
sudo cat /etc/shadow            # выполнить одну команду от имени root
./deploy.sh                     # запустить скрипт из текущего каталога

# --- Процессы ---
ps aux                          # все процессы: USER, PID, %CPU, %MEM, COMMAND
ps aux | grep uvicorn           # найти процесс по имени
top                             # кто грузит процессор/память (выход: q)
kill 3117                       # вежливо завершить процесс по PID (SIGTERM)
kill -9 3117                    # убить силой — только если обычный kill не помог
pkill python                    # завершить по имени
Ctrl+C                          # остановить программу, запущенную в этом терминале

# --- Текст, поиск, конвейер ---
grep ERROR app.log              # строки со словом; -i регистр, -n номера, -v наоборот, -c счёт
grep -r "ERROR" logs/           # искать по всем файлам каталога
find . -name "*.log"            # найти ФАЙЛЫ по имени (-type f / -type d)
cat app.log | grep ERROR | sort | uniq -c | sort -rn   # какая ошибка чаще всего
wc -l app.log                   # сколько строк
head -n 20 / tail -n 20 app.log # первые / последние 20 строк; tail -f — следить вживую
cut -d " " -f 2                 # вырезать 2-ю колонку (разделитель — пробел)
команда > файл                  # записать вывод в файл (перезаписать!)
команда >> файл                 # дописать в конец
команда 2> /dev/null            # спрятать ошибки`,
  },
  {
    id: 'linux-server',
    title: 'Linux на сервере: apt, systemd, сеть, bash',
    icon: '⚙️',
    lang: 'bash',
    code: `# --- Пакеты (модуль 33): apt — система, pip в venv — проект ---
sudo apt update                 # обновить каталог пакетов (всегда первым делом)
sudo apt upgrade                # обновить установленные программы
sudo apt install nginx postgresql python3-venv python3-pip
sudo apt remove htop            # удалить
apt search redis  /  apt show nginx  /  apt list --installed
cat /etc/os-release             # какой дистрибутив (Ubuntu → apt, Fedora → dnf)

# --- Службы systemd ---
systemctl status myapp          # жива ли служба, PID, память, последние логи
sudo systemctl start|stop|restart myapp
sudo systemctl enable --now myapp   # автозапуск при загрузке + запустить сейчас
sudo systemctl daemon-reload    # после правки unit-файла — обязательно
journalctl -u myapp -f          # логи службы вживую (-n 50 последние, --since "10 min ago")
# /etc/systemd/system/myapp.service:
#   [Service] User=deploy  WorkingDirectory=/opt/myapp  EnvironmentFile=/opt/myapp/.env
#   ExecStart=/opt/myapp/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
#   Restart=always      [Install] WantedBy=multi-user.target

# --- Сеть: адрес → интернет → порты → ответ ---
ip a                            # адреса сервера (inet на eth0 — внешний)
ping -c 3 google.com            # есть ли интернет и DNS
ss -tlnp                        # кто слушает порты (нет :8000 — приложение не запущено)
curl -i localhost:8000/health   # ответ приложения с заголовками
sudo ufw status  /  sudo ufw allow 443   # firewall: наружу только 22, 80, 443
# Connection refused — порт никто не слушает; Address already in use — порт занят
# 127.0.0.1 — только «сам себе»; --host 0.0.0.0 — принимать снаружи

# --- Bash-скрипт ---
#!/bin/bash                     # первая строка: чем выполнять
APP_DIR=/opt/myapp              # переменная — БЕЗ пробелов вокруг =
echo "Каталог: $APP_DIR"        # $VAR читается в двойных кавычках
NOW=$(date)                     # подставить вывод команды
if [ -f "$1" ]; then echo "есть"; else echo "нет"; exit 1; fi   # $1 — первый аргумент
for f in logs/*.log; do cp "$f" backup/; done                    # цикл по файлам
chmod +x deploy.sh && ./deploy.sh                                # право на запуск и запуск`,
  },
  {
    id: 'keyboard-symbols',
    title: 'Символы на клавиатуре (для планшетов/компактных клавиатур)',
    icon: '🔣',
    description:
      'Если печатаешь код на компактной клавиатуре без подписанных символов — вот где их искать (для стандартной английской раскладки).',
    items: [
      { label: '{ }', text: 'Shift + [ ]' },
      { label: '[ ]', text: 'без Shift, клавиша рядом с P' },
      { label: ':', text: 'Shift + ;' },
      { label: '_', text: 'Shift + -' },
      { label: '=', text: 'без Shift, отдельная клавиша' },
      { label: '"', text: "Shift + '" },
      { label: '#', text: 'Shift + 3' },
      { label: '|', text: 'Shift + \\' },
      { label: '\\', text: 'без Shift, клавиша рядом с Enter' },
      { label: '~', text: 'Shift + ` (клавиша слева от 1, выше Tab)' },
      { label: 'Tab', text: 'клавиша Tab, используется для отступов в Python' },
    ],
  },
];
