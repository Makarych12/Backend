// Модуль 33 — Linux для бэкенд-разработчика.
// Уроки 1-3 — про команды, которые нельзя выполнить по-настоящему даже виртуально (сеть,
// системные пакеты, службы): они идут через `terminal` (симулятор с честным заготовленным
// выводом). Урок 4 — bash-скрипты — через `linuxLab` с настоящим виртуальным шеллом, а его
// check() запускает скрипт ученика на чистой копии каталога и смотрит на результат.
import { VirtualShell } from '../../utils/virtualShell.js';

const LOG_FILES = {
  'app.log': '10:00:01 INFO Server started on port 8000\n10:00:09 WARN Slow query: 1.8s\n10:00:14 ERROR Database connection refused\n',
  'web.log': '10:00:03 INFO GET / 200\n10:00:08 WARN GET /admin 403\n',
  'db.log': '10:00:00 INFO PostgreSQL ready to accept connections\n',
};

const BACKUP_LAB_FS = {
  home: {
    user: {
      'backup.sh': '#!/bin/bash\n# Резервная копия логов: перебрать logs/*.log, скопировать каждый в backup/\n# и напечатать строку вида "Скопирован: logs/app.log"\n',
      logs: { ...LOG_FILES },
      backup: {},
      'notes.txt': 'Скрипт бэкапа запускать каждый вечер.\n',
    },
  },
};

export const module33 = {
  id: 'linux-backend',
  order: 33,
  title: 'Linux для бэкенд-разработчика',
  icon: '⚙️',
  description:
    'Что на самом деле происходит на сервере, когда ты деплоишь: установка пакетов, службы systemd, сеть и порты, bash-скрипты автоматизации.',
  lessons: [
    // ------------------------------------------------------------------
    // Урок 1. Пакетные менеджеры
    // ------------------------------------------------------------------
    {
      id: 'linux-package-managers',
      title: 'Пакетные менеджеры: apt и dnf',
      summary: 'Как на «голый» сервер попадают Python, nginx и PostgreSQL, чем apt отличается от pip и почему перед установкой всегда делают apt update',
      theory: [
        {
          type: 'p',
          text: 'В модуле 13 ты деплоил на Render и Railway — там сервер уже был готов: Python стоит, всё настроено, только дай ссылку на репозиторий. А в модуле 16 мы обсуждали VPS — аренду «голого» Linux-сервера. Голый — значит на нём нет вообще ничего: ни Python, ни pip, ни базы данных, ни nginx. Всё это нужно установить. И делается это не скачиванием установщиков с сайтов, а через пакетный менеджер — одной командой.',
        },
        {
          type: 'analogy',
          text: 'Пакетный менеджер — это магазин приложений для сервера, как App Store на телефоне. Только вместо витрины — репозиторий (огромный склад готовых, проверенных программ в интернете), вместо кнопки «Установить» — команда apt install, а вместо иконки — имя пакета. Как и в App Store, магазин сам следит за зависимостями: попросил nginx — он сам притащит все библиотеки, без которых nginx не заработает. И сам же умеет всё обновлять и удалять без «хвостов».',
        },
        {
          type: 'command',
          command: 'sudo apt install nginx',
          parts: [
            { text: 'sudo', desc: 'от имени администратора — ставить программы для всей системы может только root (вспомни урок про права в модуле 32)' },
            { text: 'apt', desc: 'сам пакетный менеджер Ubuntu и Debian (Advanced Package Tool)' },
            { text: 'install', desc: 'что сделать: установить. Ещё есть remove (удалить), update (обновить список), upgrade (обновить программы), search, show, list' },
            { text: 'nginx', desc: 'имя пакета. Можно перечислить несколько через пробел: sudo apt install nginx postgresql htop' },
          ],
          result: 'apt посмотрит в свой каталог, скачает nginx и все его зависимости, распакует, настроит и — для программ-служб вроде nginx — сразу запустит. Без sudo получишь «Permission denied ... are you root?» — это не ошибка apt, а защита системы.',
        },
        {
          type: 'steps',
          title: 'Первые минуты на свежем сервере: ставим всё, что нужно бэкендеру',
          items: [
            { code: 'sudo apt update', note: 'Обновить КАТАЛОГ — список того, что вообще есть в репозитории и каких версий. Сами программы не трогает. Делается первым делом, иначе apt может не найти пакет или поставить старую версию' },
            { code: 'sudo apt upgrade', note: 'Обновить уже установленные программы до свежих версий из каталога (в том числе исправления безопасности)' },
            { code: 'sudo apt install python3-pip python3-venv', note: 'pip и venv — на голом Ubuntu их нет, хотя сам python3 обычно есть' },
            { code: 'sudo apt install postgresql', note: 'База данных из модуля 7 — тоже просто пакет' },
            { code: 'sudo apt install nginx', note: 'Веб-сервер, который на настоящем сервере стоит «перед» uvicorn: принимает HTTPS и передаёт запросы твоему приложению' },
            { code: 'apt list --installed', note: 'Что уже стоит. Смотреть можно без sudo — это только чтение' },
            { code: 'sudo apt remove htop', note: 'Удалить. autoremove — подчистить зависимости, которые больше никому не нужны' },
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'apt и pip — два разных магазина',
          text: 'apt ставит программы для всей системы: Python, nginx, PostgreSQL, git. pip ставит библиотеки для твоего Python-проекта: fastapi, sqlalchemy — и, как ты помнишь из модуля 5, внутри виртуального окружения venv. Правило: система — через apt, зависимости проекта — через pip в venv. Никогда не ставь fastapi через sudo pip install в системный Python: ты перемешаешь пакеты системы и проекта, и при следующем apt upgrade что-нибудь сломается.',
        },
        {
          type: 'list',
          title: 'Тот же магазин в других городах',
          items: [
            'Ubuntu, Debian, Mint — apt (пакеты .deb). Самый частый выбор для серверов; весь курс ориентируется на Ubuntu.',
            'Fedora, RHEL, CentOS, Rocky — dnf (раньше yum, пакеты .rpm). Команды почти те же: sudo dnf install nginx.',
            'Alpine (крошечные Docker-образы из модуля 22) — apk: apk add nginx. Именно поэтому в Dockerfile на базе alpine ты видел apk, а на базе python:3.12-slim (это Debian) — apt-get.',
            'Внутри Dockerfile пишут apt-get, а не apt: apt — интерфейс для человека (с прогресс-барами и подсказками), apt-get — стабильный для скриптов. Делают они одно и то же.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Unable to locate package',
          text: 'Самая частая ошибка новичка: E: Unable to locate package nginx на свежем сервере. Пакет не «сломан» — просто ты ещё не сделал sudo apt update, и apt не знает, что такой пакет существует. Вторая по частоте: опечатка в имени. Проверить, как правильно называется пакет, можно через apt search слово.',
        },
        {
          type: 'terminal',
          title: 'Так выглядит подготовка свежего сервера',
          script: [
            { command: 'sudo apt update' },
            { command: 'sudo apt install python3-pip python3-venv nginx' },
            { command: 'apt list --installed' },
          ],
        },
      ],
      example: {
        title: 'Слой RUN apt-get из Dockerfile — это те же команды, только внутри контейнера',
        lang: 'docker',
        code: `FROM python:3.12-slim

# Внутри образа — Debian, поэтому пакетный менеджер тот же самый apt.
# Одной строкой: обновить каталог → поставить → удалить кэш каталога (чтобы образ был меньше)
RUN apt-get update && apt-get install -y --no-install-recommends \\
        libpq-dev \\
        curl \\
    && rm -rf /var/lib/apt/lists/*

# А зависимости ПРОЕКТА — через pip, как и на твоём компьютере
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt`,
        explanation: 'Помнишь эту строку из модуля 22 и не понимал, что там написано? Теперь понимаешь: -y отвечает «да» на вопросы apt (в Dockerfile некому нажимать y), --no-install-recommends не тянет необязательные пакеты, а rm -rf /var/lib/apt/lists/* стирает скачанный каталог, чтобы не раздувать образ. Два магазина — apt для системы, pip для проекта — стоят рядом в одном файле.',
      },
      terminal: {
        title: 'Тренажёр apt',
        description:
          'Свежий Ubuntu-сервер. Попробуй поставить что-нибудь без sudo и прочитай ответ; сделай apt update; поищи пакет для Redis; посмотри, что уже установлено. Это симулятор — вывод такой же, как на настоящем сервере, но ничего не скачивается.',
        suggestions: ['apt install htop', 'sudo apt update', 'sudo apt install htop', 'apt search redis', 'apt show nginx', 'apt list --installed', 'sudo apt remove htop', 'dnf install nginx'],
      },
      tasks: [
        {
          title: 'Задание 1: поставить всё для проекта',
          difficulty: 'easy',
          lang: 'bash',
          description: 'В тренажёре выше подготовь сервер для FastAPI-проекта: обнови каталог, поставь одной командой pip, venv и PostgreSQL, потом проверь через apt list --installed, что postgresql появился в списке.',
          hints: ['Все имена пакетов есть в блоке «Первые минуты на свежем сервере».', 'Несколько пакетов перечисляются через пробел в одной команде install.'],
          solution: `sudo apt update
sudo apt install python3-pip python3-venv postgresql
apt list --installed`,
        },
        {
          title: 'Задание 2: чужой дистрибутив',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Введи dnf install nginx и прочитай ответ. Объясни своими словами: почему команда не найдена, хотя dnf — настоящий пакетный менеджер? Как узнать, какой Linux стоит на сервере, чтобы не гадать? (Подсказка: в модуле 32 ты читал файлы из /etc.)',
          hints: ['dnf есть только в Fedora/RHEL-семействе; на Ubuntu его просто не установлено — отсюда command not found.', 'cat /etc/os-release печатает название и версию дистрибутива.'],
          solution: `dnf install nginx          # bash: dnf: command not found
cat /etc/os-release        # PRETTY_NAME="Ubuntu 24.04.1 LTS" — значит, apt`,
        },
        {
          title: 'Задание 3: apt или pip?',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Для каждого пункта реши, каким магазином его ставить на сервере и почему: (а) nginx, (б) fastapi, (в) git, (г) psycopg2-binary (драйвер PostgreSQL для Python из модуля 7), (д) сам PostgreSQL. Затем напиши полную последовательность команд для нового сервера: система → клонировать проект → venv → зависимости.',
          hints: ['Всё, что импортируется в Python-коде (import fastapi, import psycopg2) — pip в venv. Всё, что запускается как отдельная программа или служба — apt.', 'Порядок: apt update → apt install (python3-venv, git, postgresql, nginx) → git clone → python3 -m venv venv → source venv/bin/activate → pip install -r requirements.txt.'],
          solution: `# (а) nginx — apt, служба.  (б) fastapi — pip, библиотека.  (в) git — apt, программа.
# (г) psycopg2-binary — pip, библиотека.  (д) postgresql — apt, служба.
sudo apt update
sudo apt install python3-venv python3-pip git postgresql nginx
git clone https://github.com/you/shop-api.git && cd shop-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt`,
        },
      ],
      mistakes: [
        {
          wrong: 'sudo pip install fastapi — «чтобы точно было доступно везде»',
          right: 'Это засоряет системный Python, которым пользуется сама Ubuntu. Библиотеки проекта — только в venv, без sudo. Через apt ставят систему, через pip — проект',
        },
        {
          wrong: 'Увидеть Unable to locate package и идти искать пакет на сайте программы',
          right: 'Сначала sudo apt update — apt просто ещё не скачал каталог. Потом apt search имя — возможно, пакет называется чуть иначе (python3-pip, а не pip)',
        },
      ],
      checklist: [
        'Понимаю, что apt — «магазин приложений» сервера, а репозиторий — его склад',
        'Знаю, зачем sudo apt update перед install, и чем update отличается от upgrade',
        'Умею install, remove, search, show, list --installed',
        'Различаю apt (система: Python, nginx, PostgreSQL) и pip в venv (зависимости проекта)',
        'Знаю, что в Fedora/RHEL — dnf, в Alpine — apk, а в Dockerfile пишут apt-get -y',
      ],
    },

    // ------------------------------------------------------------------
    // Урок 2. systemd и службы
    // ------------------------------------------------------------------
    {
      id: 'linux-systemd-services',
      title: 'systemd и службы: чтобы сервер не падал',
      summary: 'Почему uvicorn, запущенный руками, умирает вместе с терминалом, что такое служба, как её описать в unit-файле и читать её журнал через journalctl',
      theory: [
        {
          type: 'p',
          text: 'В модуле 32 ты узнал, что процесс, запущенный из терминала, умирает вместе с терминалом. Значит, uvicorn main:app, который ты запустил по ssh и закрыл ноутбук, — уже мёртв. А если приложение упало само в три часа ночи из-за ошибки — кто его поднимет? На настоящем сервере за этим следит systemd — программа, которая стартует первой (тот самый PID 1) и управляет всеми остальными долгоживущими программами. Такие программы называются службами (services): nginx, postgresql, ssh — и твой FastAPI, если ты его правильно оформишь.',
        },
        {
          type: 'analogy',
          text: 'Служба — это работник на смене, а systemd — начальник смены. Начальник знает список всех работников (unit-файлы), выводит их на смену при открытии цеха (загрузке сервера), следит, чтобы никто не пропал, и если работник упал в обморок (процесс завершился с ошибкой) — тут же ставит на его место нового (Restart=always). Ты не бегаешь за каждым работником сам, а даёшь указания начальнику: systemctl start — «выведи на смену», stop — «отпусти», restart — «замени на свежего», enable — «пусть выходит на каждую смену автоматически».',
        },
        {
          type: 'steps',
          title: 'Unit-файл /etc/systemd/system/myapp.service — досье на работника',
          items: [
            { code: '[Unit]', note: 'Раздел «кто такой»' },
            { code: 'Description=FastAPI backend (uvicorn)', note: 'Человеческое название — его покажет systemctl status' },
            { code: 'After=network.target postgresql.service', note: 'Выходить на смену только после сети и базы данных — иначе приложение стартует раньше базы и упадёт' },
            { code: '[Service]', note: 'Раздел «что делать»' },
            { code: 'User=deploy', note: 'От чьего имени запускать. Не root! Если приложение взломают, злоумышленник получит права обычного пользователя, а не всего сервера' },
            { code: 'WorkingDirectory=/opt/myapp', note: 'Каталог проекта — то же, что cd /opt/myapp перед запуском' },
            { code: 'EnvironmentFile=/opt/myapp/.env', note: 'Откуда взять переменные окружения (DATABASE_URL, SECRET_KEY) — вот куда на сервере кладётся .env из модуля 11' },
            { code: 'ExecStart=/opt/myapp/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000', note: 'Сама команда запуска — полным путём до uvicorn внутри venv, потому что у systemd нет твоего активированного окружения' },
            { code: 'Restart=always', note: 'Упал — поднять. RestartSec=3 — через 3 секунды, чтобы не молотить впустую' },
            { code: '[Install]', note: 'Раздел «когда выходить»' },
            { code: 'WantedBy=multi-user.target', note: '«При обычной загрузке сервера» — так работает systemctl enable' },
          ],
        },
        {
          type: 'command',
          command: 'sudo systemctl enable --now myapp',
          parts: [
            { text: 'sudo', desc: 'управлять службами может только администратор; смотреть статус — любой' },
            { text: 'systemctl', desc: 'пульт управления systemd (system control)' },
            { text: 'enable', desc: '«выходить на смену при каждой загрузке сервера» — иначе после перезагрузки службу придётся стартовать руками' },
            { text: '--now', desc: 'и заодно запустить прямо сейчас (то же, что отдельный systemctl start)' },
            { text: 'myapp', desc: 'имя службы = имя unit-файла без .service' },
          ],
          result: 'systemd создаст «ярлык» в списке автозапуска и запустит uvicorn. Перед первым enable после создания или правки unit-файла нужен sudo systemctl daemon-reload — «начальник, перечитай досье».',
        },
        {
          type: 'list',
          title: 'Пульт управления, который ты будешь нажимать каждый день',
          items: [
            'systemctl status myapp — жив ли, с каким PID, сколько памяти ест, последние строки журнала. Первая команда при любом «сайт не открывается».',
            'sudo systemctl start / stop / restart myapp — запустить, остановить, перезапустить (после деплоя новой версии кода — restart).',
            'sudo systemctl enable / disable myapp — включить/выключить автозапуск при загрузке.',
            'journalctl -u myapp — весь журнал службы; -f — следить в реальном времени (как tail -f из модуля 32); -n 50 — последние 50 строк; --since "10 min ago" — за последние 10 минут.',
            'systemctl list-units --type=service — все службы разом; is-active myapp — коротко: active/inactive (удобно в скриптах).',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Ты уже это видел — просто под другими именами',
          text: 'На Render и Railway (модуль 13) поле «Start command» — это ExecStart, а «Environment variables» — EnvironmentFile. Платформа сама играет роль systemd: перезапускает упавшее приложение и показывает логи. В Docker (модуль 22) флаг --restart unless-stopped и restart: always в docker-compose.yml — это Restart=always, только начальник смены — не systemd, а Docker-демон. Идея одна: долгоживущую программу никогда не запускают «руками в терминале», за ней всегда кто-то присматривает.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Служба «failed» — иди в журнал, а не перезапускай вслепую',
          text: 'Если systemctl status показывает Active: failed, самое бесполезное — жать restart по кругу: с Restart=always systemd и так уже пытался. Открой journalctl -u myapp -n 50: там будет тот же Python-traceback, который ты видел бы в терминале. Чаще всего это KeyError по переменной окружения (забыли .env — модуль 11), не та версия зависимости или порт занят (следующий урок).',
        },
      ],
      example: {
        title: 'Полный unit-файл и порядок его включения',
        lang: 'bash',
        code: `# /etc/systemd/system/myapp.service
[Unit]
Description=FastAPI backend (uvicorn)
After=network.target postgresql.service

[Service]
User=deploy
WorkingDirectory=/opt/myapp
EnvironmentFile=/opt/myapp/.env
ExecStart=/opt/myapp/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target

# --- в терминале ---
sudo nano /etc/systemd/system/myapp.service   # создать файл (это редактор, Ctrl+O сохранить, Ctrl+X выйти)
sudo systemctl daemon-reload                  # начальник, перечитай досье
sudo systemctl enable --now myapp             # автозапуск + запустить сейчас
systemctl status myapp                        # Active: active (running)
journalctl -u myapp -f                        # смотреть логи вживую, Ctrl+C — выйти`,
        explanation: 'Файл лежит в /etc/systemd/system/, поэтому создаётся через sudo. После любой правки unit-файла — daemon-reload, иначе systemd продолжит работать по старому досье. Деплой новой версии на VPS после этого сводится к трём словам: git pull, pip install -r requirements.txt, sudo systemctl restart myapp.',
      },
      terminal: {
        title: 'Тренажёр systemd',
        description:
          'На сервере есть служба myapp (наш FastAPI), но она не работает. Посмотри её статус, найди в журнале причину падения, «почини» (представь, что добавил переменную в .env) и запусти. Убедись через curl, что сервер отвечает, и включи автозапуск. Это симулятор: вывод как на настоящей Ubuntu.',
        suggestions: ['systemctl status myapp', 'journalctl -u myapp', 'systemctl start myapp', 'sudo systemctl start myapp', 'systemctl status myapp', 'curl localhost:8000', 'sudo systemctl enable myapp', 'systemctl list-units', 'journalctl -u myapp -f'],
      },
      tasks: [
        {
          title: 'Задание 1: диагноз по журналу',
          difficulty: 'easy',
          lang: 'bash',
          description: 'В тренажёре выше посмотри статус службы myapp и её журнал. Найди строку с настоящей причиной падения и скажи, из какого модуля курса это знание: чего не хватило приложению и где на сервере это должно было лежать?',
          hints: ['Ищи в journalctl строку с Traceback и последнюю строку после него — это и есть причина.', 'KeyError: DATABASE_URL — переменной окружения нет. Она должна лежать в /opt/myapp/.env, который подключён через EnvironmentFile (модуль 11 — переменные окружения).'],
          solution: `systemctl status myapp       # Active: inactive (dead)
journalctl -u myapp          # ... KeyError: 'DATABASE_URL' — нет переменной окружения`,
        },
        {
          title: 'Задание 2: запустить и закрепить',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Попробуй запустить myapp без sudo и прочитай ответ. Потом запусти правильно, проверь статус (должен появиться Main PID) и через curl убедись, что сервер отвечает на порту 8000. Наконец, сделай так, чтобы после перезагрузки сервера служба поднялась сама, и проверь это через is-enabled.',
          hints: ['Без sudo: Failed to start myapp.service: Access denied.', 'Автозапуск — enable; проверка — systemctl is-enabled myapp → enabled.'],
          solution: `systemctl start myapp          # Access denied
sudo systemctl start myapp
systemctl status myapp         # active (running), Main PID: ...
curl localhost:8000            # {"status":"ok",...}
sudo systemctl enable myapp
systemctl is-enabled myapp     # enabled`,
        },
        {
          title: 'Задание 3: unit-файл для Celery-воркера',
          difficulty: 'hard',
          lang: 'bash',
          description: 'В модуле 23 ты запускал воркер очереди командой celery -A tasks worker (вспомни: это отдельный долгоживущий процесс рядом с FastAPI). Напиши для него unit-файл myapp-worker.service по образцу из теории: он должен стартовать после redis, работать от пользователя deploy из /opt/myapp с тем же .env, перезапускаться при падении. Затем — команды, чтобы включить его.',
          hints: ['Меняются Description, After (redis.service вместо postgresql), ExecStart (полный путь /opt/myapp/venv/bin/celery ...). Остальное — как у myapp.', 'После создания файла — daemon-reload, потом enable --now.'],
          solution: `# /etc/systemd/system/myapp-worker.service
[Unit]
Description=Celery worker for myapp
After=network.target redis.service

[Service]
User=deploy
WorkingDirectory=/opt/myapp
EnvironmentFile=/opt/myapp/.env
ExecStart=/opt/myapp/venv/bin/celery -A tasks worker --loglevel=info
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target

# ---
sudo systemctl daemon-reload
sudo systemctl enable --now myapp-worker
systemctl status myapp-worker`,
        },
      ],
      mistakes: [
        {
          wrong: 'Запустить на сервере uvicorn main:app по ssh, закрыть ноутбук и удивляться, что сайт лежит',
          right: 'Процесс из терминала умирает вместе с ним. На сервере приложение — это служба systemd (или контейнер с restart: always): её запускает и поднимает после падений не человек, а «начальник смены»',
        },
        {
          wrong: 'Поправить unit-файл и сразу systemctl restart — «а изменения не применились»',
          right: 'systemd читает unit-файлы один раз. После любой правки — sudo systemctl daemon-reload, и только потом restart',
        },
      ],
      checklist: [
        'Понимаю, что такое служба и почему долгоживущие программы не запускают руками в терминале',
        'Читаю unit-файл: [Unit]/[Service]/[Install], ExecStart, User, EnvironmentFile, Restart=always, WantedBy',
        'Умею systemctl status/start/stop/restart/enable/disable и daemon-reload после правки файла',
        'При «сайт не открывается» иду в systemctl status и journalctl -u имя, а не жму restart по кругу',
        'Вижу связь: Start command на Render, restart: always в Docker и Restart=always в systemd — одна идея',
      ],
    },

    // ------------------------------------------------------------------
    // Урок 3. Сеть по-простому
    // ------------------------------------------------------------------
    {
      id: 'linux-networking-basics',
      title: 'Сеть по-простому: ping, curl, ip a и порты',
      summary: 'Четыре команды, чтобы ответить на вопрос «почему мой сервер не отвечает»: есть ли сеть, какой у машины адрес, кто слушает порт и что отвечает приложение',
      theory: [
        {
          type: 'p',
          text: 'Как устроен интернет — клиент, сервер, HTTP, запрос и ответ — ты разобрал ещё в модуле 4 («Как работает интернет»), повторять не будем. Здесь — практическая сторона: ты задеплоил приложение на VPS, открываешь адрес в браузере — и ничего. Где сломалось? Между браузером и твоим uvicorn — пять мест, где может быть обрыв, и на каждое есть своя команда, чтобы проверить.',
        },
        {
          type: 'analogy',
          text: 'IP-адрес — это адрес дома, а порт — номер квартиры. Письмо (HTTP-запрос) сначала должно доехать до дома (ping проверяет, что дорога есть и дом существует), потом попасть в нужную квартиру (порт 8000 — там живёт uvicorn, 80 и 443 — nginx, 5432 — PostgreSQL, 22 — ssh). Если в квартире никто не живёт (порт никто не слушает) — письмо вернётся с пометкой Connection refused. А ss показывает список жильцов: кто в какой квартире сейчас принимает письма.',
        },
        {
          type: 'steps',
          title: 'Проверяем цепочку сверху вниз',
          items: [
            { code: 'ip a', note: '«Какой у меня адрес?» Ищи строку inet: 127.0.0.1 — это lo, «сам себе» (localhost); адрес на eth0 — тот, по которому сервер виден снаружи' },
            { code: 'ping -c 3 google.com', note: '«Есть ли у сервера интернет?» -c 3 — три попытки и выйти (без -c ping идёт бесконечно, выход — Ctrl+C). Заодно проверяет, что работает DNS: имя превратилось в IP' },
            { code: 'ss -tlnp', note: '«Кто какой порт слушает?» t — TCP, l — только слушающие, n — числа вместо имён, p — какой процесс. Нет строки с :8000 — приложение не запущено или упало' },
            { code: 'curl localhost:8000', note: '«Что отвечает приложение изнутри сервера?» Если тут работает, а из браузера нет — проблема выше: firewall, nginx или --host' },
            { code: 'curl -i localhost:8000/health', note: '-i — показать и заголовки ответа (статус 200/500), не только тело. Тот же самый HTTP из модуля 4, только без браузера' },
          ],
        },
        {
          type: 'command',
          command: 'uvicorn main:app --host 0.0.0.0 --port 8000',
          parts: [
            { text: '--host 0.0.0.0', desc: '«слушать на всех адресах сервера» — принимать запросы и снаружи. Без этого uvicorn по умолчанию слушает 127.0.0.1 — только «сам себя», и снаружи сервер молчит, хотя curl localhost:8000 на самой машине работает' },
            { text: '--port 8000', desc: 'номер «квартиры». Порты ниже 1024 (80, 443) обычный пользователь занять не может — поэтому их слушает nginx от root, а он уже передаёт запросы на 8000' },
          ],
          result: 'Именно поэтому в Dockerfile из модуля 13 и в ExecStart из прошлого урока стоит --host 0.0.0.0. Самая частая причина «работает локально, а на сервере нет» — забытый --host.',
        },
        {
          type: 'list',
          title: 'Ошибки curl, которые ты будешь видеть, и что они значат',
          items: [
            'Connection refused — до сервера дошли, но на этом порту никто не слушает: приложение не запущено. Проверь systemctl status и ss -tlnp.',
            'Could not resolve host — имя не превращается в адрес: опечатка в домене или не настроен DNS (модуль 16).',
            'Connection timed out — пакеты уходят и не возвращаются: обычно firewall закрыл порт. sudo ufw allow 8000 (или лучше — пусти трафик через nginx на 80/443).',
            'HTTP 502 Bad Gateway от nginx — nginx жив, а приложение за ним нет: снова systemctl status myapp.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Firewall в двух словах',
          text: 'На сервере обычно включён ufw — простой firewall («охранник на воротах дома»). Он пропускает только те порты, которые ты явно разрешил: sudo ufw allow 22 (ssh — иначе потеряешь доступ!), 80 и 443 (nginx). Порт 8000 наружу открывать не нужно: снаружи ходят в nginx, а он уже внутри сервера обращается к 8000. Посмотреть правила — sudo ufw status.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Address already in use',
          text: 'Запускаешь uvicorn — и [Errno 98] Address already in use. Это не поломка: порт 8000 уже занят — чаще всего той самой службой myapp из прошлого урока, которую ты же и включил. Два процесса на одном порту жить не могут, как две семьи в одной квартире. Найди, кто занял: ss -tlnp | grep 8000 — и либо останови его, либо возьми другой порт.',
        },
        {
          type: 'terminal',
          title: 'Кто занял порт?',
          script: [
            { command: 'sudo systemctl start myapp' },
            { command: 'ss -tlnp' },
            {
              command: 'uvicorn main:app --port 8000',
              type: 'error',
              output: [
                'ERROR:    [Errno 98] error while attempting to bind on address (\'127.0.0.1\', 8000): address already in use',
              ],
            },
            { command: 'ss -tlnp | grep 8000', output: ['tcp   LISTEN 0      2048         0.0.0.0:8000       0.0.0.0:*     users:(("uvicorn",pid=4021,fd=7))'] },
            { command: 'curl localhost:8000' },
          ],
        },
      ],
      example: {
        title: 'Диагностика «сайт не открывается» за одну минуту',
        lang: 'bash',
        code: `user@backend:~$ ip a | grep inet
    inet 127.0.0.1/8 scope host lo
    inet 203.0.113.42/24 brd 203.0.113.255 scope global eth0   # наш внешний адрес

user@backend:~$ ping -c 2 google.com          # интернет и DNS есть
64 bytes from 142.250.74.14: icmp_seq=1 ttl=116 time=14.4 ms
64 bytes from 142.250.74.14: icmp_seq=2 ttl=116 time=14.6 ms

user@backend:~$ ss -tlnp                      # кто слушает порты?
tcp   LISTEN 0  128   0.0.0.0:22    users:(("sshd",pid=634,fd=3))
tcp   LISTEN 0  511   0.0.0.0:80    users:(("nginx",pid=1187,fd=6))
tcp   LISTEN 0  244 127.0.0.1:5432  users:(("postgres",pid=912,fd=5))
                                              # :8000 нет — приложение не запущено!

user@backend:~$ curl localhost:8000
curl: (7) Failed to connect to localhost port 8000: Connection refused

user@backend:~$ sudo systemctl start myapp && curl -i localhost:8000/health
HTTP/1.1 200 OK
content-type: application/json

{"status":"ok","message":"Backend is healthy"}`,
        explanation: 'Порядок всегда один: адрес → интернет → порты → ответ приложения. Обрати внимание на postgres: он слушает 127.0.0.1:5432, а не 0.0.0.0 — база доступна только изнутри сервера, и это правильно. Наружу должны смотреть только ssh (22) и nginx (80/443).',
      },
      terminal: {
        title: 'Тренажёр сети',
        description:
          'Проверь сервер по цепочке: адрес, интернет, порты, ответ приложения. Служба myapp сначала выключена — посмотри, как выглядит Connection refused, запусти службу и повтори curl. Симулятор: реальной сети нет, вывод — как на настоящем сервере.',
        suggestions: ['ip a', 'hostname -I', 'ping -c 3 google.com', 'ping nope.local', 'ss -tlnp', 'curl localhost:8000', 'sudo systemctl start myapp', 'curl -i localhost:8000/health', 'curl https://api.github.com/users/octocat', 'sudo ufw status'],
      },
      tasks: [
        {
          title: 'Задание 1: адрес и интернет',
          difficulty: 'easy',
          lang: 'bash',
          description: 'В тренажёре выше узнай внешний IP-адрес сервера (тот, что не 127.0.0.1) двумя разными командами. Затем проверь, что у сервера есть интернет, — ровно тремя пакетами. Что произойдёт, если написать ping без -c на настоящем сервере?',
          hints: ['ip a — ищи inet на eth0; hostname -I печатает только адрес.', 'Без -c ping не остановится сам — нужен Ctrl+C.'],
          solution: `ip a                    # inet 203.0.113.42/24 ... eth0
hostname -I             # 203.0.113.42
ping -c 3 google.com`,
        },
        {
          title: 'Задание 2: Connection refused',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Сделай curl localhost:8000 и прочитай ошибку. Не запуская службу, докажи через ss, что порт 8000 действительно никто не слушает. Потом запусти myapp, снова покажи список портов (строка с 8000 должна появиться, с именем процесса) и получи ответ с заголовками.',
          hints: ['ss -tlnp — в столбце Local Address ищи :8000.', 'Заголовки — флаг -i у curl.'],
          solution: `curl localhost:8000        # Connection refused
ss -tlnp                   # строки с :8000 нет
sudo systemctl start myapp
ss -tlnp                   # tcp LISTEN 0.0.0.0:8000 users:(("uvicorn",...))
curl -i localhost:8000/health`,
        },
        {
          title: 'Задание 3: «локально работает, на сервере нет»',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Коллега жалуется: на VPS приложение запущено, curl localhost:8000 на самом сервере отвечает 200, а из браузера по внешнему IP — тишина. Перечисли по порядку три вероятные причины (вспомни --host, firewall и nginx) и для каждой — команду, которой ты бы её проверил или исправил.',
          hints: ['1) uvicorn слушает 127.0.0.1 — в ss будет 127.0.0.1:8000 вместо 0.0.0.0:8000; лечится --host 0.0.0.0 в ExecStart.', '2) ufw не пропускает порт — sudo ufw status; правильнее не открывать 8000, а поставить nginx на 80/443. 3) nginx стоит, но не настроен на 8000 — 502 Bad Gateway, journalctl -u nginx.'],
          solution: `ss -tlnp | grep 8000        # 127.0.0.1:8000 → нет --host 0.0.0.0 в unit-файле
sudo systemctl edit myapp   # поправить ExecStart, потом daemon-reload + restart
sudo ufw status             # 80/443 разрешены? 22 — обязательно
curl -i http://203.0.113.42/  # снаружи ходим через nginx (80), не на 8000`,
        },
      ],
      mistakes: [
        {
          wrong: 'Запустить uvicorn на сервере без --host 0.0.0.0 и час искать проблему в firewall',
          right: 'Сначала ss -tlnp: если видишь 127.0.0.1:8000 — приложение слушает только «само себя». --host 0.0.0.0 в ExecStart решает за секунду',
        },
        {
          wrong: 'Открыть в ufw порт 8000 наружу, чтобы «ходить напрямую в uvicorn»',
          right: 'Наружу смотрят только 22 и nginx на 80/443, а он уже внутри передаёт запросы на 8000. Так HTTPS, сжатие и защита — на nginx, а uvicorn не торчит в интернет',
        },
      ],
      checklist: [
        'Проверяю сеть по цепочке: ip a → ping -c → ss -tlnp → curl, и знаю, что проверяет каждая команда',
        'Понимаю аналогию: IP — адрес дома, порт — квартира, 127.0.0.1 — «сам себе», 0.0.0.0 — «слушать снаружи»',
        'Различаю ошибки curl: Connection refused, Could not resolve host, timed out, 502 от nginx',
        'Знаю, почему нужен --host 0.0.0.0 и почему Address already in use — это занятый порт',
        'Помню, что наружу открывают только 22, 80, 443, а не порт приложения',
      ],
    },

    // ------------------------------------------------------------------
    // Урок 4. Bash-скрипты
    // ------------------------------------------------------------------
    {
      id: 'linux-bash-scripts',
      title: 'Bash-скрипты: переменные, if, for',
      summary: 'Как превратить десять команд, которые ты каждый раз набираешь руками, в один файл deploy.sh: переменные, условия, циклы по файлам и права на запуск',
      theory: [
        {
          type: 'p',
          text: 'Деплой на VPS из прошлых уроков — это каждый раз одни и те же шаги: зайти в каталог, git pull, поставить зависимости, перезапустить службу, проверить curl. Десять команд, и в каждой можно опечататься в пятницу вечером. В Linux любую последовательность команд можно записать в файл и запускать одним словом. Такой файл — bash-скрипт. Язык в нём — не Python, а те самые команды терминала, которые ты уже знаешь, плюс немного грамматики: переменные, if и for.',
        },
        {
          type: 'analogy',
          text: 'Скрипт — это рецепт, записанный один раз, чтобы больше не держать в голове. Пока ты готовишь сам, ты помнишь, что после «залить водой» идёт «посолить». Но если ты уезжаешь и оставляешь готовить кого-то другого (сервер, коллегу, себя-через-полгода), нужен листок с шагами по порядку. Переменная в рецепте — «возьми N яиц» вместо «возьми 3 яйца» (число задаётся сверху один раз), if — «если тесто жидкое, добавь муки», for — «каждое яблоко помой и нарежь».',
        },
        {
          type: 'steps',
          title: 'Анатомия скрипта',
          items: [
            { code: '#!/bin/bash', note: 'Первая строка, «шебанг»: какой программой выполнять файл. Без неё система не знает, что это bash, а не Python' },
            { code: 'APP_DIR=/opt/myapp', note: 'Переменная. ВАЖНО: без пробелов вокруг =. APP_DIR = /opt — это уже команда APP_DIR с аргументами, и она упадёт' },
            { code: 'echo "Каталог: $APP_DIR"', note: 'Читать переменную — через $. В двойных кавычках $ раскрывается, в одинарных — нет: \'$APP_DIR\' напечатает буквально $APP_DIR' },
            { code: 'NOW=$(date)', note: 'Подставить вывод команды: $(команда). Так в переменную попадает результат любой команды' },
            { code: 'echo "Первый аргумент: $1, всего аргументов: $#"', note: './deploy.sh prod → $1 = prod. $0 — имя скрипта, $@ — все аргументы' },
            { code: 'if [ -f "$APP_DIR/.env" ]; then ... else ... fi', note: 'Условие. [ -f путь ] — файл существует, -d — каталог, "$A" = "$B" — строки равны, -eq/-gt — числа. Пробелы внутри [ ] обязательны' },
            { code: 'for f in logs/*.log; do ... done', note: 'Цикл по файлам: *.log раскрывается в список, f по очереди становится каждым именем. Внутри — cp "$f" backup/' },
            { code: 'exit 1', note: 'Завершить скрипт с кодом ошибки (0 — успех, всё остальное — ошибка). Так скрипт может «сказать» вызвавшему, что что-то не так' },
          ],
        },
        {
          type: 'command',
          command: './deploy.sh',
          parts: [
            { text: './', desc: '«из текущего каталога» — как в модуле 32: без ./ bash ищет deploy среди системных команд' },
            { text: 'deploy.sh', desc: 'файл скрипта. Расширение .sh — только для людей, bash на него не смотрит' },
          ],
          result: 'Сработает только если у файла есть право x (chmod +x deploy.sh — урок про права из модуля 32). Без x — Permission denied. Обходной путь bash deploy.sh запускает файл без x, но правильно — выдать право один раз.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Три ловушки, в которые попадают все',
          text: '1) Пробелы вокруг = при присваивании: NAME = "x" — ошибка command not found. 2) Переменные с пробелами в значении всегда в кавычках: cp $f backup/ сломается на файле «my file.log», cp "$f" backup/ — нет. 3) Пробелы внутри [ ]: [ -f "$1"] без пробела перед ] — синтаксическая ошибка. Bash прощает мало — зато эти три правила покрывают 90% ошибок.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Когда bash, а когда Python',
          text: 'Bash — для «склеивания» команд: деплой, бэкап, перезапуск, обход файлов. Как только появляется настоящая логика — разбор JSON, работа с API, больше 50 строк — пиши на Python: он у тебя уже есть на сервере, а bash для сложного кода нечитаем. Правило: скрипт на bash должен помещаться на экран.',
        },
        {
          type: 'p',
          text: 'В учебном терминале ниже нет редактора nano — строки в скрипт добавляются командой echo \'строка\' >> файл (одинарные кавычки защищают $ и кавычки внутри, >> дописывает в конец), а проверяются через cat файл. На настоящем сервере ты откроешь nano deploy.sh — но всё остальное будет ровно таким же.',
        },
      ],
      example: {
        title: 'deploy.sh — всё, что ты делал руками в модулях 13, 32 и 33, одним файлом',
        lang: 'bash',
        code: `#!/bin/bash
# Деплой новой версии на VPS. Запуск: ./deploy.sh

APP_DIR=/opt/myapp
SERVICE=myapp

echo "== Деплой $SERVICE, $(date)"

if [ ! -d "$APP_DIR" ]; then
    echo "Ошибка: каталог $APP_DIR не найден"
    exit 1
fi

cd "$APP_DIR"
git pull
source venv/bin/activate
pip install -r requirements.txt

sudo systemctl restart "$SERVICE"

if systemctl is-active --quiet "$SERVICE"; then
    echo "OK: служба $SERVICE работает"
    curl -s localhost:8000/health
else
    echo "ОШИБКА: служба не поднялась, смотри journalctl -u $SERVICE"
    exit 1
fi`,
        explanation: 'Скрипт читается сверху вниз как список шагов. Условие if с ! («не») останавливает выполнение, если каталога нет — лучше упасть сразу, чем сделать git pull не туда. В конце скрипт сам проверяет, что служба поднялась, и говорит, куда смотреть, если нет. Один раз написал, chmod +x — и деплой стал одним словом.',
      },
      linuxLab: {
        initialFs: BACKUP_LAB_FS,
        goal: 'В домашнем каталоге лежит заготовка backup.sh. Допиши её так, чтобы скрипт перебрал все файлы *.log в каталоге logs, скопировал каждый в каталог backup и напечатал для каждого строку с его именем (например, «Скопирован: logs/app.log»). Сделай скрипт исполняемым и запусти. Проверка сама прогонит твой скрипт на чистой копии каталога — значит, работу должен делать именно скрипт, а не команды, набранные руками.',
        check: (shell) => {
          const script = shell.getNode('/home/user/backup.sh');
          if (!script || script.type !== 'file') return false;
          if ((Number(script.mode[0]) & 1) !== 1) return false;
          const names = Object.keys(LOG_FILES);
          // 1) ученик действительно запускал скрипт — копии лежат у него в backup/
          if (!names.every((n) => shell.readFile(`/home/user/backup/${n}`) === LOG_FILES[n])) return false;
          // 2) скрипт сам делает работу: прогоняем ЕГО ТЕКСТ на чистой копии каталога
          const clean = new VirtualShell(BACKUP_LAB_FS);
          clean.getNode('/home/user/backup.sh').content = script.content;
          clean.run('chmod +x backup.sh');
          const res = clean.run('./backup.sh');
          if (res.error) return false;
          const copied = names.every((n) => clean.readFile(`/home/user/backup/${n}`) === LOG_FILES[n]);
          const printed = names.every((n) => res.output.includes(n));
          return copied && printed;
        },
        hint: 'Тебе нужен цикл по шаблону logs/*.log; внутри — две команды: скопировать текущий файл (его имя лежит в переменной цикла) и напечатать строку с этой переменной. Сначала проверь цикл прямо в терминале одной строкой — если работает, допиши его в файл через echo с одинарными кавычками и >>. Не забудь право на запуск.',
        solution: `# 1. Проверить цикл вживую (можно писать в одну строку через ;)
for f in logs/*.log; do cp "$f" backup/; echo "Скопирован: $f"; done
rm backup/*.log                      # убрать, чтобы скрипт сделал всё сам

# 2. Дописать в скрипт (одинарные кавычки — чтобы $f не раскрылся прямо сейчас)
echo 'for f in logs/*.log; do cp "$f" backup/; echo "Скопирован: $f"; done' >> backup.sh
cat backup.sh

# 3. Право на запуск и запуск
chmod +x backup.sh
./backup.sh
ls backup`,
        suggestions: ['cat backup.sh', 'ls logs', 'for f in logs/*.log; do echo "$f"; done', 'chmod +x backup.sh', './backup.sh', 'ls backup'],
      },
      tasks: [
        {
          title: 'Задание 1: переменные и подстановка',
          difficulty: 'easy',
          lang: 'bash',
          description: 'В терминале выше создай скрипт hello.sh, который печатает «Привет, <имя пользователя>! Сейчас <дата>», беря имя из переменной USER, а дату — из команды date. Сделай исполняемым и запусти.',
          hints: ['Первая строка — шебанг, её тоже добавляем через echo с >.', 'Имя пользователя уже лежит в $USER; дату даёт $(date). Внутри одинарных кавычек echo они не раскроются — раскроются при запуске скрипта, как и надо.'],
          solution: `echo '#!/bin/bash' > hello.sh
echo 'echo "Привет, $USER! Сейчас $(date)"' >> hello.sh
chmod +x hello.sh
./hello.sh`,
        },
        {
          title: 'Задание 2: аргумент и условие',
          difficulty: 'medium',
          lang: 'bash',
          description: 'Напиши check.sh, который принимает путь к файлу первым аргументом и печатает «есть: путь», если файл существует, и «нет: путь» — если нет (и в этом случае завершается с кодом 1). Проверь на logs/app.log и на nope.txt, а после второго запуска выведи код завершения через echo $?.',
          hints: ['Первый аргумент — $1; условие — if [ -f "$1" ]; then ... else ... fi. В одну строку через ; тоже можно.', '$? — код завершения последней команды; после exit 1 он равен 1.'],
          solution: `echo '#!/bin/bash' > check.sh
echo 'if [ -f "$1" ]; then echo "есть: $1"; else echo "нет: $1"; exit 1; fi' >> check.sh
chmod +x check.sh
./check.sh logs/app.log     # есть: logs/app.log
./check.sh nope.txt         # нет: nope.txt
echo $?                     # 1`,
        },
        {
          title: 'Задание 3: отчёт по логам',
          difficulty: 'hard',
          lang: 'bash',
          description: 'Напиши report.sh: для каждого файла logs/*.log он печатает «имя: N строк», а файлы, в которых есть слово ERROR, помечает в конце строки словом «⚠ ошибки». Подсказка по инструментам: число строк даёт wc -l с перенаправлением ввода < (тогда wc не печатает имя файла), а «есть ли ERROR» проверяется командой grep -q в if — она молчит и только возвращает код.',
          hints: ['N=$(wc -l < "$f") — число без имени файла.', 'if grep -q ERROR "$f"; then ... fi — if умеет проверять не только [ ], а любую команду по её коду завершения: нашёл — код 0, значит «истина».'],
          solution: `echo '#!/bin/bash' > report.sh
echo 'for f in logs/*.log; do' >> report.sh
echo '  N=$(wc -l < "$f")' >> report.sh
echo '  if grep -q ERROR "$f"; then echo "$f: $N строк ⚠ ошибки"; else echo "$f: $N строк"; fi' >> report.sh
echo 'done' >> report.sh
chmod +x report.sh
./report.sh
# logs/app.log: 3 строк ⚠ ошибки
# logs/db.log: 1 строк
# logs/web.log: 2 строк`,
        },
      ],
      mistakes: [
        {
          wrong: 'NAME = "prod" с пробелами вокруг знака равно — и получить NAME: command not found',
          right: 'В bash присваивание пишется слитно: NAME="prod". Пробелы превращают строку в вызов команды NAME с аргументами = и "prod"',
        },
        {
          wrong: 'cp $f backup/ без кавычек — и скрипт ломается на первом же файле с пробелом в имени',
          right: 'Переменные с путями — всегда в двойных кавычках: cp "$f" backup/. Привычка, которая экономит часы',
        },
      ],
      checklist: [
        'Знаю, зачем #!/bin/bash и chmod +x, и запускаю скрипт через ./имя',
        'Пишу переменные без пробелов вокруг =, читаю через "$VAR", подставляю вывод команды через $(...)',
        'Умею if [ -f ... ] / [ -d ... ] / сравнения, else, exit 1, и for по шаблону файлов',
        'Всегда беру переменные с путями в двойные кавычки и оставляю пробелы внутри [ ]',
        'Понимаю, где bash (склейка команд: деплой, бэкап), а где уже Python (логика, JSON, API)',
      ],
    },
  ],
};
